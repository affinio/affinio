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
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()
```

Common operations:

```ts
api.setSortModel([{ key: "service", direction: "asc" }])
api.setFilterModel({ columnFilters: { owner: ["NOC"] } })
api.setGroupBy({ key: "owner" })
api.refreshRows("manual")
```

## 3) Snapshots and row access

```ts
const snapshot = api.getRowSnapshot()
const first = api.getRow(0)
```

## 4) When to use the advanced entrypoint

If you need direct viewport control, overlay integration, or runtime events, use `@affino/datagrid-core/advanced`.

Next: [/datagrid/orchestration](/datagrid/orchestration)
