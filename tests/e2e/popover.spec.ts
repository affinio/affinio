import { expect, test, type Page } from "@playwright/test"

const popoverRoute = "/popovers"

const popoverSurface = (page: Page) => page.locator(".popover-surface")
const snoozeSurface = (page: Page) => page.locator(".snooze-popover")

test.describe("popover playground", () => {
  test("applies filters, repositions arrow, and closes on outside interactions", async ({ page }) => {
    await page.goto(popoverRoute)

    const trigger = page.getByRole("button", { name: "Adjust filters" })
    const summary = page.locator(".metric-copy")
    const surface = popoverSurface(page)
    const arrow = page.locator(".popover-arrow")

    await trigger.click()
    await expect(surface).toBeVisible()
    await expect(surface).toHaveAttribute("role", "dialog")
    await expect(surface).toHaveAttribute("tabindex", "-1")

    await expect(arrow).toHaveAttribute("data-placement", "bottom")
    await expect(arrow).toHaveAttribute("data-align", "start")

    const retention = page.getByLabel("Retention")
    await retention.uncheck()
    await expect(summary).toContainText("2 segments")

    const applyButton = page.getByRole("button", { name: "Apply" })
    await applyButton.scrollIntoViewIfNeeded()
    await applyButton.evaluate((node: HTMLButtonElement) => node.click())
    await expect(surface).toHaveCount(0)

    await trigger.click()
    await expect(surface).toBeVisible()

    await page.locator(".board-card").first().click({ position: { x: 10, y: 10 } })
    await expect(surface).toHaveCount(0)
  })

  test("keeps filter state intact when another surface steals focus", async ({ page }) => {
    await page.goto(popoverRoute)

    const filtersTrigger = page.getByRole("button", { name: "Adjust filters" })
    const snoozeTrigger = page.getByRole("button", { name: "Snooze" })
    const summary = page.locator(".metric-copy")

    await filtersTrigger.click()
    const retention = page.getByLabel("Retention")
    await retention.uncheck()
    await expect(summary).toContainText("2 segments")

    await snoozeTrigger.click()

    const filtersSurface = popoverSurface(page)
    await expect(filtersSurface).toHaveCount(0)

    const snooze = snoozeSurface(page)
    await expect(snooze).toBeVisible()

    const untilTomorrow = page.getByRole("menuitemradio", { name: /Until tomorrow/ })
    await untilTomorrow.click()

    await expect(snooze).toHaveCount(0)
    await expect(snoozeTrigger).toBeFocused()

    await filtersTrigger.click()
    await expect(popoverSurface(page)).toBeVisible()
    await expect(page.getByLabel("Retention")).not.toBeChecked()
    await expect(summary).toContainText("2 segments")

    await page.getByRole("button", { name: "Close popover" }).click()
    await expect(filtersSurface).toHaveCount(0)
    await expect(filtersTrigger).toBeFocused()
  })
})

test.describe("notification snooze popover", () => {
  test("respects menu semantics, radio selection, and focus return", async ({ page }) => {
    await page.goto(popoverRoute)

    const trigger = page.getByRole("button", { name: "Snooze" })
    const surface = snoozeSurface(page)
    const arrow = page.locator(".snooze-arrow")
    const currentValue = page.locator(".snooze-meta__value")

    await trigger.click()
    await expect(surface).toBeVisible()
    await expect(surface).toHaveAttribute("role", "menu")
    await expect(arrow).toHaveAttribute("data-placement", "bottom")
    await expect(arrow).toHaveAttribute("data-align", "end")

    const oneHour = page.getByRole("menuitemradio", { name: /1 hour/ })
    await expect(oneHour).toHaveAttribute("aria-checked", "true")

    const untilTomorrow = page.getByRole("menuitemradio", { name: /Until tomorrow/ })
    await untilTomorrow.click()

    await expect(surface).toHaveCount(0)
    await expect(currentValue).toHaveText("Until tomorrow")
    await expect(trigger).toBeFocused()

    await trigger.click()
    await expect(surface).toBeVisible()
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(surface).toHaveCount(0)

    await trigger.click()
    await expect(surface).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(surface).toHaveCount(0)
  })
})
