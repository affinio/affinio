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

test.describe("datagrid sort foundation", () => {
  test("header click cycles sort state asc -> desc -> none", async ({ page }) => {
    await page.goto(ROUTE)

    const sortValue = metricValue(page, "Sort state")
    const latencyHeader = headerCell(page, "Latency (ms)")

    const initialSort = await readText(sortValue)
    if (initialSort !== "none") {
      await latencyHeader.click()
      await expect(sortValue).toHaveText("none")
    }

    await latencyHeader.click()
    await expect(sortValue).toContainText("1:latencyMs:asc")

    await latencyHeader.click()
    await expect(sortValue).toContainText("1:latencyMs:desc")

    await latencyHeader.click()
    await expect(sortValue).toHaveText("none")
  })

  test("shift click builds deterministic multi-sort priorities", async ({ page }) => {
    await page.goto(ROUTE)

    const sortValue = metricValue(page, "Sort state")
    const serviceHeader = headerCell(page, "Service")
    const ownerHeader = headerCell(page, "Owner")

    await serviceHeader.click()
    await ownerHeader.click({ modifiers: ["Shift"] })

    await expect(sortValue).toContainText("1:service:asc")
    await expect(sortValue).toContainText("2:owner:asc")
  })

  test("keyboard sorting works on pinned header", async ({ page }) => {
    await page.goto(ROUTE)

    const sortValue = metricValue(page, "Sort state")
    const serviceHeader = headerCell(page, "Service")

    await serviceHeader.focus()
    await page.keyboard.press("Enter")
    await expect(sortValue).toContainText("1:service:asc")

    await page.keyboard.press("Enter")
    await expect(sortValue).toContainText("1:service:desc")
  })
})

test.describe("datagrid quick filter foundation", () => {
  test("quick filter indicator and clear flow are deterministic", async ({ page }) => {
    await page.goto(ROUTE)

    const totalValue = metricValue(page, "Total")
    const filteredValue = metricValue(page, "Filtered")
    const total = await readText(totalValue)
    const input = page.locator('.datagrid-controls input[placeholder*="quick filter"]')
    const indicator = page.locator(".datagrid-controls__filter-indicator")
    const clearButton = page.locator(".datagrid-controls__clear-filter")

    await expect(indicator).toContainText("Quick filter: all rows")
    await input.fill("edge-gateway-1")

    await expect(indicator).toHaveAttribute("data-active", "true")
    await expect(filteredValue).not.toHaveText(total)

    await clearButton.click()
    await expect(indicator).toHaveAttribute("data-active", "false")
    await expect(filteredValue).toHaveText(total)
  })

  test("quick filter composes with sort and virtualization window", async ({ page }) => {
    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")

    const sortValue = metricValue(page, "Sort state")
    const filteredValue = metricValue(page, "Filtered")
    const input = page.locator('.datagrid-controls input[placeholder*="quick filter"]')
    const viewport = page.locator(".datagrid-stage__viewport")
    const windowValue = metricValue(page, "Window")

    await headerCell(page, "Service").click()
    await expect(sortValue).toContainText("1:service:asc")

    await input.fill("edge-gateway")
    await expect(sortValue).toContainText("1:service:asc")
    await expect(filteredValue).not.toHaveText("6400")
    await expect(page.locator(".datagrid-stage__row").first().locator(".datagrid-stage__cell").nth(1)).toContainText(
      "edge-gateway",
    )

    await runLongVerticalSession(viewport)
    await expect.poll(async () => parseRangeStart(await readText(windowValue))).toBeGreaterThan(10)
  })

  test("quick filter empty state appears and recovers on clear", async ({ page }) => {
    await page.goto(ROUTE)

    const input = page.locator('.datagrid-controls input[placeholder*="quick filter"]')
    const clearButton = page.locator(".datagrid-controls__clear-filter")

    await input.fill("zzzz-no-match-datagrid")
    await expect(page.locator(".datagrid-stage__empty")).toHaveCount(1)

    await clearButton.click()
    await expect(page.locator(".datagrid-stage__empty")).toHaveCount(0)
  })
})

test.describe("datagrid column filter mvp", () => {
  test("apply and reset text filter from header trigger", async ({ page }) => {
    await page.goto(ROUTE)

    const totalValue = metricValue(page, "Total")
    const filteredValue = metricValue(page, "Filtered")
    const columnFilterValue = metricValue(page, "Column filters")
    const total = await readText(totalValue)

    await openHeaderFilter(page, "service")
    await page.locator("[data-datagrid-filter-value]").fill("edge-gateway-1")
    await page.locator("[data-datagrid-filter-apply]").click()

    await expect(columnFilterValue).toHaveText("1")
    await expect(filteredValue).not.toHaveText(total)
    await expect(headerFilterTrigger(page, "service")).toHaveClass(/is-active/)

    await openHeaderFilter(page, "service")
    await page.locator("[data-datagrid-filter-reset]").click()

    await expect(columnFilterValue).toHaveText("0")
    await expect(filteredValue).toHaveText(total)
  })

  test("filter combinations stay stable with horizontal scroll and clear-all", async ({ page }) => {
    await page.goto(ROUTE)

    const viewport = page.locator(".datagrid-stage__viewport")
    const columnFilterValue = metricValue(page, "Column filters")
    const columnWindowValue = metricValue(page, "Visible columns window")

    await openHeaderFilter(page, "service")
    await page.locator("[data-datagrid-filter-value]").fill("edge-gateway")
    await page.locator("[data-datagrid-filter-apply]").click()

    await openHeaderFilter(page, "owner")
    await page.locator("[data-datagrid-filter-value]").fill("ari")
    await page.locator("[data-datagrid-filter-apply]").click()

    await expect(columnFilterValue).toHaveText("2")
    await expect(page.locator(".datagrid-stage__row").first().locator(".datagrid-stage__cell").nth(1)).toContainText(
      "edge-gateway",
    )

    await runLongHorizontalSession(viewport)
    await expect.poll(async () => parseColumnWindowStart(await readText(columnWindowValue))).toBeGreaterThan(1)
    await expect(columnFilterValue).toHaveText("2")

    await openHeaderFilter(page, "service")
    await page.locator("[data-datagrid-filter-clear-all]").click()
    await expect(columnFilterValue).toHaveText("0")
  })
})

test.describe("datagrid column resize foundation", () => {
  test("drag resize handle updates width and stays stable after long horizontal scroll", async ({ page }) => {
    await page.goto(ROUTE)

    const viewport = page.locator(".datagrid-stage__viewport")
    const serviceHeader = page.locator('.datagrid-stage__cell--header[data-column-key="service"]').first()
    const serviceHandle = page.locator('[data-datagrid-resize-handle][data-column-key="service"]').first()

    const beforeWidth = await headerWidth(serviceHeader)
    await dragResizeHandle(page, serviceHandle, 90)
    const afterWidth = await headerWidth(serviceHeader)
    expect(afterWidth).toBeGreaterThan(beforeWidth + 40)

    await runLongHorizontalSession(viewport)
    await expect(serviceHeader).toBeVisible()
    await expect.poll(async () => parseColumnWindowStart(await readText(metricValue(page, "Visible columns window")))).toBeGreaterThan(1)
  })

  test("double click resize handle auto-sizes using content heuristics", async ({ page }) => {
    await page.goto(ROUTE)

    const ownerHeader = page.locator('.datagrid-stage__cell--header[data-column-key="owner"]').first()
    const ownerHandle = page.locator('[data-datagrid-resize-handle][data-column-key="owner"]').first()

    await dragResizeHandle(page, ownerHandle, -55)
    const narrowedWidth = await headerWidth(ownerHeader)

    await ownerHandle.dblclick()
    const autoSizedWidth = await headerWidth(ownerHeader)
    expect(autoSizedWidth).toBeGreaterThan(narrowedWidth + 15)
  })

  test("pinned column resize keeps sticky offset under horizontal scroll", async ({ page }) => {
    await page.goto(ROUTE)

    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(".datagrid-stage__viewport")
    const statusHandle = page.locator('[data-datagrid-resize-handle][data-column-key="status"]').first()
    await dragResizeHandle(page, statusHandle, 70)

    const statusCell = page.locator('.datagrid-stage__row .datagrid-stage__cell[data-column-key="status"]').first()
    const before = await boundingBox(statusCell)
    await runLongHorizontalSession(viewport)
    const after = await boundingBox(statusCell)

    expect(Math.abs(before.x - after.x)).toBeLessThan(2)
  })
})

function metricValue(page: Page, label: string): Locator {
  return page
    .locator(".datagrid-metrics div")
    .filter({ has: page.locator("dt", { hasText: label }) })
    .locator("dd")
    .first()
}

function headerCell(page: Page, label: string): Locator {
  return page
    .locator(".datagrid-stage__cell--header")
    .filter({ hasText: label })
    .first()
}

function headerFilterTrigger(page: Page, columnKey: string): Locator {
  return page
    .locator(`[data-datagrid-filter-trigger][data-column-key="${columnKey}"]`)
    .first()
}

async function openHeaderFilter(page: Page, columnKey: string): Promise<void> {
  await headerFilterTrigger(page, columnKey).click()
  await expect(page.locator("[data-datagrid-filter-panel]")).toHaveAttribute("data-column-key", columnKey)
}

async function headerWidth(header: Locator): Promise<number> {
  const box = await boundingBox(header)
  return box.width
}

async function dragResizeHandle(page: Page, handle: Locator, deltaX: number): Promise<void> {
  const box = await boundingBox(handle)
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY)
  await page.mouse.up()
}

async function boundingBox(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error("Expected element to be visible with bounding box")
  }
  return box
}

async function selectRowsPreset(page: Page, rows: string): Promise<void> {
  const control = page
    .locator(".datagrid-controls label")
    .filter({ has: page.locator("span", { hasText: "Rows" }) })

  const trigger = control.locator("[data-affino-listbox-trigger]")
  await trigger.click()

  const option = page.locator("[data-affino-listbox-option]", { hasText: rows }).first()
  await option.click()
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
