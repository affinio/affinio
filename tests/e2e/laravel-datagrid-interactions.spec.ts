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
    const sourceBefore = (await sourceCell.textContent())?.trim() ?? ""

    await sourceCell.dblclick()
    const editor = page
      .locator('[data-datagrid-inline-editor="true"][data-datagrid-column-key="owner"]')
      .first()
    await expect(editor).toBeVisible()
    await editor.fill("qa-owner-laravel")
    await editor.press("Enter")
    await expect(sourceCell).toHaveText("qa-owner-laravel")

    await sourceCell.click()
    await sourceCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="clear"]').click()
    await expect(sourceCell).toHaveText("")

    await undoButton.click()
    await expect(sourceCell).toHaveText(sourceBefore)

    await redoButton.click()
    await expect(sourceCell).toHaveText("")

    await undoButton.click()
    await expect(sourceCell).toHaveText(sourceBefore)

    await sourceCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="copy"]').click()

    const targetBefore = (await targetCell.textContent())?.trim() ?? ""
    await targetCell.click({ button: "right" })
    await page.locator('[data-datagrid-menu-action="paste"]').click()
    await expect(targetCell).toHaveText(sourceBefore)
    expect(targetBefore).not.toBe("")
  })
})
