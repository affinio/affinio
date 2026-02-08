import { expect, Locator, Page, test } from "@playwright/test"

const ROUTE = "/datagrid"

test.describe("datagrid long-session regressions", () => {
  test("vertical long scroll session stays interactive and error-free", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")

    const viewport = page.locator(".datagrid-stage__viewport")
    await viewport.waitFor()

    const windowValue = metricValue(page, "Window")
    const activeCellValue = metricValue(page, "Active cell")

    await runLongVerticalSession(viewport)

    await expect.poll(async () => parseRangeStart(await readText(windowValue))).toBeGreaterThan(1000)

    await viewport.evaluate(element => {
      element.scrollTop = 0
    })

    await expect.poll(async () => parseRangeStart(await readText(windowValue))).toBe(1)

    await page.locator(".datagrid-stage__row").first().locator(".datagrid-stage__cell").nth(1).click()
    await expect(activeCellValue).toContainText("service")
    await expect(page.locator(".datagrid-stage__empty")).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })

  test("horizontal long scroll session updates window metrics deterministically", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    const viewport = page.locator(".datagrid-stage__viewport")
    await viewport.waitFor()

    const columnWindowValue = metricValue(page, "Visible columns window")
    const activeCellValue = metricValue(page, "Active cell")
    const initialWindow = await readText(columnWindowValue)

    await runLongHorizontalSession(viewport)

    await expect.poll(async () => await readText(columnWindowValue)).not.toBe(initialWindow)

    await page.locator(".datagrid-stage__row").first().locator(".datagrid-stage__cell").nth(20).click()
    await expect(activeCellValue).toContainText("status")

    await viewport.evaluate(element => {
      element.scrollLeft = 0
    })
    await expect.poll(async () => parseColumnWindowStart(await readText(columnWindowValue))).toBe(1)

    expect(pageErrors).toEqual([])
  })
})

function metricValue(page: Page, label: string): Locator {
  return page.locator(".datagrid-metrics div").filter({ has: page.locator("dt", { hasText: label }) }).locator("dd")
}

async function selectRowsPreset(page: Page, rows: string): Promise<void> {
  await page
    .locator(".datagrid-controls label")
    .filter({ has: page.locator("span", { hasText: "Rows" }) })
    .locator("select")
    .selectOption(rows)
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
    for (let step = 11; step >= 0; step -= 1) {
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
    for (let step = 9; step >= 0; step -= 1) {
      element.scrollLeft = Math.round((maxLeft * step) / 10)
      await frame()
    }
  })
}

async function readText(locator: Locator): Promise<string> {
  return (await locator.textContent())?.trim() ?? ""
}

function parseRangeStart(raw: string): number {
  const match = raw.match(/^(\d+)-(\d+)$/)
  return match ? Number(match[1]) : 0
}

function parseColumnWindowStart(raw: string): number {
  const match = raw.match(/^(\d+)-(\d+)\s*\/\s*(\d+)$/)
  return match ? Number(match[1]) : 0
}
