---
title: DataGrid Core — Overview
---

# DataGrid Core

Раздел разделён по аудиториям:

- **Core**: детерминированный headless‑grid для сложных интеграций.
- **Sugar**: быстрый запуск без прямого доступа к Core.

## Guidance

- **When to use Core vs Sugar** → [/datagrid-ru/core-vs-sugar](/datagrid-ru/core-vs-sugar)
- **Треки пользователей (Core / Adapter / Sugar)** → [/datagrid-ru/audience-tracks](/datagrid-ru/audience-tracks)
- **Режимы рантайма (main-thread / worker-owned / server-side)** → [/datagrid-ru/runtime-modes](/datagrid-ru/runtime-modes)
- **Tree data и grouped rows** → [/datagrid-ru/tree-data](/datagrid-ru/tree-data)
- **Контракты фабрик Core (constructor reference)** → [/datagrid-ru/core-factories-reference](/datagrid-ru/core-factories-reference)
- **Справочник Core advanced entrypoint** → [/datagrid-ru/core-advanced-reference](/datagrid-ru/core-advanced-reference)
- **Полный каталог возможностей** → [DataGrid Feature Catalog](https://github.com/affinio/affinio/blob/main/docs/datagrid-feature-catalog.md)

## Что входит в пакетный набор

- **Core**: модели строк/колонок, viewport, снимки, детерминизм, GridApi.
- **Interaction Orchestration Engine**: редактирование диапазонов, копирование/вставка/вырезание, fill/drag/move, pointer‑lifecycle.
- **Адаптеры**: Vue/Laravel остаются тонкими, используют Core + Interaction Runtime.

## Design philosophy

Affino DataGrid is:

- deterministic
- snapshot-driven
- headless-first
- interaction-runtime-aware
- contract-enforced
- performance-budgeted

## Режимы выполнения: когда какой выбирать

| Профиль нагрузки | Рекомендуемый режим | Почему |
| --- | --- | --- |
| До ~10k строк, низкое давление от patch/edit | `main-thread` | Минимальная сложность и предсказуемый baseline |
| 20k+ строк, частые patch/edit + активные sort/group/filter | `worker-owned` | Лучшая отзывчивость UI и ниже sync-cost на main thread |
| Очень большие/удаленные датасеты, backend владеет query shape | `server-side row model` | Тяжелая проекция и агрегация переносятся на сервер |

Практическое правило:

- Начинать с `main-thread`.
- Переключаться на `worker-owned`, когда UI начинает “залипать” под интерактивной нагрузкой.
- Переходить на `server-side`, когда масштаб и shape данных логично держать на backend.

## Функциональное покрытие (overview)

- Стабильный фасад `DataGridApi` с namespace-доменами (`lifecycle/rows/data/columns/view/pivot/selection/transaction/state/events/meta/policy/compute/diagnostics/plugins`).
- State + events: unified state export/import (`api.state`) и typed public event surface (`api.events`) для детерминированных интеграций.
- Row model: сортировка, фильтрация, группировка, пагинация, viewport range, snapshots/revisions.
- Pivot: rows/columns/values, динамические pivot columns, subtotal/grand total, export/import layout, drilldown.
- Selection engine: anchor/focus/range, fill, drag-move, clipboard сценарии.
- Editing lifecycle: patch-based обновления, freeze/reapply политика (Excel-like).
- Interaction orchestration: keyboard/pointer/context-menu примитивы для адаптеров.
- Compute + diagnostics: управление compute mode и unified diagnostics snapshot (`api.diagnostics.getAll`).
- Extensibility: стабильная регистрация плагинов (`api.plugins`) + advanced runtime hooks.
- Determinism и контракты: строгие инварианты API/runtime + parity/CI проверки.
- Режимы рантайма: main-thread, worker-owned compute, server/data-source модели.

## Срез бенчей (простым языком)

Репрезентативный тренд из worker pressure matrix (scaled patch profile):

| Размер датасета | Worker-owned vs main-thread (end-to-end pressure) |
| --- | --- |
| 20k строк | примерно `~5.4x` быстрее |
| 100k строк | примерно `~1.6x` быстрее |
| 200k строк (более тяжелый patch size) | примерно `~1.34x` быстрее |

Как читать:

- Worker-режим особенно полезен, когда дорогим становится синхронный patch dispatch на main thread.
- Для небольших и простых сценариев `main-thread` остается нормальным вариантом.
- При доминировании backend shaping/query имеет смысл переходить на `server-side`.

## DataGrid Platform

- Core Runtime
- Interaction Engine
- Framework Adapters
- Integration Contracts

## Core (advanced)

1) **Быстрый старт Core**: модели + GridApi → [/datagrid-ru/core-quickstart](/datagrid-ru/core-quickstart)
2) **Справочник Core advanced entrypoint**: runtime/viewport/transaction/a11y API → [/datagrid-ru/core-advanced-reference](/datagrid-ru/core-advanced-reference)
3) **Архитектура**: границы пакетов → [/datagrid-ru/architecture](/datagrid-ru/architecture)
4) **Модели и контракты**: row/column/row-node → [/datagrid-ru/data-models](/datagrid-ru/data-models)
5) **Model contracts**: API инварианты → [/datagrid-ru/model-contracts](/datagrid-ru/model-contracts)
6) **Grid API**: фасад операций → [/datagrid-ru/grid-api](/datagrid-ru/grid-api)
7) **GroupBy projection**: pipeline и группы → [/datagrid-ru/groupby-projection](/datagrid-ru/groupby-projection)
8) **Row модели**: client/server, refresh → [/datagrid-ru/row-models](/datagrid-ru/row-models)
9) **Режимы рантайма**: main-thread / worker-owned / server-side → [/datagrid-ru/runtime-modes](/datagrid-ru/runtime-modes)
10) **Tree data и grouped rows**: tree-контракт для DataGrid → [/datagrid-ru/tree-data](/datagrid-ru/tree-data)
11) **Interaction Orchestration Engine**: selection/clipboard/fill/move → [/datagrid-ru/orchestration](/datagrid-ru/orchestration)
12) **Data source protocol**: pull/push/abort‑first → [/datagrid-ru/data-source-protocol](/datagrid-ru/data-source-protocol)
13) **Deterministic integration**: pinned/overlay/viewport → [/datagrid-ru/deterministic-integration](/datagrid-ru/deterministic-integration)
14) **Runtime events**: диагностика и интеграции → [/datagrid-ru/runtime-events](/datagrid-ru/runtime-events)
15) **State/events/compute/diagnostics**: stable integration surface → [/datagrid-ru/state-events-compute-diagnostics](/datagrid-ru/state-events-compute-diagnostics)
16) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid-ru/custom-renderer](/datagrid-ru/custom-renderer)
17) **Range selection engine**: anchor/focus/range → [/datagrid-ru/range-selection](/datagrid-ru/range-selection)
18) **Fill-handle**: автозаполнение и перенос → [/datagrid-ru/fill-handle](/datagrid-ru/fill-handle)
19) **Range move**: drag‑move диапазона → [/datagrid-ru/drag-move](/datagrid-ru/drag-move)
20) **Reordering**: row/column drag → [/datagrid-ru/reordering](/datagrid-ru/reordering)
21) **Viewport + a11y**: интеграция снапшотов и доступность → [/datagrid-ru/viewport-a11y](/datagrid-ru/viewport-a11y)
22) **End‑to‑end**: полный путь Core → Interaction Runtime → UI → [/datagrid-ru/end-to-end](/datagrid-ru/end-to-end)

## Sugar (быстрый запуск)

1) **Vue интеграция**: готовый компонент и composable‑UI → [/datagrid-ru/vue-integration](/datagrid-ru/vue-integration)
2) **Vue API Reference**: карта framework-facing API (`datagrid-vue`) → [/datagrid-ru/vue-api-reference](/datagrid-ru/vue-api-reference)
3) **Sugar overview**: быстрый старт без Core → [/datagrid-ru/sugar-overview](/datagrid-ru/sugar-overview)
4) **Vue Sugar Playbook**: полный маршрут через `useAffinoDataGrid` → [/datagrid-ru/vue-sugar-playbook](/datagrid-ru/vue-sugar-playbook)
5) **Laravel интеграция**: фасад `datagrid-laravel` для Livewire/JS shell → [/datagrid-ru/laravel-integration](/datagrid-ru/laravel-integration)

Если вы делаете Vue-приложение и вам не нужна headless‑сборка через Core, начинайте с Sugar‑маршрута и устанавливайте только `@affino/datagrid-vue`.

## Операции и качество

1) **Migration guide**: перенос с legacy → [/datagrid-ru/migration-guide](/datagrid-ru/migration-guide)
2) **Migration & compat**: стабильность контрактов → [/datagrid-ru/migration-compat](/datagrid-ru/migration-compat)
3) **Quality gates**: обязательные проверки → [/datagrid-ru/quality-gates](/datagrid-ru/quality-gates)
4) **Performance gates**: SLA и бюджеты → [/datagrid-ru/performance-gates](/datagrid-ru/performance-gates)
5) **Perf‑by‑design**: runtime контракты → [/datagrid-ru/perf-by-design-runtime](/datagrid-ru/perf-by-design-runtime)
6) **Parity matrix**: единая матрица → [/datagrid-ru/parity-matrix](/datagrid-ru/parity-matrix)
7) **Performance & diagnostics**: perf‑контуры и метрики → [/datagrid-ru/performance-diagnostics](/datagrid-ru/performance-diagnostics)
8) **Testing & QA**: unit/integration/e2e → [/datagrid-ru/testing-qa](/datagrid-ru/testing-qa)
9) **Release notes**: краткие изменения → [/datagrid-ru/releases](/datagrid-ru/releases)
10) **Troubleshooting**: частые проблемы → [/datagrid-ru/troubleshooting](/datagrid-ru/troubleshooting)

## Базовые ссылки (контракты)

- Модели и контракты: [/docs/datagrid-model-contracts.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-model-contracts.md)
- Unified Grid API: [/docs/datagrid-grid-api.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-grid-api.md)
- Детерминированная интеграция: [/docs/datagrid-deterministic-integration-setup.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-deterministic-integration-setup.md)
- Typed runtime events: [/docs/datagrid-typed-runtime-events.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-typed-runtime-events.md)

## Короткое ядро

```ts
import {
  createClientRowModel,
  createDataGridApi,
  createDataGridColumnModel,
  createDataGridCore,
} from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
const columnModel = createDataGridColumnModel({ columns })
const core = createDataGridCore({
  services: {
    rowModel: { name: "rowModel", model: rowModel },
    columnModel: { name: "columnModel", model: columnModel },
  },
})
const api = createDataGridApi({ core })
```

Дальше можно:

- управлять сортировкой/фильтрами/группами через `api`
- подключить viewport и overlay‑снапшоты
- подключить interaction runtime для интерактивных сценариев
