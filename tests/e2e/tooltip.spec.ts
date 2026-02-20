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

  test("basic hover tooltip respects delays and placement", async ({ page }) => {
    await page.goto(tooltipRoute)

    const trigger = page.getByRole("button", { name: "Inspect SLA" })
    const bubble = page.locator(".tooltip-bubble").filter({ hasText: "Always-on" })

    await trigger.hover()
    await expect(bubble).toHaveCount(0)
    await page.waitForTimeout(120)
    await expect(bubble).toBeVisible()

    const [triggerBox, bubbleBox] = await Promise.all([trigger.boundingBox(), bubble.boundingBox()])
    if (!triggerBox || !bubbleBox) {
      throw new Error("Failed to measure tooltip geometry")
    }

    const bubbleBottom = bubbleBox.y + bubbleBox.height
    expect(bubbleBottom).toBeLessThan(triggerBox.y + 1)

    const triggerCenter = triggerBox.x + triggerBox.width / 2
    const bubbleCenter = bubbleBox.x + bubbleBox.width / 2
    expect(Math.abs(triggerCenter - bubbleCenter)).toBeLessThan(6)

    const arrow = bubble.locator(".tooltip-arrow")
    await expect(arrow).toHaveAttribute("data-placement", "top")
    await expect(arrow).toHaveAttribute("data-align", "center")

    await page.mouse.move(0, 0)
    await page.waitForTimeout(60)
    await expect(bubble).toBeVisible()
    await page.waitForTimeout(140)
    await expect(bubble).toHaveCount(0)
  })

  test("field tooltip exposes assertive live region", async ({ page }) => {
    await page.goto(tooltipRoute)

    const infoButton = page.getByRole("button", { name: "Field requirements" })
    const liveRegion = page.locator("#tooltip-field-live")

    await expect(infoButton).toHaveAttribute("aria-describedby", /tooltip-field-live/)
    await expect(liveRegion).toHaveAttribute("role", "status")
    await expect(liveRegion).toHaveAttribute("aria-live", "assertive")
    await expect(liveRegion).toHaveAttribute("aria-atomic", "true")
    await expect(liveRegion).toHaveAttribute("aria-hidden", "true")
    await expect(liveRegion).toHaveAttribute("data-state", "closed")

    await infoButton.hover()
    const bubble = page.locator(".tooltip-bubble").filter({ hasText: "Verified domains" })
    await expect(bubble).toBeVisible()
    await expect(liveRegion).toContainText("Use your company email so access can be provisioned across every workspace instantly.")
  })
})
