# DataGrid Pivot Enterprise Roadmap

Status date: 2026-03-02

## Scope

- [x] Pivot baseline (rows/columns/values, subtotals, grand totals, expand/collapse, pivot-space sort)
- [x] Pivot cell drilldown/details UX
- [x] Server-side pivot protocol/runtime
- [x] High-cardinality incremental pivot optimizations
- [x] Export/interop with pivot layout preservation

## Phase 1: Drilldown/Details

- [x] Core contract: `getPivotCellDrilldown({ rowId, columnId, limit? })`
- [x] Client row model implementation (constraint-based match over source rows)
- [x] API passthrough on `DataGridApi`
- [x] Unit tests for subtotal and grand-total drilldown behavior
- [x] Vue demo cell action + side panel/modal details
- [x] Laravel demo cell action + details panel
- [ ] Telemetry hooks (drilldown open latency + matched row count histogram)

## Phase 2: Server-side Pivot

- [x] Define server pivot request/response schema (`pivotModel`, sort/filter/group context, page, cursor)
- [x] Add server row model pivot column metadata hydration
- [x] Add deterministic row key contract for server pivot groups/details
- [x] Add fallback handling when server returns partial pivot metadata
- [x] Contract tests for server/client parity (same pivot model -> same layout semantics)

## Phase 3: High-cardinality Incremental Pivot

- [x] Keep per-cell aggregate states (avoid leaf bucket arrays for hot paths)
- [x] Add bounded memory strategy (cap + fallback for pivot incremental caches)
- [x] Add patch-driven incremental recompute for affected row/column buckets only
- [x] Add perf gates for 50k+ rows, 30x30+ column cardinalities, 3+ value metrics
- [x] Add regression dashboards for p95/p99 and variance

## Phase 4: Export/Interop

- [x] Snapshot format for pivot layout (rows/columns/values + subtotal/grand-total policies + expansion state)
- [ ] CSV export preserving generated pivot columns order
- [x] JSON export with layout metadata and row kind annotations (group/detail/subtotal/grand-total)
- [x] Import/reapply of saved layout snapshot
- [x] Compatibility notes for external BI pipelines

## Notes

- Current drilldown implementation is synchronous and scans source rows intentionally for correctness-first delivery.
- Incremental pivot runtime now applies value-only row patches against cached per-cell aggregate states and falls back to full rebuild when pivot axes/filter/sort semantics are affected.
- High-cardinality incremental path no longer depends on per-row leaf-binding cache; touched keys are derived on-demand from row axes/column axes, so incremental patches remain available beyond 100k+ leaf identities.
- Interop export is available via `DataGridApi.exportPivotInterop()` and includes layout snapshot, generated pivot columns and serialized projected rows for external pipelines.
