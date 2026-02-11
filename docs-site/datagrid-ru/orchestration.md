---
title: Оркестрация взаимодействий
---

# Оркестрация взаимодействий

`@affino/datagrid-orchestration` — слой, который связывает Core с адаптером (Vue/React/и т.д.) и отвечает за ввод, selection, clipboard, fill‑handle и drag‑move.

## 1) Минимальная инициализация

```ts
import { createDataGridApi } from "@affino/datagrid-core"
import { createOrchestration } from "@affino/datagrid-orchestration"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()

const orchestration = createOrchestration({ api })
```

## 2) Основные контракты

- `adapter`: преобразует DOM‑события в абстрактные input‑events.
- `input`: единый поток pointer/keyboard для selection/clipboard/fill.
- `viewport`: связывает измерения и скролл с Core.

## 3) Примеры операций

### Selection

```ts
orchestration.selection.selectCell({ rowIndex: 0, colKey: "service" })
orchestration.selection.clear()
```

### Clipboard

```ts
await orchestration.clipboard.copySelection()
await orchestration.clipboard.paste()
```

### Fill‑handle (автозаполнение)

```ts
orchestration.fill.begin({ rowIndex: 0, colKey: "service" })
orchestration.fill.update({ rowIndex: 5, colKey: "service" })
orchestration.fill.commit()
```

## 4) Когда подключать

Подключайте оркестрацию в UI‑адаптере. Core остаётся полностью детерминированным и тестируемым без DOM.

Следующий шаг: [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
