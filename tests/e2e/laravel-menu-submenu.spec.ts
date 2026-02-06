import { expect, test } from "@playwright/test"

test.describe("laravel menu submenu", () => {
  test("binds submenu trigger", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")
    const submenuPanel = rootPanel
      .locator("[data-affino-menu-root][data-affino-menu-parent][data-affino-menu-parent-item]")
      .first()
      .locator(":scope > [data-affino-menu-panel]")
    await expect(submenuPanel).toBeAttached()
  })

  test("submenu trigger stays focusable", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")
    await submenuTrigger.focus()
    await expect(submenuTrigger).toBeFocused()
  })
})
