# DataGrid Feature Catalog

Updated: 2026-03-03

This is the canonical feature inventory for Affino DataGrid.
Use it as a single decision sheet to understand whether the platform fits your product requirements.

## How to read this catalog

- Scope:
  - `Core` means implemented in `@affino/datagrid-core`.
  - `Adapter` means surfaced through framework adapters (`@affino/datagrid-vue`, `@affino/datagrid-laravel`).
  - `Backend` means contract exists client-side, but behavior is implemented by your server/data source.
- Runtime mode:
  - `main-thread` for simpler/smaller workloads.
  - `worker-owned` for interaction-heavy workloads where UI responsiveness is critical.
  - `server-side` when query shape and data shaping should be backend-owned.

## Capability Matrix

| Area | Capability | Scope | Runtime mode | Notes |
| --- | --- | --- | --- | --- |
| API | Stable namespace-based facade (`DataGridApi`) | Core + Adapter | all | Single public surface: `rows/columns/view/state/events/meta/policy/compute/diagnostics/plugins`. |
| Row models | Client row model (`createClientRowModel`) | Core + Adapter | main-thread, worker-owned | Sorting/filtering/grouping/pagination/visible projection pipeline. |
| Row models | Worker-owned row model (`createDataGridWorkerOwnedRowModel`) | Core worker + Adapter | worker-owned | Compute/state owned by worker, main thread consumes snapshots/windows. |
| Row models | Data source backed row model (`createDataSourceBackedRowModel`) | Core + Adapter + Backend | server-side | Protocol-first pull/push/invalidation/backpressure contract for backend-driven datasets. |
| Row models | Server backed row model (`createServerBackedRowModel`) | Core + Adapter + Backend | server-side | Server-fetch oriented model with explicit lazy/block fetch flow and cached snapshots. |
| State | Unified state export/import (`api.state.get/set`) | Core + Adapter | all | V1 is model-centric transport (`rows.snapshot` + `columns` + `selection` + `transaction`) for restore/integration boundaries. |
| State | Partial + strict restore policies | Core + Adapter | all | `applyColumns/applySelection/applyViewport/strict` restore options. |
| Events | Typed public event surface (`api.events.on`) | Core + Adapter | all | Typed events for rows/columns/projection/selection/pivot/transaction/viewport/state. |
| Events | Event ordering guarantees | Core + Adapter | all | Row tick order is explicit: `rows:changed` -> `projection:recomputed` -> `pivot:changed` -> `viewport:changed` (when applicable). |
| Query | Sort model (single/multi column) | Core + Adapter | all | Deterministic sort state and projection stage integration. |
| Query | Column filters | Core + Adapter | all | Predicate-based column filtering with snapshot state. |
| Query | Advanced filter expressions | Core + Adapter | all | Structured boolean expression tree normalization/evaluation. |
| Query | Quick/global filter actions | Core + Adapter | main-thread, worker-owned | Adapter-level orchestration hooks for global text filtering UX. |
| Grouping | Group by model + expansion state | Core + Adapter | all | Deterministic group projection with expand/collapse controls. |
| Tree data | Tree projection and subtree toggles | Core + Adapter | all | Tree data projection paths and group-like expansion controls. |
| Aggregation | Built-in aggregations (`sum/count/countNonNull/avg/min/max/first/last`) | Core + Adapter | all | Incremental paths where applicable; deterministic finalize behavior. |
| Aggregation | Custom aggregation hooks | Core + Adapter | all | Custom add/finalize/merge style aggregation contracts. |
| Pivot | Pivot rows/columns/values model | Core + Adapter | main-thread, worker-owned, server-side* | Declarative pivot spec with dynamic pivot column generation. |
| Pivot | Row subtotals and grand total | Core + Adapter | main-thread, worker-owned, server-side* | Configurable totals in pivot projection. |
| Pivot | Pivot drilldown (`getPivotCellDrilldown`) | Core + Adapter | main-thread, worker-owned, server-side* | Details path from pivot cell back to source rows. |
| Pivot | Pivot layout export/import + interop snapshot | Core + Adapter | main-thread, worker-owned, server-side* | Persist/restore pivot layout and cross-boundary interop payloads. |
| Pagination | Pagination model/snapshot | Core + Adapter | all | Deterministic paging inputs and snapshot outputs. |
| Virtualization | Vertical virtualization (rows) | Core + Adapter | all | Viewport-driven visible row windows for large datasets. |
| Virtualization | Horizontal virtualization (columns) | Core + Adapter | all | Deterministic horizontal windowing with pinned column support. |
| Columns | Visibility, order, sizing, pinning | Core + Adapter | all | Canonical column model (`pin` contract, snapshots, state updates). |
| Selection | Row and cell/range selection | Core + Adapter | all | Anchor/focus/range model and overlay transform contracts. |
| Selection | Fill handle + drag-fill | Core + Adapter | main-thread, worker-owned | Spreadsheet-like fill interaction primitives. |
| Selection | Range move / drag-move | Core + Adapter | main-thread, worker-owned | Move selected ranges with deterministic lifecycle hooks. |
| Clipboard | Copy/cut/paste orchestration | Core + Adapter | main-thread, worker-owned | Clipboard bridge/mutation policy and selection-aware operations. |
| Reordering | Client row reorder mutation (`rowModel.reorderRows`) | Core + Adapter | main-thread, worker-owned | Officially row-model-scoped in current stable facade; adapters may wrap it, `api.rows` alias is not yet part of semver contract. |
| Editing | Patch updates (`patchRows`) | Core + Adapter | all | Partial row updates with field-aware stage invalidation. |
| Editing | Editing lifecycle controls (`patch/applyEdits/reapply`) | Core + Adapter | main-thread, worker-owned | Explicit mutation lifecycle for edit-heavy UX flows. |
| Editing | Projection policy (`mutable/immutable/excel-like`) | Core + Adapter | all | `mutable` enables auto-reapply; `immutable`/`excel-like` disable auto-reapply (explicit reapply flow). |
| Editing | Deterministic edit revisions | Core + Adapter | all | Revision snapshots are monotonic across edit pipelines. |
| Editing | Stage invalidation guarantees | Core + Adapter | all | Field-aware invalidation keeps recompute scope explicit and observable. |
| Interaction | Keyboard command routing | Core + Adapter | main-thread, worker-owned | Advanced keyboard orchestration for editing/selection/navigation. |
| Interaction | Pointer/context-menu orchestration | Core + Adapter | main-thread, worker-owned | Advanced pointer routing and context menu action contracts. |
| Accessibility | A11y attributes + state machine | Core advanced + Adapter | all | Deterministic ARIA mapping and keyboard/a11y state support. |
| Compute | Mode switch (`api.compute.getMode/switchMode`) | Core + Adapter | main-thread, worker-owned | Synchronous mode switch control for sync/worker paths; does not implicitly recompute projection. |
| Diagnostics | Aggregated diagnostics snapshot (`api.diagnostics.getAll`) | Core + Adapter | all | Read-only diagnostics payload (`rowModel/compute/cache/backpressure`) without triggering recompute. |
| Diagnostics | Projection stage health | Core + Adapter | all | Stage/version/stale diagnostics for runtime health and regression debugging. |
| Diagnostics | Compute transport health | Core + Adapter | main-thread, worker-owned | Dispatch/fallback/transport diagnostics for worker and hybrid pipelines. |
| Transactions | Transaction service (undo/redo/batch/rollback) | Core advanced + Adapter | main-thread, worker-owned | Advanced transaction capability surface. |
| Determinism | Deterministic projection lifecycle | Core + Adapter | all | Projection recompute lifecycle is snapshot-driven and stage-aware. |
| Determinism | Revision-based state tracking | Core + Adapter | all | Monotonic revisions support restore/checkpoint/test assertions. |
| Determinism | Predictable mutation pipeline | Core + Adapter | all | Structured mutation + event payloads support deterministic integration flows and regression assertions. |
| Extensibility | Stable plugin registration surface (`api.plugins.*`) | Core + Adapter | all | Register/unregister/list plugins on stable API facade with lifecycle hooks (`onRegister/onDispose`) and event tap (`onEvent`). |
| Extensibility | Advanced runtime plugin hooks | Core advanced + Adapter | all | Host/plugin runtime hooks for power-user integration layers. |
| Protocols | Worker protocol (commands/updates/transport) | Core worker + Adapter | worker-owned | Typed worker messaging for compute and row-model ownership. |
| Protocols | Data source pull/push/invalidation/backpressure | Core + Adapter + Backend | server-side | Backend integration contract for remote and streaming data flows. |
| Quality | Contract + perf gate coverage | Repo process | all | CI gates for API contracts, perf budgets, variance and drift checks. |

\* `server-side` pivot depends on backend implementation through data source/server protocols.

## Runtime Mode Decision Table

| Requirement profile | Recommended mode |
| --- | --- |
| Small-to-medium table, low mutation pressure, simple UX | `main-thread` |
| Frequent edits/patch storms + active sort/group/filter with responsiveness constraints | `worker-owned` |
| Large remote dataset, backend-owned filtering/grouping/pivot/query | `server-side` |
| Mixed workload with uncertain profile | Start `main-thread`, benchmark, then promote to `worker-owned` or `server-side` |

## Package Entry Map

| Package | Intended consumer | Typical use |
| --- | --- | --- |
| `@affino/datagrid-core` | Headless/platform engineers | Build framework-agnostic integrations and direct model/runtime control. |
| `@affino/datagrid-vue` | Vue teams | Build production grid UX without importing core/orchestration directly. |
| `@affino/datagrid-laravel` | Laravel/Livewire teams | Use Laravel-facing facade with datagrid capabilities and contracts. |
| `@affino/datagrid-vue/advanced` | Power users | Low-level interaction/layout primitives for custom renderer wiring. |
