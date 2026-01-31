import { expect, test } from "@playwright/test"

const tooltipRoute = "/tooltips"

test.describe("tooltip demos", () => {
  test("hover, focus, and programmatic flows stay in sync", async ({ page }) => {
    await page.goto(tooltipRoute)

    const hoverTrigger = page.getByRole("button", { name: "Inspect SLA" })
    const hoverBubble = page.locator(".tooltip-bubble").filter({ hasText: "Always-on" })

    await hoverTrigger.hover()
    await expect(hoverBubble).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(hoverBubble).toHaveCount(0)

    const emailInput = page.getByLabel("Work email")
    const fieldBubble = page.locator(".tooltip-bubble").filter({ hasText: "Verified domains" })

    await emailInput.focus()
    await expect(fieldBubble).toBeVisible()
    await emailInput.evaluate((node: HTMLInputElement) => node.blur())
    await expect(fieldBubble).toHaveCount(0)

    const manualBubble = page.locator(".tooltip-bubble").filter({ hasText: "Pinned tooltips" })
    const openNow = page.getByRole("button", { name: "Open now" })
    const closeNow = page.getByRole("button", { name: "Close" })
    const keepOpenToggle = page.getByLabel("Keep open")

    await openNow.click()
    await expect(manualBubble).toBeVisible()

    await closeNow.click()
    await expect(manualBubble).toHaveCount(0)

    await keepOpenToggle.check()
    await expect(manualBubble).toBeVisible()

    await keepOpenToggle.uncheck()
    await expect(manualBubble).toHaveCount(0)
  })
})
