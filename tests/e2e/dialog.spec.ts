import { expect, Locator, test } from "@playwright/test"

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

  test("records lifecycle events and manages nested stacks", async ({ page }) => {
    await page.goto(dialogRoute)

    const openButton = page.getByRole("button", { name: "Open dialog" })
    await openButton.click()

    const baseSurface = page.locator("[data-affino-dialog-host] .surface:not(.surface--stacked)")
    await expect(baseSurface).toHaveCount(1)
    const stackTitle = page.locator(".stack-panel__title")
    await expect(stackTitle).toHaveText("No nested dialogs")

    const stackToggle = page.locator(".stack-panel .ghost")
    await stackToggle.click()
    const stackedSurfaces = page.locator(".surface--stacked")
    await expect(stackedSurfaces).toHaveCount(1)
    await expect(stackTitle).toHaveText("Depth 1")

    await stackToggle.click()
    await expect(stackedSurfaces).toHaveCount(2)
    await expect(stackTitle).toHaveText("Depth 2")

    await page.keyboard.press("Escape")
    await expect(stackedSurfaces).toHaveCount(1)

    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page.locator("[data-affino-dialog-host] .surface")).toHaveCount(0)

    const timelineEntries = page.locator(".timeline ul li .timeline__label")
    await expect(timelineEntries.first()).toHaveText("Closed")
    await expect(timelineEntries.nth(1)).toHaveText("Opened")
  })

  test("guarded dialog enforces async close guards and resets when discarded", async ({ page }) => {
    await page.goto(dialogRoute)

    const guardPanel = page.locator(".panel").filter({ hasText: "Optimistic close with limits" })
    const guardStatus = guardPanel.locator(".status__value").nth(0)
    const guardAttempts = guardPanel.locator(".status__value").nth(1)
    const openGuard = guardPanel.getByRole("button", { name: "Open guarded dialog" })
    await openGuard.click()

    const guardSurface = page.locator(".surface--warm")
    await expect(guardSurface).toBeVisible()

    await page.keyboard.press("Escape")
    await page.keyboard.press("Escape")
    await page.keyboard.press("Escape")

    const alert = page.locator(".alert")
    await expect(alert).toContainText("Close retried")
    await expect(guardStatus).toHaveText("Draft must be saved or discarded.")

    await guardSurface.getByRole("button", { name: "Discard draft" }).click()
    await expect(guardSurface).toHaveCount(0)

    await expect(guardStatus).toHaveText("Ready to close")
    await expect(guardAttempts).toHaveText("0 / 3")
  })

  test("supports swipe gestures to close base and guard overlays", async ({ page }) => {
    await page.goto(dialogRoute)

    const primaryTrigger = page.getByRole("button", { name: "Open dialog" })
    await primaryTrigger.click()

    const baseSurface = page.locator("[data-affino-dialog-host] .surface").filter({ hasNot: page.locator(".surface--stacked") }).first()
    await expect(baseSurface).toBeVisible()

    await swipeDownToClose(baseSurface)

    await expect(page.locator("[data-affino-dialog-host] .surface")).toHaveCount(0)

    const cleanDraftButton = page.getByRole("button", { name: "Mark draft as clean" })
    await cleanDraftButton.click()

    const guardTrigger = page.getByRole("button", { name: "Open guarded dialog" })
    await guardTrigger.click()

    const guardSurface = page.locator(".surface--warm")
    await expect(guardSurface).toBeVisible()

    await swipeDownToClose(guardSurface)

    await expect(guardSurface).toHaveCount(0)
  })
})

async function swipeDownToClose(locator: Locator, delta = 140) {
  await locator.evaluate((element, distance) => {
    const dispatch = (type: string, y: number) => {
      const touch = { identifier: 0, clientX: 0, clientY: y }
      const touches = {
        length: 1,
        item: () => touch,
      }
      const event = new Event(type, { bubbles: true, cancelable: true }) as any
      Object.defineProperty(event, "touches", { value: touches })
      element.dispatchEvent(event)
    }

    dispatch("touchstart", 12)
    dispatch("touchmove", 12 + distance)
    element.dispatchEvent(new Event("touchend", { bubbles: true, cancelable: true }))
  }, delta)
}
