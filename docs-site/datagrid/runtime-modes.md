---
title: Runtime modes (main-thread, worker-owned, server-side)
---

# Runtime modes

This page explains when to use each runtime mode and how to switch safely.

## 1) Modes at a glance

| Mode | Best for | Trade-offs |
| --- | --- | --- |
| `main-thread` | Small/medium grids, low edit pressure | Simplest setup, but compute shares UI thread |
| `worker-owned` | High patch/edit pressure, heavy projection churn | Better UI responsiveness, adds worker transport complexity |
| `server-side` row model | Very large/remote datasets, backend-owned query shaping | Moves heavy work to backend, requires server protocol |

## 2) Decision rule

1. Start with `main-thread`.
2. Switch to `worker-owned` when dispatch latency and UI stalls increase.
3. Move to `server-side` when backend should own shaping/paging/aggregation.

## 3) Worker mode (stable API)

Use `api.compute` when compute capability is available:

```ts
if (api.compute.hasSupport()) {
  const before = api.compute.getMode()
  const switched = api.compute.switchMode("worker")
  const after = api.compute.getMode()
  const diagnostics = api.compute.getDiagnostics()
}
```

Switch semantics:

- `switchMode(...)` is synchronous and returns `boolean`.
- It does not auto-recompute by itself.
- It does not change row revision by itself.
- Switch at safe lifecycle boundaries (outside active transactional bursts).

## 4) Server-side row model

Use `createServerBackedRowModel` when dataset size/query ownership belongs to backend:

```ts
import { createServerBackedRowModel } from "@affino/datagrid-core"

const rowModel = createServerBackedRowModel({
  getRowCount: async () => total,
  getRow: async index => fetchRow(index),
})
```

For protocol-based pull/push/invalidation, see:

- [/datagrid/data-source-protocol](/datagrid/data-source-protocol)

## 5) Diagnostics checklist

Track runtime health with:

- `api.diagnostics.getAll()`
- `api.compute.getDiagnostics()`
- `api.events.on("projection:recomputed", ...)`

Use event-driven dashboards rather than tight polling loops.

## 6) Related docs

- Overview: [/datagrid/](/datagrid/)
- Row models and data sources: [/datagrid/row-models](/datagrid/row-models)
- State/events/compute/diagnostics: [/datagrid/state-events-compute-diagnostics](/datagrid/state-events-compute-diagnostics)
- Performance diagnostics: [/datagrid/performance-diagnostics](/datagrid/performance-diagnostics)
