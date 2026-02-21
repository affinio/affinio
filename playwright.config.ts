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
  ? "pnpm --filter demo-vue build-only && pnpm --filter demo-vue preview --host 127.0.0.1 --port 4173 --strictPort"
  : "test -f demo-vue/dist/index.html || pnpm --filter demo-vue build-only; pnpm --filter demo-vue preview --host 127.0.0.1 --port 4173 --strictPort"
const laravelWebServerCommand = shouldBuildWebServers
  ? "pnpm build && php artisan serve --host=127.0.0.1 --port=4180"
  : "test -f public/build/manifest.json || pnpm build; php artisan serve --host=127.0.0.1 --port=4180"
const vueWebServerReadyUrl = "http://127.0.0.1:4173/index.html"
const laravelWebServerReadyUrl = "http://127.0.0.1:4180/up"
const parsedWorkers = Number.parseInt(process.env.PLAYWRIGHT_WORKERS ?? (isCi ? "3" : "3"), 10)
const workers = Number.isFinite(parsedWorkers) && parsedWorkers > 0 ? parsedWorkers : 3

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: jsonOutputFile }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    launchOptions: {
      args: ["--disable-dev-shm-usage"],
    },
  },
  webServer: [
    {
      command: vueWebServerCommand,
      url: vueWebServerReadyUrl,
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeoutMs,
      stdout: "pipe",
      stderr: "pipe",
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 5000,
      },
    },
    {
      command: laravelWebServerCommand,
      url: laravelWebServerReadyUrl,
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeoutMs,
      stdout: "pipe",
      stderr: "pipe",
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 5000,
      },
      cwd: "demo-laravel",
      env: {
        APP_ENV: "testing",
        APP_DEBUG: "true",
        APP_URL: "http://127.0.0.1:4180",
        SESSION_DRIVER: "file",
        CACHE_STORE: "file",
        QUEUE_CONNECTION: "sync",
      },
    },
  ],
})
