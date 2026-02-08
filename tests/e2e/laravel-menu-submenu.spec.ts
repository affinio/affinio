import { expect, test } from "@playwright/test"

test.describe("laravel menu submenu", () => {
  test("binds submenu trigger", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")
    const submenuPanel = rootPanel
      .locator("[data-affino-menu-root][data-affino-menu-parent][data-affino-menu-parent-item]")
      .first()
      .locator(":scope > [data-affino-menu-panel]")
    await expect(submenuPanel).toBeAttached()
  })

  test("submenu trigger stays focusable", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")
    await submenuTrigger.focus()
    const isFocused = await submenuTrigger.evaluate((element) => element.ownerDocument.activeElement === element)
    expect(isFocused).toBe(true)
  })

  test("opens submenu panel on hover", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")

    await submenuTrigger.hover()

    const submenuPanel = page
      .locator("[data-affino-menu-root][data-affino-menu-parent][data-affino-menu-parent-item]")
      .first()
      .locator(":scope > [data-affino-menu-panel]")

    await expect(submenuPanel).toHaveAttribute("data-state", "open")
    await expect(submenuPanel).toBeVisible()
    await expect(submenuPanel.getByText("Runbook")).toBeVisible()
  })

  test("closes submenu panel on pointer leave", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")

    await submenuTrigger.hover()

    const submenuPanel = page
      .locator("[data-affino-menu-root][data-affino-menu-parent][data-affino-menu-parent-item]")
      .first()
      .locator(":scope > [data-affino-menu-panel]")

    await expect(submenuPanel).toHaveAttribute("data-state", "open")

    const rootBox = await rootPanel.boundingBox()
    const submenuBox = await submenuPanel.boundingBox()
    if (rootBox && submenuBox) {
      const outsideX = Math.max(rootBox.x + rootBox.width, submenuBox.x + submenuBox.width) + 40
      const outsideY = Math.max(rootBox.y + rootBox.height, submenuBox.y + submenuBox.height) + 40
      await page.mouse.move(outsideX, outsideY)
    } else if (rootBox) {
      await page.mouse.move(rootBox.x + rootBox.width + 40, rootBox.y + rootBox.height + 40)
    } else {
      await page.mouse.move(0, 0)
    }

    await expect(submenuPanel).toHaveAttribute("data-state", "closed")
  })

  test("closes submenu panel on Escape", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = rootPanel.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await expect(submenuTrigger).toHaveAttribute("data-affino-menu-submenu-bound", "true")

    await submenuTrigger.hover()

    const submenuPanel = page
      .locator("[data-affino-menu-root][data-affino-menu-parent][data-affino-menu-parent-item]")
      .first()
      .locator(":scope > [data-affino-menu-panel]")

    await expect(submenuPanel).toHaveAttribute("data-state", "open")

    await submenuPanel.getByText("Runbook").focus()
    await page.keyboard.press("Escape")

    await expect(submenuPanel).toHaveAttribute("data-state", "closed")
  })

  test("teleports root menu panel to body", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    const trigger = page.getByRole("button", { name: "Open menu" })
    await trigger.click()

    const root = page.locator("[data-affino-menu-root]").filter({ has: trigger }).first()
    const rootId = await root.getAttribute("data-affino-menu-root")
    if (!rootId) {
      throw new Error("Missing root id for teleported menu")
    }

    const panel = page.locator(`[data-affino-menu-panel][data-affino-menu-root-id='${rootId}']`).first()
    await expect(panel).toHaveAttribute("data-state", "open")

    const parentTag = await panel.evaluate((node) => node.parentElement?.tagName ?? "")
    expect(parentTag).toBe("BODY")
  })

  test("keeps inline menu panel inside root", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    const trigger = page.getByRole("button", { name: "Inline portal" })
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const root = page.locator("[data-affino-menu-root]").filter({ has: trigger }).first()
    const rootId = await root.getAttribute("data-affino-menu-root")
    if (!rootId) {
      throw new Error("Missing root id for inline menu")
    }

    await expect(root).toHaveAttribute("data-affino-menu-portal", "inline")

    await expect.poll(async () => await root.getAttribute("data-affino-menu-state")).toBe("open")

    const panel = root.locator("[data-affino-menu-panel]").first()
    await expect(panel).toBeVisible()

    const isManaged = await panel.getAttribute("data-affino-menu-portal-managed")
    expect(isManaged).not.toBe("true")
  })
})
