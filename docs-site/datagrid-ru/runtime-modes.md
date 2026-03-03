---
title: Режимы рантайма (main-thread, worker-owned, server-side)
---

# Режимы рантайма

Эта страница объясняет, когда выбирать каждый режим и как переключать его безопасно.

## 1) Режимы в двух словах

| Режим | Для чего лучше | Компромиссы |
| --- | --- | --- |
| `main-thread` | Небольшие/средние таблицы, низкое edit-давление | Самая простая схема, но вычисления делят поток с UI |
| `worker-owned` | Высокое patch/edit давление, тяжелый projection churn | Лучшая отзывчивость UI, но появляется сложность transport/worker |
| `server-side` row model | Очень большие/удалённые датасеты, backend владеет query shaping | Тяжелая обработка переносится на backend, нужен серверный протокол |

## 2) Практическое правило выбора

1. Начинайте с `main-thread`.
2. Переходите на `worker-owned`, когда растут dispatch latency и лаги UI.
3. Переходите на `server-side`, когда shaping/paging/aggregation должен контролировать backend.

## 3) Worker mode (stable API)

Используйте `api.compute`, если capability доступна:

```ts
if (api.compute.hasSupport()) {
  const before = api.compute.getMode()
  const switched = api.compute.switchMode("worker")
  const after = api.compute.getMode()
  const diagnostics = api.compute.getDiagnostics()
}
```

Семантика переключения:

- `switchMode(...)` синхронный и возвращает `boolean`.
- Авто-recompute сам по себе не запускается.
- Row revision сам по себе не меняется.
- Переключайте режим в safe lifecycle точках (вне активных transaction bursts).

## 4) Server-side row model

Используйте `createServerBackedRowModel`, когда размер данных/shape логично держать на backend:

```ts
import { createServerBackedRowModel } from "@affino/datagrid-core"

const rowModel = createServerBackedRowModel({
  getRowCount: async () => total,
  getRow: async index => fetchRow(index),
})
```

Для протокольного pull/push/invalidation:

- [/datagrid-ru/data-source-protocol](/datagrid-ru/data-source-protocol)

## 5) Диагностика и контроль

Отслеживайте состояние рантайма через:

- `api.diagnostics.getAll()`
- `api.compute.getDiagnostics()`
- `api.events.on("projection:recomputed", ...)`

Для панелей мониторинга лучше event-driven подход, а не частый polling.

## 6) Связанные разделы

- Overview: [/datagrid-ru/](/datagrid-ru/)
- Row модели и источники данных: [/datagrid-ru/row-models](/datagrid-ru/row-models)
- State/events/compute/diagnostics: [/datagrid-ru/state-events-compute-diagnostics](/datagrid-ru/state-events-compute-diagnostics)
- Performance diagnostics: [/datagrid-ru/performance-diagnostics](/datagrid-ru/performance-diagnostics)
