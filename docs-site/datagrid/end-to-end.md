---
title: End‑to‑end integration
---

# End‑to‑end integration

Goal: assemble the Core → Interaction Runtime → UI pipeline with minimal wiring.

## 1) Core

```ts
import { createClientRowModel, createDataGridColumnModel, createDataGridApi } from "@affino/datagrid-core"

const rowModel = createClientRowModel({ rows })
const columnModel = createDataGridColumnModel({ columns })
const api = createDataGridApi({ rowModel, columnModel })
await api.start()
```

## 2) Interaction Runtime (Interaction Orchestration Engine)

```ts
import { createOrchestration } from "@affino/datagrid-orchestration"

const orchestration = createOrchestration({ api })
```

## 3) UI (Vue)

```ts
import { useAffinoDataGridUi } from "@affino/datagrid-vue"

const grid = useAffinoDataGridUi({
  rows,
  columns: computed(() => columns.value),
  features,
})
```

## 4) Minimal contracts

- Header: `grid.ui.bindHeaderCell`
- Cell: `grid.ui.bindDataCell`
- Editor: `grid.ui.bindInlineEditor`
- Context menu: `grid.ui.bindContextMenuRoot` + `grid.ui.bindContextMenuAction`

## 5) Synchronization

- On data updates: `api.refreshRows("manual")`
- On column updates: `api.refreshColumns("manual")`

