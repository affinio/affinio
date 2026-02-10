import { defineConfig } from "@playwright/test"

const jsonOutputFile = process.env.PLAYWRIGHT_JSON_OUTPUT ?? "playwright-report/results.json"

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
      command: "pnpm --filter demo-vue build && pnpm --filter demo-vue preview --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm build && php artisan serve --host=127.0.0.1 --port=4180",
      url: "http://127.0.0.1:4180",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "demo-laravel",
      env: {
        APP_ENV: "testing",
        APP_DEBUG: "true",
      },
    },
  ],
})
