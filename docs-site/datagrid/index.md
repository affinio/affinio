---
title: DataGrid Core — Overview
---

# DataGrid Core

This section is split into two audiences:

- **Core**: deterministic headless grid for advanced integrations.
- **Sugar**: fast setup without direct access to Core.

## Guidance

- **When to use Core vs Sugar** → [/datagrid/core-vs-sugar](/datagrid/core-vs-sugar)

## Package set

- **Core**: row/column models, viewport, snapshots, determinism, `GridApi`.
- **Interaction Orchestration Engine**: range edit, copy/paste/cut, fill/drag/move, pointer lifecycle.
- **Adapters**: Vue/Laravel stay thin and consume Core + Interaction Runtime.

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

## Core path (advanced)

1) **Core quickstart**: models + `GridApi` → [/datagrid/core-quickstart](/datagrid/core-quickstart)
2) **Architecture**: package boundaries → [/datagrid/architecture](/datagrid/architecture)
3) **Data models**: row/column/row-node → [/datagrid/data-models](/datagrid/data-models)
4) **Model contracts**: API invariants → [/datagrid/model-contracts](/datagrid/model-contracts)
5) **Grid API**: operation facade → [/datagrid/grid-api](/datagrid/grid-api)
6) **GroupBy projection**: pipeline and groups → [/datagrid/groupby-projection](/datagrid/groupby-projection)
7) **Row models**: client/server, refresh → [/datagrid/row-models](/datagrid/row-models)
8) **Interaction Orchestration Engine**: selection/clipboard/fill/move → [/datagrid/orchestration](/datagrid/orchestration)
9) **Data source protocol**: pull/push/abort‑first → [/datagrid/data-source-protocol](/datagrid/data-source-protocol)
10) **Deterministic integration**: pinned/overlay/viewport → [/datagrid/deterministic-integration](/datagrid/deterministic-integration)
11) **Runtime events**: diagnostics and hooks → [/datagrid/runtime-events](/datagrid/runtime-events)
12) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid/custom-renderer](/datagrid/custom-renderer)
13) **Range selection engine**: anchor/focus/range → [/datagrid/range-selection](/datagrid/range-selection)
14) **Fill handle**: autofill and copy → [/datagrid/fill-handle](/datagrid/fill-handle)
15) **Range move**: drag‑move ranges → [/datagrid/drag-move](/datagrid/drag-move)
16) **Reordering**: row/column drag → [/datagrid/reordering](/datagrid/reordering)
17) **Viewport & a11y**: snapshot integration → [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
18) **End‑to‑end**: full Core → Interaction Runtime → UI path → [/datagrid/end-to-end](/datagrid/end-to-end)

## Sugar path (fast setup)

1) **Vue integration**: ready component + composable UI → [/datagrid/vue-integration](/datagrid/vue-integration)
2) **Vue API Reference**: framework-facing API map (`datagrid-vue`) → [/datagrid/vue-api-reference](/datagrid/vue-api-reference)
3) **Sugar overview**: fast table without Core → [/datagrid/sugar-overview](/datagrid/sugar-overview)
4) **Vue Sugar Playbook**: full `useAffinoDataGrid` path → [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)
5) **Laravel integration**: `datagrid-laravel` facade for Livewire/JS shells → [/datagrid/laravel-integration](/datagrid/laravel-integration)

If you are building a Vue app and do not need headless Core wiring, start with the Sugar path and install only `@affino/datagrid-vue`.

## Operations & quality

1) **Migration guide**: legacy move → [/datagrid/migration-guide](/datagrid/migration-guide)
2) **Migration & compat**: contract stability → [/datagrid/migration-compat](/datagrid/migration-compat)
3) **Quality gates**: required checks → [/datagrid/quality-gates](/datagrid/quality-gates)
4) **Performance gates**: SLA and budgets → [/datagrid/performance-gates](/datagrid/performance-gates)
5) **Perf‑by‑design**: runtime contracts → [/datagrid/perf-by-design-runtime](/datagrid/perf-by-design-runtime)
6) **Parity matrix**: unified matrix → [/datagrid/parity-matrix](/datagrid/parity-matrix)
7) **Performance & diagnostics**: perf contours and metrics → [/datagrid/performance-diagnostics](/datagrid/performance-diagnostics)
8) **Testing & QA**: unit/integration/e2e → [/datagrid/testing-qa](/datagrid/testing-qa)
9) **Release notes**: summary → [/datagrid/releases](/datagrid/releases)
10) **Troubleshooting**: common issues → [/datagrid/troubleshooting](/datagrid/troubleshooting)

## Baseline references (contracts)

- Models and contracts: [/docs/datagrid-model-contracts.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-model-contracts.md)
- Unified Grid API: [/docs/datagrid-grid-api.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-grid-api.md)
- Deterministic integration: [/docs/datagrid-deterministic-integration-setup.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-deterministic-integration-setup.md)
- Typed runtime events: [/docs/datagrid-typed-runtime-events.md](https://github.com/affinio/affinio/blob/main/docs/datagrid-typed-runtime-events.md)

## Core in 5 lines

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

Next steps:

- drive sort/filter/group via `api`
- wire viewport and overlay snapshots
- add interaction runtime for interactive scenarios
