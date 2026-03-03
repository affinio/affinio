---
title: Column/Row reordering
---

# Column/Row reordering

В sugar‑слое отдельной удобной обёртки пока нет, но базовая интеграция возможна через кастомный UI.

## 1) Колонки

Рекомендуемый контракт:

- Drag‑handle на заголовке.
- Перестановка в `columnModel` через явное обновление колонок.

```ts
const next = [...columns.value]
// swap/move columns
columns.value = next
api.columns.setAll(next)
```

## 2) Строки

Для row‑reorder:

- Перемещайте данные в `rows`.
- Вызывайте `api.view.reapply()`.

```ts
const nextRows = [...rows.value]
// reorder rows
rows.value = nextRows
api.view.reapply()
```

## 3) Валидация

- Проверяйте `rowId` стабильность.
- Убедитесь, что selection/focus не теряются при reorder.
