# DataGrid Tree Workload Optimization Pipeline

Updated: `2026-02-12`  
Scope: `@affino/datagrid-core` performance path for `treeData` workloads (`expand/filter/sort`)  
Goal: keep CI deterministic/fast while improving real core throughput for large tree projections.

## Rules

- Close strictly top-down (`O0 -> O8`).
- Every closed step must include:
  - `Proof/Test` (what passed),
  - `Bench` (exact command + metric delta),
  - `Artifact` (file/report path).
- If a regression appears, reopen step immediately.

## Pipeline

- [x] `O0` Split benchmark profiles: `CI light` vs `stress`.
  - What:
    - CI uses reduced tree workload profile.
    - Stress profile preserved as explicit manual benchmark.
  - Proof/Test:
    - `bench:datagrid:harness:ci` no longer blocks on long silent tree runs.
    - `bench:datagrid:tree:stress` remains available for heavy validation.
  - Bench:
    - CI profile command: `pnpm run bench:datagrid:tree:ci-light`
    - Stress profile command: `pnpm run bench:datagrid:tree:stress`
  - Artifact:
    - `/Users/anton/Projects/affinio/scripts/bench-datagrid-harness.mjs`
    - `/Users/anton/Projects/affinio/package.json`

- [ ] `O1` Add deterministic phase timing in tree benchmark.
  - What:
    - Separate timings for: tree index build, filter marking, sibling sort, flatten.
  - Exit:
    - Benchmark report includes per-phase timing slices for both scenarios.
  - Artifact target:
    - `/Users/anton/Projects/affinio/scripts/bench-datagrid-tree-workload.mjs`

- [ ] `O2` Add core-level perf counters for projection pipeline.
  - What:
    - Counters in client row model for projection phases and cache hits.
  - Exit:
    - Snapshot/diagnostics expose stable perf counters for contracts.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [ ] `O3` Optimize `expand/collapse` path (incremental projection).
  - What:
    - Avoid full rebuild when expansion changes only.
    - Recompute only affected subtree + flatten window.
  - Exit:
    - `expand-burst p95` materially reduced in stress profile.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [ ] `O4` Optimize tree filter path (marker reuse + targeted invalidation).
  - What:
    - Reuse filter marker structures and avoid full-array churn.
  - Exit:
    - `filter-sort-burst p95` improved, variance stable.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [ ] `O5` Optimize sibling sort path (stable key cache).
  - What:
    - Cache sort keys per row revision and reuse on unchanged rows.
  - Exit:
    - lower CPU per filter/sort burst; no ordering regressions.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [ ] `O6` Memory pressure reduction in tree projection.
  - What:
    - Reduce temporary allocations in flatten/projection.
    - Reuse arrays/buffers where safe.
  - Exit:
    - lower heap delta and lower GC variability under stress.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [ ] `O7` Contract lock for new optimized behavior.
  - What:
    - Add/extend strict contracts for deterministic ordering and expansion semantics after optimization.
  - Exit:
    - tree contracts green + no behavior drift.
  - Artifact target:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/clientRowModel.spec.ts`
    - `/Users/anton/Projects/affinio/tests/e2e/datagrid.tree-data.spec.ts`

- [ ] `O8` Gate update and baseline refresh.
  - What:
    - Keep CI on light profile.
    - Keep stress benchmark tracked in docs/baseline.
  - Exit:
    - `bench:datagrid:harness:ci:gate` stable.
    - stress benchmark documented and repeatable.
  - Artifact target:
    - `/Users/anton/Projects/affinio/docs/perf/datagrid-benchmark-baseline.json`
    - `/Users/anton/Projects/affinio/docs/datagrid-performance-gates.md`

## Current Baseline (Observed)

- Heavy profile (`70k`, `220/180`) is too slow for CI intent.
- Tree workload should remain in CI only as light deterministic guard.
- Stress profile remains a non-blocking regression/perf study tool.

