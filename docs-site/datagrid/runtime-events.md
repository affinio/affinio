---
title: Runtime events
---

# Runtime events

Stable `DataGridApi` exposes a typed public event surface via `api.events.on(...)`.

## 1) Public event map

| Event | Payload highlights |
| --- | --- |
| `rows:changed` | `{ snapshot }` row-model snapshot after mutation/refresh. |
| `columns:changed` | `{ snapshot }` column-model snapshot after column changes. |
| `projection:recomputed` | `{ snapshot, previousVersion, nextVersion, staleStages }`. |
| `selection:changed` | `{ snapshot }` selection snapshot or `null`. |
| `pivot:changed` | `{ pivotModel, pivotColumns }`. |
| `transaction:changed` | `{ snapshot }` transaction snapshot or `null`. |
| `viewport:changed` | `{ range, snapshot }` viewport range + row snapshot. |
| `state:import:begin` | `{ state }` emitted at logical start of `api.state.set(...)`. |
| `state:import:end` | `{ state }` emitted at logical end of `api.state.set(...)` (success or failure path). |
| `state:imported` | `{ state }` unified state payload passed to `api.state.set(...)`. |
| `error` | `{ code, operation, recoverable, error }` guarded facade/runtime failure details. |

## 2) Subscription

```ts
const offRows = api.events.on("rows:changed", payload => {
  // payload.snapshot.revision, payload.snapshot.rowCount, ...
})

const offProjection = api.events.on("projection:recomputed", payload => {
  // payload.staleStages, payload.previousVersion -> payload.nextVersion
})

const offStateImported = api.events.on("state:imported", payload => {
  // payload.state
})
const offStateImportBegin = api.events.on("state:import:begin", payload => {
  // payload.state
})
const offStateImportEnd = api.events.on("state:import:end", payload => {
  // payload.state
})

// later
offRows()
offProjection()
offStateImported()
offStateImportBegin()
offStateImportEnd()
```

## 3) Ordering and semantics

Guaranteed sequencing:

- For each row-model subscription tick:
  1. `rows:changed`
  2. `projection:recomputed` (if projection recompute version changed)
  3. `pivot:changed` (if pivot model/columns signature changed)
  4. `viewport:changed` (if viewport range changed)
- `columns:changed` is emitted from column-model ticks.
- `selection:changed` is emitted by selection facade operations.
- `transaction:changed` is emitted by transaction facade operations.
- `api.state.set(...)` emits explicit import boundaries:
  1. `state:import:begin`
  2. internal row/column/selection events while restore is applied
  3. `state:imported` (on successful apply)
  4. `state:import:end`
- Reentrant emissions are queued FIFO inside a runtime tick.

Non-guarantees:

- `api.state.set(...)` may emit multiple row/column events between begin/end boundaries.
- No cross-thread/distributed ordering guarantee is provided (surface is in-process only).

Guidance:

- Use event payloads as source of truth for reactive diagnostics panels.
- Prefer event-driven updates over polling `api.rows.getSnapshot()` in hot paths.
- Plugin event-handler exceptions are isolated from core event dispatch.
- Exceptions thrown by direct `api.events` listeners propagate to caller.

## 4) When to use advanced runtime events

Use stable `api.events` for product code.
Use advanced runtime/plugin buses only when you need custom host-plugin orchestration.

See also:

- `/datagrid/grid-api`
- `/datagrid/performance-diagnostics`
- `/datagrid/state-events-compute-diagnostics`
