---
title: Migration и compatibility
---

# Migration и compatibility

Этот раздел помогает переходить между версиями, сохранять стабильные контракты и избегать регрессий.

## 1) Контракт идентичности строк

- У каждой строки должен быть стабильный `rowId` (или `id`/`key`).
- Если структура нестабильна — задайте `features.selection.resolveRowKey(row, index)`.

## 2) Обновление данных

- При замене данных используйте `api.refreshRows("manual")`.
- При смене колонок — `api.refreshColumns("manual")`.

## 3) Стабильность сортировок/фильтров

- Всегда сохраняйте `key` колонок между версиями.
- Избегайте переименования `key` без миграции состояния.

## 4) Back‑compat поведения UI

Если меняете UI‑адаптер:

- сохраните bindings `grid.ui.bindHeaderCell`, `grid.ui.bindDataCell`,
- сохраните a11y‑роль и roving‑tabindex,
- не ломайте контракты `actionButton` и context menu.

## 5) Что делать при расхождениях

- Снимите `api.getRowSnapshot()` до/после изменения.
- Сравните `sort/filter/group` модели.
- Используйте runtime‑events для диагностики.

Дальше: [/datagrid](/datagrid/)
