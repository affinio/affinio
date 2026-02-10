import { expect, Locator, Page, test } from "@playwright/test"
import {
  DATA_GRID_DATA_ATTRS,
  DATA_GRID_SELECTORS,
  dataGridCellSelector,
} from "../../packages/datagrid-vue/src/contracts/dataGridSelectors"

const ROUTE = "/datagrid"

test.describe("datagrid interaction contracts", () => {
  test("selection mouse+keyboard updates range metrics deterministically", async ({ page }) => {
    await page.goto(ROUTE)

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")

    await expect.poll(async () => parseMetricNumber(await readText(metricValue(page, "Cells selected")))).toBeGreaterThan(1)
    await expect(metricValue(page, "Selection anchor")).toContainText("R1")
    await expect(metricValue(page, "Selection anchor")).toContainText("owner")
    await expect(metricValue(page, "Active cell")).toContainText("R2")
    await expect(metricValue(page, "Active cell")).toContainText("region")
    await expect(page.locator(DATA_GRID_SELECTORS.selectionOverlayMain)).toHaveCount(1)
  })

  test("fill handle drag applies value extension and reports action", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(ROUTE)

    const source = cellLocator(page, "deployment", 0)
    const target = cellLocator(page, "deployment", 1)
    const windowValue = metricValue(page, "Window")
    await expect.poll(async () => await readText(windowValue)).not.toBe("1-1")
    await expect.poll(async () => page.locator(dataGridCellSelector("deployment")).count()).toBeGreaterThan(1)
    const sourceValue = await readText(source)

    await source.click()
    await dragFillHandle(page, source, target)

    await expect(target).toHaveText(sourceValue)
    await expect(page.locator(DATA_GRID_SELECTORS.status)).toContainText("Fill applied")
  })

  test("inline editor commits value on Enter without layout regression", async ({ page }) => {
    await page.goto(ROUTE)

    const ownerCell = cellLocator(page, "owner", 0)
    await ownerCell.dblclick()

    const editor = page
      .locator(`${DATA_GRID_SELECTORS.inlineEditorInput}[${DATA_GRID_DATA_ATTRS.inlineEditorColumnKey}="owner"]`)
      .first()
    await expect(editor).toBeVisible()
    await editor.fill("qa-owner-demo")
    await editor.press("Enter")

    await expect(page.locator(DATA_GRID_SELECTORS.status)).toContainText("Saved owner")
  })

  test("pinned column remains sticky during long horizontal scroll", async ({ page }) => {
    await page.goto(ROUTE)

    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(DATA_GRID_SELECTORS.viewport)
    const statusCell = page.locator(`${DATA_GRID_SELECTORS.row} ${dataGridCellSelector("status")}`).first()

    const before = await boundingBox(statusCell)
    await runLongHorizontalSession(viewport)
    const after = await boundingBox(statusCell)

    expect(Math.abs(before.x - after.x)).toBeLessThan(2)
    await expect(statusCell).toBeVisible()
  })

  test("scroll sessions keep row/column windows moving under virtualization", async ({ page }) => {
    await page.goto(ROUTE)

    await selectControlOption(page, "Rows", "6400")

    const viewport = page.locator(DATA_GRID_SELECTORS.viewport)
    const rowWindow = metricValue(page, "Window")
    const columnWindow = metricValue(page, "Visible columns window")

    await runLongVerticalSession(viewport)
    await runLongHorizontalSession(viewport)

    await expect.poll(async () => parseRangeStart(await readText(rowWindow))).toBeGreaterThan(1000)
    const canScroll = await viewport.evaluate(element => element.scrollWidth > element.clientWidth + 1)
    if (canScroll) {
      await expect.poll(async () => viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    }
  })
})

function metricValue(page: Page, label: string): Locator {
  return page
    .locator(`${DATA_GRID_SELECTORS.metrics} div`)
    .filter({ has: page.locator("dt", { hasText: label }) })
    .locator("dd")
    .first()
}

function cellLocator(page: Page, columnKey: string, rowIndex: number): Locator {
  return page.locator(`${DATA_GRID_SELECTORS.row} ${dataGridCellSelector(columnKey)}`).nth(rowIndex)
}

async function dragFillHandle(page: Page, fromCell: Locator, toCell: Locator): Promise<void> {
  await fromCell.hover()
  const handle = fromCell.locator(DATA_GRID_SELECTORS.selectionHandleCell).first()
  await expect(handle).toBeVisible()
  await expect(toCell).toBeVisible()
  const handleBox = await boundingBox(handle)
  const targetBox = await boundingBox(toCell)

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2
  const endX = targetBox.x + targetBox.width / 2
  const endY = targetBox.y + targetBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
  await page.mouse.up()
}

async function runLongVerticalSession(viewport: Locator): Promise<void> {
  await viewport.evaluate(async element => {
    const maxTop = Math.max(0, element.scrollHeight - element.clientHeight)
    if (maxTop <= 0) return
    const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    for (let step = 1; step <= 12; step += 1) {
      element.scrollTop = Math.round((maxTop * step) / 12)
      await frame()
    }
  })
}

async function runLongHorizontalSession(viewport: Locator): Promise<void> {
  await viewport.evaluate(async element => {
    const maxLeft = Math.max(0, element.scrollWidth - element.clientWidth)
    if (maxLeft <= 0) return
    const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    for (let step = 1; step <= 10; step += 1) {
      element.scrollLeft = Math.round((maxLeft * step) / 10)
      await frame()
    }
  })
}

async function selectControlOption(page: Page, label: string, option: string): Promise<void> {
  const control = page
    .locator(".datagrid-controls label")
    .filter({ has: page.locator("span", { hasText: label }) })
  const listboxTrigger = control.locator("[data-affino-listbox-trigger]")
  if (await listboxTrigger.count()) {
    await listboxTrigger.click()
    await page
      .locator('[data-affino-listbox-surface] [data-affino-listbox-option]', { hasText: option })
      .first()
      .click()
    return
  }

  const menuTrigger = control.locator(".datagrid-controls__menu-trigger")
  await menuTrigger.click()
  await page.locator('[role="menuitem"]', { hasText: option }).first().click()
}

async function boundingBox(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error("Expected element to be visible with bounding box")
  }
  return box
}

async function readText(locator: Locator): Promise<string> {
  return (await locator.textContent())?.trim() ?? ""
}

function parseMetricNumber(raw: string): number {
  const normalized = raw.replace(/[^\d.-]/g, "")
  if (!normalized) {
    return 0
  }
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

function parseRangeStart(raw: string): number {
  const match = raw.match(/^(\d+)-(\d+)$/)
  return match ? Number(match[1]) : 0
}

function parseColumnWindowStart(raw: string): number {
  const match = raw.match(/^(\d+)-(\d+)\s*\/\s*(\d+)$/)
  return match ? Number(match[1]) : 0
}
