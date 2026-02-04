import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
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
      command: "php artisan serve --host=127.0.0.1 --port=4180",
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
