import { expect, test } from "@playwright/test"

test.describe("laravel dialog actions", () => {
  test("save increments revision count", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/dialogs")

    const openTrigger = page.getByRole("button", { name: "Open incident modal" })
    await openTrigger.click()

    const surface = page
      .locator("[data-affino-dialog-surface]")
      .filter({ hasText: "Incident update draft" })
      .first()
    await expect(surface).toBeVisible()

    const savedHint = surface.locator(".dialogs-hint")
    await expect(savedHint).toContainText("Saved revisions: 0")

    await surface.getByRole("button", { name: "Save" }).click()

    const root = page.locator("[data-affino-dialog-root]").filter({ has: openTrigger }).first()
    await expect(root).toHaveAttribute("data-affino-dialog-state", "closed")

    const savedMeta = page.locator(".dialogs-meta dt", { hasText: "Saved" }).locator("..")
    await expect(savedMeta).toContainText("1")
  })

  test("reset clears inputs on first click", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/dialogs")

    const openTrigger = page.getByRole("button", { name: "Open incident modal" })
    await openTrigger.click()

    const surface = page
      .locator("[data-affino-dialog-surface]")
      .filter({ hasText: "Incident update draft" })
      .first()
    await expect(surface).toBeVisible()

    const titleInput = surface.getByPlaceholder("Incident title")
    const ownerInput = surface.getByPlaceholder("Owner")

    await expect(titleInput).toHaveValue(/.+/)
    await expect(ownerInput).toHaveValue(/.+/)

    await surface.getByRole("button", { name: "Reset" }).click()

    await expect(titleInput).toHaveValue("")
    await expect(ownerInput).toHaveValue("")
  })
})