import { expect, test } from "@playwright/test"

test.describe("laravel listbox + combobox", () => {
  test("listbox selects an option and closes", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/listbox")

    const root = page.locator("[data-affino-listbox-root]").first()
    const selection = page.locator(".listbox-meta dd").first()

    const initialSelection = (await selection.textContent())?.trim() ?? ""

    const trigger = root.locator("[data-affino-listbox-trigger]")
    await trigger.click()

    const optionLabels = await page.locator("[data-affino-listbox-option] strong").allTextContents()
    const targetIndex = optionLabels.findIndex((label) => label.trim() !== initialSelection)
    const resolvedIndex = targetIndex >= 0 ? targetIndex : 0
    const option = page.locator("[data-affino-listbox-option]").nth(resolvedIndex)
    const targetLabel = optionLabels[resolvedIndex]?.trim() ?? initialSelection
    await option.click()

    await expect.poll(async () => root.getAttribute("data-affino-listbox-state")).toBe("closed")
    await expect(selection).toHaveText(targetLabel)
  })

  test("combobox selects an option and closes", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/combobox")

    const root = page.locator("[data-affino-combobox-root]").first()
    const selection = page.locator(".combobox-meta dd").first()

    const initialSelection = (await selection.textContent())?.trim() ?? ""

    const input = root.locator("[data-affino-combobox-input]")
    await input.click()
    await input.fill("")

    const optionLabels = await page.locator("[data-affino-listbox-option] strong").allTextContents()
    const targetIndex = optionLabels.findIndex((label) => label.trim() !== initialSelection)
    const resolvedIndex = targetIndex >= 0 ? targetIndex : 0
    const option = page.locator("[data-affino-listbox-option]").nth(resolvedIndex)
    const optionLabel = optionLabels[resolvedIndex]?.trim() ?? initialSelection
    await option.click()

    await expect.poll(async () => root.getAttribute("data-affino-combobox-state")).toBe("false")
    await expect(selection).toHaveText(optionLabel)
  })
})
