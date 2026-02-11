---
title: Testing и QA gates
---

# Testing и QA gates

Этот раздел описывает подход к тестированию DataGrid и минимальные QA‑ворота.

## 1) Unit тесты

- Проверяйте row/column модели изолированно.
- Фиксируйте снапшоты `api.getRowSnapshot()`.

## 2) Integration тесты

- Валидация сортировки/фильтрации/группировок.
- Проверка refresh‑циклов `api.refreshRows("manual")`.

## 3) E2E минимальный набор

- Selection (single + range)
- Clipboard (copy/paste)
- Editing commit/cancel
- Fill‑handle и drag‑move (если включены)

## 4) Performance gates

- Большие наборы данных.
- Стресс‑сценарии на resize/scroll.

Дальше: [/datagrid](/datagrid/)
