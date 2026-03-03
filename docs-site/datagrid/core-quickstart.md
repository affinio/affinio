---
title: DataGrid Core — Quickstart
---

# Core quickstart

Goal: minimal wiring of `rowModel` + `columnModel` + `GridApi`, without UI.

## 1) Models

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

## 2) `GridApi` (server‑safe facade)

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

Common operations:

```ts
api.rows.setSortModel([{ key: "service", direction: "asc" }])
api.rows.setFilterModel({ columnFilters: { owner: ["NOC"] } })
api.rows.setGroupBy({ fields: ["owner"] })
api.view.reapply()
```

## 3) Snapshots and row access

```ts
const snapshot = api.rows.getSnapshot()
const first = api.rows.get(0)
const page = api.rows.getPagination()
```

Column and pivot operations:

```ts
api.columns.setVisibility("owner", true)
api.columns.setWidth("service", 260)

api.pivot.setModel({
  rows: ["owner"],
  columns: ["service"],
  values: [{ field: "service", agg: "count" }],
})
```

Selection and transaction (capability-aware):

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

## 4) When to use the advanced entrypoint

If you need direct viewport control, overlay integration, or runtime events, use `@affino/datagrid-core/advanced`.

Dedicated advanced reference:

- [/datagrid/core-advanced-reference](/datagrid/core-advanced-reference)

## 5) Full method reference

For complete namespace-by-namespace API surface with examples:

- [/datagrid/grid-api](/datagrid/grid-api)
- [/datagrid/core-factories-reference](/datagrid/core-factories-reference)
