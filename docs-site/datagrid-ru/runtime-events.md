---
title: Runtime events
---

# Runtime events

Stable `DataGridApi` предоставляет typed public event surface через `api.events.on(...)`.

## 1) Публичная карта событий

| Событие | Ключевые поля payload |
| --- | --- |
| `rows:changed` | `{ snapshot }` snapshot row-model после мутации/refresh. |
| `columns:changed` | `{ snapshot }` snapshot column-model после изменений колонок. |
| `projection:recomputed` | `{ snapshot, previousVersion, nextVersion, staleStages }`. |
| `selection:changed` | `{ snapshot }` snapshot выделения или `null`. |
| `pivot:changed` | `{ pivotModel, pivotColumns }`. |
| `transaction:changed` | `{ snapshot }` snapshot транзакций или `null`. |
| `viewport:changed` | `{ range, snapshot }` viewport range + row snapshot. |
| `state:imported` | `{ state }` unified state payload, переданный в `api.state.set(...)`. |

## 2) Подписка

```ts
const offRows = api.events.on("rows:changed", payload => {
  // payload.snapshot.revision, payload.snapshot.rowCount, ...
})

const offProjection = api.events.on("projection:recomputed", payload => {
  // payload.staleStages, payload.previousVersion -> payload.nextVersion
})

const offStateImported = api.events.on("state:imported", payload => {
  // payload.state
})

// позже
offRows()
offProjection()
offStateImported()
```

## 3) Порядок и семантика

Гарантированный порядок:

- Для каждого row-model tick:
  1. `rows:changed`
  2. `projection:recomputed` (если изменилась recompute version)
  3. `pivot:changed` (если изменилась подпись pivot model/columns)
  4. `viewport:changed` (если изменился viewport range)
- `columns:changed` идёт из column-model ticks.
- `selection:changed` эмитится selection facade-операциями.
- `transaction:changed` эмитится transaction facade-операциями.
- `state:imported` эмитится в конце успешного `api.state.set(...)`.

Что не гарантируется:

- `api.state.set(...)` может эмитить несколько row/column событий в процессе применения; это не atomic single-event граница.
- Глобальная cross-thread/distributed ordering гарантия не заявлена (surface только in-process).

Рекомендация:

- Для reactive diagnostics UI ориентируйтесь на payload событий.
- В hot path лучше event-driven обновления, а не polling `api.rows.getSnapshot()`.

## 4) Когда нужны advanced runtime events

Для продуктового кода используйте stable `api.events`.
Advanced runtime/plugin bus используйте, когда нужен кастомный host-plugin orchestration.

См. также:

- `/datagrid-ru/grid-api`
- `/datagrid-ru/performance-diagnostics`
- `/datagrid-ru/state-events-compute-diagnostics`
