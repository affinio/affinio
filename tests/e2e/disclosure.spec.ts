import { expect, test } from "@playwright/test"

test.describe("disclosure adapters", () => {
  test("toggles and closes panel", async ({ page }) => {
    await page.goto("/disclosure")

    const panel = page.locator(".disclosure-panel")
    const stateLog = page.locator(".adapter-log dd").nth(0)
    const eventLog = page.locator(".adapter-log dd").nth(1)
    const toggleButton = page.getByRole("button", { name: "Toggle project pulses" })
    const closeButton = page.getByRole("button", { name: "Force close" })

    await expect(panel).toHaveAttribute("data-state", "closed")
    await expect(stateLog).toHaveText("Closed")

    await toggleButton.click()
    await expect(panel).toHaveAttribute("data-state", "open")
    await expect(stateLog).toHaveText("Open")
    await expect(eventLog).toHaveText("Panel expanded")
    await expect(closeButton).toBeEnabled()

    await closeButton.click()
    await expect(panel).toHaveAttribute("data-state", "closed")
    await expect(stateLog).toHaveText("Closed")
    await expect(eventLog).toHaveText("Panel collapsed")
    await expect(closeButton).toBeDisabled()
  })
})
