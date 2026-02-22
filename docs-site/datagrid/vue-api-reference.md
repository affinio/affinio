---
title: Vue API Reference (datagrid-vue)
---

# Vue API Reference

Package: `@affino/datagrid-vue`

This page is a framework-facing API map for Vue teams that want to build and operate DataGrid without importing `@affino/datagrid-core` or `@affino/datagrid-orchestration` directly.

## Install (Vue-only path)

```bash
pnpm add @affino/datagrid-vue
```

`@affino/datagrid-core` and `@affino/datagrid-orchestration` are internal dependencies of the adapter.

## Entrypoints

### `@affino/datagrid-vue` (stable)

Use this entrypoint for app integrations and product code.

- `AffinoDataGridSimple` - prewired component for fast setup
- `DataGrid` - lower-level component surface
- `useAffinoDataGrid` - sugar API (feature-driven grid setup)
- `useAffinoDataGridMinimal` - lighter sugar path
- `useAffinoDataGridUi` - custom renderer bindings
- `useDataGridRuntime` - runtime composable (rows/columns/api lifecycle)
- `createDataGridVueRuntime` - explicit runtime instance factory
- `useDataGridContextMenu` - context menu state/controller
- `useDataGridSettingsStore`, `createDataGridSettingsAdapter` - persisted settings wiring

Stable facade also re-exports common types and pure helpers, including:

- `DataGridColumnDef`
- `DataGridFilterSnapshot`
- `DataGridSortState`
- `DataGridAggregationModel`
- `DataGridClientRowPatch`
- `createClientRowModel`
- `createDataGridColumnModel`
- `createDataGridSelectionSummary`
- `evaluateDataGridAdvancedFilterExpression`

### `@affino/datagrid-vue/components`

Component-only entrypoint (template usage).

- `DataGrid`
- `AffinoDataGridSimple`

### `@affino/datagrid-vue/advanced`

Advanced Vue composables for custom interaction/layout wiring.

Typical uses:

- `useDataGridManagedWheelScroll`
- `useDataGridColumnLayoutOrchestration`
- `useDataGridHeaderSortOrchestration`
- `useDataGridSelectionOverlayOrchestration`
- `useDataGridViewportScrollLifecycle`
- `useDataGridLinkedPaneScrollSync`
- `createDataGridViewportController` (re-export)

Use this entrypoint when `useAffinoDataGrid` is not enough and you are building custom markup/runtime integration.

## Core workflows (Vue-only)

## 1) Fast product grid (`AffinoDataGridSimple`)

```ts
import { ref } from "vue"
import type { DataGridColumnDef } from "@affino/datagrid-vue"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

const rows = ref([
  { rowId: "1", service: "edge", owner: "NOC" },
])

const columns: DataGridColumnDef[] = [
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
]
```

## 2) Sugar API (`useAffinoDataGrid`)

Use when you need features + custom UI bindings, but still no direct core wiring.

```ts
import { ref } from "vue"
import { useAffinoDataGrid } from "@affino/datagrid-vue"

const grid = useAffinoDataGrid({
  rows: ref([]),
  columns: ref([]),
  features: {
    selection: true,
    clipboard: true,
    editing: true,
    filtering: true,
    summary: true,
    visibility: true,
    tree: true,
    keyboardNavigation: true,
  },
})
```

Key outputs you will use most often:

- `grid.componentProps` - bind directly to `DataGrid`
- `grid.bindings.*` - custom renderer binding helpers
- `grid.features.*` - feature-specific commands/state
- `grid.pagination`, `grid.columnState`, `grid.history` - wrappers
- `grid.api` - unified grid API surface

## 3) Runtime API (`useDataGridRuntime`)

Use when you want explicit control of rows/columns/runtime lifecycle without full sugar feature wiring.

```ts
import { ref } from "vue"
import { useDataGridRuntime, type DataGridColumnDef } from "@affino/datagrid-vue"

const rows = ref([{ rowId: "r-1", service: "edge" }])
const columns = ref<DataGridColumnDef[]>([{ key: "service", label: "Service", width: 220 }])

const runtime = useDataGridRuntime({ rows, columns })
```

Most-used runtime methods/refs:

- `runtime.api` - Grid API facade
- `runtime.rowModel`, `runtime.columnModel`, `runtime.core`
- `runtime.columnSnapshot`, `runtime.virtualWindow`
- `runtime.setRows(rows)`
- `runtime.patchRows(updates, options?)`
- `runtime.applyEdits(updates, options?)`
- `runtime.reapplyView()`
- `runtime.autoReapply` (`Ref<boolean>`)
- `runtime.setAggregationModel(model)`, `runtime.getAggregationModel()`

## Editing and reapply policy (Excel-style)

Recommended app pattern:

- Use `applyEdits()` for interactive cell edits
- Keep `autoReapply=false` (default) to avoid sort/filter/group jumps
- Call `reapplyView()` on explicit user action or after edit session commit

```ts
runtime.applyEdits([{ rowId: "r-1", data: { tested_at: "2026-02-22T10:05:00Z" } }])
runtime.reapplyView()
```

Enable live reapply only if your UX expects re-sorting/re-filtering while typing:

```ts
runtime.autoReapply.value = true
```

## Feature-to-API map (where to start)

- Quick table: `AffinoDataGridSimple`
- Rich app grid: `useAffinoDataGrid`
- Custom renderer: `useAffinoDataGridUi`
- Runtime patching / streaming rows: `useDataGridRuntime`
- Advanced wheel/layout/selection orchestration: `@affino/datagrid-vue/advanced`

## When to leave the Vue facade

Most Vue apps should not need this.

Use direct `@affino/datagrid-core` or `@affino/datagrid-orchestration` imports only when you are intentionally building:

- framework-agnostic integrations
- non-Vue adapters
- low-level deterministic runtime experiments
- docs/tests for core/orchestration packages themselves

