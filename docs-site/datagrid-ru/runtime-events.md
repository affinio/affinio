---
title: Runtime events
---

# Runtime events

Runtime‑events — это типизированные события, которые Core эмитит во время расчётов (refresh, сортировка, фильтры, модельные переходы).

## 1) Когда нужны

- наблюдать, какие обновления выполняет Grid,
- собирать диагностические метрики,
- интегрировать кастомные эффекты в UI‑адаптере.

## 2) Подключение

```ts
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()

const unsubscribe = api.onRuntimeEvent(event => {
  if (event.kind === "rows-refresh") {
    // diagnostics
  }
})

// позже
unsubscribe()
```

## 3) Рекомендации

- Не блокируйте обработчик событий: держите его быстрым.
- Диагностику и логирование выносите в отдельный слой.

