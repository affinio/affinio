---
title: Migration guide
---

# Migration guide

Переход с `.tmp/ui-table` на `@affino/datagrid-*`.

## 1) Импорт‑маппинг

- `.tmp/ui-table/core/*` → `@affino/datagrid-core`
- `.tmp/ui-table/core/viewport/*` → `@affino/datagrid-core/advanced`
- `.tmp/ui-table/vue/*` → `@affino/datagrid-vue`

## 2) Переименование

- `UiTable.vue` → `DataGrid.vue`
- `UiTableViewportSimple.vue` → `DataGridViewport.vue`
- `UiTableOverlayLayer.vue` → `DataGridOverlayLayer.vue`

## 3) Pinning

- используйте `pin: "left" | "right" | "none"`
- не полагайтесь на legacy pin‑поля

## 4) Рекомендуемые шаги

1. Перенести импорты на package‑root.
2. Перевести компоненты на `DataGrid*` имена.
3. Интегрировать overlay через `getIntegrationSnapshot()`.
4. Прогнать quality/perf gates.

## 5) Проверка

- `pnpm run test:matrix:unit`
- `pnpm run test:matrix:integration`
- `pnpm run quality:gates:datagrid`

