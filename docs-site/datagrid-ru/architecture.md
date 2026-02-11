---
title: Архитектура и границы пакетов
---

# Архитектура и границы пакетов

Цель: сохранить Core детерминированным и framework‑agnostic, а Vue‑слой — тонким адаптером.

## 1) Границы ответственности

| Пакет | Отвечает | Не отвечает |
| --- | --- | --- |
| `@affino/datagrid-core` | модели, runtime‑signals, viewport/virtualization, selection geometry | Vue refs, SFC‑рендер, adapter‑lifecycle |
| `@affino/datagrid-vue` | composables, UI‑адаптер, lifecycle, интеграция | дублирование геометрии/virtualization |

## 2) Направление зависимостей

- `datagrid-core` не зависит от Vue.
- `datagrid-vue` зависит от `datagrid-core`.

## 3) Канонический runtime‑pipeline

1. Input события попадают в адаптер.
2. Адаптер нормализует в core‑контракты.
3. Core считает viewport/virtualization.
4. Core эмитит детерминированную геометрию.
5. Vue‑слой только отображает.

## 4) Инварианты

- Один владелец scroll‑sync.
- Канонический `pin = left | right | none`.
- Одна система координат (world/viewport/client).

