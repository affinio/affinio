---
title: Vue Sugar Playbook
---

# Vue Sugar Playbook

Пакет: `@affino/datagrid-vue`

Цель: пошаговая интеграция через `useAffinoDataGrid` с готовыми сценариями.

## 1) Quick Start (60 сек)

```ts
import { ref } from "vue"
import { useAffinoDataGrid } from "@affino/datagrid-vue"

const rows = ref([
  { rowId: "1", service: "edge-gateway", owner: "NOC", region: "eu-west" },
  { rowId: "2", service: "billing-api", owner: "Payments", region: "us-east" },
])

const columns = ref([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
  { key: "region", label: "Region", width: 140 },
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

Row identity контракт (обязательно):

1. Предоставьте стабильный `rowId` (или `id`/`key`) для каждой строки, либо
2. Передайте `features.selection.resolveRowKey(row, index)`.

```vue
<DataGrid v-bind="grid.componentProps" />
```

## 2) Полная конфигурация features

```ts
import type { DataGridAdvancedFilterExpression } from "@affino/datagrid-core"

const grid = useAffinoDataGrid({
  rows,
  columns,
  features: {
    selection: true,
    clipboard: true,
    editing: {
      mode: "cell",
      enum: true,
    },
    filtering: {
      enabled: true,
      initialFilterModel: {
        columnFilters: {},
        advancedFilters: {},
      },
    },
    summary: {
      enabled: true,
      columns: [
        { key: "latencyMs", aggregations: ["avg", "max"] },
        { key: "owner", aggregations: ["countDistinct"] },
      ],
    },
    visibility: {
      enabled: true,
      hiddenColumnKeys: [],
    },
    tree: {
      enabled: true,
      initialGroupBy: {
        fields: ["owner"],
        expandedByDefault: true,
      },
    },
    rowHeight: {
      enabled: true,
      mode: "auto",
      base: 40,
    },
    keyboardNavigation: true,
  },
})

const noisyServicesFilter: DataGridAdvancedFilterExpression = {
  kind: "group",
  operator: "and",
  children: [
    { kind: "condition", key: "latencyMs", type: "number", operator: ">", value: 250 },
    {
      kind: "group",
      operator: "or",
      children: [
        { kind: "condition", key: "severity", type: "text", operator: "in", value: ["high", "critical"] },
        { kind: "condition", key: "region", type: "text", operator: "equals", value: "us-east" },
      ],
    },
  ],
}

grid.features.filtering.setAdvancedExpression(noisyServicesFilter)

// keyboardNavigation=true включает:
// Cmd/Ctrl+C/X/V, Delete/Backspace, Cmd/Ctrl+Z/Cmd+Ctrl+Shift+Z/Cmd+Ctrl+Y
// плюс стрелки/home/end/page/tab/enter для навигации и выделения.
```

## 3) Pagination, Column State, History

```ts
// Pagination wrappers
grid.pagination.set({ pageSize: 100, currentPage: 0 })
grid.pagination.goToNextPage()
const page = grid.pagination.snapshot.value

// Column state wrappers
const savedColumnState = grid.columnState.capture()
grid.columnState.setPin("service", "left")
grid.columnState.setWidth("owner", 240)
grid.columnState.setVisibility("severity", false)
grid.columnState.apply(savedColumnState)

// History wrappers
if (grid.history.supported.value && grid.history.canUndo.value) {
  await grid.history.undo()
}
```

## 4) TreeView contract

UI‑слой обязан учитывать `row.kind` и `row.groupMeta`:

1. Для `row.kind === "group"` — рендерите toggle и вызывайте `grid.features.tree.toggleGroup(groupKey)`.
2. Используйте `row.groupMeta.level` для indent.
3. Используйте `row.state.expanded` для состояния.

Group key:

1. `row.groupMeta.groupKey` → приоритет.
2. `String(row.rowId ?? row.rowKey)` → fallback.

## 5) Advanced Filter AST Cookbook

### Numeric range

```ts
grid.features.filtering.setAdvancedExpression({
  kind: "condition",
  key: "latencyMs",
  type: "number",
  operator: "between",
  value: 100,
  value2: 400,
})
```

### Text + boolean

```ts
grid.features.filtering.setAdvancedExpression({
  kind: "group",
  operator: "and",
  children: [
    { kind: "condition", key: "service", type: "text", operator: "contains", value: "api" },
    { kind: "condition", key: "isHealthy", type: "boolean", operator: "is-true" },
  ],
})
```

### NOT branch

```ts
grid.features.filtering.setAdvancedExpression({
  kind: "not",
  child: {
    kind: "condition",
    key: "region",
    type: "text",
    operator: "equals",
    value: "eu-west",
  },
})
```

## 6) Selection Summary

```ts
const snapshot = grid.features.summary.selected.value
const avgLatency = snapshot?.columns["latencyMs"]?.aggregations.avg?.value ?? null
```

## 7) Column Visibility

```ts
grid.features.visibility.setColumnVisible("severity", false)
grid.features.visibility.toggleColumnVisible("region")
```

## 8) Interaction Contract (минимум для parity)

1. `grid.bindings.headerCell(columnKey)` — сортировка + header context.
2. `grid.bindings.dataCell({ row, rowIndex, columnKey, value })` — edit/context hooks.
3. `grid.bindings.inlineEditor({ rowKey, columnKey })` — commit/cancel keyboard behavior.
4. `grid.bindings.contextMenuRoot()` + `grid.bindings.contextMenuAction(actionId)` — keyboard‑safe menu.
5. `grid.bindings.actionButton(actionId)` — toolbar actions.

