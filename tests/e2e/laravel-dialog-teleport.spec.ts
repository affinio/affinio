import { expect, test } from "@playwright/test"

test.describe("laravel dialog teleport", () => {
  test("keeps focus while typing and closes via buttons", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/dialogs")

    const openTrigger = page.getByRole("button", { name: "Open incident modal" })
    await openTrigger.click()

    const surface = page
      .locator("[data-affino-dialog-surface]")
      .filter({ hasText: "Incident update draft" })
      .first()
    await expect(surface).toBeVisible()

    const input = surface.getByPlaceholder("Incident title")
    await input.fill("Draft update")
    await expect(input).toHaveValue("Draft update")
    await expect(input).toBeFocused()

    const saveButton = surface.getByRole("button", { name: "Save" })
    await saveButton.click()

    const root = page.locator("[data-affino-dialog-root]").filter({ has: openTrigger }).first()
    await expect(root).toHaveAttribute("data-affino-dialog-state", "closed")

    await openTrigger.click()
    await expect(surface).toBeVisible()

    const closeButton = surface.getByRole("button", { name: "Close" })
    await closeButton.click()
    await expect(root).toHaveAttribute("data-affino-dialog-state", "closed")
  })
})