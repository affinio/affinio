import { expect, test } from "@playwright/test"

test.describe("combobox overlays", () => {
  test("opens, navigates, commits selection, and clears", async ({ page }) => {
    await page.goto("/combobox")

    const input = page.locator("#account-combobox-input")
    await expect(input).toBeVisible()

    const initialValue = await input.inputValue()

    await input.click()
    const listbox = page.locator(".combobox-list")
    await expect(listbox).toBeVisible()

    await input.fill("")
    await expect(listbox).toBeVisible()

    await input.press("ArrowDown")
    await expect(input).toHaveAttribute("aria-expanded", "true")

    const secondOption = page.locator(".combobox-option").nth(1)
    const secondLabel = secondOption.locator(".combobox-option__label")
    const nextValue = await secondLabel.innerText()
    await secondOption.click()

    await expect(page.locator(".combobox-list")).toHaveCount(0)
    expect(await input.inputValue()).toBe(nextValue)
    expect(nextValue).not.toBe(initialValue)

    await page.getByRole("button", { name: "Clear" }).click()
    await expect(page.locator(".combobox-list")).toBeVisible()
    await expect(page.locator(".combobox-hint")).toHaveText("No account selected")
  })
})
