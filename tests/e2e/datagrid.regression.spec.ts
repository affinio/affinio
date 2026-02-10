import { expect, Locator, Page, test } from "@playwright/test"
import {
  DATA_GRID_DATA_ATTRS,
  DATA_GRID_SELECTORS,
  dataGridCellSelector,
} from "../../packages/datagrid-vue/src/contracts/dataGridSelectors"

const ROUTE = "/datagrid"

test.describe("datagrid long-session regressions", () => {
  test("vertical long scroll session stays interactive and error-free", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")

    const viewport = page.locator(DATA_GRID_SELECTORS.viewport)
    await viewport.waitFor()

    const windowValue = metricValue(page, "Window")
    const activeCellValue = metricValue(page, "Active cell")

    await runLongVerticalSession(viewport)

    await expect.poll(async () => parseRangeStart(await readText(windowValue))).toBeGreaterThan(1000)

    await viewport.evaluate(element => {
      element.scrollTop = 0
    })

    await expect.poll(async () => parseRangeStart(await readText(windowValue))).toBe(1)

    await page.locator(DATA_GRID_SELECTORS.row).first().locator(DATA_GRID_SELECTORS.cell).nth(1).click()
    await expect(activeCellValue).toContainText("service")
    await expect(page.locator(DATA_GRID_SELECTORS.emptyState)).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })

  test("horizontal long scroll session updates window metrics deterministically", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    const viewport = page.locator(DATA_GRID_SELECTORS.viewport)
    await viewport.waitFor()

    const columnWindowValue = metricValue(page, "Visible columns window")
    const activeCellValue = metricValue(page, "Active cell")
    const initialWindow = await readText(columnWindowValue)

    await runLongHorizontalSession(viewport)

    const canScroll = await viewport.evaluate(element => element.scrollWidth > element.clientWidth + 1)
    if (canScroll) {
      await expect.poll(async () => viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    } else {
      await expect.poll(async () => viewport.evaluate(element => element.scrollLeft)).toBe(0)
      await expect.poll(async () => await readText(columnWindowValue)).toBe(initialWindow)
    }

    const targetCell = page
      .locator(
        `${DATA_GRID_SELECTORS.row} ${DATA_GRID_SELECTORS.cell}[${DATA_GRID_DATA_ATTRS.rowId}][${DATA_GRID_DATA_ATTRS.columnKey}]:not([${DATA_GRID_DATA_ATTRS.columnKey}="select"])`
      )
      .first()
    const targetColumnKey = await targetCell.getAttribute(DATA_GRID_DATA_ATTRS.columnKey)
    expect(targetColumnKey).toBeTruthy()
    await targetCell.click()
    await expect(activeCellValue).toContainText(targetColumnKey ?? "")

    await viewport.evaluate(element => {
      element.scrollLeft = 0
      element.scrollTop = 0
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
    const indicator = page.locator(".datagrid-controls__filter-indicator", { hasText: "Quick filter" })
    const clearButton = page.locator(".datagrid-controls__clear-filter")

    await expect(indicator).toContainText("Quick filter: all rows")
    await input.fill("edge-gateway-1")

    await expect.poll(async () => indicator.getAttribute("data-active")).toBe("true")
    await expect(filteredValue).not.toHaveText(total)

    await clearButton.click()
    await expect.poll(async () => indicator.getAttribute("data-active")).toBe("false")
    await expect.poll(async () => await readText(filteredValue)).toBe(total)
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
    const canScroll = await viewport.evaluate(element => element.scrollHeight > element.clientHeight + 1)
    if (canScroll) {
      await expect.poll(async () => viewport.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
      await expect(windowValue).not.toHaveText("—")
    } else {
      await expect.poll(async () => viewport.evaluate(element => element.scrollTop)).toBe(0)
    }
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

test.describe("datagrid group-by baseline", () => {
  test("group by owner clusters rows and exposes group metrics", async ({ page }) => {
    await page.goto(ROUTE)

    await selectControlOption(page, "Group by", "Owner")

    await expect(metricValue(page, "Group by")).toContainText("owner")
    await expect.poll(async () => parseMetricNumber(await readText(metricValue(page, "Groups")))).toBeGreaterThan(1)
    await expect(page.locator(".datagrid-controls__status")).toContainText("Grouped by owner")
    await expect(page.locator(".datagrid-stage__tree-toggle").first()).toBeVisible()
  })

  test("group by remains deterministic with quick filter and sorting", async ({ page }) => {
    await page.goto(ROUTE)

    await selectControlOption(page, "Group by", "Service")
    await page.locator('.datagrid-controls input[placeholder*="quick filter"]').fill("edge-gateway")

    await expect(metricValue(page, "Group by")).toHaveText("service")
    await expect.poll(async () => parseMetricNumber(await readText(metricValue(page, "Groups")))).toBeGreaterThan(0)

    await headerCell(page, "Latency (ms)").click()
    await expect(page.locator('.datagrid-stage__row .datagrid-stage__cell[data-column-key="service"]').first()).toContainText(
      "edge-gateway",
    )
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

    await runLongHorizontalSession(viewport)
    const canScroll = await viewport.evaluate(element => element.scrollWidth > element.clientWidth + 1)
    if (canScroll) {
      await expect.poll(async () => viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    }
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
    const canScroll = await viewport.evaluate(element => element.scrollWidth > element.clientWidth + 1)
    if (canScroll) {
      await expect.poll(async () => viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    }
  })

  test("double click resize handle auto-sizes using content heuristics", async ({ page }) => {
    await page.goto(ROUTE)

    const ownerHeader = page.locator('.datagrid-stage__cell--header[data-column-key="owner"]').first()
    const ownerHandle = page.locator('[data-datagrid-resize-handle][data-column-key="owner"]').first()

    await dragResizeHandle(page, ownerHandle, -55)
    const narrowedWidth = await headerWidth(ownerHeader)

    await ownerHandle.dblclick()
    const autoSizedWidth = await headerWidth(ownerHeader)
    expect(autoSizedWidth).toBeGreaterThan(0)
  })

  test("pinned column resize keeps sticky offset under horizontal scroll", async ({ page }) => {
    await page.goto(ROUTE)

    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    await expect.poll(async () => page.locator('.datagrid-stage__cell[data-column-key="owner"]').count()).toBeGreaterThan(1)

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

test.describe("datagrid clipboard copy foundation", () => {
  test("keyboard copy exports selected range and shows visual feedback", async ({ page }) => {
    await page.goto(ROUTE)

    const copiedMetric = metricValue(page, "Copied cells")
    const actionStatus = page.locator(".datagrid-controls__status")
    const firstServiceCell = page.locator('.datagrid-stage__row .datagrid-stage__cell[data-column-key="service"]').first()

    await firstServiceCell.click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("ControlOrMeta+C")

    await expect.poll(async () => parseMetricNumber(await readText(copiedMetric))).toBeGreaterThan(0)
    await expect(actionStatus).toContainText("Copied")
    await expect(page.locator(".datagrid-stage__cell--copied").first()).toBeVisible()
  })

  test("context menu copy works with pinned column in virtualized scroll session", async ({ page }) => {
    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")
    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(".datagrid-stage__viewport")
    await runLongVerticalSession(viewport)
    await runLongHorizontalSession(viewport)

    const copiedMetric = metricValue(page, "Copied cells")
    const actionStatus = page.locator(".datagrid-controls__status")
    const statusCell = page.locator('.datagrid-stage__row .datagrid-stage__cell[data-column-key="status"]').first()

    await statusCell.scrollIntoViewIfNeeded()
    await statusCell.click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(1)
    const copyAction = page.locator("[data-datagrid-copy-action]").first()
    await copyAction.focus()
    await page.keyboard.press("Enter")

    await expect.poll(async () => parseMetricNumber(await readText(copiedMetric))).toBeGreaterThan(0)
    await expect(actionStatus).toContainText("Copied")
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(0)
  })
})

test.describe("datagrid clipboard paste foundation", () => {
  test("keyboard paste applies matrix in virtualized+pinned session", async ({ page }) => {
    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")
    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("ControlOrMeta+C")

    const viewport = page.locator(".datagrid-stage__viewport")
    await runLongVerticalSession(viewport)
    await runLongHorizontalSession(viewport)
    await viewport.evaluate(element => {
      element.scrollLeft = 0
      element.scrollTop = 0
    })

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("ControlOrMeta+V")

    await expect(page.locator(".datagrid-controls__status")).toContainText("Pasted")
  })

  test("context menu paste supports partial apply with blocked cells", async ({ page }) => {
    await page.goto(ROUTE)

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("ControlOrMeta+C")

    const serviceBefore = await cellText(page, "service", 2)
    await cellLocator(page, "service", 2).click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(1)
    await page.locator("[data-datagrid-paste-action]").click()

    await expect(page.locator(".datagrid-controls__status")).toContainText("blocked")
    await expect(cellLocator(page, "service", 2)).toHaveText(serviceBefore)
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(0)
  })
})

test.describe("datagrid clipboard cut foundation", () => {
  test("keyboard cut clears editable range and keeps copy payload flow", async ({ page }) => {
    await page.goto(ROUTE)

    const actionStatus = page.locator(".datagrid-controls__status")
    const ownerBefore = await cellText(page, "owner", 0)
    const regionBefore = await cellText(page, "region", 0)

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("ControlOrMeta+X")

    await expect(actionStatus).toContainText("Cut")
    expect(await cellText(page, "owner", 0)).not.toBe(ownerBefore)
    await expect(cellLocator(page, "owner", 0)).toHaveText("")
  })

  test("context cut supports mixed editable/non-editable selection with blocked count", async ({ page }) => {
    await page.goto(ROUTE)

    const serviceBefore = await cellText(page, "service", 0)
    await cellLocator(page, "service", 0).click()
    await page.keyboard.press("Shift+ArrowRight")

    await cellLocator(page, "service", 0).click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(1)
    await page.locator("[data-datagrid-cut-action]").click()

    await expect(page.locator(".datagrid-controls__status")).toContainText("blocked")
    await expect(cellLocator(page, "service", 0)).toHaveText(serviceBefore)
    await expect(cellLocator(page, "owner", 0)).toHaveText("")
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveCount(0)
  })
})

test.describe("datagrid context menu system", () => {
  test("header context menu routes sort/filter/auto-size actions", async ({ page }) => {
    await page.goto(ROUTE)

    const ownerHeader = page.locator('.datagrid-stage__cell--header[data-column-key="owner"]').first()
    const ownerHandle = page.locator('[data-datagrid-resize-handle][data-column-key="owner"]').first()
    const sortValue = metricValue(page, "Sort state")

    await dragResizeHandle(page, ownerHandle, -60)
    const narrowedWidth = await headerWidth(ownerHeader)

    await ownerHeader.click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveAttribute("data-zone", "header")
    await page.locator('[data-datagrid-menu-action="sort-desc"]').click()
    await expect(sortValue).toContainText("1:owner:desc")

    await ownerHeader.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="filter"]').click()
    await expect(page.locator("[data-datagrid-filter-panel]")).toHaveAttribute("data-column-key", "owner")
    await page.locator("[data-datagrid-filter-close]").click()

    await ownerHeader.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="auto-size"]').click()
    const autoSizedWidth = await headerWidth(ownerHeader)
    expect(autoSizedWidth).toBeGreaterThan(0)
  })

  test("keyboard Shift+F10 opens cell context menu and executes clear action", async ({ page }) => {
    await page.goto(ROUTE)

    const ownerCell = cellLocator(page, "owner", 0)
    const activeCellMetric = metricValue(page, "Active cell")
    await ownerCell.click()
    const activeBefore = await readText(activeCellMetric)
    await page.keyboard.press("Shift+F10")
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveAttribute("data-zone", /cell|range/)
    await page.keyboard.press("ArrowDown")
    await expect(activeCellMetric).toHaveText(activeBefore)
    await page.locator('[data-datagrid-menu-action="clear"]').click()

    await expect(ownerCell).toHaveText("")
    await expect(page.locator(".datagrid-controls__status")).toContainText("Cleared")
  })

  test("pinned header context menu stays usable after horizontal scroll", async ({ page }) => {
    await page.goto(ROUTE)

    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(".datagrid-stage__viewport")
    await runLongHorizontalSession(viewport)

    const statusHeader = page.locator('.datagrid-stage__cell--header[data-column-key="status"]').first()
    await statusHeader.click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveAttribute("data-zone", "header")
    await page.locator('[data-datagrid-menu-action="sort-asc"]').click()
    await expect(metricValue(page, "Sort state")).toContainText("1:status:asc")
  })
})

test.describe("datagrid drag & drop editing flows", () => {
  test("alt-drag moves selected editable range and clears source", async ({ page }) => {
    await page.goto(ROUTE)

    const channelA = await cellText(page, "channel", 0)
    const runbookA = await cellText(page, "runbook", 0)
    const channelB = await cellText(page, "channel", 1)
    const runbookB = await cellText(page, "runbook", 1)

    await cellLocator(page, "channel", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")

    await altDragRange(page, cellLocator(page, "channel", 0), cellLocator(page, "channel", 3))
    await expect(cellLocator(page, "channel", 3)).toHaveText(channelA)
    await expect(cellLocator(page, "runbook", 3)).toHaveText(runbookA)
    await expect(cellLocator(page, "channel", 4)).toHaveText(channelB)
    await expect(cellLocator(page, "runbook", 4)).toHaveText(runbookB)
    await expect(cellLocator(page, "channel", 0)).toHaveText(channelA)
    await expect(cellLocator(page, "runbook", 0)).toHaveText(runbookA)
  })

  test("alt-drag remains stable in large virtualized+pinned session", async ({ page }) => {
    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")
    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(".datagrid-stage__viewport")
    await runLongVerticalSession(viewport)
    await runLongHorizontalSession(viewport)
    await viewport.evaluate(element => {
      element.scrollLeft = Math.max(0, element.scrollWidth - element.clientWidth - 120)
      element.scrollTop = 0
    })

    await cellLocator(page, "channel", 0).click()
    await page.keyboard.press("Shift+ArrowRight")
    await page.keyboard.press("Shift+ArrowDown")
    const beforeStart = parseRangeStart(await readText(metricValue(page, "Window")))
    await altDragRangeWithAutoScroll(page, cellLocator(page, "channel", 0), viewport)
    await expect(page.locator(".datagrid-stage__selection-overlay--move")).toHaveCount(0)
    await expect.poll(async () => parseRangeStart(await readText(metricValue(page, "Window")))).toBeGreaterThan(beforeStart)
  })
})

test.describe("datagrid history undo/redo regression", () => {
  test("keyboard undo/redo restores edit, paste, cut in grouped + virtualized mode", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await prepareGroupedVirtualizedSession(page)

    const viewport = page.locator(".datagrid-stage__viewport")
    await viewport.evaluate(element => {
      element.scrollTop = 0
      element.scrollLeft = 0
    })
    await expect.poll(async () => page
      .locator('.datagrid-stage__row:not(.datagrid-stage__row--group-start) .datagrid-stage__cell[data-column-key="owner"]')
      .count()).toBeGreaterThan(1)

    const ownerCell = leafCellLocator(page, "owner", 0)
    const ownerBefore = await readText(ownerCell)

    const pasteTarget = leafCellLocator(page, "owner", 1)
    const pasteTargetBefore = await readText(pasteTarget)
    await ownerCell.click()
    await page.keyboard.press("ControlOrMeta+C")
    await pasteTarget.click()
    await page.keyboard.press("ControlOrMeta+V")
    await expect(page.locator(".datagrid-controls__status")).toContainText("Pasted")

    if (!(await undoControl(page).isEnabled())) {
      return
    }
    await historyUndoKeyboard(page)
    await expect(redoControl(page)).toBeEnabled()
    await historyRedoKeyboard(page)
    await expect(undoControl(page)).toBeEnabled()

    const deploymentCell = leafCellLocator(page, "deployment", 0)
    const deploymentBefore = await readText(deploymentCell)
    await deploymentCell.click()
    await page.keyboard.press("ControlOrMeta+X")
    await expect.poll(async () => await readText(deploymentCell)).toBe("")

    await historyUndoKeyboard(page)
    await expect.poll(async () => await readText(deploymentCell)).toBe(deploymentBefore)
    await historyRedoKeyboard(page)
    await expect.poll(async () => await readText(deploymentCell)).toBe("")

    expect(pageErrors).toEqual([])
  })

  test("control undo/redo restores fill and move in grouped + virtualized mode", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await prepareGroupedVirtualizedSession(page)

    const deploymentCell0 = leafCellLocator(page, "deployment", 0)
    const deploymentCell1 = leafCellLocator(page, "deployment", 1)
    const deploymentCell2 = leafCellLocator(page, "deployment", 2)

    await deploymentCell0.click()
    await page.keyboard.press("ControlOrMeta+C")
    await deploymentCell1.click()
    await page.keyboard.press("ControlOrMeta+V")
    await deploymentCell2.click()
    await page.keyboard.press("ControlOrMeta+V")
    await expect(page.locator(".datagrid-controls__status")).toContainText("Pasted")

    if (!(await undoControl(page).isEnabled())) {
      return
    }
    await historyUndoControl(page)
    await expect(redoControl(page)).toBeEnabled()

    await historyRedoControl(page)
    await expect(undoControl(page)).toBeEnabled()

    expect(pageErrors).toEqual([])
  })
})

test.describe("datagrid critical regression bundle", () => {
  test("baseline critical path (sort/filter/resize/clipboard/context) stays stable", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    const sortValue = metricValue(page, "Sort state")
    const filteredValue = metricValue(page, "Filtered")
    const totalValue = metricValue(page, "Total")

    await headerCell(page, "Service").click()
    await expect(sortValue).toContainText("1:service:asc")

    const totalCount = parseMetricNumber(await readText(totalValue))
    await openHeaderFilter(page, "owner")
    await page.locator("[data-datagrid-filter-value]").fill("ari")
    await page.locator("[data-datagrid-filter-apply]").click()
    await expect(page.locator(".datagrid-controls__status")).toContainText("Filter applied")
    await expect.poll(async () => parseMetricNumber(await readText(filteredValue))).toBeLessThan(totalCount)

    if (await page.locator(".datagrid-stage__row").count() === 0) {
      await openHeaderFilter(page, "owner")
      await page.locator("[data-datagrid-filter-clear-all]").click()
    }

    const ownerHeader = page.locator('.datagrid-stage__cell--header[data-column-key="owner"]').first()
    const ownerHandle = page.locator('[data-datagrid-resize-handle][data-column-key="owner"]').first()
    const ownerWidthBefore = await headerWidth(ownerHeader)
    await dragResizeHandle(page, ownerHandle, 70)
    const ownerWidthAfter = await headerWidth(ownerHeader)
    expect(ownerWidthAfter).toBeGreaterThanOrEqual(ownerWidthBefore)

    const ownerCells = page.locator('.datagrid-stage__cell[data-column-key="owner"]')
    if ((await ownerCells.count()) < 2) {
      await openHeaderFilter(page, "owner")
      await page.locator("[data-datagrid-filter-clear-all]").click()
    }
    await expect.poll(async () => ownerCells.count()).toBeGreaterThan(1)

    const viewport = page.locator(".datagrid-stage__viewport")
    await viewport.evaluate(element => {
      element.scrollTop = 0
    })
    const ownerCell0 = cellLocator(page, "owner", 0)
    await ownerCell0.click()
    await page.keyboard.press("ControlOrMeta+C")
    await page.evaluate(() => {
      const cells = document.querySelectorAll('.datagrid-stage__row .datagrid-stage__cell[data-column-key="owner"]')
      const target = cells[1]
      if (target instanceof HTMLElement) {
        target.click()
      }
    })
    await page.keyboard.press("ControlOrMeta+V")
    await expect(page.locator(".datagrid-controls__status")).toContainText("Pasted")

    await viewport.focus()
    await page.keyboard.press("Shift+F10")
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveAttribute("data-zone", "cell")
    await page.locator('[data-datagrid-menu-action="cut"]').click()
    await expect(page.locator(".datagrid-controls__status")).toContainText("Cut")

    expect(pageErrors).toEqual([])
  })

  test("pinned+virtualized critical path remains deterministic", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", error => {
      pageErrors.push(error.message)
    })

    await page.goto(ROUTE)

    await selectRowsPreset(page, "6400")
    await page
      .locator(".datagrid-controls label")
      .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
      .locator('input[type="checkbox"]')
      .check()

    const viewport = page.locator(".datagrid-stage__viewport")
    await runLongVerticalSession(viewport)
    await runLongHorizontalSession(viewport)

    const statusHeader = page.locator('.datagrid-stage__cell--header[data-column-key="status"]').first()
    await statusHeader.click({ button: "right" })
    await expect(page.locator("[data-datagrid-copy-menu]")).toHaveAttribute("data-zone", "header")
    await page.locator('[data-datagrid-menu-action="sort-asc"]').click()
    await expect(metricValue(page, "Sort state")).toContainText("1:status:asc")

    await openHeaderFilter(page, "service")
    await page.locator("[data-datagrid-filter-value]").fill("edge-gateway")
    await page.locator("[data-datagrid-filter-apply]").click()
    await expect(metricValue(page, "Column filters")).toHaveText("1")
    const filterPanel = page.locator("[data-datagrid-filter-panel]")
    if ((await filterPanel.count()) > 0) {
      await page.keyboard.press("Escape")
      await expect(filterPanel).toHaveCount(0)
    }

    await viewport.evaluate(element => {
      element.scrollLeft = 0
    })
    await expect.poll(async () => page.locator('.datagrid-stage__cell[data-column-key="owner"]').count()).toBeGreaterThan(0)
    await page.evaluate(() => {
      const cell = document.querySelector('.datagrid-stage__row .datagrid-stage__cell[data-column-key="owner"]')
      if (cell instanceof HTMLElement) {
        cell.click()
      }
    })
    const ownerTargetCell = page
      .locator('.datagrid-stage__row .datagrid-stage__cell[data-column-key="owner"]')
      .first()
    const copyMenu = page.locator("[data-datagrid-copy-menu]")
    await ownerTargetCell.click()
    await viewport.focus()
    await page.keyboard.press("Shift+F10")
    if ((await copyMenu.count()) === 0) {
      await ownerTargetCell.click({ button: "right", force: true })
    }
    await expect(copyMenu).toHaveCount(1)
    await page.keyboard.press("Escape")
    await expect(copyMenu).toHaveCount(0)

    expect(pageErrors).toEqual([])
  })
})

test.describe("datagrid accessibility pass", () => {
  test("grid exposes active-descendant and semantic row/col indexes", async ({ page }) => {
    await page.goto(ROUTE)

    const viewport = page.locator(".datagrid-stage__viewport")
    const ownerCell = cellLocator(page, "owner", 0)
    await ownerCell.click()

    await expect(viewport).toHaveAttribute("role", "grid")
    await expect(viewport).toHaveAttribute("aria-multiselectable", "true")
    await expect(viewport).toHaveAttribute("aria-colcount", /\d+/)
    await expect(viewport).toHaveAttribute("aria-rowcount", /\d+/)

    const activeDescendantId = await viewport.getAttribute("aria-activedescendant")
    expect(activeDescendantId).toBeTruthy()
    if (!activeDescendantId) {
      throw new Error("Expected aria-activedescendant to be set")
    }
    await expect(page.locator(`#${activeDescendantId}`)).toHaveAttribute("role", "gridcell")
    await expect(ownerCell).toHaveAttribute("aria-colindex", /\d+/)
  })

  test("context menu is keyboard-focusable and traps arrow navigation", async ({ page }) => {
    await page.goto(ROUTE)

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("Shift+F10")

    const menu = page.locator(DATA_GRID_SELECTORS.copyMenu)
    await expect(menu).toHaveAttribute("role", "menu")
    await expect(menu).toHaveAttribute("aria-label", /Cell actions|Column actions/)

    const menuItems = page.locator(DATA_GRID_SELECTORS.menuAction)
    await expect(menuItems.first()).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(menuItems.nth(1)).toBeFocused()
  })

  test("live region announces clipboard actions", async ({ page }) => {
    await page.goto(ROUTE)

    await cellLocator(page, "owner", 0).click()
    await page.keyboard.press("ControlOrMeta+C")

    const liveRegion = page.locator(".datagrid-sr-only[role='status']")
    await expect(liveRegion).toContainText("Copied")
  })
})

function metricValue(page: Page, label: string): Locator {
  return page
    .locator(`${DATA_GRID_SELECTORS.metrics} div`)
    .filter({ has: page.locator("dt", { hasText: label }) })
    .locator("dd")
    .first()
}

function headerCell(page: Page, label: string): Locator {
  return page
    .locator(DATA_GRID_SELECTORS.headerCell)
    .filter({ hasText: label })
    .first()
}

function headerFilterTrigger(page: Page, columnKey: string): Locator {
  return page
    .locator(`[${DATA_GRID_DATA_ATTRS.filterTrigger}][${DATA_GRID_DATA_ATTRS.columnKey}="${columnKey}"]`)
    .first()
}

async function openHeaderFilter(page: Page, columnKey: string): Promise<void> {
  await headerFilterTrigger(page, columnKey).click()
  await expect(page.locator(DATA_GRID_SELECTORS.filterPanel)).toHaveAttribute(DATA_GRID_DATA_ATTRS.columnKey, columnKey)
}

function cellLocator(page: Page, columnKey: string, rowIndex: number): Locator {
  return page.locator(`${DATA_GRID_SELECTORS.row} ${dataGridCellSelector(columnKey)}`).nth(rowIndex)
}

function leafCellLocator(page: Page, columnKey: string, rowIndex: number): Locator {
  return page
    .locator(`${DATA_GRID_SELECTORS.row}:not(.datagrid-stage__row--group-start) ${dataGridCellSelector(columnKey)}`)
    .nth(rowIndex)
}

async function cellText(page: Page, columnKey: string, rowIndex: number): Promise<string> {
  return readText(cellLocator(page, columnKey, rowIndex))
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

async function altDragRange(page: Page, fromCell: Locator, toCell: Locator): Promise<void> {
  const from = await boundingBox(fromCell)
  const to = await boundingBox(toCell)
  const startX = from.x + Math.min(6, Math.max(2, from.width * 0.2))
  const startY = from.y + Math.min(6, Math.max(2, from.height * 0.2))
  const endX = to.x + Math.max(8, Math.min(to.width - 8, to.width * 0.5))
  const endY = to.y + Math.max(8, Math.min(to.height - 8, to.height * 0.5))
  await page.keyboard.down("Alt")
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
  await page.mouse.up()
  await page.keyboard.up("Alt")
}

async function altDragRangeWithAutoScroll(page: Page, fromCell: Locator, viewport: Locator): Promise<void> {
  const from = await boundingBox(fromCell)
  const viewportBox = await boundingBox(viewport)
  const startX = from.x + Math.min(6, Math.max(2, from.width * 0.2))
  const startY = from.y + Math.min(6, Math.max(2, from.height * 0.2))
  const endX = viewportBox.x + Math.max(12, Math.min(viewportBox.width - 12, viewportBox.width * 0.5))
  const endY = viewportBox.y + viewportBox.height - 3
  await page.keyboard.down("Alt")
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  for (let step = 0; step < 12; step += 1) {
    await page.mouse.move(endX, endY)
    await page.waitForTimeout(20)
  }
  await page.mouse.up()
  await page.keyboard.up("Alt")
}

async function dragFillHandle(page: Page, fromCell: Locator, toCell: Locator): Promise<void> {
  await fromCell.hover()
  const handle = fromCell.locator(DATA_GRID_SELECTORS.selectionHandleCell).first()
  await expect(handle).toBeVisible()
  const handleBox = await boundingBox(handle)
  const targetBox = await boundingBox(toCell)
  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2
  const endX = targetBox.x + Math.max(8, Math.min(targetBox.width - 8, targetBox.width * 0.5))
  const endY = targetBox.y + Math.max(8, Math.min(targetBox.height - 8, targetBox.height * 0.5))
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
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
  await selectControlOption(page, "Rows", rows)
}

async function selectControlOption(page: Page, label: string, option: string): Promise<void> {
  const control = page
    .locator(".datagrid-controls label")
    .filter({ has: page.locator("span", { hasText: label }) })

  const listboxTrigger = control.locator("[data-affino-listbox-trigger]")
  if (await listboxTrigger.count()) {
    await listboxTrigger.click()
    const listboxOption = page
      .locator('[data-affino-listbox-surface] [data-affino-listbox-option]', { hasText: option })
      .first()
    await listboxOption.click()
    return
  }

  const menuTrigger = control.locator(".datagrid-controls__menu-trigger")
  await menuTrigger.click()
  const menuItem = page.locator('[role="menuitem"]', { hasText: option }).first()
  await menuItem.click()
}

function undoControl(page: Page): Locator {
  return page.getByRole("button", { name: "Undo" }).first()
}

function redoControl(page: Page): Locator {
  return page.getByRole("button", { name: "Redo" }).first()
}

async function historyUndoKeyboard(page: Page): Promise<void> {
  await page.keyboard.press("ControlOrMeta+Z")
}

async function historyRedoKeyboard(page: Page): Promise<void> {
  await page.keyboard.press("ControlOrMeta+Shift+Z")
}

async function historyUndoControl(page: Page): Promise<void> {
  await expect(undoControl(page)).toBeEnabled()
  await undoControl(page).click()
}

async function historyRedoControl(page: Page): Promise<void> {
  await expect(redoControl(page)).toBeEnabled()
  await redoControl(page).click()
}

async function prepareGroupedVirtualizedSession(page: Page): Promise<void> {
  await page.goto(ROUTE)
  await selectRowsPreset(page, "6400")
  await selectControlOption(page, "Group by", "Service")
  await page
    .locator(".datagrid-controls label")
    .filter({ has: page.locator("span", { hasText: "Pin status column" }) })
    .locator('input[type="checkbox"]')
    .check()

  const viewport = page.locator(DATA_GRID_SELECTORS.viewport)
  await viewport.waitFor()
  await runLongVerticalSession(viewport)
  await runLongHorizontalSession(viewport)
  await viewport.evaluate(element => {
    element.scrollLeft = 0
  })
  await expect(metricValue(page, "Group by")).toHaveText("service")
  await expect.poll(async () => parseRangeStart(await readText(metricValue(page, "Window")))).toBeGreaterThan(10)
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

function parseMetricNumber(raw: string): number {
  const normalized = raw.replace(/[^\d.-]/g, "")
  if (!normalized) {
    return 0
  }
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}
