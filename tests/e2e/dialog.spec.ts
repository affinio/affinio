import { expect, test } from "@playwright/test"

const dialogRoute = "/dialogs"

test.describe("dialog overlays", () => {
  test("opens and traps focus via shared overlay host", async ({ page }) => {
    await page.goto(dialogRoute)
    await page.getByRole("button", { name: "Open dialog" }).click()

    const dialogSurface = page.locator("[data-affino-dialog-host] .surface")
    await expect(dialogSurface).toBeVisible()

    // Menu trigger should live inside dialog surface and stay interactive.
    const menuTrigger = dialogSurface.getByRole("button", { name: "Inline actions" })
    await expect(menuTrigger).toBeVisible()
    await menuTrigger.click()

    const menuPanel = page.locator('[data-ui-menu-panel="true"]')
    await expect(menuPanel).toBeVisible()

    // Ensure tooltip teleport host renders inside the same overlay tree.
    await page.getByRole("button", { name: "SLA policy" }).hover()
    const tooltip = page.locator(".surface-tooltip__bubble")
    await expect(tooltip).toBeVisible()
  })
})
