---
title: Performance and diagnostics
---

# Performance and diagnostics

This page covers stable diagnostics APIs and practical performance instrumentation.

## 1) Stable diagnostics surface

Use:

- `api.diagnostics.getAll()` for aggregated runtime diagnostics
- `api.compute.getDiagnostics()` for compute transport details
- `api.events.on(...)` for event-driven updates

```ts
const d = api.diagnostics.getAll()

// d.rowModel -> revision/rowCount/loading/warming/projection/treeData
// d.compute -> configured/effective mode, transport kind, dispatch/fallback counters
// d.derivedCache -> cache stats (when client row model supports it)
// d.backpressure -> pull/push pressure diagnostics (data source backed models)
```

## 2) Projection health checks

Track projection lifecycle via:

- `d.rowModel.projection?.lastStage`
- `d.rowModel.projection?.staleStages`
- `d.rowModel.projection?.cycleVersion`
- `d.rowModel.projection?.recomputeVersion`

Use `projection:recomputed` events to update dashboards without polling.

## 3) Compute mode checks

```ts
if (api.compute.hasSupport()) {
  const before = api.compute.getMode()
  api.compute.switchMode("worker")
  const after = api.compute.getMode()
  const cd = api.compute.getDiagnostics()
}
```

Interpretation:

- high `dispatchCount` + low `fallbackCount` => transport handles requests as expected
- rising `fallbackCount` => compute transport is not handling requests consistently

## 4) Event-driven diagnostics loop

```ts
const off = api.events.on("rows:changed", () => {
  diagnosticsPanel.set(api.diagnostics.getAll())
})
```

Prefer this model in UI adapters and demos.

## 5) Practical recommendations

- Keep event handlers lightweight; push heavy work to scheduled/background tasks.
- For edit storms, combine `applyEdits` policy with explicit `view.reapply()` where needed.
- Use worker-owned mode when synchronous dispatch pressure becomes the bottleneck.
- Move to server-side row models when backend should own query/data shaping.

## 6) Performance gates

Validate contracts and budgets in CI:

- latency percentiles (p95/p99)
- variance gates (CV/drift)
- memory/heap deltas
- mode-specific regressions (main-thread vs worker-owned)
