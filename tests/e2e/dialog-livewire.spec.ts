import { expect, test } from "@playwright/test"

const livewireRoute = "/livewire/dialogs"

// Override the default base URL for these tests so they hit the Laravel demo.
test.use({ baseURL: "http://127.0.0.1:4180" })

test.describe("livewire dialog showcase", () => {
  test("command buttons append telemetry and timeline entries", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text())
      }
    })

    await page.goto(livewireRoute)

    const livewireRoot = page.locator("[data-affino-livewire-id]").first()
    const dataComponentId = await livewireRoot.getAttribute("data-affino-livewire-id")
    const wireComponentId = await livewireRoot.getAttribute("wire:id")
    expect(dataComponentId).toBeTruthy()
    expect(wireComponentId).toBeTruthy()
    expect(dataComponentId).toBe(wireComponentId)

    const handoffTab = page.getByRole("tab", { name: "HANDOFF" })
    await handoffTab.click()
    const journeyTitle = page.locator(".dialog-journeys__body h3")
    await expect(journeyTitle).toHaveText("Follow-the-sun handoff")

    const trigger = page.getByRole("button", { name: "Launch command palette" })
    await trigger.click()

    const composeButton = page.getByRole("button", { name: "Draft incident note" })
    const timelineLabels = page.locator(".dialog-timeline__label")
    const paletteDialog = page.getByRole("dialog", { name: "Productivity palette" })

    await expect(timelineLabels.first()).toHaveText(/Steps updated/)

    await composeButton.click()

    await expect(paletteDialog).toBeVisible()

    await expect(timelineLabels.first()).toHaveText("Composer launched")

    const alertTitle = page.locator(".dialog-alert__title")
    await expect(alertTitle).toHaveText("Composer launched")

    const telemetryFirst = page.locator(".dialog-panel__feed li").first()
    await expect(telemetryFirst).toContainText("Composer launched")

    expect(consoleErrors).toEqual([])
  })

  test("manual dialog closes even when pinned", async ({ page }) => {
    await page.goto(livewireRoute)

    const manualDialog = page.locator('[data-affino-dialog-overlay][data-affino-dialog-owner="manual-ops-dialog"] [data-affino-dialog-surface]')
    const openControl = page.getByRole("button", { name: "Open dialog" })
    const pinnedToggle = page.getByLabel("Keep pinned across morphs")
    const headerClose = manualDialog.getByRole("button", { name: "Close" })
    const overlay = page.locator('[data-affino-dialog-overlay][data-affino-dialog-owner="manual-ops-dialog"]')
    const manualRoot = page.locator('[data-affino-dialog-root="manual-ops-dialog"]')

    const programmaticOpen = () =>
      page.evaluate(() => {
        document.dispatchEvent(
          new CustomEvent("affino-dialog:manual", {
            detail: { id: "manual-ops-dialog", action: "open", reason: "programmatic" },
          }),
        )
      })

    await openControl.click()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", "open")

    await headerClose.click()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", /(closing|idle|closed)/)

    await programmaticOpen()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", "open")

    await expect(overlay).toBeVisible()
    const bbox = await overlay.boundingBox()
    if (!bbox) {
      throw new Error("Overlay bounding box unavailable")
    }
    await page.mouse.click(bbox.x + Math.min(10, bbox.width / 2), bbox.y + Math.min(10, bbox.height / 2))
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", /(closing|idle|closed)/)

    await pinnedToggle.check()

    await programmaticOpen()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", "open")

    await headerClose.click()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", /(closing|idle|closed)/)

    await programmaticOpen()
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", "open")

    await expect(overlay).toBeVisible()
    const bboxPinned = await overlay.boundingBox()
    if (!bboxPinned) {
      throw new Error("Overlay bounding box unavailable")
    }
    await page.mouse.click(bboxPinned.x + Math.min(10, bboxPinned.width / 2), bboxPinned.y + Math.min(10, bboxPinned.height / 2))
    await expect(manualRoot).toHaveAttribute("data-affino-dialog-state", /(closing|idle|closed)/)

  })
})
