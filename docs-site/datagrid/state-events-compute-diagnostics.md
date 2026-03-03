---
title: State, events, compute, diagnostics
---

# State, events, compute, diagnostics

This is the stable integration reference for the new platform surface.

## 1) Unified state (`api.state`)

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

`api.state` is designed for:

- workspace save/restore
- deterministic test checkpoints
- cross-runtime handoff scenarios

### V1 payload shape

- `rows.snapshot` (sort/filter/group/pivot/pagination/viewport/revision state)
- `rows.aggregationModel`
- `columns` (`order/visibility/widths/pins`)
- `selection`
- `transaction`

Notes:

- This is a model-centric transport shape in V1.
- `policy` and `compute` are not included in unified state payload.
- Transaction restore is not supported by `api.state.set(...)`.

## 2) Typed public events (`api.events`)

```ts
const off = api.events.on("rows:changed", payload => {
  console.log(payload.snapshot.revision)
})
```

Stable events:

- `rows:changed`
- `columns:changed`
- `projection:recomputed`
- `selection:changed`
- `pivot:changed`
- `transaction:changed`
- `viewport:changed`
- `state:imported`

Ordering guarantees:

- row-model tick emits in this sequence:
  1. `rows:changed`
  2. `projection:recomputed` (when recompute version changed)
  3. `pivot:changed` (when pivot signature changed)
  4. `viewport:changed` (when viewport range changed)
- `columns:changed` comes from column-model subscription.
- `selection:changed` is emitted by selection facade operations and during `state.set(...)` when selection is applied.
- `transaction:changed` is emitted by transaction facade operations.
- `state:imported` is emitted at the end of successful `api.state.set(...)`.

Non-guarantee:

- `api.state.set(...)` is not atomic as a single event; it can emit multiple row/column events while applying state.

## 3) Compute control (`api.compute`)

```ts
if (api.compute.hasSupport()) {
  const switched = api.compute.switchMode("worker")
  const mode = api.compute.getMode()
  const diagnostics = api.compute.getDiagnostics()
}
```

Switch semantics:

- synchronous call, returns `boolean`.
- does not trigger automatic recompute.
- does not change row revision by itself.
- does not coordinate active transaction batches automatically (callers should switch mode at safe boundaries).

## 4) Aggregated diagnostics (`api.diagnostics`)

```ts
const d = api.diagnostics.getAll()
```

Snapshot domains:

- `rowModel` (revision/rowCount/loading/warming/projection/treeData)
- `compute` (mode/transport/dispatch/fallback counters)
- `derivedCache` (cache metrics when supported)
- `backpressure` (data-source pressure metrics when supported)

Cost contract:

- read-only path.
- does not trigger recompute.
- designed for event-driven diagnostics panels (prefer events over hot-loop polling).

## 5) Recommended wiring pattern

```ts
const stop = api.events.on("rows:changed", () => {
  panel.update({
    state: api.state.get(),
    diagnostics: api.diagnostics.getAll(),
  })
})
```

This gives a deterministic event-driven integration loop.

## 6) Policy integration (`api.policy`)

Projection policy:

- `mutable`
- `immutable`
- `excel-like`

```ts
api.policy.setProjectionMode("excel-like")
```

Runtime meaning:

- `mutable`: auto-reapply enabled.
- `immutable`: auto-reapply disabled.
- `excel-like`: currently equivalent to immutable for patch/reapply behavior.

## 7) Plugins and this surface

- `api.plugins` can observe stable events through `onEvent`.
- Plugin lifecycle is `onRegister` / `onDispose`.
- Plugins do not currently augment unified state serialization.
