# Datagrid Quality Gates

Scope: `@affino/datagrid-core` + `@affino/datagrid-vue`

## Architecture Acceptance Gate

Fail-fast architecture acceptance:
- `pnpm run quality:architecture:datagrid`
- Script: `scripts/check-datagrid-architecture-acceptance.mjs`
- Report: `artifacts/quality/datagrid-architecture-acceptance-report.json`

## Perf Contract Gate

Fail-fast performance contract acceptance:
- `pnpm run quality:perf:datagrid`
- Script: `scripts/check-datagrid-perf-contracts.mjs`
- Report: `artifacts/quality/datagrid-perf-contracts-report.json`

Architecture acceptance checklist:
- `docs/datagrid-ag-architecture-acceptance-checklist.md`

## Mandatory Test Matrix

CI matrix suites:
- `unit` -> `pnpm run test:matrix:unit`
- `integration` -> `pnpm run test:matrix:integration`
- `interaction` -> `pnpm run test:matrix:interaction`
- `visual` -> `pnpm run test:matrix:visual`

Root scripts:
- `test:datagrid:unit`
- `test:datagrid:contracts`
- `test:datagrid:strict-contracts`
- `test:datagrid:integration`
- `test:datagrid:coverage`
- `test:e2e:critical`

Strict matrix reference:
- `docs/datagrid-strict-contract-testing.md`

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
- `pnpm run quality:lock:datagrid` (architecture + perf contracts + strict contract matrix + coverage + critical e2e)

## Benchmark Regression

CI benchmark job runs multi-seed assertions via datagrid harness:
- `pnpm run bench:regression`

Artifacts:
- `artifacts/performance/datagrid-benchmark-report.json`
- `artifacts/performance/bench-vue-adapters.json`
- `artifacts/performance/bench-livewire-morph.json`
- `artifacts/performance/bench-datagrid-rowmodels.json`
- `artifacts/quality/datagrid-benchmark-gates-report.json`

## CI Blocking Jobs

Workflow: `.github/workflows/ci.yml`

- `quality-gates`
  - runs `pnpm run quality:lock:datagrid`
  - uploads `artifacts/quality`, coverage, and Playwright reports
- `benchmark-regression`
  - runs `pnpm run bench:datagrid:harness:ci`
  - uploads `artifacts/performance`
