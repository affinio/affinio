import { expect, test } from "@playwright/test"

const nestedMenuRoute = "/menu/nested"

test.describe("nested menu demo", () => {
  test("opens deep stacks and records selections", async ({ page }) => {
    await page.goto(nestedMenuRoute)

    const browseTrigger = page.getByRole("button", { name: "Browse stacks" })
    await browseTrigger.click()

    const panels = page.locator('[data-ui-menu-panel="true"]')
    await expect(panels.first()).toBeVisible()

    const analyticsTrigger = panels.first().locator("button", { hasText: "Analytics" })
    await analyticsTrigger.hover()

    const nestedPanel = panels.nth(1)
    await expect(nestedPanel).toBeVisible()

    const sessionsItem = nestedPanel.getByText("Sessions", { exact: true })
    await sessionsItem.click()

    await expect(panels).toHaveCount(0)

    const lastActionValue = page.locator(".demo-last-action__value")
    await expect(lastActionValue).toHaveText("Sessions")
  })

  test("keeps submenu open during diagonal pointer travel", async ({ page }) => {
    await page.goto(nestedMenuRoute)

    const browseTrigger = page.getByRole("button", { name: /Browse stacks/i })
    await browseTrigger.click()

    const panels = page.locator('[data-ui-menu-panel="true"]')
    const rootPanel = panels.first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator('[data-ui-menu-trigger="true"]').first()
    await submenuTrigger.hover()

    const nestedPanel = panels.nth(1)
    await expect(nestedPanel).toBeVisible()

    const triggerBox = await submenuTrigger.boundingBox()
    const nestedBox = await nestedPanel.boundingBox()
    if (!triggerBox || !nestedBox) {
      throw new Error("Failed to measure menu geometry")
    }

    const entryPoint = {
      x: triggerBox.x + triggerBox.width - 6,
      y: triggerBox.y + triggerBox.height / 2,
    }
    const detourPoint = {
      x: nestedBox.x - 24,
      y: triggerBox.y + triggerBox.height * 2,
    }
    const targetPoint = {
      x: nestedBox.x + 16,
      y: nestedBox.y + nestedBox.height / 2,
    }

    await page.mouse.move(entryPoint.x, entryPoint.y)
    await page.mouse.move(detourPoint.x, detourPoint.y, { steps: 12 })
    await page.mouse.move(targetPoint.x, targetPoint.y, { steps: 12 })

    await expect(rootPanel).toBeVisible()
    await expect(nestedPanel).toBeVisible()
  })
})
