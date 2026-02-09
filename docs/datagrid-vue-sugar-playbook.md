# DataGrid Vue Sugar Playbook

Updated: `2026-02-09`
Package: `@affino/datagrid-vue`
Scope: junior-friendly integration through `useAffinoDataGrid`.

## 1) Quick Start (60 sec)

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
  },
})

type Grid = ReturnType<typeof useAffinoDataGrid>
// grid is fully typed and safe to destructure.
```

```vue
<DataGrid v-bind="grid.componentProps" />
```

## 2) Full Feature Configuration

```ts
import { ref } from "vue"
import { useAffinoDataGrid } from "@affino/datagrid-vue"
import type { DataGridAdvancedFilterExpression } from "@affino/datagrid-core"

const rows = ref<IncidentRow[]>(seedRows)
const columns = ref([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
  { key: "region", label: "Region", width: 140 },
  { key: "severity", label: "Severity", width: 120 },
  { key: "latencyMs", label: "Latency", width: 120 },
])

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
grid.features.tree.setGroupBy({ fields: ["owner", "region"], expandedByDefault: false })
```

## 3) TreeView Integration Contract

Tree in sugar is model-driven. UI should render by `row.kind` and `row.groupMeta`.

Required rendering behavior:

1. If `row.kind === "group"`, render a toggle control and use `grid.features.tree.toggleGroup(groupKey)`.
2. Use `row.groupMeta.level` for indent.
3. Use `row.state.expanded` for chevron state.
4. For leaf rows, use normal editable/data-cell flow.

Group key source:

1. Prefer `row.groupMeta.groupKey`.
2. Fallback to `String(row.rowId ?? row.rowKey)`.

Important:

1. Do not attach toggle handlers both on cell container and toggle button.
2. If container has pointer handlers, ignore events that originate from the toggle button.

## 4) Advanced Filter AST Cookbook

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

## 5) Selection Summary

`summary` is selection-scope based and uses core API internally.

```ts
const snapshot = grid.features.summary.selected.value
const avgLatency = snapshot?.columns["latencyMs"]?.aggregations.avg?.value ?? null
const ownersCount = snapshot?.columns["owner"]?.aggregations.countDistinct?.value ?? null
```

## 6) Column Visibility

```ts
grid.features.visibility.setColumnVisible("severity", false)
grid.features.visibility.toggleColumnVisible("region")
grid.features.visibility.setHiddenColumnKeys(["owner", "latencyMs"])
grid.features.visibility.reset()
```

## 7) Interaction Contract (Minimum for parity)

Use these bindings if you build custom markup:

1. `grid.bindings.headerCell(columnKey)` for sort + header context.
2. `grid.bindings.dataCell({ row, rowIndex, columnKey, value })` for edit/context hooks.
3. `grid.bindings.inlineEditor({ rowKey, columnKey })` for commit/cancel keyboard behavior.
4. `grid.bindings.contextMenuRoot()` + `grid.bindings.contextMenuAction(actionId)` for keyboard-safe menu.
5. `grid.bindings.actionButton(actionId)` for toolbar actions.

Hotkeys users expect:

1. `Ctrl/Cmd+C`, `Ctrl/Cmd+V`, `Ctrl/Cmd+X` for clipboard flows.
2. `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z` for history (when runtime transaction capability is wired).
3. `Shift+F10` for context menu.

## 8) Common Pitfalls

1. Group auto-expand after collapse: check for double toggle handlers (`mousedown` + `click`).
2. Sticky headers overlap issues: keep pinned header z-index above pinned cell content.
3. Selection drift after layout jumps: keep controls area height stable; avoid reflow pushing viewport while dragging.
4. If runtime state seems stale, call `grid.api.refreshRows("manual")`.

## 9) References

1. `/Users/anton/Projects/affinio/packages/datagrid-vue/README.md`
2. `/Users/anton/Projects/affinio/docs/datagrid-vue-adapter-integration.md`
3. `/Users/anton/Projects/affinio/docs/datagrid-sheets-user-interactions-and-integrator-api.md`
4. `/Users/anton/Projects/affinio/demo-vue/src/pages/DataGridPage.vue`
