import { expect, test } from "@playwright/test"

test.describe("laravel datagrid interactions", () => {
  test("context menu clear/undo/redo and copy/paste stay functional", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const root = page.locator("[data-affino-datagrid-demo]").first()
    const ownerCells = page.locator('[data-datagrid-column-key="owner"]')
    const undoButton = page.locator("[data-datagrid-undo]")
    const redoButton = page.locator("[data-datagrid-redo]")

    await expect(root).toBeVisible()
    await expect(ownerCells.first()).toBeVisible()

    const sourceCell = ownerCells.nth(0)
    const targetCell = ownerCells.nth(1)
    const editedValue = "qa-owner-laravel"

    await sourceCell.dblclick()
    const editor = page
      .locator('[data-datagrid-inline-editor="true"][data-datagrid-column-key="owner"]')
      .first()
    await expect(editor).toBeVisible()
    await editor.fill(editedValue)
    await editor.press("Enter")
    await expect(sourceCell).toHaveText(editedValue)

    const viewport = page.locator("[data-datagrid-viewport]")
    await sourceCell.click()
    await viewport.focus()
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowRight")
    await expect(page.locator("[data-datagrid-selected]")).toHaveText("4")
    await expect(page.locator("[data-datagrid-anchor]")).toContainText("owner")
    await expect(page.locator("[data-datagrid-selection-overlay]")).toBeVisible()

    await sourceCell.click()
    await sourceCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="clear"]').click()
    await expect(sourceCell).toHaveText("")

    await undoButton.click()
    await expect(sourceCell).toHaveText(editedValue)

    await redoButton.click()
    await expect(sourceCell).toHaveText("")

    await undoButton.click()
    await expect(sourceCell).toHaveText(editedValue)

    await sourceCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="copy"]').click()

    const targetBefore = (await targetCell.textContent())?.trim() ?? ""
    await targetCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="paste"]').click()
    await expect(targetCell).toHaveText(editedValue)
    expect(targetBefore).not.toBe("")
  })

  test("keyboard navigation auto-scrolls to keep active cell visible", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const viewport = page.locator("[data-datagrid-viewport]")
    await expect(viewport).toBeVisible()

    const firstCell = page
      .locator('[data-datagrid-row-index="0"][data-datagrid-column-key="service"]')
      .first()
    await firstCell.click()
    await viewport.focus()

    const activeCellValue = page.locator("[data-datagrid-active-cell]")
    const initialActive = (await activeCellValue.textContent())?.trim() ?? ""

    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0)

    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press("ArrowDown")
    }

    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

    await expect.poll(async () => {
      const current = (await activeCellValue.textContent())?.trim() ?? ""
      return current !== "" && current !== initialActive
    }).toBe(true)
  })

  test("range cut/paste applies matrix with undo support", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const ownerCells = page.locator('[data-datagrid-column-key="owner"]')
    const regionCells = page.locator('[data-datagrid-column-key="region"]')
    const undoButton = page.locator("[data-datagrid-undo]")

    const ownerR1 = ownerCells.nth(0)
    const ownerR2 = ownerCells.nth(1)
    const ownerR3 = ownerCells.nth(2)
    const regionR1 = regionCells.nth(0)
    const regionR2 = regionCells.nth(1)
    const regionR3 = regionCells.nth(2)

    const ownerR1Before = ((await ownerR1.textContent()) ?? "").trim()
    const ownerR2Before = ((await ownerR2.textContent()) ?? "").trim()
    const regionR1Before = ((await regionR1.textContent()) ?? "").trim()
    const regionR2Before = ((await regionR2.textContent()) ?? "").trim()
    expect(ownerR1Before).not.toBe("")
    expect(regionR1Before).not.toBe("")

    await ownerR1.click()
    await page.keyboard.down("Shift")
    await regionR2.click()
    await page.keyboard.up("Shift")

    await expect(page.locator("[data-datagrid-selected]")).toHaveText("4")

    await page.locator("[data-datagrid-viewport]").focus()
    await page.keyboard.press("ControlOrMeta+X")

    await expect.poll(async () => {
      const owner1 = ((await ownerR1.textContent()) ?? "").trim()
      const owner2 = ((await ownerR2.textContent()) ?? "").trim()
      const region1 = ((await regionR1.textContent()) ?? "").trim()
      const region2 = ((await regionR2.textContent()) ?? "").trim()
      const cleared = owner1 === "" && owner2 === "" && region1 === "" && region2 === ""
      const unchanged =
        owner1 === ownerR1Before &&
        owner2 === ownerR2Before &&
        region1 === regionR1Before &&
        region2 === regionR2Before
      return cleared || unchanged
    }).toBe(true)

    if (await undoButton.isEnabled()) {
      await undoButton.click()

      await expect(ownerR1).toHaveText(ownerR1Before)
      await expect(ownerR2).toHaveText(ownerR2Before)
      await expect(regionR1).toHaveText(regionR1Before)
      await expect(regionR2).toHaveText(regionR2Before)
    }

    await ownerR1.click()
    await page.keyboard.down("Shift")
    await regionR2.click()
    await page.keyboard.up("Shift")
    await page.locator("[data-datagrid-viewport]").focus()
    await page.keyboard.press("ControlOrMeta+C")
    await expect(page.locator("[data-datagrid-status]")).toContainText("Copied")

    await ownerR3.click()
    await page.locator("[data-datagrid-viewport]").focus()
    await page.keyboard.press("ControlOrMeta+V")

    await expect(page.locator("[data-datagrid-status]")).toContainText("Pasted")

    await expect.poll(async () => ((await ownerR3.textContent()) ?? "").trim()).toBe(ownerR1Before)
    await expect.poll(async () => ((await regionR3.textContent()) ?? "").trim()).toBe(regionR1Before)
  })

  test("fill handle extends active cell value down the range", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const sourceCell = page.locator(
      '[data-datagrid-cell="true"][data-datagrid-column-key="deployment"][data-datagrid-row-index="0"]'
    )
    const middleCell = page.locator(
      '[data-datagrid-cell="true"][data-datagrid-column-key="deployment"][data-datagrid-row-index="1"]'
    )
    const targetCell = page.locator(
      '[data-datagrid-cell="true"][data-datagrid-column-key="deployment"][data-datagrid-row-index="2"]'
    )

    const sourceValue = ((await sourceCell.textContent()) ?? "").trim()

    await sourceCell.click()
    await sourceCell.hover()

    const handle = sourceCell.locator(".affino-datagrid-demo__fill-handle")
    await expect(handle).toBeVisible()

    await handle.dragTo(targetCell)

    await expect(middleCell).toHaveText(sourceValue)
    await expect(targetCell).toHaveText(sourceValue)
    await expect(page.locator("[data-datagrid-status]")).toContainText("Filled range")
  })

  test("fill handle autoscrolls viewport near bottom edge", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const viewport = page.locator("[data-datagrid-viewport]")
    const deploymentCells = page.locator('[data-datagrid-column-key="deployment"]')
    const sourceCell = deploymentCells.nth(0)

    await sourceCell.click()
    await sourceCell.hover()

    const handle = sourceCell.locator(".affino-datagrid-demo__fill-handle")
    await expect(handle).toBeVisible()

    const viewportBox = await viewport.boundingBox()
    if (!viewportBox) {
      throw new Error("Unable to resolve viewport/handle geometry for fill autoscroll")
    }

    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(0)

    await handle.dragTo(viewport, {
      targetPosition: {
        x: viewportBox.width / 2,
        y: Math.max(2, viewportBox.height - 2),
      },
    })

    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(page.locator("[data-datagrid-status]")).toContainText("Filled range")
  })
})
