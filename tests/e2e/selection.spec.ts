import { expect, test, type Page } from "@playwright/test"

const selectionRoute = "/selection"

const gridCell = (page: Page, label: string) =>
  page.locator(".grid-cell", { hasText: label }).first()

const listboxOption = (page: Page, label: string) =>
  page.getByRole("option", { name: new RegExp(`^${label}`) })

test.describe("selection demos", () => {
  test("grid selection combos update counters", async ({ page }) => {
    await page.goto(selectionRoute)

    const grid = page.getByRole("grid", { name: "Selection grid" })
    const selectedCount = page.locator(".selection-status .status-value")
    const activeRange = page.locator(".selection-status .status-grid .status-pill").first()
    const cursorLabel = page.locator(".selection-status .status-grid .status-pill").nth(1)
    const clearSelectionButton = page.getByRole("button", { name: "Clear selection" })

    await expect(selectedCount).toHaveText("1")
    await expect(activeRange).toHaveText("A1")
    await expect(cursorLabel).toHaveText("A1")

    await gridCell(page, "C3").click({ modifiers: ["Shift"] })
    await expect(selectedCount).toHaveText("9")
    await expect(activeRange).toHaveText("A1 – C3")
    await expect(cursorLabel).toHaveText("C3")

    const toggledCell = gridCell(page, "B2")
    await toggledCell.click({ modifiers: ["Control"] })
    await expect(selectedCount).toHaveText("8")
    await expect(toggledCell).not.toHaveClass(/grid-cell--selected/)

    await clearSelectionButton.click()
    await expect(selectedCount).toHaveText("0")
    await expect(activeRange).toHaveText("—")
    await expect(cursorLabel).toHaveText("—")

    await grid.focus()
    await page.keyboard.press("ArrowRight")
    await expect(selectedCount).toHaveText("1")
    await expect(activeRange).toHaveText("B1")
    await expect(cursorLabel).toHaveText("B1")

    await page.keyboard.press("Shift+ArrowDown")
    await expect(selectedCount).toHaveText("2")
    await expect(activeRange).toHaveText("B1 – B2")
    await expect(cursorLabel).toHaveText("B2")
  })

  test("listbox adapters honor pointer + keyboard intents", async ({ page }) => {
    await page.goto(selectionRoute)

    const listbox = page.getByRole("listbox")
    const statCount = page.locator(".listbox-card .stat-count")
    const summary = page.locator(".listbox-footer .muted")
    const clearButton = page.getByRole("button", { name: "Clear", exact: true })

    await listboxOption(page, "Command Palette").click()
    await expect(statCount).toHaveText("1")

    await listboxOption(page, "Dashboards").click({ modifiers: ["Shift"] })
    await expect(statCount).toHaveText("3")
    await expect(summary).toContainText("Command Palette – Dashboards")

    await listbox.click()
    await page.keyboard.press("Control+a")
    await expect(statCount).toHaveText("12")
    await expect(summary).toContainText("Command Palette – Labs")

    const featureFlags = listboxOption(page, "Feature Flags")
    await featureFlags.click({ modifiers: ["Control"] })
    await expect(statCount).toHaveText("11")
    await expect(featureFlags).not.toHaveClass(/listbox-item--selected/)

    await clearButton.click()
    await expect(statCount).toHaveText("0")
    await expect(summary).toHaveText("Nothing selected")
  })
})
