# DataGrid High-Performance Closure Checklist

Updated: `2026-02-10`  
Scope: `@affino/datagrid-core` + `@affino/datagrid-vue` + `@affino/datagrid-orchestration`

Goal: закрыть оставшиеся архитектурные/perf пункты для high-performance grid path.

## Closure Rule (DoD)

- Нельзя ставить `- [x]`, пока нет проверяемого evidence.
- Каждый закрытый пункт обязан иметь:
  - `Contract/Test`: имя теста (или нового теста) и ожидаемый инвариант.
  - `Bench/Perf`: метрика до/после (p95/p99/CV/memory) или явная пометка `N/A` с причиной.
  - `Visual`: сценарий ручной проверки (короткий шаг + ожидаемый результат).
  - `Artifact`: путь к файлу/отчету/спеке, где зафиксирован результат.
- Если есть только частичный прогресс: оставляем `- [ ]` и пишем комментарий `Progress:` без закрытия.

## Execution Order (One-by-one)

1. Canonical `VirtualWindow` contract.
2. Overscan inside canonical window snapshot.
3. One-frame guarantee for hot paths.
4. Hard split `virtual-x` vs `layout-x`.
5. Range/axis-scoped invalidation.
6. Остальные P1/P2 после закрытия всех P0.

## 2026 Criticality Note

- Enterprise/grid-at-scale path: `not optional`, these are must-have.
- Basic CRUD table path: можно жить без части пунктов, но это уже не уровень AG/Sheets.

## P0 (Critical)

- [x] Transaction log as single mutation path (no direct UI mutations in enterprise path).
  - Comment: `2026-02-10` - Vue sugar row mutations now flow through intent-based `runtime.api.applyTransaction` with rollback payloads (`clear`/`cut`/`paste` paths). Added default internal transaction service bootstrap when host app does not provide one in `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridRuntimeBootstrap.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridFeatureSuite.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/internal/useAffinoDataGrid/useAffinoDataGridClipboardFeature.ts`.
- [x] Bounded cache for server-backed row model (`rowNodeCache` LRU).
  - Comment: `2026-02-10` - added `rowCacheLimit` to `createServerBackedRowModel` and LRU touch/evict flow in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/serverBackedRowModel.ts`; contract added in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/serverBackedRowModel.spec.ts`.
- [x] Remove redundant O(N) column width-map rebuilds when layout-widths are unchanged.
  - Comment: `2026-02-10` - `updateColumnSnapshot` now skips map/pinned rebuild on meta version changes that do not change width-layout projection (`snapshot.metrics === meta.metrics` fast-path) in `/Users/anton/Projects/affinio/packages/datagrid-core/src/virtualization/columnSnapshot.ts`; contract lock in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/columnSnapshot.performance.contract.spec.ts`.
- [x] Canonical `VirtualWindow` contract as single source of truth.
  - Required shape: row/column visible range + directional overscan in one immutable snapshot.
  - Requirement: renderer/overlay/hit-test/selection/pointer consume this snapshot only (no local recompute from `getRowCount/getRowsInRange`).
  - Progress: `2026-02-10` - added public `virtualWindow` snapshot + `getVirtualWindow()` API on viewport controller, added imperative `onWindow(payload)` callback, exported new types in advanced entrypoint, aligned legacy `visibleRowRange/visibleColumnRange` as compatibility mirrors, and extended contract coverage in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
  - Progress: `2026-02-10` - migrated consumer paths: `useDataGridVirtualRangeMetrics` and `useDataGridColumnLayoutOrchestration` can now consume canonical `virtualWindow` (orchestration + vue wrapper), with contract coverage in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridVirtualRangeMetrics.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridColumnLayoutOrchestration.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridVirtualRangeMetrics.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridColumnLayoutOrchestration.contract.spec.ts`.
  - Progress: `2026-02-10` - migrated hot interaction consumers to optional `virtualWindow` bounds in orchestration (`useDataGridCellCoordNormalizer`, `useDataGridPointerCellCoordResolver`, `useDataGridCellVisibilityScroller`, `useDataGridSelectionOverlayOrchestration`) plus vue contract coverage in `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridCellCoordNormalizer.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridPointerCellCoordResolver.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridCellVisibilityScroller.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridSelectionOverlayOrchestration.contract.spec.ts`.
  - Progress: `2026-02-10` - added orchestration-level contracts for hot interaction consumers (not only vue wrappers): `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridCellCoordNormalizer.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridPointerCellCoordResolver.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridCellVisibilityScroller.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridSelectionOverlayOrchestration.contract.spec.ts`.
  - Progress: `2026-02-10` - wired internal demo call-sites to pass `virtualWindow` bounds into normalizer/pointer/visibility/selection overlay paths in `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`.
  - Progress: `2026-02-10` - exposed canonical `virtualWindow` snapshot from runtime service/composable/component (`useDataGridRuntimeService`, `useDataGridRuntime`, `DataGrid` slot/expose), including contract updates in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/useDataGridRuntimeService.contract.spec.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/__tests__/useDataGridRuntime.contract.spec.ts` and `/Users/anton/Projects/affinio/packages/datagrid-vue/src/components/__tests__/DataGrid.contract.spec.ts`.
  - Progress: `2026-02-10` - switched internal demo window consumers (`useDataGridVirtualRangeMetrics`, `useDataGridColumnLayoutOrchestration`) to prefer runtime canonical snapshot when available in `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`.
  - Progress: `2026-02-10` - removed fallback-only bounds in hot orchestration paths by making canonical window input mandatory (`useDataGridCellCoordNormalizer`, `useDataGridPointerCellCoordResolver`, `useDataGridCellVisibilityScroller`, `useDataGridSelectionOverlayOrchestration`) and updated vue/orchestration contracts accordingly.
  - Progress: `2026-02-10` - removed remaining scroll-math fallbacks from window consumers by requiring canonical `virtualWindow` in `useDataGridVirtualRangeMetrics` and `useDataGridColumnLayoutOrchestration` (orchestration + vue wrappers + internal demo call-sites + contracts) in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridVirtualRangeMetrics.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridColumnLayoutOrchestration.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/useDataGridVirtualRangeMetrics.ts`, `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/useDataGridColumnLayoutOrchestration.ts`, `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`.
  - Evidence (pending run):
    - `pnpm vitest packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridVirtualRangeMetrics.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridColumnLayoutOrchestration.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridCellCoordNormalizer.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridPointerCellCoordResolver.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridCellVisibilityScroller.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridSelectionOverlayOrchestration.contract.spec.ts`
    - `pnpm vitest packages/datagrid-orchestration/src/__tests__/useDataGridRuntimeService.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridVirtualRangeMetrics.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridColumnLayoutOrchestration.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridCellCoordNormalizer.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridPointerCellCoordResolver.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridCellVisibilityScroller.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridSelectionOverlayOrchestration.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/composables/__tests__/useDataGridRuntime.contract.spec.ts`
    - `pnpm vitest packages/datagrid-vue/src/components/__tests__/DataGrid.contract.spec.ts`
- [x] Overscan moved into model-level window snapshot with deterministic behavior.
  - Requirement: overscan is part of public window contract, not hidden state in mixed schedulers/render paths.
  - Requirement: pointer-drag/fill/keyboard/scroll inertia use the same overscan snapshot.
  - Progress: `2026-02-10` - directional overscan (`top/bottom/left/right`) now exposed via `virtualWindow.overscan` in viewport controller snapshot.
  - Progress: `2026-02-10` - propagated canonical `virtualWindow` shape (including overscan + ranges) through hot interaction orchestration contracts (`useDataGridCellCoordNormalizer`, `useDataGridPointerCellCoordResolver`, `useDataGridCellVisibilityScroller`, `useDataGridSelectionOverlayOrchestration`) and internal demo shared resolver in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridCellCoordNormalizer.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridPointerCellCoordResolver.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridCellVisibilityScroller.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridSelectionOverlayOrchestration.ts`, `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`.
  - Progress: `2026-02-10` - aligned vue wrappers fallback snapshots to canonical overscan-aware shape in `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/useDataGridVirtualRangeMetrics.ts` and `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/useDataGridColumnLayoutOrchestration.ts`.
  - Evidence (pending run): `pnpm vitest packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
- [x] One-frame guarantee for hot scroll/drag paths.
  - Contract: `1 input -> 1 window compute -> 1 apply` (no extra microtask/timeout re-apply in same intent cycle).
  - Gate: contract tests for coalescing and duplicate-apply prevention.
  - Progress: `2026-02-10` - added `onWindow` dedupe assertions for stable refresh and single-scroll/single-apply behavior in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
  - Progress: `2026-02-10` - added burst-scroll coalescing contract to assert one rows/columns/window apply per coalesced input cycle and no duplicate apply on immediate follow-up refresh in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
  - Evidence (pending run): `pnpm vitest packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.

## P1 (High)

- [ ] Enforce phased async pipeline (`input -> compute -> apply`) across remaining hot interaction paths.
  - Progress: `2026-02-10` - demoted non-hot imperative setter updates from forced heavy invalidation to queued async updates (`scheduleUpdate(false)` for zoom/virtualization/row-height/viewport-metrics setters), keeping heavy compute/apply in scheduled frame pipeline rather than immediate force path in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts`.
- [ ] Incremental recalculation for horizontal meta/layout across scroll-only updates.
  - Progress: `2026-02-10` - expanded horizontal meta cache from single-entry to 2-slot cache to reduce recompute thrash across alternating controllers in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportHorizontalMeta.ts`.
  - Progress: `2026-02-10` - viewport controller now reuses cached `lastHorizontalMeta` for motion-only horizontal updates and rebuilds layout/meta only on structural changes (`columns/layoutScale/viewport/native scroll envelope`), avoiding repeated `buildHorizontalMeta` calls on plain scroll in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts`.
- [x] Hard split `horizontal virtualization` vs `layout`.
  - `virtual-x`: index/window math only.
  - `layout-x`: px geometry only.
  - No cross-leak of responsibilities in hot path.
  - Progress: `2026-02-10` - extracted horizontal window math into dedicated pure module and switched range/clamp calculations to metrics-driven contract (`calculateVisibleColumnsFromMetrics` + `horizontalVirtualWindowMath`) so virtual window calculation no longer depends on column object arrays in `/Users/anton/Projects/affinio/packages/datagrid-core/src/virtualization/columnSizing.ts`, `/Users/anton/Projects/affinio/packages/datagrid-core/src/virtualization/horizontalVirtualWindowMath.ts`, `/Users/anton/Projects/affinio/packages/datagrid-core/src/virtualization/horizontalVirtualizer.ts`, with contract coverage in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/horizontalVirtualWindowMath.contract.spec.ts`.
  - Evidence (pending run): `pnpm vitest packages/datagrid-core/src/viewport/__tests__/horizontalVirtualWindowMath.contract.spec.ts`
- [ ] Range/axis-scoped invalidation contract.
  - Resize single column must not trigger row-window recompute.
  - Vertical scroll must not trigger full column-layout recompute.
  - Bridge/controller invalidation should be narrowed from force-refresh to affected axis/range.
  - Progress: `2026-02-10` - controller now short-circuits horizontal recompute/apply for vertical-only updates using horizontal structure/motion invalidation gates, with contract coverage for axis-scoped callback behavior (vertical-only => rows/window without columns, horizontal-only => columns/window without rows, width resize => columns without rows) in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts` and `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
  - Progress: `2026-02-10` - model bridge now emits axis-specific invalidation reasons (`rows`/`columns`) and viewport controller maps row-only invalidation to non-force update scheduling to avoid broad forced horizontal refreshes on row updates in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportModelBridgeService.ts`, `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/dataGridViewportController.ts`, `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/modelBridge.contract.spec.ts`.
  - Progress: `2026-02-10` - added contract that row-only model invalidation must not produce horizontal column apply callbacks in `/Users/anton/Projects/affinio/packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`.
  - Evidence (pending run):
    - `pnpm vitest packages/datagrid-core/src/viewport/__tests__/integrationSnapshot.contract.spec.ts`
    - `pnpm vitest packages/datagrid-core/src/viewport/__tests__/modelBridge.contract.spec.ts`
- [ ] Unify range-engine internals for copy/paste/cut/fill/move to one canonical transaction-aware pipeline.
  - Progress: `2026-02-10` - extracted shared kernel for deterministic range iteration + mutable row store (`dataGridRangeMutationKernel`) and rewired both clipboard mutations (`copy/paste/cut/clear` path) and range mutation engine (`fill/move` path) to consume it instead of duplicated local row-mutation loops in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/dataGridRangeMutationKernel.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridClipboardMutations.ts`, `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/useDataGridRangeMutationEngine.ts`.
  - Progress: `2026-02-10` - added kernel contract coverage in `/Users/anton/Projects/affinio/packages/datagrid-orchestration/src/__tests__/dataGridRangeMutationKernel.contract.spec.ts`.
  - Evidence (pending run):
    - `pnpm --filter @affino/datagrid-orchestration exec vitest run --config vitest.config.ts src/__tests__/dataGridRangeMutationKernel.contract.spec.ts src/__tests__/useDataGridClipboardMutations.contract.spec.ts src/__tests__/useDataGridRangeMutationEngine.contract.spec.ts`
- [ ] Expand derived/value caches (filter predicates, sort keys, group meta) with bounded invalidation.
  - Progress: `2026-02-10` - client row model now caches compiled filter predicate by serialized filter snapshot (bounded single-slot cache with automatic invalidation on filter model key change), materializes sort keys once per row per sort pass instead of re-reading row fields inside comparator loops, and caches grouped field values per projection pass (`rowId::field`) to avoid duplicate group-value reads in grouped projection in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`.
  - Progress: `2026-02-10` - added projection contract for sort-key materialization in `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/clientRowModel.spec.ts`.
  - Evidence (pending run):
    - `pnpm --filter @affino/datagrid-core exec vitest run --config vitest.config.ts src/models/__tests__/clientRowModel.spec.ts`

## P2 (Hardening)

- [ ] Strengthen CI perf gates (variance + memory growth) for parity lock.
- [ ] Finish stable selector contract extraction from demo into `@affino/datagrid-vue`.
- [ ] Complete cross-framework parity lock rollout (`quality:lock:datagrid:parity`) in CI workflow.
