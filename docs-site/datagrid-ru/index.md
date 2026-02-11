---
title: DataGrid Core — Overview
---

# DataGrid Core

Раздел разделён по аудиториям:

- **Core**: детерминированный headless‑grid для сложных интеграций.
- **Sugar**: быстрый запуск без прямого доступа к Core.

## Guidance

- **When to use Core vs Sugar** → [/datagrid-ru/core-vs-sugar](/datagrid-ru/core-vs-sugar)

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

## DataGrid Platform

- Core Runtime
- Interaction Engine
- Framework Adapters
- Integration Contracts

## Core (advanced)

1) **Быстрый старт Core**: модели + GridApi → [/datagrid-ru/core-quickstart](/datagrid-ru/core-quickstart)
2) **Архитектура**: границы пакетов → [/datagrid-ru/architecture](/datagrid-ru/architecture)
3) **Модели и контракты**: row/column/row-node → [/datagrid-ru/data-models](/datagrid-ru/data-models)
4) **Model contracts**: API инварианты → [/datagrid-ru/model-contracts](/datagrid-ru/model-contracts)
5) **Grid API**: фасад операций → [/datagrid-ru/grid-api](/datagrid-ru/grid-api)
6) **GroupBy projection**: pipeline и группы → [/datagrid-ru/groupby-projection](/datagrid-ru/groupby-projection)
7) **Row модели**: client/server, refresh → [/datagrid-ru/row-models](/datagrid-ru/row-models)
8) **Interaction Orchestration Engine**: selection/clipboard/fill/move → [/datagrid-ru/orchestration](/datagrid-ru/orchestration)
9) **Data source protocol**: pull/push/abort‑first → [/datagrid-ru/data-source-protocol](/datagrid-ru/data-source-protocol)
10) **Deterministic integration**: pinned/overlay/viewport → [/datagrid-ru/deterministic-integration](/datagrid-ru/deterministic-integration)
11) **Runtime events**: диагностика и интеграции → [/datagrid-ru/runtime-events](/datagrid-ru/runtime-events)
12) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid-ru/custom-renderer](/datagrid-ru/custom-renderer)
13) **Range selection engine**: anchor/focus/range → [/datagrid-ru/range-selection](/datagrid-ru/range-selection)
14) **Fill-handle**: автозаполнение и перенос → [/datagrid-ru/fill-handle](/datagrid-ru/fill-handle)
15) **Range move**: drag‑move диапазона → [/datagrid-ru/drag-move](/datagrid-ru/drag-move)
16) **Reordering**: row/column drag → [/datagrid-ru/reordering](/datagrid-ru/reordering)
17) **Viewport + a11y**: интеграция снапшотов и доступность → [/datagrid-ru/viewport-a11y](/datagrid-ru/viewport-a11y)
18) **End‑to‑end**: полный путь Core → Interaction Runtime → UI → [/datagrid-ru/end-to-end](/datagrid-ru/end-to-end)

## Sugar (быстрый запуск)

1) **Vue интеграция**: готовый компонент и composable‑UI → [/datagrid-ru/vue-integration](/datagrid-ru/vue-integration)
2) **Sugar overview**: быстрый старт без Core → [/datagrid-ru/sugar-overview](/datagrid-ru/sugar-overview)
3) **Vue Sugar Playbook**: полный маршрут через `useAffinoDataGrid` → [/datagrid-ru/vue-sugar-playbook](/datagrid-ru/vue-sugar-playbook)

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
- подключить interaction runtime для интерактивных сценариев
