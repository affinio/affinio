# DataGrid Model Contracts

Updated: `2026-02-07`

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

Implementations:

- `createClientRowModel` (in-memory)
- `createServerBackedRowModel` (adapter over `ServerRowModel`)

## Column Model

`DataGridColumnModel` is the canonical ownership boundary for column state.

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
- Adapter (`useTableViewport`) owns normalization from incoming column props into `DataGridColumnModel`.

## Public API

Contracts are exported via `@affino/datagrid-core` (`src/public.ts`).
