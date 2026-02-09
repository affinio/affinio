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

    await sourceCell.click()
    await page.keyboard.down("Shift")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.up("Shift")
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
})
