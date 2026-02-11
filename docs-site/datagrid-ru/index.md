---
title: DataGrid Core — Overview
---

# DataGrid Core

Этот раздел — учебный маршрут по `@affino/datagrid-core` и `@affino/datagrid-orchestration` от простого к сложному. Цель: по одной только документации можно собрать детерминированный headless DataGrid и подключить оркестраторы для интерактивных сценариев.

## Что входит в пакетный набор

- **Core**: модели строк/колонок, viewport, снимки, детерминизм, GridApi.
- **Orchestration**: редактирование диапазонов, копирование/вставка/вырезание, fill/drag/move, pointer‑lifecycle.
- **Адаптеры**: Vue/Laravel остаются тонкими, используют core+orchestration.

## Учебный маршрут (рекомендуемый порядок)

1) **Быстрый старт Core**: модели + GridApi → [/datagrid/core-quickstart](/datagrid/core-quickstart)
2) **Архитектура**: границы пакетов → [/datagrid/architecture](/datagrid/architecture)
3) **Модели и контракты**: row/column/row-node → [/datagrid/data-models](/datagrid/data-models)
4) **Model contracts**: API инварианты → [/datagrid/model-contracts](/datagrid/model-contracts)
5) **Grid API**: фасад операций → [/datagrid/grid-api](/datagrid/grid-api)
6) **GroupBy projection**: pipeline и группы → [/datagrid/groupby-projection](/datagrid/groupby-projection)
7) **Row модели**: client/server, refresh → [/datagrid/row-models](/datagrid/row-models)
8) **Vue интеграция**: готовый компонент и composable‑UI → [/datagrid/vue-integration](/datagrid/vue-integration)
9) **Vue Sugar Playbook**: полный маршрут через `useAffinoDataGrid` → [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)
10) **Оркестраторы взаимодействий**: selection/clipboard/fill/move → [/datagrid/orchestration](/datagrid/orchestration)
11) **Data source protocol**: pull/push/abort‑first → [/datagrid/data-source-protocol](/datagrid/data-source-protocol)
12) **Deterministic integration**: pinned/overlay/viewport → [/datagrid/deterministic-integration](/datagrid/deterministic-integration)
13) **Runtime events**: диагностика и интеграции → [/datagrid/runtime-events](/datagrid/runtime-events)
14) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid/custom-renderer](/datagrid/custom-renderer)
15) **Migration guide**: перенос с legacy → [/datagrid/migration-guide](/datagrid/migration-guide)
16) **Migration & compat**: стабильность контрактов → [/datagrid/migration-compat](/datagrid/migration-compat)
17) **Range selection engine**: anchor/focus/range → [/datagrid/range-selection](/datagrid/range-selection)
18) **Fill-handle**: автозаполнение и перенос → [/datagrid/fill-handle](/datagrid/fill-handle)
19) **Range move**: drag‑move диапазона → [/datagrid/drag-move](/datagrid/drag-move)
20) **Reordering**: row/column drag → [/datagrid/reordering](/datagrid/reordering)
21) **Quality gates**: обязательные проверки → [/datagrid/quality-gates](/datagrid/quality-gates)
22) **Performance gates**: SLA и бюджеты → [/datagrid/performance-gates](/datagrid/performance-gates)
23) **Perf‑by‑design**: runtime контракты → [/datagrid/perf-by-design-runtime](/datagrid/perf-by-design-runtime)
24) **Parity matrix**: единая матрица → [/datagrid/parity-matrix](/datagrid/parity-matrix)
25) **Performance & diagnostics**: perf‑контуры и метрики → [/datagrid/performance-diagnostics](/datagrid/performance-diagnostics)
26) **Testing & QA**: unit/integration/e2e → [/datagrid/testing-qa](/datagrid/testing-qa)
27) **End‑to‑end**: полный путь Core → UI → [/datagrid/end-to-end](/datagrid/end-to-end)
28) **Release notes**: краткие изменения → [/datagrid/releases](/datagrid/releases)
29) **Troubleshooting**: частые проблемы → [/datagrid/troubleshooting](/datagrid/troubleshooting)
30) **Viewport + a11y**: интеграция снапшотов и доступность → [/datagrid/viewport-a11y](/datagrid/viewport-a11y)

## Базовые ссылки (контракты)

- Модели и контракты: [/docs/datagrid-model-contracts.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-model-contracts.md)
- Unified Grid API: [/docs/datagrid-grid-api.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-grid-api.md)
- Детерминированная интеграция: [/docs/datagrid-deterministic-integration-setup.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-deterministic-integration-setup.md)
- Typed runtime events: [/docs/datagrid-typed-runtime-events.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-typed-runtime-events.md)

## Короткое «ядро‑в‑5‑строк»

```ts
import {
  createClientRowModel,
  createDataGridColumnModel,
  createDataGridApi,
} from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
const columnModel = createDataGridColumnModel({ columns })
const api = createDataGridApi({ rowModel, columnModel })
```

Дальше можно:

- управлять сортировкой/фильтрами/группами через `api`
- подключить viewport и overlay‑снапшоты
- подключить orchestration для интерактивных сценариев
