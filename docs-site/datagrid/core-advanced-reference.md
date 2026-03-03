---
title: Core advanced entrypoint reference
---

# Core advanced entrypoint reference

This page is the canonical reference for `@affino/datagrid-core/advanced`.

Use this entrypoint when you intentionally need lower-level runtime, viewport, transaction, adapter, or a11y orchestration APIs.

## Constructor map

| Factory | Returns | Typical use |
| --- | --- | --- |
| `createDataGridRuntime(options)` | `DataGridRuntime` | Host event runtime + plugin bus with typed internal/host events. |
| `createDataGridAdapterRuntime(options)` | `DataGridAdapterRuntime` | Framework adapter bridge (vue/react/laravel/web-component event naming). |
| `createDataGridTransactionService(options)` | `DataGridTransactionService` | Standalone transactional command engine with undo/redo and rollback safety. |
| `createDataGridA11yStateMachine(options)` | `DataGridA11yStateMachine` | Headless accessibility focus/keyboard state machine for grid navigation. |
| `createDataGridViewportController(options)` | `DataGridViewportController` | Full viewport virtualization orchestration + integration snapshots. |
| `createDataSourceBackedRowModel(options)` | `DataSourceBackedRowModel<T>` | Protocol-driven row model (pull/push/invalidation/backpressure). |

## `createDataGridRuntime(options)`

Primary contract:

- Accepts host handlers, plugin context, optional plugins, internal hooks.
- Emits:
  - host events (`emitHost`/`emit`)
  - plugin events (`emitPlugin`, `onPlugin`)
- Lifecycle:
  - plugin event `runtime:initialized`
  - plugin event `runtime:disposing`

Use when you need explicit host-to-plugin event orchestration and typed runtime internal events.

## `createDataGridAdapterRuntime(options)`

Primary contract:

- `kind`: `vue | react | laravel | web-component`
- Maps host event names to adapter event names:
  - React keeps camelCase host names.
  - Vue/Laravel/Web Component map to kebab-case by default.
- Extends `DataGridRuntime` with:
  - `kind`
  - `mapHostEventName(hostEvent)`

Use when adapter event naming/transport policy must be centralized and deterministic.

## `createDataGridTransactionService(options)`

Primary contract:

- Requires `execute(command, context)` handler.
- Supports batching + history:
  - `beginBatch`
  - `commitBatch`
  - `rollbackBatch`
  - `applyTransaction`
  - `undo` / `redo`
- Snapshot:
  - `revision`
  - `pendingBatch`
  - `undoDepth`
  - `redoDepth`
  - `lastCommittedId`

Guarantee:

- every command must include `rollbackPayload` (rollback safety contract).

Use when mutations need auditable/rollbackable command execution independent of framework.

## `createDataGridA11yStateMachine(options)`

Primary contract:

- Headless grid focus state:
  - `snapshot()`
  - `setDimensions`
  - `setFocusCell`
  - `focusGrid`
  - `dispatchKeyboard`
- ARIA snapshots:
  - `getGridAria()`
  - `getCellAria(cell)`
- Keyboard support includes arrows, home/end, page up/down, tab, enter, escape.

Use when you need deterministic a11y behavior in custom renderers, not tied to a specific UI layer.

## `createDataGridViewportController(options)`

Primary contract:

- Runtime attachment + lifecycle:
  - `attach` / `detach` / `dispose`
- Model wiring:
  - `setRowModel`
  - `setColumnModel`
- Virtualization and behavior:
  - `setVirtualizationEnabled`
  - `setRowHeightMode`
  - `setBaseRowHeight`
  - `scrollToRow` / `scrollToColumn`
- Integration snapshots:
  - `getVirtualWindow()`
  - `getIntegrationSnapshot()`
  - `getViewportSyncState()`

Use when you need full control over viewport orchestration, pinned zones, sync transforms, and integration snapshots.

## `createDataSourceBackedRowModel(options)`

Also exported from stable root; listed here because advanced integrations commonly compose it with custom runtime/transport strategies.

Extra capabilities:

- `invalidateRange`
- `invalidateAll`
- `getBackpressureDiagnostics`

Use when backend pull/push invalidation contract drives row shaping lifecycle.

## Advanced utility groups

From `@affino/datagrid-core/advanced` you also get low-level helpers:

- Selection geometry/policy:
  - `applyGroupSelectionPolicy`
  - `clampGridSelectionPoint`
  - `clampSelectionArea`
  - `createGridSelectionContextFromFlattenedRows`
  - `createGridSelectionRange`
  - `createGridSelectionRangeFromInput`
  - `normalizeGridSelectionRange`
- Event protocol envelope/tier helpers:
  - `DATAGRID_EVENT_TIERS`
  - `DATAGRID_EVENT_TIER_ENTRYPOINTS`
  - `createDataGridEventEnvelope`
  - `isDataGridEventTier`
- Public protocol codemod helper:
  - `transformDataGridPublicProtocolSource`

## When to prefer stable root instead

Prefer `@affino/datagrid-core` for application integrations that only need:

- row/column models
- `DataGridApi`
- standard filtering/sorting/grouping/pivot/aggregation
- mainstream client/server/data-source usage without low-level runtime customization

Use `advanced` only when you need explicit control over runtime internals or integration transport concerns.
