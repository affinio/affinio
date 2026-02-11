---
title: Model contracts
---

# Model contracts

This section defines the minimal Core model contracts.

## 1) Row model

Base API:

- `getSnapshot()`
- `getRow(index)` / `getRowsInRange(range)`
- `setViewportRange(range)`
- `setSortModel(model)` / `setFilterModel(model)`
- `setGroupBy(spec | null)` / `toggleGroup(groupKey)`
- `refresh(reason)`

`DataGridRowNode` is required:

- `kind: "leaf" | "group"`
- `rowKey` (stable identity)
- `sourceIndex` / `displayIndex`
- `groupMeta` for groups
- `state.selected/expanded/pinned`

## 2) Column model

Canonical column fields: `key`, `label`, `width`, `minWidth`, `maxWidth`, `visible`, `pin`.

API:

- `getSnapshot()` / `getColumn(key)`
- `setColumns(columns)`
- `setColumnOrder(keys)`
- `setColumnVisibility(key, visible)`
- `setColumnWidth(key, width)`
- `setColumnPin(key, pin)`

## 3) Edit model

- `getSnapshot()`
- `getEdit(rowId, columnKey)`
- `setEdit(patch)` / `setEdits(patches)`
- `clearEdit(rowId, columnKey)` / `clearAll()`

## 4) GroupBy and TreeView

- GroupBy lives in the RowModel.
- Tree is a projection of group/leaf rows.
- Virtualization always consumes a flat stream.

