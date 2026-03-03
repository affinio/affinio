---
title: DataGrid Core — Overview
---

# DataGrid Core

This section is split into two audiences:

- **Core**: deterministic headless grid for advanced integrations.
- **Sugar**: fast setup without direct access to Core.

## Guidance

- **When to use Core vs Sugar** → [/datagrid/core-vs-sugar](/datagrid/core-vs-sugar)
- **Audience tracks (Core / Adapter / Sugar)** → [/datagrid/audience-tracks](/datagrid/audience-tracks)
- **Runtime modes (main-thread / worker-owned / server-side)** → [/datagrid/runtime-modes](/datagrid/runtime-modes)
- **Tree data and grouped rows** → [/datagrid/tree-data](/datagrid/tree-data)
- **Core factory contracts (constructor reference)** → [/datagrid/core-factories-reference](/datagrid/core-factories-reference)
- **Core advanced entrypoint reference** → [/datagrid/core-advanced-reference](/datagrid/core-advanced-reference)
- **Full capability catalog** → [DataGrid Feature Catalog](https://github.com/affinio/affinio/blob/main/docs/datagrid-feature-catalog.md)

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

## Runtime mode playbook

| Workload profile | Recommended mode | Rationale |
| --- | --- | --- |
| Up to ~10k rows, low mutation pressure, straightforward table UX | `main-thread` | Lowest operational complexity |
| 20k+ rows with frequent edits/patches + active sort/group/filter | `worker-owned` | Better UI responsiveness and lower synchronous dispatch cost |
| Very large/remote datasets where backend owns query shape | `server-side row model` | Moves heavy compute + data shaping to backend |

Operational rule:

- Start with `main-thread`.
- Promote to `worker-owned` when interaction pressure causes UI stalls.
- Use `server-side` when dataset scale/query ownership is backend-first.

## Functional coverage (platform overview)

- Stable `DataGridApi` facade with namespace domains (`lifecycle/rows/data/columns/view/pivot/selection/transaction/state/events/meta/policy/compute/diagnostics/plugins).
- State + events: unified state export/import (`api.state`) and typed public event surface (`api.events`) for deterministic integrations.
- Row model: sorting, filtering, grouping, pagination, viewport range, snapshots/revisions.
- Pivot: rows/columns/values, generated pivot columns, subtotals, grand totals, layout export/import, drilldown.
- Selection engine: anchor/focus/range, fill, drag-move, clipboard flows.
- Editing lifecycle: patch-based updates, freeze/reapply policies (Excel-like flows).
- Interaction orchestration: keyboard/pointer/context-menu primitives for adapters.
- Compute + diagnostics: compute mode control and unified diagnostics snapshot (`api.diagnostics.getAll`).
- Extensibility: stable plugin registration surface (`api.plugins`) + advanced runtime hooks.
- Determinism and contracts: strict API/runtime invariants, parity checks and CI gates.
- Runtime options: main-thread, worker-owned compute, server/data-source models.

## Benchmark snapshot (plain language)

Representative trend from worker pressure matrix (scaled patch profile):

| Dataset size | Worker-owned vs main-thread (end-to-end pressure) |
| --- | --- |
| 20k rows | about `~5.4x` faster |
| 100k rows | about `~1.6x` faster |
| 200k rows (heavier patch size) | about `~1.34x` faster |

How to interpret:

- Worker mode helps most when synchronous patch dispatch becomes expensive.
- Main-thread remains valid for smaller/simple workloads.
- Server-side is the right next step when backend data shaping dominates.

## DataGrid Platform

- Core Runtime
- Interaction Engine
- Framework Adapters
- Integration Contracts

## Core path (advanced)

1) **Core quickstart**: models + `GridApi` → [/datagrid/core-quickstart](/datagrid/core-quickstart)
2) **Core advanced entrypoint reference**: runtime/viewport/transaction/a11y APIs → [/datagrid/core-advanced-reference](/datagrid/core-advanced-reference)
3) **Architecture**: package boundaries → [/datagrid/architecture](/datagrid/architecture)
4) **Data models**: row/column/row-node → [/datagrid/data-models](/datagrid/data-models)
5) **Model contracts**: API invariants → [/datagrid/model-contracts](/datagrid/model-contracts)
6) **Grid API**: operation facade → [/datagrid/grid-api](/datagrid/grid-api)
7) **GroupBy projection**: pipeline and groups → [/datagrid/groupby-projection](/datagrid/groupby-projection)
8) **Row models**: client/server, refresh → [/datagrid/row-models](/datagrid/row-models)
9) **Runtime modes**: main-thread / worker-owned / server-side → [/datagrid/runtime-modes](/datagrid/runtime-modes)
10) **Tree data and grouped rows**: tree contract for DataGrid → [/datagrid/tree-data](/datagrid/tree-data)
11) **Interaction Orchestration Engine**: selection/clipboard/fill/move → [/datagrid/orchestration](/datagrid/orchestration)
12) **Data source protocol**: pull/push/abort‑first → [/datagrid/data-source-protocol](/datagrid/data-source-protocol)
13) **Deterministic integration**: pinned/overlay/viewport → [/datagrid/deterministic-integration](/datagrid/deterministic-integration)
14) **Runtime events**: diagnostics and hooks → [/datagrid/runtime-events](/datagrid/runtime-events)
15) **State/events/compute/diagnostics**: stable integration surface → [/datagrid/state-events-compute-diagnostics](/datagrid/state-events-compute-diagnostics)
16) **Custom renderer**: `useAffinoDataGridUi` → [/datagrid/custom-renderer](/datagrid/custom-renderer)
17) **Range selection engine**: anchor/focus/range → [/datagrid/range-selection](/datagrid/range-selection)
18) **Fill handle**: autofill and copy → [/datagrid/fill-handle](/datagrid/fill-handle)
19) **Range move**: drag‑move ranges → [/datagrid/drag-move](/datagrid/drag-move)
20) **Reordering**: row/column drag → [/datagrid/reordering](/datagrid/reordering)
21) **Viewport & a11y**: snapshot integration → [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
22) **End‑to‑end**: full Core → Interaction Runtime → UI path → [/datagrid/end-to-end](/datagrid/end-to-end)

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

## Core in short

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

Next steps:

- drive sort/filter/group via `api`
- wire viewport and overlay snapshots
- add interaction runtime for interactive scenarios
