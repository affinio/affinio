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

- [x] Abort-first semantics for outdated pull requests.
- [x] Range deduplication and inflight coalescing.
- [x] Priority policy (`visible window > prefetch > background`).
- [x] Bounded cache with deterministic eviction (LRU/window-aware).
- [ ] Validation:
  - [x] contract tests for cancel/dedup ordering;
  - [ ] bench on rapid scroll/filter churn;
  - [x] memory growth gate under long session.

Progress:
- `2026-02-10` - implemented inflight pull coalescing for identical demand keys in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceBackedRowModel.ts` (`pullCoalesced` diagnostics counter + request-key reuse, no extra `pull()`/abort churn).
- `2026-02-10` - added contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`coalesces identical inflight viewport pulls instead of spawning duplicate requests`).
- `2026-02-10` - implemented range dedup for inflight viewport churn: subset `viewport-change` demand is coalesced when active inflight request already covers target range (same model state + sufficient priority), while invalidation/refresh paths keep freshness semantics, in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceBackedRowModel.ts`.
- `2026-02-10` - added contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`coalesces subset viewport demand when broader inflight range already covers it`).
- `2026-02-10` - implemented priority arbitration (`critical > normal > background`) for inflight pulls: lower-priority demand is deferred instead of aborting active high-priority viewport fetch; added `pullDeferred` diagnostics in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceBackedRowModel.ts`.
- `2026-02-10` - added contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`defers lower-priority invalidation pull while critical viewport pull is inflight`).
- `2026-02-10` - added contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`preempts lower-priority inflight pull when critical viewport demand arrives`).
- `2026-02-10` - added pending-queue collapse for repeated deferred requests (same key) and contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`collapses repeated deferred invalidation pulls into single pending request`).
- `2026-02-10` - upgraded bounded cache eviction to window-aware policy: under cache pressure, entries outside active viewport are evicted first (before visible-window rows) in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceBackedRowModel.ts`.
- `2026-02-10` - added cache-pressure contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`keeps active viewport rows cached under row-cache pressure from out-of-window pushes`) and `rowCacheEvicted` diagnostics counter.
- `2026-02-10` - updated protocol docs `/Users/anton/Projects/affinio/docs/datagrid-data-source-protocol.md` to include `pullCoalesced` observability contract.
- `2026-02-10` - extended backpressure diagnostics with runtime-state observability (`hasPendingPull`, `rowCacheSize`, `rowCacheLimit`) in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceProtocol.ts` + `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/dataSourceBackedRowModel.ts`.
- `2026-02-10` - added long-session bounded-memory contract test `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/dataSourceBackedRowModel.spec.ts` (`keeps row-cache bounded under long viewport churn`) to prove `rowCacheSize <= rowCacheLimit` across sustained viewport churn.

## 02. Value/Derived Cache Layer (`target >= 9.3`)

- [x] Unified cache for derived values: sort keys, filter predicates, group meta, formatted values.
- [x] Explicit invalidation keys (`row revision`, `column revision`, `filter revision`, `group revision`).
- [x] Deterministic cache hit/miss behavior in snapshot.
- [ ] Validation:
  - [x] contract tests for invalidation correctness;
  - [ ] bench for hot-path CPU reduction;
  - [x] no stale-values regression tests.

Progress:
- `2026-02-10` - added revision-keyed derived cache layer in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`:
  - filter-predicate cache (`filterRevision`);
  - sort-value cache (`rowRevision + sortRevision`);
  - group-value cache (`rowRevision + groupRevision + group fields`).
- `2026-02-10` - introduced deterministic derived-cache diagnostics (`getDerivedCacheDiagnostics`) with hit/miss counters + revision snapshot in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`.
- `2026-02-10` - added contract tests in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/clientRowModel.spec.ts`:
  - `reuses derived sort cache across grouping expansion changes when rows/sort stay stable`;
  - `invalidates filter predicate cache only when filter revision changes`;
  - `invalidates derived sort cache on row revision to avoid stale sort values`.

## 03. Range-Based Invalidation Guarantees (`target >= 9.4`)

- [x] Mutations invalidate only affected ranges on corresponding axis.
- [x] Vertical-only updates never force horizontal recompute (and vice versa).
- [x] Column resize/order/visibility recalc scoped to affected segments.
- [ ] Validation:
  - [x] contract tests for axis/range isolation;
  - [x] instrumentation counters in CI (recompute scope assertions).

Progress:
- `2026-02-10` - exposed recompute-scope diagnostics in viewport integration snapshot (`rowApplyCount`, `columnApplyCount`, `horizontalMetaRecomputeCount`, `horizontalSizingRecomputeCount`, `offscreenRowInvalidationSkips`, `contentRowInvalidationApplyCount`) via `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportTypes.ts` and `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts`.
- `2026-02-10` - added contract coverage `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`:
  - `tracks recompute scope counters for vertical/horizontal/offscreen invalidation paths`;
  - ensures vertical content invalidation does not force horizontal recompute/apply;
  - ensures offscreen content invalidation is skipped without apply.

## 04. One-Frame Apply Contract (`target >= 9.5`)

- [x] Input -> compute -> apply single-frame guarantee for scroll/select/edit/resize hot paths.
- [x] No duplicated apply in same frame under microtask/RAF interplay.
- [x] Deterministic frame scheduler tracing for diagnostics.
- [ ] Validation:
  - [x] frame-budget contracts (`1 compute + 1 apply / input`);
  - [x] regression suite for long sessions (vertical/horizontal mixed).

Progress:
- `2026-02-10` - added one-frame budget contract `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts` (`keeps single apply per scheduler flush under mixed input burst`) validating coalesced mixed input (`scroll + zoom + row/column mutations`) into a single apply cycle.
- `2026-02-10` - frame-level recompute counters (`recompute.*`) are now available through `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts` integration snapshot for deterministic diagnostics and CI assertions.

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
