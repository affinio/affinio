---
title: DataGrid Sugar overview
---

# DataGrid Sugar overview

Sugar is a higher-level API for people who want to build a DataGrid quickly **without touching Core directly**. You enable the features you need, and the sugar layer wires the underlying models, selection, clipboard, and editing for you.

If desired, the UX can be brought to an AG Grid‑like polish: sticky toolbar, compact header filter popovers, and clear visual indicators for sort/pin/group.

## Who it is for

- You need a working grid fast.
- You prefer configuration over manual Core wiring.
- You want to enable features without writing Interaction Orchestration Engine code.

## What you get

- A single entrypoint via `useAffinoDataGrid`.
- Feature flags for selection/clipboard/editing/filtering/tree/summary/visibility/keyboardNavigation.
- Pagination, column-state, and history helpers.
- Ready bindings for header/cell/editor/context menu.

## Quick start

```ts
import { ref } from "vue"
import { useAffinoDataGrid } from "@affino/datagrid-vue"

const rows = ref([
  { rowId: "1", service: "edge", owner: "NOC" },
  { rowId: "2", service: "billing", owner: "Payments" },
])

const columns = ref([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
])

const grid = useAffinoDataGrid({
  rows,
  columns,
  features: {
    selection: true,
    clipboard: true,
    editing: true,
    keyboardNavigation: true,
  },
})
```

## No-core access contract

You do not need direct access to Core. Sugar exposes safe helpers:

- `grid.componentProps` for ready component binding
- `grid.bindings.*` for custom markup
- `grid.features.*` for behavior toggles

