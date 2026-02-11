---
title: Grid API
---

# Grid API

`GridApi` is a semver‑safe facade over row/column/selection/transaction services.

## 1) Entry point

```ts
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()
```

## 2) Core operations

- rows: `getRowSnapshot`, `getRow`, `setSortModel`, `setFilterModel`, `setGroupBy`, `refreshRows`
- columns: `getColumnSnapshot`, `setColumns`, `setColumnOrder`, `setColumnVisibility`, `setColumnWidth`, `setColumnPin`
- selection: `getSelectionSnapshot`, `setSelectionSnapshot`, `clearSelection`, `summarizeSelection`
- transaction: `applyTransaction`, `undoTransaction`, `redoTransaction`

## 3) Selection summary

`summarizeSelection` computes aggregates (`count`, `sum`, `avg`, `min`, `max`) using core services.

## 4) Viewport integration

For overlay/pinned geometry, use the advanced entrypoint:
`createDataGridViewportController(...).getIntegrationSnapshot()`.

