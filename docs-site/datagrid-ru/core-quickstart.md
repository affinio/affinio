---
title: DataGrid Core — Быстрый старт
---

# Быстрый старт: Core

Цель: минимальная связка `rowModel` + `columnModel` + `GridApi`, без UI.

## 1) Модели

```ts
import {
  createClientRowModel,
  createDataGridColumnModel,
} from "@affino/datagrid-core"

const rows = [
  { rowId: "1", service: "edge", owner: "NOC" },
  { rowId: "2", service: "billing", owner: "Payments" },
]

const columns = [
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
]

const rowModel = createClientRowModel({ rows })
const columnModel = createDataGridColumnModel({ columns })
```

## 2) GridApi (сервер‑безопасный фасад)

```ts
import { createDataGridApi, createDataGridCore } from "@affino/datagrid-core"

const core = createDataGridCore({
  services: {
    rowModel: { name: "rowModel", model: rowModel },
    columnModel: { name: "columnModel", model: columnModel },
  },
})

const api = createDataGridApi({ core })
await api.start()
```

Типовые операции:

```ts
api.rows.setSortModel([{ key: "service", direction: "asc" }])
api.rows.setFilterModel({ columnFilters: { owner: ["NOC"] } })
api.rows.setGroupBy({ fields: ["owner"] })
api.view.reapply()
```

## 3) Снимки и доступ к строкам

```ts
const snapshot = api.rows.getSnapshot()
const first = api.rows.get(0)
const page = api.rows.getPagination()
```

Операции с колонками и pivot:

```ts
api.columns.setVisibility("owner", true)
api.columns.setWidth("service", 260)

api.pivot.setModel({
  rows: ["owner"],
  columns: ["service"],
  values: [{ field: "service", agg: "count" }],
})
```

Selection и transaction (с проверкой capability):

```ts
if (api.selection.hasSupport()) {
  const selection = api.selection.getSnapshot()
  const summary = api.selection.summarize()
}

if (api.transaction.hasSupport()) {
  const batchId = api.transaction.beginBatch("bulk-edit")
  await api.transaction.commitBatch(batchId)
}
```

## 4) Когда нужен advanced‑entrypoint

Если нужен прямой контроль viewport, интеграции overlay или runtime‑events — используйте `@affino/datagrid-core/advanced`.

Отдельный справочник advanced-слоя:

- [/datagrid-ru/core-advanced-reference](/datagrid-ru/core-advanced-reference)

## 5) Полный справочник методов

Полная reference-страница по namespace API с примерами:

- [/datagrid-ru/grid-api](/datagrid-ru/grid-api)
- [/datagrid-ru/core-factories-reference](/datagrid-ru/core-factories-reference)
