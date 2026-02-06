import { expect, test } from "@playwright/test"

test.describe("laravel manual bridge", () => {
  test("listbox manual actions dispatch and update state", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/listbox")

    const manual = page.locator(".listbox-edge--manual")
    const listboxRoot = manual.locator("[data-affino-listbox-root]")
    const lastAction = manual.locator(".listbox-manual__state dd").nth(1)

    await manual.getByRole("button", { name: "Open" }).click()
    await expect(listboxRoot).toHaveAttribute("data-affino-listbox-state", "open")
    await expect(lastAction).toHaveText("open")

    await manual.getByRole("button", { name: "Close" }).click()
    await expect(listboxRoot).toHaveAttribute("data-affino-listbox-state", "closed")
    await expect(lastAction).toHaveText("close")

    await manual.getByRole("button", { name: "Select Tier 0" }).click()
    await expect(lastAction).toHaveText("select:tier-0")
  })
})
