# DataGrid State, Events, Compute, Diagnostics

Updated: `2026-03-03`

This document defines the stable platform-level integration surface exposed by `DataGridApi`.

## Unified state (`api.state`)

### Export

```ts
const state = api.state.get()
```

### Import

```ts
api.state.set(state, {
  applyColumns: true,
  applySelection: true,
  applyViewport: true,
  strict: false,
})
```

`api.state` is the canonical boundary for:

- workspace save/restore
- deterministic test checkpoints
- cross-runtime handoff

### V1 transport shape (current stable wire format)

- `rows.snapshot` (row-model snapshot; includes sort/filter/group/pivot/pagination/viewport/revision fields)
- `rows.aggregationModel`
- `columns` (order/visibility/widths/pins)
- `selection`
- `transaction`

Important:

- V1 state is model-centric by design (snapshot transport), not a conceptual UI-domain schema.
- `policy` and `compute mode` are not part of V1 state payload.
- `transaction` restore is intentionally unsupported in `set(...)` right now.

## Typed public events (`api.events`)

Subscribe via `api.events.on(event, listener)`.

Stable event set:

- `rows:changed`
- `columns:changed`
- `projection:recomputed`
- `selection:changed`
- `pivot:changed`
- `transaction:changed`
- `viewport:changed`
- `state:imported`

### Ordering guarantees (actual runtime contract)

- For row-model subscription ticks:
  - `rows:changed` is emitted first.
  - `projection:recomputed` is emitted after `rows:changed` if projection recompute version changed.
  - `pivot:changed` is emitted after that if pivot model/columns signature changed.
  - `viewport:changed` is emitted after that if viewport range changed.
- `columns:changed` is emitted from column-model subscription ticks.
- `selection:changed` is emitted by selection facade methods (`setSnapshot/clear`) and during `state.set(...)` when selection is applied.
- `transaction:changed` is emitted by transaction facade methods (`begin/commit/rollback/apply/undo/redo`).
- `state:imported` is emitted at the end of successful `api.state.set(...)` processing.

### Non-guarantees

- `api.state.set(...)` is not an atomic single-event operation; it may trigger multiple row/column events during application.
- No cross-service total-order guarantee is declared beyond the sequencing above.

## Compute control (`api.compute`)

```ts
if (api.compute.hasSupport()) {
  const switched = api.compute.switchMode("worker")
  const mode = api.compute.getMode()
  const diagnostics = api.compute.getDiagnostics()
}
```

Switch semantics:

- `switchMode(...)` is synchronous and returns `boolean` (`true` if mode changed).
- It does not implicitly run refresh/reapply.
- It does not alter row-model revision by itself.
- It does not coordinate active transaction batches automatically; caller should switch mode at safe lifecycle points.
- Use explicit recompute (`api.view.reapply()` / refresh path) if mode switch must be followed by projection update.

## Aggregated diagnostics (`api.diagnostics`)

```ts
const diagnostics = api.diagnostics.getAll()
```

Domains:

- `rowModel`
- `compute`
- `derivedCache`
- `backpressure`

Cost/behavior contract:

- `getAll()` is read-only and does not trigger recompute.
- Snapshot allocations are bounded to diagnostics payload shape.
- Safe for event-driven diagnostics panels; avoid unnecessary polling in tight loops.

## Policy layer (`api.policy`)

Projection policy is explicit:

- `mutable`
- `immutable`
- `excel-like`

```ts
api.policy.setProjectionMode("excel-like")
```

Policy semantics:

- `mutable`: auto-reapply enabled (projection can react immediately to edit mutations).
- `immutable`: auto-reapply disabled (projection changes require explicit reapply).
- `excel-like`: currently same runtime behavior as `immutable` for patch flows (freeze until explicit reapply).

## Integration pattern

```ts
const off = api.events.on("rows:changed", () => {
  diagnosticsPanel.set(api.diagnostics.getAll())
  checkpointStore.set(api.state.get())
})
```

This event-driven loop is preferred over hot-path polling.

## Plugins and this surface

`api.plugins` is event-driven:

- plugins can receive stable public events through `onEvent(event, payload)`.
- plugin lifecycle hooks: `onRegister`, `onDispose`.
- plugins currently do not participate in unified state serialization/deserialization.
