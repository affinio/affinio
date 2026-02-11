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
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()
```

Типовые операции:

```ts
api.setSortModel([{ key: "service", direction: "asc" }])
api.setFilterModel({ columnFilters: { owner: ["NOC"] } })
api.setGroupBy({ key: "owner" })
api.refreshRows("manual")
```

## 3) Снимки и доступ к строкам

```ts
const snapshot = api.getRowSnapshot()
const first = api.getRow(0)
```

## 4) Когда нужен advanced‑entrypoint

Если нужен прямой контроль viewport, интеграции overlay или runtime‑events — используйте `@affino/datagrid-core/advanced`.

Следующий шаг: [/datagrid/orchestration](/datagrid/orchestration)
