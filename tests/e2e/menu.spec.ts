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
})
