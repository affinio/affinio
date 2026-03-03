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
| `state:imported` | `{ state }` unified state payload passed to `api.state.set(...)`. |

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

// later
offRows()
offProjection()
offStateImported()
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
- `state:imported` is emitted at the end of successful `api.state.set(...)`.

Non-guarantees:

- `api.state.set(...)` may emit multiple row/column events during apply; it is not an atomic single-event boundary.
- No cross-thread/distributed ordering guarantee is provided (surface is in-process only).

Guidance:

- Use event payloads as source of truth for reactive diagnostics panels.
- Prefer event-driven updates over polling `api.rows.getSnapshot()` in hot paths.

## 4) When to use advanced runtime events

Use stable `api.events` for product code.
Use advanced runtime/plugin buses only when you need custom host-plugin orchestration.

See also:

- `/datagrid/grid-api`
- `/datagrid/performance-diagnostics`
- `/datagrid/state-events-compute-diagnostics`
