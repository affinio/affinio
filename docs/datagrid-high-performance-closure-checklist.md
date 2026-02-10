# DataGrid High-Performance Closure Checklist

Updated: `2026-02-10`  
Scope: `@affino/datagrid-core` + `@affino/datagrid-vue` + `@affino/datagrid-orchestration`

Goal: закрыть оставшиеся архитектурные/perf пункты для high-performance grid path.

## P0 (Critical)

- [x] Transaction log as single mutation path (no direct UI mutations in enterprise path).
  - Comment: `2026-02-10` - Vue sugar row mutations now flow through intent-based `runtime.api.applyTransaction` with rollback payloads (`clear`/`cut`/`paste` paths). Added default internal transaction service bootstrap when host app does not provide one in `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridRuntimeBootstrap.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridFeatureSuite.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridClipboardFeature.ts`.
- [x] Bounded cache for server-backed row model (`rowNodeCache` LRU).
  - Comment: `2026-02-10` - added `rowCacheLimit` to `createServerBackedRowModel` and LRU touch/evict flow in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/serverBackedRowModel.ts`; contract added in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/serverBackedRowModel.spec.ts`.
- [x] Remove redundant O(N) column width-map rebuilds when layout-widths are unchanged.
  - Comment: `2026-02-10` - `updateColumnSnapshot` now skips map/pinned rebuild on meta version changes that do not change width-layout projection (`snapshot.metrics === meta.metrics` fast-path) in `/Users/anton/Projects/affinio/packages/datagrid-core/src/virtualization/columnSnapshot.ts`; contract lock in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/columnSnapshot.performance.contract.spec.ts`.

## P1 (High)

- [ ] Enforce phased async pipeline (`input -> compute -> apply`) across remaining hot interaction paths.
- [ ] Incremental recalculation for horizontal meta/layout across scroll-only updates.
  - Progress: `2026-02-10` - expanded horizontal meta cache from single-entry to 2-slot cache to reduce recompute thrash across alternating controllers in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportHorizontalMeta.ts`.
- [ ] Unify range-engine internals for copy/paste/cut/fill/move to one canonical transaction-aware pipeline.
- [ ] Expand derived/value caches (filter predicates, sort keys, group meta) with bounded invalidation.

## P2 (Hardening)

- [ ] Strengthen CI perf gates (variance + memory growth) for parity lock.
- [ ] Finish stable selector contract extraction from demo into `@affino/datagrid-vue`.
- [ ] Complete cross-framework parity lock rollout (`quality:lock:datagrid:parity`) in CI workflow.
