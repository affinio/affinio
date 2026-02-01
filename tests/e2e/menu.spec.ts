import { expect, test } from "@playwright/test"

const nestedMenuRoute = "/menu/nested"
const simpleMenuRoute = "/menu/simple"
const contextMenuRoute = "/menu/context"
const commandMenuRoute = "/menu/command"
const stressMenuRoute = "/menu/stress"

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

test.describe("simple menu demo", () => {
  test("supports keyboard navigation loops and closes on select", async ({ page }) => {
    await page.goto(simpleMenuRoute)

    const trigger = page.getByRole("button", { name: "Open Vue menu" })
    const panels = page.locator('[data-ui-menu-panel="true"]')
    const lastActionValue = page.locator(".demo-last-action__value")

    await trigger.click()
    await expect(panels.first()).toBeVisible()

    await page.keyboard.press("ArrowUp")
    await page.keyboard.press("Enter")
    await expect(panels).toHaveCount(0)
    await expect(lastActionValue).toHaveText("Delete")

    await trigger.click()
    await page.keyboard.press("Home")
    await page.keyboard.press("Enter")
    await expect(lastActionValue).toHaveText("Edit headline")

    await trigger.click()
    await page.keyboard.press("End")
    await page.keyboard.press("Enter")
    await expect(lastActionValue).toHaveText("Delete")

    await trigger.click()
    await page.keyboard.press("Escape")
    await expect(panels).toHaveCount(0)
  })

  test("closes on Tab and returns focus to trigger", async ({ page }) => {
    await page.goto(simpleMenuRoute)

    const trigger = page.getByRole("button", { name: "Open Vue menu" })
    const panels = page.locator('[data-ui-menu-panel="true"]')

    await trigger.click()
    await expect(panels.first()).toBeVisible()

    await page.keyboard.press("Tab")

    await expect(panels).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe("context menu demo", () => {
  test("opens on pointer context menu and remains keyboard accessible", async ({ page }) => {
    await page.goto(contextMenuRoute)

    const trigger = page.getByRole("button", { name: "Context Menu (Right-click)" })
    const panels = page.locator('[data-ui-menu-panel="true"]')
    const lastActionValue = page.locator(".demo-last-action__value")

    await trigger.click({ button: "right" })

    await expect(panels.first()).toBeVisible()
    await page.getByRole("menuitem", { name: "Clear selection" }).click()
    await expect(panels).toHaveCount(0)
    await expect(lastActionValue).toContainText("Clear selection")

    await trigger.focus()
    await page.keyboard.press("Shift+F10")
    await expect(panels.first()).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(panels).toHaveCount(0)
  })
})

test.describe("command menu demo", () => {
  test("keeps panel open for multi-select flows", async ({ page }) => {
    await page.goto(commandMenuRoute)

    const trigger = page.getByRole("button", { name: "Segment actions" })
    const panels = page.locator('[data-ui-menu-panel="true"]')
    const lastActionValue = page.locator(".demo-last-action__value")

    await trigger.click()
    await expect(panels.first()).toBeVisible()

    const vipItem = page.getByRole("menuitem", { name: /VIP accounts/ })
    await vipItem.click()
    await expect(panels.first()).toBeVisible()
    await expect(lastActionValue).toContainText("VIP accounts")

    const riskItem = page.getByRole("menuitem", { name: /Churn risk/ })
    await riskItem.click()
    await expect(panels.first()).toBeVisible()

    const automationItem = page.getByRole("menuitem", { name: "Dispatch nurture flow" })
    await automationItem.click()
    await expect(panels.first()).toBeVisible()
    await expect(lastActionValue).toHaveText("Dispatch nurture flow")

    await page.keyboard.press("Escape")
    await expect(panels).toHaveCount(0)

    const chips = page.locator(".demo-chip")
    await expect(chips.filter({ hasText: "vip" })).toHaveCount(0)
    await expect(chips.filter({ hasText: "beta" })).toHaveCount(1)
    await expect(chips.filter({ hasText: "risk" })).toHaveCount(1)
  })
})

test.describe("menu stress lab", () => {
  test("handles dataset tuning, toggles, and deep nested stacks", async ({ page }) => {
    await page.goto(stressMenuRoute)

    await page.getByLabel("Items count").selectOption("50")
    const scrollToggle = page.locator(".stress-toggle").filter({ hasText: "Scroll container" })
    const transformToggle = page.locator(".stress-toggle").filter({ hasText: "Parent transform" })
    await scrollToggle.click()
    await transformToggle.click()
    await expect(scrollToggle).toHaveAttribute("aria-pressed", "true")
    await expect(transformToggle).toHaveAttribute("aria-pressed", "true")

    const layoutLabel = page.getByText("Scroll parent · Transformed container")
    await expect(layoutLabel).toBeVisible()

    const addDynamic = page.getByRole("button", { name: "Add dynamic" })
    await addDynamic.click()

    const trigger = page.getByRole("button", { name: /Open stress-test menu/ })
    const panels = page.locator('[data-ui-menu-panel="true"]')
    await trigger.click()
    const panelRoot = panels.first()
    await expect(panelRoot).toBeVisible()

    const panelScope = panelRoot
    await expect(panelScope.getByText("Root items (50)")).toBeVisible()
    await expect(panelScope.getByText("Dynamic items (21)")).toBeVisible()

    const item50 = page.getByRole("menuitem", { name: "Item 50" })
    await item50.scrollIntoViewIfNeeded()
    await item50.click()
    const lastEvent = page.locator(".demo-last-action__value")
    await expect(lastEvent).toHaveText("Item 50")

    await trigger.click()
    const nestedPanels = panels
    await page.getByRole("menuitem", { name: "Nested level 1" }).hover()
    await expect.poll(async () => nestedPanels.count()).toBeGreaterThan(1)
    await page.getByRole("menuitem", { name: "Nested level 2" }).hover()
    await expect.poll(async () => nestedPanels.count()).toBeGreaterThan(2)
    await page.getByRole("menuitem", { name: "Nested level 3" }).hover()
    await expect.poll(async () => nestedPanels.count()).toBeGreaterThan(3)

    await page.getByRole("menuitem", { name: "Dangerous leaf" }).last().click()
    await expect(lastEvent).toHaveText("Danger invoked")
  })
})
