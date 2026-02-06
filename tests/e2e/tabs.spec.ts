import { expect, test } from "@playwright/test"

test.describe("tabs adapters", () => {
  test("selects tabs and clears selection", async ({ page }) => {
    await page.goto("/tabs")

    const activeValue = page.locator(".adapter-log dd").nth(0)
    const lastSelection = page.locator(".adapter-log dd").nth(1)

    await expect(activeValue).toHaveText("overview")
    await expect(lastSelection).toHaveText("overview")

    await page.getByRole("tab", { name: "Journeys" }).click()
    await expect(activeValue).toHaveText("journeys")
    await expect(lastSelection).toHaveText("journeys")

    await page.getByRole("tab", { name: "Signals" }).click()
    await expect(activeValue).toHaveText("signals")
    await expect(lastSelection).toHaveText("signals")

    await page.getByRole("button", { name: "Clear selection" }).click()
    await expect(activeValue).toHaveText("overview")
    await expect(lastSelection).toHaveText("overview")
  })
})
