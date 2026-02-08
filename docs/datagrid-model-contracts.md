# DataGrid Model Contracts

Updated: `2026-02-08`

This document defines the canonical model layer for `@affino/datagrid-core`.

## Row Model

`DataGridRowModel` is the canonical data contract for viewport/runtime layers.

Core API:

- `getSnapshot()` -> metadata (`rowCount`, `loading`, `error`, `viewportRange`, `sortModel`, `filterModel`)
- `getRow(index)` / `getRowsInRange(range)` -> row access via canonical `DataGridRowNode`
- `setViewportRange(range)` -> deterministic demand window
- `setSortModel(model)` / `setFilterModel(model)` -> model-side inputs
- `refresh(reason)` -> reload hook
- `subscribe(listener)` / `dispose()` -> lifecycle

`DataGridRowNode` identity/state contract:

- `rowKey` (stable row identity for selection/focus/operations)
- `sourceIndex` (source model index)
- `displayIndex` (current rendered/order index)
- `state.selected`
- `state.group`
- `state.pinned` (`none|top|bottom`)
- `state.expanded`
- `stickyTop/stickyBottom` are intentionally not part of core model and are mapped only at UI adapter boundaries.
- `rowKey/rowId` are mandatory. Core no longer falls back to row index for identity.

Implementations:

- `createClientRowModel` (in-memory)
- `createServerBackedRowModel` (adapter over `ServerRowModel`)
- `createDataSourceBackedRowModel` (pull+push `DataGridDataSource` protocol with abort-first cancellation/backpressure diagnostics, advanced entrypoint)

Identity resolver contract:

- `createClientRowModel({ resolveRowId })` lets adapters inject deterministic identity for legacy rows that do not provide `rowId/rowKey`.
- `createServerBackedRowModel({ resolveRowId })` is the preferred path for server datasets; default behavior reads `row.id` and throws if identity is missing.

RowModel kind truthfulness:

- Public `DataGridRowModelKind` currently includes only implemented kinds: `client | server`.
- `infinite` / `viewport` kinds are intentionally not exposed until concrete implementations and contract tests are added.

## Column Model

`DataGridColumnModel` is the canonical ownership boundary for column state.

Headless `DataGridColumnDef` contract:

- canonical fields only: `key`, `label`, `width`, `minWidth`, `maxWidth`, `visible`, `pin`
- UI-only fields (`isSystem`, `sticky*`, legacy pin fields) are not part of the core contract
- adapter-specific payload is allowed only through `meta` (opaque boundary channel)

Core API:

- `getSnapshot()` / `getColumn(key)`
- `setColumns(columns)`
- `setColumnOrder(keys)`
- `setColumnVisibility(key, visible)`
- `setColumnWidth(key, width)`
- `setColumnPin(key, pin)`
- `subscribe(listener)` / `dispose()`

Snapshot guarantees:

- deterministic order output
- `visibleColumns` is derived from canonical state

Viewport boundary:

- `tableViewportController` consumes `columnModel` as the only column source.
- Adapter (`useTableViewport`) owns normalization from incoming column props into `DataGridColumnModel`:
  legacy pin/sticky fields -> canonical `pin`, and UI-specific fields -> `column.meta`.

## Edit Model

`DataGridEditModel` is the canonical headless editing state service.

Core API:

- `getSnapshot()` -> deterministic snapshot (`revision`, sorted `edits`)
- `getEdit(rowId, columnKey)` -> single-cell patch lookup
- `setEdit(patch)` / `setEdits(patches)` -> deterministic write path
- `clearEdit(rowId, columnKey)` / `clearAll()`
- `subscribe(listener)` / `dispose()`

Determinism guarantees:

- no DOM/framework dependencies
- stable snapshot ordering by `rowId` + `columnKey`
- repeated writes with unchanged payload are no-op

## Transaction Service

`createDataGridTransactionService` defines headless command orchestration with rollback safety (advanced entrypoint).

Core contract:

- `applyTransaction({ commands })` -> atomic apply or fail with rollback
- `beginBatch` / `commitBatch` / `rollbackBatch` -> deterministic batching
- `undo` / `redo` -> deterministic history over committed transactions
- `getSnapshot()` -> deterministic state (`revision`, `pendingBatch`, `undoDepth`, `redoDepth`)

Command invariants:

- each command must include `type`, `payload`, and `rollbackPayload`
- rollback always uses `rollbackPayload` and runs in reverse command order
- same command sequence gives same apply/undo/redo ordering

## Public API Tiers

- Stable (`@affino/datagrid-core`): row/column/edit model contracts + core/grid API.
- Advanced (`@affino/datagrid-core/advanced`): transaction service and data-source-backed row model.
- Internal (`@affino/datagrid-core/internal`): unsafe model helpers (no semver guarantees).

## Data Source Protocol

`DataGridDataSource` is the canonical server data boundary for row-demand driven models.

Core contracts:

- `pull(request)` with `range`, `priority`, `reason`, `AbortSignal`, `sortModel`, `filterModel`
- optional `subscribe(listener)` for push events (`upsert`, `remove`, `invalidate`)
- optional `invalidate(invalidation)` for partial/full cache invalidation handoff

Reference: `/Users/anton/Projects/affinio/docs/datagrid-data-source-protocol.md`.
