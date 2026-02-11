---
title: Модели данных и контракты
---

# Модели данных и контракты

Core работает с тремя ключевыми сущностями:

- **Row model** — источник строк и их состояния.
- **Column model** — описание колонок, сортировок, фильтров.
- **Row node** — нормализованная форма строки, которую видит GridApi.

## 1) Row node — единый формат

```ts
import type { DataGridRowNode } from "@affino/datagrid-core"

const node: DataGridRowNode<{ rowId: string }> = {
  kind: "leaf",
  rowId: "1",
  data: { rowId: "1" },
}
```

`kind` определяет тип узла (leaf/group/summary), `rowId` — стабильный идентификатор.

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

Колонка идентифицируется ключом `key`, который используется в sort/filter/group.

## 3) GridApi — фасад для моделей

```ts
import { createDataGridApi, createClientRowModel } from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
const api = createDataGridApi({ rowModel, columnModel })
await api.start()

api.setSortModel([{ key: "service", direction: "asc" }])
api.setFilterModel({ columnFilters: { owner: ["NOC"] } })
```

