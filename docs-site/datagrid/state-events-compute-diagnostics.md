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

```ts
const migrated = api.state.migrate(externalState, { strict: true })
if (migrated) {
  api.state.set(migrated)
}
```

`api.state` is designed for:

- workspace save/restore
- deterministic test checkpoints
- cross-runtime handoff scenarios

### Snapshot isolation contract

- Public read operations are revision-consistent within one synchronous call stack.
- If your code performs only reads (`rows.getSnapshot/getCount/getRange`, `state.get`, `meta.getRuntimeInfo`) without mutation calls between them, they observe the same logical revision.
- Revision may change only after a mutation/recompute boundary (for example `rows.patch`, `rows.setSortModel`, `state.set`, `view.reapply`).

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
- `state:import:begin`
- `state:import:end`
- `state:imported`
- `error`

Ordering guarantees:

- row-model tick emits in this sequence:
  1. `rows:changed`
  2. `projection:recomputed` (when recompute version changed)
  3. `pivot:changed` (when pivot signature changed)
  4. `viewport:changed` (when viewport range changed)
- `columns:changed` comes from column-model subscription.
- `selection:changed` is emitted by selection facade operations and during `state.set(...)` when selection is applied.
- `transaction:changed` is emitted by transaction facade operations.
- `state.set(...)` emits explicit restore boundaries:
  1. `state:import:begin`
  2. row/column/selection events while restore is applied
  3. `state:imported` on successful apply
  4. `state:import:end`
- Reentrant emissions are queued FIFO inside one runtime tick (deterministic event order under nested listener-triggered mutations).

Non-guarantee:

- `api.state.set(...)` is a logical operation boundary (begin/end), not a single-event atomic payload.
- row/column events can still fire inside that boundary while restore is being applied.

Error surface:

- `error` is emitted for guarded facade failures (for example lifecycle exclusivity conflicts).
- payload contains `code`, `operation`, `recoverable`, `error`.

### Error handling philosophy

- Recoverable runtime conflicts are surfaced via typed `error` events.
- Guarded operations still throw/reject so caller can enforce local control flow.
- Treat event stream as observability channel and thrown error as control-flow channel.
- For abort-first flows, check `code === "aborted"` and/or `error.name === "AbortError"`.

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

### Mutation abort semantics

- `api.rows.patch(...)` and `api.rows.applyEdits(...)` accept `options.signal`.
- `api.transaction.apply(...)` accepts `options.signal`.
- When aborted before dispatch, operation fails with `AbortError`.

## 3.1) Lifecycle concurrency helpers (`api.lifecycle`)

```ts
if (api.lifecycle.isBusy()) {
  await api.lifecycle.whenIdle()
}

await api.lifecycle.runExclusive(async () => {
  api.state.set(savedState)
})
```

Use this to serialize high-impact operations (state import, mode switching, burst edits).

### Concurrency model guarantees

- `runExclusive(...)` establishes an exclusive mutation window for guarded operations.
- `whenIdle()` resolves after the exclusive lifecycle queue drains.
- `isBusy()` reflects active or queued exclusive lifecycle work.

Non-guarantee:

- Non-guarded row/query mutations are not automatically funneled through `runExclusive(...)`.

## 3.2) Metadata/version introspection (`api.meta`)

```ts
const modelKind = api.meta.getRowModelKind()
const apiVersion = api.meta.getApiVersion()
const protocolVersion = api.meta.getProtocolVersion()
```

Use this for compatibility checks across worker/server/runtime boundaries.

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

### Backpressure and memory guarantees (current surface)

Guaranteed:

- Backpressure state is exposed through diagnostics snapshot (`backpressure` domain when supported).
- Diagnostics reads are observational and do not mutate runtime state.
- Abort-first mutation semantics are available on guarded mutation entrypoints (`signal`).
- Public backpressure controls are available on supported models via `api.data.pause()/resume()/flush()`.
- `api.rows.batch(...)` coalesces facade events into one deterministic event-cycle.

Non-guaranteed on current stable facade:

- No hard memory ceiling contract is declared for all model implementations.
- No global “never duplicate inflight pull” guarantee is declared at facade level.

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
- `immutable` enforcement: data mutation calls are rejected by facade guards.

## 7) Plugins and this surface

- `api.plugins` can observe stable events through `onEvent`.
- Plugin lifecycle is `onRegister` / `onDispose`.
- Plugin event failures are isolated from core event delivery.
- Plugins do not currently augment unified state serialization.
