---
title: Row модели и источники данных
---

# Row модели и источники данных

Core поддерживает разные типы источников строк. Выбор влияет на refresh/кэширование и на то, как обновляется UI.

## 1) Client row model

Подходит, когда все данные уже в памяти.

```ts
import { createClientRowModel } from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
```

## 2) Server-backed row model

Используйте для больших таблиц и ленивой подгрузки.

```ts
import { createServerBackedRowModel } from "@affino/datagrid-core"

const rowModel = createServerBackedRowModel({
  getRowCount: async () => total,
  getRow: async index => fetchRow(index),
})
```

## 3) Рекомендации по refresh

- **Смена данных**: `api.refreshRows("manual")`
- **Смена колонок**: `api.refreshColumns("manual")`
- **Изменение измерений**: обновляйте viewport измерения в адаптере

## 4) Диагностика и контроль

Для детерминированных обновлений используйте ручные refresh и тестируйте снапшоты через `api.getRowSnapshot()`.

