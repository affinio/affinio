---
title: Range selection engine
---

# Range selection engine

Range‑engine отвечает за anchor/focus/range, а также за hot‑paths для массовых операций.

## 1) Основные понятия

- **Anchor** — стартовая ячейка.
- **Focus** — текущая активная ячейка.
- **Range** — прямоугольник между anchor и focus.

## 2) Базовые операции

```ts
// псевдо‑операции на уровне Interaction Orchestration Engine
orchestration.selection.setAnchor({ rowIndex: 0, colKey: "service" })
orchestration.selection.setFocus({ rowIndex: 5, colKey: "owner" })
const range = orchestration.selection.getRange()
```

## 3) Что должен делать UI‑адаптер

- Гарантировать один активный фокус.
- Поддерживать shift‑selection для построения range.
- При скролле сохранять anchor/focus.

## 4) Диагностика

- Проверяйте соответствие `rowIndex`/`colKey` текущей модели.
- Используйте runtime‑events для инспекции переходов.

