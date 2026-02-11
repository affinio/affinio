---
title: Grid API
---

# Grid API

`GridApi` — semver‑safe фасад поверх row/column/selection/transaction сервисов.

## 1) Точка входа

```ts
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()
```

## 2) Основные операции

- rows: `getRowSnapshot`, `getRow`, `setSortModel`, `setFilterModel`, `setGroupBy`, `refreshRows`
- columns: `getColumnSnapshot`, `setColumns`, `setColumnOrder`, `setColumnVisibility`, `setColumnWidth`, `setColumnPin`
- selection: `getSelectionSnapshot`, `setSelectionSnapshot`, `clearSelection`, `summarizeSelection`
- transaction: `applyTransaction`, `undoTransaction`, `redoTransaction`

## 3) Selection summary

`summarizeSelection` вычисляет агрегаты (`count`, `sum`, `avg`, `min`, `max`) на основе core‑сервисов.

## 4) Viewport интеграция

Для overlay/пин‑геометрии используйте advanced‑entrypoint:
`createDataGridViewportController(...).getIntegrationSnapshot()`.

