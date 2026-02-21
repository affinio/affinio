import { defineConfig } from "@playwright/test"

const jsonOutputFile = process.env.PLAYWRIGHT_JSON_OUTPUT ?? "playwright-report/results.json"
const isCi = Boolean(process.env.CI)
const shouldBuildWebServers = process.env.PLAYWRIGHT_FORCE_WEB_BUILDS === "1"
  || (!isCi && process.env.PLAYWRIGHT_SKIP_WEB_BUILDS !== "1")
const defaultWebServerTimeoutMs = isCi ? 300_000 : 180_000
const parsedWebServerTimeoutMs = Number.parseInt(
  process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS ?? String(defaultWebServerTimeoutMs),
  10,
)
const webServerTimeoutMs = Number.isFinite(parsedWebServerTimeoutMs) && parsedWebServerTimeoutMs > 0
  ? parsedWebServerTimeoutMs
  : defaultWebServerTimeoutMs
const vueWebServerCommand = shouldBuildWebServers
  ? "pnpm --filter demo-vue build-only && pnpm --filter demo-vue preview --host 127.0.0.1 --port 4173"
  : "test -f demo-vue/dist/index.html || pnpm --filter demo-vue build-only; pnpm --filter demo-vue preview --host 127.0.0.1 --port 4173"
const laravelWebServerCommand = shouldBuildWebServers
  ? "pnpm build && php artisan serve --host=127.0.0.1 --port=4180"
  : "test -f public/build/manifest.json || pnpm build; php artisan serve --host=127.0.0.1 --port=4180"

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: jsonOutputFile }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: vueWebServerCommand,
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeoutMs,
    },
    {
      command: laravelWebServerCommand,
      url: "http://127.0.0.1:4180",
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeoutMs,
      cwd: "demo-laravel",
      env: {
        APP_ENV: "testing",
        APP_DEBUG: "true",
      },
    },
  ],
})
