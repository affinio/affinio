# DataGrid Wave 2 Enterprise Architecture Pipeline

Baseline date: `2026-02-10`  
Scope: `/Users/anton/Projects/affinio/packages/datagrid-core` + orchestration/adapters  
Goal: закрыть core-архитектурные требования high-performance grid уровня enterprise (не косметика, не UI-only).

## Validation Rules

- Каждый шаг закрывается только при наличии:
  - code-level contract;
  - automated validation (`unit/contract/e2e/bench`);
  - measurable outcome (latency/variance/memory or deterministic behavior).
- For perf-sensitive steps: обязательно фиксируем `before/after` в бенч-артефактах.

## Pipeline (Simple -> Complex)

## 01. Data Source Backpressure + Cancellation (`target >= 9.3`)

- [ ] Abort-first semantics for outdated pull requests.
- [ ] Range deduplication and inflight coalescing.
- [ ] Priority policy (`visible window > prefetch > background`).
- [ ] Bounded cache with deterministic eviction (LRU/window-aware).
- [ ] Validation:
  - [ ] contract tests for cancel/dedup ordering;
  - [ ] bench on rapid scroll/filter churn;
  - [ ] memory growth gate under long session.

## 02. Value/Derived Cache Layer (`target >= 9.3`)

- [ ] Unified cache for derived values: sort keys, filter predicates, group meta, formatted values.
- [ ] Explicit invalidation keys (`row revision`, `column revision`, `filter revision`, `group revision`).
- [ ] Deterministic cache hit/miss behavior in snapshot.
- [ ] Validation:
  - [ ] contract tests for invalidation correctness;
  - [ ] bench for hot-path CPU reduction;
  - [ ] no stale-values regression tests.

## 03. Range-Based Invalidation Guarantees (`target >= 9.4`)

- [ ] Mutations invalidate only affected ranges on corresponding axis.
- [ ] Vertical-only updates never force horizontal recompute (and vice versa).
- [ ] Column resize/order/visibility recalc scoped to affected segments.
- [ ] Validation:
  - [ ] contract tests for axis/range isolation;
  - [ ] instrumentation counters in CI (recompute scope assertions).

## 04. One-Frame Apply Contract (`target >= 9.5`)

- [ ] Input -> compute -> apply single-frame guarantee for scroll/select/edit/resize hot paths.
- [ ] No duplicated apply in same frame under microtask/RAF interplay.
- [ ] Deterministic frame scheduler tracing for diagnostics.
- [ ] Validation:
  - [ ] frame-budget contracts (`1 compute + 1 apply / input`);
  - [ ] regression suite for long sessions (vertical/horizontal mixed).

## 05. Clipboard/Fill/Move Unified Range Engine Hardening (`target >= 9.4`)

- [ ] One canonical range mutation engine for copy/paste/cut/fill/move.
- [ ] Shared blocked-cell accounting and deterministic partial-apply behavior.
- [ ] Transaction log integration (undo/redo intent-level).
- [ ] Validation:
  - [ ] regression e2e (grouped + virtualized + pinned);
  - [ ] contract tests for before/after snapshot consistency.

## 06. Stable Identity + Snapshot Protocol Hardening (`target >= 9.5`)

- [ ] Enforce strict `rowId/columnId` contracts across all enterprise paths.
- [ ] Remove index-based fallback from enterprise runtime paths.
- [ ] Snapshot roundtrip guarantees for row/column/filter/pagination/group/selection state.
- [ ] Validation:
  - [ ] strict contracts + failure tests for invalid identity;
  - [ ] protocol compatibility suite (stable/advanced/internal tiers).

## 07. Perf Gates in CI (`target >= 9.5`)

- [ ] p95/p99 + variance budgets per critical benchmark.
- [ ] Memory growth budgets (long-session scenarios).
- [ ] Gate fails on variance drift and runaway heap growth.
- [ ] Validation:
  - [ ] CI integration with artifact reports;
  - [ ] baseline locking + drift alerts.

## Close Log

- `2026-02-10`: pipeline created.
