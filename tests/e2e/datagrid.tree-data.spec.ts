import { expect, Locator, test } from "@playwright/test"

const ROUTE = "/datagrid/must-have/tree-data"

test.describe("datagrid tree-data must-have", () => {
  test("expand/collapse all keeps projection deterministic", async ({ page }) => {
    await page.goto(ROUTE)

    await expect(page.locator(".datagrid-sugar-stage__row").first()).toBeVisible()
    await expect(page.locator(".datagrid-sugar-stage__group-toggle").first()).toBeVisible()

    const visibleRowsMetric = page.locator("[data-tree-visible-rows]")
    const before = await metricNumber(visibleRowsMetric)
    expect(before).toBeGreaterThan(0)

    await page.locator("[data-tree-collapse-all]").click()
    await expect(page.locator("[data-tree-status]")).toContainText("Collapsed groups")
    const collapsed = await metricNumber(visibleRowsMetric)
    expect(collapsed).toBeLessThan(before)

    await page.locator("[data-tree-expand-all]").click()
    await expect(page.locator("[data-tree-status]")).toContainText("Expanded groups")
    await expect.poll(async () => await metricNumber(visibleRowsMetric)).toBe(before)
  })

  test("quick filter + sort stay stable in tree projection", async ({ page }) => {
    await page.goto(ROUTE)

    const visibleRowsMetric = page.locator("[data-tree-visible-rows]")
    const before = await metricNumber(visibleRowsMetric)
    expect(before).toBeGreaterThan(0)

    await page.locator("[data-tree-quick-filter]").fill("payments-api")
    await page.locator("[data-tree-apply-filter]").click()

    await expect(page.locator("[data-tree-status]")).toContainText("Filter applied")
    await expect.poll(async () => await metricNumber(visibleRowsMetric)).toBeLessThan(before)
    await expect(
      page
        .locator('.datagrid-sugar-stage__row .datagrid-sugar-stage__cell[data-column-key="service"]')
        .first(),
    ).toContainText("payments-api")

    await page.locator("[data-tree-sort-select]").selectOption("owner-asc")
    await expect(page.locator("[data-tree-sort-state]")).toContainText("owner:asc")

    await page.locator("[data-tree-clear-filter]").click()
    await expect.poll(async () => await metricNumber(visibleRowsMetric)).toBe(before)
  })

  test("keyboard navigation and context menu are active in tree mode", async ({ page }) => {
    await page.goto(ROUTE)

    const serviceCell = page
      .locator('.datagrid-sugar-stage__row .datagrid-sugar-stage__cell[data-column-key="service"]')
      .first()
    await serviceCell.click()
    await page.keyboard.press("Shift+ArrowRight")

    await expect(page.locator(".datagrid-sugar-stage__selection-handle").first()).toBeVisible()

    await page.keyboard.press("Shift+F10")
    await expect(page.locator(".datagrid-sugar-context")).toBeVisible()
    await expect(page.locator(".datagrid-sugar-context__item").first()).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(".datagrid-sugar-context")).toHaveCount(0)
  })
})

async function metricNumber(locator: Locator): Promise<number> {
  const text = (await locator.textContent())?.trim() ?? ""
  const normalized = text.replace(/[^\d.-]/g, "")
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}
