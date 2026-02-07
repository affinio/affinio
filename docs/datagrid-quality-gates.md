# Datagrid Quality Gates

Scope: `@affino/datagrid-core` + `@affino/datagrid-vue`

## Mandatory Test Matrix

CI matrix suites:
- `unit` -> `pnpm run test:matrix:unit`
- `integration` -> `pnpm run test:matrix:integration`
- `interaction` -> `pnpm run test:matrix:interaction`
- `visual` -> `pnpm run test:matrix:visual`

Root scripts:
- `test:datagrid:unit`
- `test:datagrid:integration`
- `test:datagrid:coverage`
- `test:e2e:critical`

## Flake Policy (E2E Only)

- Retry policy is enabled only in Playwright (`retries: process.env.CI ? 1 : 0`).
- Non-e2e suites (Vitest/Storybook test runner) do not have retry-based stabilization.
- Flake tracking script: `scripts/check-playwright-flakes.mjs`.
- Default policy: `PLAYWRIGHT_MAX_FLAKES=0`.

Artifacts:
- Playwright JSON report: `playwright-report/results.json`
- Flake summary: `artifacts/playwright-flake-summary.json`

## Coverage Gate

Coverage assertions are required for datagrid packages via:
- `pnpm run test:datagrid:coverage`

Thresholds:
- `@affino/datagrid-core` (vitest): lines/functions/statements >= 80, branches >= 70.
- `@affino/datagrid-vue` (vitest): lines/functions/statements >= 80, branches >= 70.

## Critical-Path Gate

Critical e2e scenarios:
- `tests/e2e/selection.spec.ts`
- `tests/e2e/virtualization.spec.ts`
- `tests/e2e/laravel-dialog-teleport.spec.ts`
- `tests/e2e/laravel-listbox-combobox.spec.ts`
- `tests/e2e/menu.spec.ts`

Command:
- `pnpm run quality:gates:datagrid`

## Benchmark Regression

CI benchmark job runs multi-seed assertions via datagrid harness:
- `pnpm run bench:datagrid:harness:ci`

Artifacts:
- `artifacts/performance/datagrid-benchmark-report.json`
- `artifacts/performance/bench-vue-adapters.json`
- `artifacts/performance/bench-livewire-morph.json`
