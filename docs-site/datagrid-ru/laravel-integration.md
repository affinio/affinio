---
title: Laravel интеграция (datagrid-laravel)
---

# Laravel интеграция

Пакет: `@affino/datagrid-laravel`

Используйте этот пакет как Laravel/Livewire-facing entrypoint для datagrid. Он даёт curated facade поверх `@affino/datagrid-core` и `@affino/datagrid-orchestration`, чтобы код приложения не импортировал их напрямую.

## 1) Установка

```bash
pnpm add @affino/datagrid-laravel
```

`@affino/datagrid-core` и `@affino/datagrid-orchestration` подтягиваются внутренне.

## 2) Для чего он нужен

`@affino/datagrid-laravel` подходит для:

- Livewire page shell с client-side datagrid runtime
- vanilla JS datagrid demo внутри Laravel-приложения
- Laravel-ориентированного integration-кода, которому нужны deterministic runtime/orchestration primitives

Это **не** Blade-компонентный пакет сам по себе. Это JS facade пакет для Laravel-приложений.

## 3) Быстрый пример импорта (demo-style)

```ts
import {
  evaluateDataGridAdvancedFilterExpression,
  createDataGridRuntime,
  buildDataGridColumnLayers,
  resolveDataGridLayerTrackTemplate,
  useDataGridColumnLayoutOrchestration,
  useDataGridManagedWheelScroll,
  resolveDataGridHeaderLayerViewportGeometry,
  resolveDataGridHeaderScrollSyncLeft,
} from "@affino/datagrid-laravel"
```

Это соответствует пути интеграции Laravel datagrid demo и убирает прямые импорты `@affino/datagrid-core` / `@affino/datagrid-orchestration`.

## 4) API-first правило для runtime

При использовании `createDataGridRuntime(...)` предпочтителен фасад через `runtime.api.*`:

- `runtime.api.rows.setData(...)`
- `runtime.api.rows.patch(...)`
- `runtime.api.rows.setFilterModel(...)`
- `runtime.api.rows.batch(() => { ... })` для grouped mutation boundary
- `runtime.api.state.get/set(...)`, `runtime.api.events.on(...)`, `runtime.api.diagnostics.getAll()`

Избегайте прямых вызовов `rowModel.*` / `columnModel.*` в Laravel app-коде, если это не целевой low-level runtime эксперимент.

## 5) Рекомендуемая import-policy

Laravel app / demo код:

- импортировать из `@affino/datagrid-laravel`

Разработка core-пакетов, бенчмарки или низкоуровневые framework-agnostic эксперименты:

- импортировать из `@affino/datagrid-core` / `@affino/datagrid-orchestration`

## 6) Типичное разделение ответственности

- Laravel (Blade/Livewire): DOM shell, controls, hydration lifecycle
- `@affino/datagrid-laravel`: datagrid runtime/orchestration facade
- DataGrid engine internals: скрыты за фасадом
