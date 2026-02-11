---
title: DataGrid Core — Overview
---

# DataGrid Core

This section is a learning path for `@affino/datagrid-core` and `@affino/datagrid-orchestration`, from basics to advanced. The goal is to build a deterministic headless DataGrid and wire orchestration for interactive scenarios using documentation only.

## Package set

- **Core**: row/column models, viewport, snapshots, determinism, `GridApi`.
- **Orchestration**: range edit, copy/paste/cut, fill/drag/move, pointer lifecycle.
- **Adapters**: Vue/Laravel stay thin and consume core + orchestration.

## Learning path (recommended order)

1) **Core quickstart**: models + `GridApi` → [/datagrid/core-quickstart](/datagrid/core-quickstart)
2) **Architecture**: package boundaries → [/datagrid/architecture](/datagrid/architecture)
3) **Data models**: row/column/row-node → [/datagrid/data-models](/datagrid/data-models)
4) **Model contracts**: API invariants → [/datagrid/model-contracts](/datagrid/model-contracts)
5) **Grid API**: operation facade → [/datagrid/grid-api](/datagrid/grid-api)
6) **GroupBy projection**: pipeline and groups → [/datagrid/groupby-projection](/datagrid/groupby-projection)
7) **Row models**: client/server, refresh → [/datagrid/row-models](/datagrid/row-models)
8) **Vue integration**: ready component + composable UI → [/datagrid/vue-integration](/datagrid/vue-integration)
9) **Vue Sugar Playbook**: full `useAffinoDataGrid` path → [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)
10) **Orchestration**: selection/clipboard/fill/move → [/datagrid/orchestration](/datagrid/orchestration)
11) **Data source protocol**: pull/push/abort‑first → [/datagrid/data-source-protocol](/datagrid/data-source-protocol)
12) **Deterministic integration**: pinned/overlay/viewport → [/datagrid/deterministic-integration](/datagrid/deterministic-integration)
13) **Runtime events**: diagnostics and hooks → [/datagrid/runtime-events](/datagrid/runtime-events)
14) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid/custom-renderer](/datagrid/custom-renderer)
15) **Migration guide**: legacy move → [/datagrid/migration-guide](/datagrid/migration-guide)
16) **Migration & compat**: contract stability → [/datagrid/migration-compat](/datagrid/migration-compat)
17) **Range selection engine**: anchor/focus/range → [/datagrid/range-selection](/datagrid/range-selection)
18) **Fill handle**: autofill and copy → [/datagrid/fill-handle](/datagrid/fill-handle)
19) **Range move**: drag‑move ranges → [/datagrid/drag-move](/datagrid/drag-move)
20) **Reordering**: row/column drag → [/datagrid/reordering](/datagrid/reordering)
21) **Quality gates**: required checks → [/datagrid/quality-gates](/datagrid/quality-gates)
22) **Performance gates**: SLA and budgets → [/datagrid/performance-gates](/datagrid/performance-gates)
23) **Perf‑by‑design**: runtime contracts → [/datagrid/perf-by-design-runtime](/datagrid/perf-by-design-runtime)
24) **Parity matrix**: unified matrix → [/datagrid/parity-matrix](/datagrid/parity-matrix)
25) **Performance & diagnostics**: perf contours and metrics → [/datagrid/performance-diagnostics](/datagrid/performance-diagnostics)
26) **Testing & QA**: unit/integration/e2e → [/datagrid/testing-qa](/datagrid/testing-qa)
27) **End‑to‑end**: full Core → UI path → [/datagrid/end-to-end](/datagrid/end-to-end)
28) **Release notes**: summary → [/datagrid/releases](/datagrid/releases)
29) **Troubleshooting**: common issues → [/datagrid/troubleshooting](/datagrid/troubleshooting)
30) **Viewport & a11y**: snapshot integration → [/datagrid/viewport-a11y](/datagrid/viewport-a11y)

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
- add orchestration for interactive scenarios
