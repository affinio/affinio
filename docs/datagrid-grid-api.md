# DataGrid Unified Grid API

Updated: `2026-02-09`

`GridApi` is the semver-safe facade for model/service operations in `@affino/datagrid-core`.

## Entry Point

Use only package public exports:

- `createDataGridApi`
- `DataGridApi`

Deep-imports are not part of the public contract.

## Service Binding Contract

`GridApi` binds to `GridCore` services:

- `rowModel` (required): must expose `model: DataGridRowModel`
- `columnModel` (required): must expose `model: DataGridColumnModel`
- `selection` (optional capability): if implemented, must provide
  - `getSelectionSnapshot`
  - `setSelectionSnapshot`
  - `clearSelection`
- `transaction` (optional capability): if implemented, must provide
  - `getTransactionSnapshot`
  - `beginTransactionBatch`
  - `commitTransactionBatch`
  - `rollbackTransactionBatch`
  - `applyTransaction`
  - `canUndoTransaction` / `canRedoTransaction`
  - `undoTransaction` / `redoTransaction`
- `viewport` (optional capability): `setViewportRange` is called when present

Creation is fail-fast for missing required services (`rowModel` / `columnModel`).

## Covered Operations

`GridApi` provides namespaced surfaces (preferred):

- `api.rows.*` (row model and projection controls)
- `api.columns.*` (column model controls and histogram)
- `api.view.*` (viewport range, refresh, cell refresh hooks)
- `api.pivot.*` (pivot model, drilldown, layout/interop import-export)
- `api.selection.*` (selection snapshot and summary)
- `api.transaction.*` (transaction history and batch lifecycle)
- `api.capabilities` (readonly capability flags for UI feature gating)

`api.capabilities` fields:

- `patch`
- `selection`
- `transaction`
- `histogram`
- `sortFilterBatch`

Capability resolution in API is lazy-cached per API instance.

Flat API methods are removed from `DataGridApi`.
Use namespaced APIs only.

Semantics note:

- `rows.applyEdits(...)` mutates row data (optionally with reapply policy).
- `view.reapply()` recomputes projection only (no data mutation).

Pivot domain note:

- pivot is exposed under `api.pivot.*` as a separate analytical subsystem.
- it is intentionally not nested under `api.rows.*`.

Selection contract in `GridApi` is headless:

- `getSelectionSnapshot(): DataGridSelectionSnapshot | null`
- `setSelectionSnapshot(snapshot: DataGridSelectionSnapshot): void`
- `summarizeSelection(options?): DataGridSelectionSummarySnapshot | null`

`summarizeSelection` computes aggregates over current selection scope from core services (`rowModel` + `columnModel` + `selection`) and supports per-column metric config (`count`, `countDistinct`, `sum`, `avg`, `min`, `max`).

UI adapter mapping stays at adapter boundary (Vue): core snapshot (`GridSelectionSnapshot`) is converted to UI snapshot (`UiTableSelectionSnapshot`) inside `/Users/anton/Projects/affinio/packages/datagrid-vue/src/composables/useTableSelection.ts`.

This API is the prerequisite boundary for future higher-level adapters and AG-style feature growth.

## Viewport Integration Boundary (Pinned/Overlay State)

Pinned and overlay sync geometry is intentionally exposed via viewport controller snapshot API, not via `GridApi`:

- `createDataGridViewportController(...).getIntegrationSnapshot()` from `@affino/datagrid-core/advanced`
- `createDataGridViewportController(...).getViewportSyncState()` from `@affino/datagrid-core/advanced`

Use these methods for deterministic adapter integration (overlay transforms, pinned geometry, visible ranges) and avoid direct reads of internal signals/DOM transforms.
