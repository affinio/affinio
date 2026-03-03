# DataGrid Unified Grid API

Updated: `2026-03-03`

`DataGridApi` is the semver-safe, namespace-based facade for model/service operations in `@affino/datagrid-core`.

## Entry point

Use only package public exports:

- `createDataGridApi`
- `DataGridApi`

Deep imports are outside the stable public contract.

## Namespaced surface

Stable domains:

- `api.rows.*`
- `api.columns.*`
- `api.view.*`
- `api.pivot.*`
- `api.selection.*`
- `api.transaction.*`
- `api.compute.*`
- `api.diagnostics.*`
- `api.meta.*`
- `api.policy.*`
- `api.plugins.*`
- `api.state.*`
- `api.events.*`

Lifecycle:

- `api.init()`
- `api.start()`
- `api.stop()`
- `api.dispose()`

Flat API methods are removed from `DataGridApi`.

## Capability contract

`api.capabilities` is runtime-resolved:

- `patch`
- `dataMutation`
- `compute`
- `selection`
- `transaction`
- `histogram`
- `sortFilterBatch`

Use it as guard before capability-dependent mutating calls.

## Key semantics

- `rows.applyEdits(...)` mutates data (optionally with reapply policy).
- `view.reapply()` recomputes projection only.
- `pivot` remains a separate analytical subsystem (intentionally not nested under `rows`).
- `state.get/set` is the unified state boundary for export/import (V1 model-centric payload).
- `events.on` is the typed public event surface with documented in-process ordering.
- `compute.switchMode(...)` is synchronous and does not implicitly trigger recompute.
- `diagnostics.getAll()` is read-only and does not trigger recompute.
- `plugins` lifecycle is event-driven (`onRegister`/`onDispose`/`onEvent`).

## Service binding notes

`createDataGridApi` binds to `GridCore` services:

- required: `rowModel`, `columnModel`
- optional capabilities: selection, transaction, viewport, histogram, compute mode switching, data mutation support

Creation is fail-fast for missing required services.

## Selection summary contract

`api.selection.summarize(options?)` computes deterministic aggregates over selected scope:

- `count`, `countDistinct`, `sum`, `avg`, `min`, `max`

Selection stays headless in core; adapter/UI mapping remains at adapter boundary.

## Viewport integration boundary

Pinned/overlay geometry sync remains in advanced viewport controller API:

- `createDataGridViewportController(...).getIntegrationSnapshot()`
- `createDataGridViewportController(...).getViewportSyncState()`

Use these for deterministic adapter geometry integration instead of internal signal reads.

## Related docs

- `docs/datagrid-core-factories-reference.md`
- `docs/datagrid-core-advanced-reference.md`
- `docs/datagrid-state-events-compute-diagnostics.md`
- `docs/datagrid-feature-catalog.md`
