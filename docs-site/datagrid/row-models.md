---
title: Row models and data sources
---

# Row models and data sources

Core supports different row data sources. The choice affects refresh/caching and UI updates.

## 1) Client row model

Use when all data is in memory.

```ts
import { createClientRowModel } from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
```

## 2) Server‑backed row model

Use for large tables and lazy loading.

```ts
import { createServerBackedRowModel } from "@affino/datagrid-core"

const rowModel = createServerBackedRowModel({
  getRowCount: async () => total,
  getRow: async index => fetchRow(index),
})
```

## 3) Refresh recommendations

- **Data change**: `api.refreshRows("manual")`
- **Column change**: `api.refreshColumns("manual")`
- **Measurement change**: update viewport measurements in the adapter

## 4) Diagnostics and control

For deterministic updates, use manual refresh and validate snapshots via `api.getRowSnapshot()`.

