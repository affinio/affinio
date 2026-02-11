---
title: Data models and contracts
---

# Data models and contracts

Core works with three key entities:

- **Row model** — the source of rows and their state.
- **Column model** — column definition, sorting, filtering.
- **Row node** — normalized row shape used by `GridApi`.

## 1) Row node — the unified shape

```ts
import type { DataGridRowNode } from "@affino/datagrid-core"

const node: DataGridRowNode<{ rowId: string }> = {
  kind: "leaf",
  rowId: "1",
  data: { rowId: "1" },
}
```

`kind` defines the node type (leaf/group/summary), `rowId` is the stable identifier.

## 2) Column model

```ts
import { createDataGridColumnModel } from "@affino/datagrid-core"

const columnModel = createDataGridColumnModel({
  columns: [
    { key: "service", label: "Service", width: 220 },
    { key: "owner", label: "Owner", width: 180 },
  ],
})
```

Columns are identified by `key`, used in sort/filter/group.

## 3) `GridApi` — facade for models

```ts
import { createDataGridApi, createClientRowModel } from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
const api = createDataGridApi({ rowModel, columnModel })
await api.start()

api.setSortModel([{ key: "service", direction: "asc" }])
api.setFilterModel({ columnFilters: { owner: ["NOC"] } })
```

