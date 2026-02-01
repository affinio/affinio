import { expect, Locator, Page, test } from "@playwright/test"

const ROUTE = "/virtualization"

test.describe("virtualization demo", () => {
  test("grid windows respond to aggressive scrolling", async ({ page }) => {
    await page.goto(ROUTE)

    const viewport = page.locator(".grid-viewport")
    await viewport.waitFor()

    const rowWindowValue = toolbarValue(page, 0)
    const columnWindowValue = toolbarValue(page, 1)
    const renderedCellsValue = toolbarValue(page, 2)
    const overscanSummary = toolbarValue(page, 3)

    const initialRowWindow = await readTrimmedText(rowWindowValue)
    const initialColumnWindow = await readTrimmedText(columnWindowValue)

    await viewport.evaluate(element => {
      element.scrollTop = 2200
    })

    await expect.poll(async () => await readTrimmedText(rowWindowValue)).not.toBe(initialRowWindow)

    await viewport.evaluate(element => {
      element.scrollLeft = 1400
    })

    await expect.poll(async () => await readTrimmedText(columnWindowValue)).not.toBe(initialColumnWindow)

    await expect(renderedCellsValue).toHaveText(/^[0-9,]+$/)
    await expect(overscanSummary).toContainText("rows ·")
  })

  test("overscan controls expand the render budget", async ({ page }) => {
    await page.goto(ROUTE)

    const rowCard = controlCard(page, "Row overscan")
    const columnCard = controlCard(page, "Column overscan")
    const rowSlider = rowCard.locator('input[type="range"]')
    const columnSlider = columnCard.locator('input[type="range"]')
    const rowStatus = rowCard.locator(".control-status")
    const columnStatus = columnCard.locator(".control-status")
    const domValue = page.locator(".dom-value")
    const renderedRows = metricsValue(page, "Rendered rows")
    const renderedColumns = metricsValue(page, "Rendered columns")

    const initialRenderedRows = await readNumericText(renderedRows)
    const initialRenderedColumns = await readNumericText(renderedColumns)
    const initialDomNodes = await readNumericText(domValue)

    await rowSlider.fill("60")
    await columnSlider.fill("24")

    await expect(rowStatus).toHaveText("60 rows")
    await expect(columnStatus).toHaveText("24 cols")

    await expect.poll(async () => await readNumericText(renderedRows)).toBeGreaterThan(initialRenderedRows)
    await expect.poll(async () => await readNumericText(renderedColumns)).toBeGreaterThan(initialRenderedColumns)
    await expect.poll(async () => await readNumericText(domValue)).toBeGreaterThan(initialDomNodes)
  })
})

function toolbarValue(page: Page, index: number): Locator {
  return page.locator(".demo-toolbar > div").nth(index).locator(".toolbar-value")
}

function controlCard(page: Page, label: string): Locator {
  return page.locator(".control-card").filter({ has: page.locator(".control-label", { hasText: label }) })
}

function metricsValue(page: Page, label: string): Locator {
  return page.locator(".metrics-grid > div").filter({ has: page.locator("dt", { hasText: label }) }).locator("dd")
}

async function readTrimmedText(locator: Locator): Promise<string> {
  return (await locator.textContent())?.trim() ?? ""
}

async function readNumericText(locator: Locator): Promise<number> {
  const raw = (await locator.textContent())?.replace(/[^0-9.-]/g, "") ?? "0"
  return Number(raw)
}
