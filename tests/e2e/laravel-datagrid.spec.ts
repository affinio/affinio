import { expect, test } from "@playwright/test"

test.describe("laravel datagrid parity", () => {
  test("filter, sort, pin and virtualization window stay functional", async ({ page }) => {
    await page.goto("http://127.0.0.1:4180/datagrid")

    const root = page.locator("[data-affino-datagrid-demo]").first()
    const totalNode = page.locator("[data-datagrid-total]")
    const filteredNode = page.locator("[data-datagrid-filtered]")
    const windowNode = page.locator("[data-datagrid-window]")

    await expect(root).toBeVisible()
    await expect.poll(async () => Number((await totalNode.textContent()) ?? "0")).toBe(3600)
    await expect.poll(async () => Number((await filteredNode.textContent()) ?? "0")).toBe(3600)

    const search = page.locator("[data-datagrid-search]")
    await search.fill("edge-gateway-1")

    await expect.poll(async () => Number((await filteredNode.textContent()) ?? "0")).toBeGreaterThan(0)
    await expect.poll(async () => Number((await filteredNode.textContent()) ?? "0")).toBeLessThan(3600)

    const firstServiceCell = page.locator(".affino-datagrid-demo__row .affino-datagrid-demo__cell").first()
    await expect(firstServiceCell).toContainText("edge-gateway-1")

    await page.locator("[data-datagrid-sort]").selectOption("service-asc")
    await expect(firstServiceCell).toContainText("edge-gateway")

    await page.locator("[data-datagrid-pin-status]").check()
    await expect(
      page.locator(".affino-datagrid-demo__row .affino-datagrid-demo__cell--status.affino-datagrid-demo__cell--sticky").first(),
    ).toBeVisible()

    const viewport = page.locator("[data-datagrid-viewport]")
    await viewport.evaluate((node) => {
      node.scrollTop = 1200
      node.dispatchEvent(new Event("scroll"))
    })

    await expect
      .poll(async () => {
        const text = ((await windowNode.textContent()) ?? "0-0").trim()
        const [start] = text.split("-")
        return Number(start ?? "0")
      })
      .toBeGreaterThan(1)

    const firstLatencyCell = page.locator(".affino-datagrid-demo__row .affino-datagrid-demo__cell--numeric").first()
    const latencyBeforeShift = ((await firstLatencyCell.textContent()) ?? "").trim()

    await page.locator("[data-datagrid-shift]").click()

    await expect
      .poll(async () => ((await firstLatencyCell.textContent()) ?? "").trim())
      .not.toBe(latencyBeforeShift)
  })
})
