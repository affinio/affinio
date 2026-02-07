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
  - `pnpm run bench:datagrid:harness:ci`

Harness script:
- `scripts/bench-datagrid-harness.mjs`

Per-benchmark outputs (JSON):
- `artifacts/performance/bench-vue-adapters.json`
- `artifacts/performance/bench-livewire-morph.json`

Harness summary:
- `artifacts/performance/datagrid-benchmark-report.json`

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
- Shared:
  - `PERF_BUDGET_MAX_VARIANCE_PCT=25`
  - `PERF_BUDGET_MAX_HEAP_DELTA_MB=80`

Fail-fast behavior:
- Harness exits non-zero when any benchmark fails budget checks.
- CI `benchmark-regression` job is blocking for merge readiness.

## CI Integration

Workflow:
- `.github/workflows/ci.yml`

Jobs:
- `quality-gates`: coverage + critical-path interaction checks.
- `benchmark-regression`: datagrid harness + uploaded performance artifacts.

## Latest Result Status

Source of truth:
- CI artifact bundle `benchmark-regression` from the latest pipeline run.

Status in this local environment:
- Benchmarks were not executed locally because `node/npm` are unavailable.
- Threshold enforcement is configured and active in CI.
