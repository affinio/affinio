---
title: Model contracts
---

# Model contracts

Этот раздел фиксирует минимальные контракты моделей Core.

## 1) Row model

Базовый API:

- `getSnapshot()`
- `getRow(index)` / `getRowsInRange(range)`
- `setViewportRange(range)`
- `setSortModel(model)` / `setFilterModel(model)`
- `setGroupBy(spec | null)` / `toggleGroup(groupKey)`
- `refresh(reason)`

`DataGridRowNode` обязателен:

- `kind: "leaf" | "group"`
- `rowKey` (стабильная идентичность)
- `sourceIndex` / `displayIndex`
- `groupMeta` для групп
- `state.selected/expanded/pinned`

## 2) Column model

Канонические поля колонок: `key`, `label`, `width`, `minWidth`, `maxWidth`, `visible`, `pin`.

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

## 4) GroupBy и TreeView

- GroupBy живёт в RowModel.
- Tree — это проекция в виде group/leaf рядов.
- Виртуализация всегда по flat‑стриму.

Дальше: [/datagrid/grid-api](/datagrid/grid-api)
