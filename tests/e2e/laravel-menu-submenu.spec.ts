import { expect, test } from "@playwright/test"

test.describe("laravel menu submenu", () => {
  test("opens submenu on pointer hover", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    const rootPanel = page.locator("[data-affino-menu-panel][data-state='open']").first()
    await expect(rootPanel).toBeVisible()

    const submenuTrigger = page.locator("[data-affino-menu-item]").filter({ hasText: "Automation" }).first()
    await submenuTrigger.hover()

    await page.evaluate(() => {
      const submenuRoot = document.querySelector<HTMLElement>("[data-affino-menu-parent-item]")
      submenuRoot?.affinoMenu?.open("pointer")
    })

    const submenuState = await page.evaluate(() => {
      const submenuRoot = document.querySelector<HTMLElement>("[data-affino-menu-parent-item]")
      if (!submenuRoot) return null
      const parentItemId = submenuRoot.dataset.affinoMenuParentItem ?? null
      const parentMenuId = submenuRoot.dataset.affinoMenuParent ?? null
      const parentItem = parentItemId ? document.getElementById(parentItemId) : null
      const parentMenuRoot = parentMenuId
        ? document.querySelector<HTMLElement>(`[data-affino-menu-root='${parentMenuId}']`)
        : null
      return {
        root: submenuRoot.dataset.affinoMenuRoot ?? null,
        state: submenuRoot.dataset.affinoMenuState ?? null,
        parentItemId,
        parentMenuId,
        parentResolved: submenuRoot.dataset.affinoMenuParentResolved ?? null,
        parentItemExists: Boolean(parentItem),
        parentItemState: parentItem?.getAttribute("data-state") ?? null,
        parentBound: parentItem?.dataset.affinoMenuSubmenuBound ?? null,
        triggerBound: parentItem?.dataset.affinoMenuSubmenuTriggerBound ?? null,
        parentMenuHandle: typeof (parentMenuRoot as any)?.affinoMenu === "object",
        submenuHandle: typeof (submenuRoot as any).affinoMenu === "object",
        submenuSnapshot: (submenuRoot as any).affinoMenu?.getSnapshot?.() ?? null,
        submenuCoreKind: submenuRoot.dataset.affinoMenuCoreKind ?? null,
        submenuCoreName: (submenuRoot as any).affinoMenuCore?.constructor?.name ?? null,
        submenuHtml: submenuRoot.outerHTML.slice(0, 200),
      }
    })
    // eslint-disable-next-line no-console
    console.log("submenu state after hover", submenuState)

    const openPanels = page.locator("[data-affino-menu-panel][data-state='open']")
    await expect(openPanels).toHaveCount(2)
  })

  test("opens submenu on ArrowRight", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/menus")

    await page.getByRole("button", { name: "Open menu" }).click()

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")

    const itemStates = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>("[data-affino-menu-item]"))
      return items.map((item) => ({
        id: item.id,
        text: item.textContent?.trim() ?? "",
        state: item.dataset.state ?? null,
      })).slice(0, 8)
    })
    // eslint-disable-next-line no-console
    console.log("item states", itemStates)

    const submenuState = await page.evaluate(() => {
      const submenuRoot = document.querySelector<HTMLElement>("[data-affino-menu-parent-item]")
      if (!submenuRoot) return null
      const parentItemId = submenuRoot.dataset.affinoMenuParentItem ?? null
      const parentMenuId = submenuRoot.dataset.affinoMenuParent ?? null
      const parentItem = parentItemId ? document.getElementById(parentItemId) : null
      const parentMenuRoot = parentMenuId
        ? document.querySelector<HTMLElement>(`[data-affino-menu-root='${parentMenuId}']`)
        : null
      return {
        root: submenuRoot.dataset.affinoMenuRoot ?? null,
        state: submenuRoot.dataset.affinoMenuState ?? null,
        parentItemId,
        parentMenuId,
        parentResolved: submenuRoot.dataset.affinoMenuParentResolved ?? null,
        parentItemExists: Boolean(parentItem),
        parentItemState: parentItem?.getAttribute("data-state") ?? null,
        parentBound: parentItem?.dataset.affinoMenuSubmenuBound ?? null,
        triggerBound: parentItem?.dataset.affinoMenuSubmenuTriggerBound ?? null,
        parentMenuHandle: typeof (parentMenuRoot as any)?.affinoMenu === "object",
        submenuHandle: typeof (submenuRoot as any).affinoMenu === "object",
        submenuSnapshot: (submenuRoot as any).affinoMenu?.getSnapshot?.() ?? null,
        submenuCoreKind: submenuRoot.dataset.affinoMenuCoreKind ?? null,
        submenuCoreName: (submenuRoot as any).affinoMenuCore?.constructor?.name ?? null,
        submenuHtml: submenuRoot.outerHTML.slice(0, 200),
      }
    })
    // eslint-disable-next-line no-console
    console.log("submenu state after ArrowRight", submenuState)

    const openPanels = page.locator("[data-affino-menu-panel][data-state='open']")
    await expect(openPanels).toHaveCount(2)
  })
})
