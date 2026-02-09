# Datagrid Performance Gates (AG Grid Target Track)

Date: `2026-02-07`  
Scope: `@affino/datagrid-core` + `@affino/datagrid-vue`

## Target SLA

The datagrid pipeline is gated by the following performance SLA targets:

- Scroll latency (`p95`): `<= 16ms` budget envelope (`target <= 12ms`).
- Selection drag smoothness: `>= 55 FPS` sustained under critical interactions.
- Overlay open/close reaction: `<= 2ms` synthetic controller/open-close proxy.
- Memory churn (heap delta) during benchmark run: `<= 80MB`.
- Variance control (`CV%`) for benchmark metrics: `<= 25%`.

These thresholds are set as fail-fast CI gates for benchmark and quality stages.

## Repeatable Benchmark Harness

Single entry-point harness:

- Local (exploratory):
  - `pnpm run bench:datagrid:harness`
- CI (gated):
  - `pnpm run bench:regression`

Harness script:
- `scripts/bench-datagrid-harness.mjs`

Per-benchmark outputs (JSON):
- `artifacts/performance/bench-vue-adapters.json`
- `artifacts/performance/bench-livewire-morph.json`
- `artifacts/performance/bench-datagrid-interactions.json`
- `artifacts/performance/bench-datagrid-rowmodels.json`

Harness summary:
- `artifacts/performance/datagrid-benchmark-report.json`

Runtime report gate summary:
- `artifacts/quality/datagrid-benchmark-gates-report.json`

## Budgets and Fail-Fast Rules

CI harness (`DATAGRID_BENCH_MODE=ci`) applies:

- `BENCH_SEEDS=1337,7331,2026`
- Vue adapters:
  - `PERF_BUDGET_TOTAL_MS=1400`
  - `PERF_BUDGET_MAX_BOOTSTRAP_MS=8`
  - `PERF_BUDGET_MAX_CONTROLLER_MS=30`
  - `PERF_BUDGET_MAX_RELAYOUT_MS=6`
- Laravel morph:
  - `PERF_BUDGET_MAX_HYDRATE_RATE_PCT=25`
  - `PERF_BUDGET_MAX_OPEN_CLOSE_MS=2`
- Row models (client/server/window-shift proxy):
  - `PERF_BUDGET_TOTAL_MS=9000`
  - `PERF_BUDGET_MAX_CLIENT_RANGE_P95_MS=5`
  - `PERF_BUDGET_MAX_CLIENT_RANGE_P99_MS=8`
  - `PERF_BUDGET_MAX_SERVER_RANGE_P95_MS=35`
  - `PERF_BUDGET_MAX_SERVER_RANGE_P99_MS=55`
  - `PERF_BUDGET_MAX_WINDOW_SHIFT_P95_MS=10`
  - `PERF_BUDGET_MAX_WINDOW_SHIFT_P99_MS=16`
- Interaction models (selection/fill under virtualization proxy):
  - `PERF_BUDGET_TOTAL_MS=3500`
  - `PERF_BUDGET_MAX_SELECTION_DRAG_P95_MS=5`
  - `PERF_BUDGET_MAX_SELECTION_DRAG_P99_MS=8`
  - `PERF_BUDGET_MAX_FILL_APPLY_P95_MS=8`
  - `PERF_BUDGET_MAX_FILL_APPLY_P99_MS=14`
- Shared:
  - `PERF_BUDGET_MAX_VARIANCE_PCT=25`
  - `PERF_BUDGET_MAX_HEAP_DELTA_MB=80`

Perf-contract fail-fast gate:
- `pnpm run quality:perf:datagrid`
- Script: `scripts/check-datagrid-perf-contracts.mjs`
- Report: `artifacts/quality/datagrid-perf-contracts-report.json`

Fail-fast behavior:
- Harness exits non-zero when any benchmark fails budget checks.
- Runtime report gate (`scripts/check-datagrid-benchmark-report.mjs`) validates:
  - report freshness,
  - required suites presence (`vue-adapters`, `laravel-morph`, `interaction-models`, `row-models`),
  - `ok=true` for harness summary and each required suite,
  - JSON artifact integrity for each suite.
- CI `benchmark-regression` job is blocking for merge readiness.

## CI Integration

Workflow:
- `.github/workflows/ci.yml`

Jobs:
- `quality-gates`: architecture acceptance + contracts + coverage + critical-path interaction checks.
- `benchmark-regression`: datagrid harness + uploaded performance artifacts.

## Latest Result Status

Source of truth:
- CI artifact bundle `benchmark-regression` from the latest pipeline run.

Status in this local environment:
- Benchmarks were not executed locally because `node/npm` are unavailable.
- Threshold enforcement is configured and active in CI.

Runtime perf-by-design contract reference:
- `docs/datagrid-perf-by-design-runtime.md`
