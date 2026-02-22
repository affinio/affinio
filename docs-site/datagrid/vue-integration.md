---
title: Vue integration (datagrid-vue)
---

# Vue integration

`@affino/datagrid-vue` provides composable APIs and a basic `AffinoDataGridSimple` component for quick start.

## 1) Install

```bash
pnpm add @affino/datagrid-vue
```

`@affino/datagrid-vue` pulls `@affino/datagrid-core` and `@affino/datagrid-orchestration` internally.
For a normal Vue integration you should not import those packages directly.

## 2) Quick start with `AffinoDataGridSimple`

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AffinoDataGridSimple } from "@affino/datagrid-vue"
import type { DataGridColumnDef } from "@affino/datagrid-vue"

const rows = ref([
  { rowId: "1", service: "edge", owner: "NOC" },
  { rowId: "2", service: "billing", owner: "Payments" },
])

const columns: DataGridColumnDef[] = [
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
]
</script>

<template>
  <AffinoDataGridSimple
    v-model:rows="rows"
    :columns="columns"
    status="Ready"
  />
</template>
```

## 3) Passing features

```ts
const features = {
  selection: true,
  clipboard: true,
  editing: {
    enabled: true,
    mode: "cell",
  },
  keyboardNavigation: true,
}
```

```vue
<AffinoDataGridSimple
  v-model:rows="rows"
  :columns="columns"
  :features="features"
/>
```

## 4) Required stable row identity

By default the component looks for `rowId`, then `id`, then `key`. If that doesn’t fit, provide `features.selection.resolveRowKey(row, index)`.

## 5) Action events

```vue
<AffinoDataGridSimple
  v-model:rows="rows"
  :columns="columns"
  @action="onGridAction"
/>
```

```ts
function onGridAction(payload: {
  actionId: string
  message: string
  affected: number
  ok: boolean
}) {
  // logging, notifications, analytics
}
```

## 6) Deep customization

For custom markup and virtualization, use `useAffinoDataGridUi` and a custom renderer.

Vue API reference (stable + advanced facade map): [/datagrid/vue-api-reference](/datagrid/vue-api-reference)

Full sugar API playbook: [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)

## 7) Runtime edits without sort/filter jumps (Excel-style)

`useDataGridRuntime` exposes a high-level edit entrypoint that can freeze projection while users edit cells.

```ts
import { ref } from "vue"
import { useDataGridRuntime, type DataGridColumnDef } from "@affino/datagrid-vue"

const rows = ref([{ rowId: "r-1", service: "edge", tested_at: "2026-02-22T10:00:00Z" }])
const columns = ref<DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "tested_at", label: "Tested at", width: 220 },
])

const grid = useDataGridRuntime({ rows, columns })

// default behavior (autoReapply=false): update cell value, keep view stable
grid.applyEdits([{ rowId: "r-1", data: { tested_at: "2026-02-22T10:05:00Z" } }])

// later, explicitly reapply sort/filter/group projection
grid.reapplyView()
```

If you want live reapply behavior:

```ts
grid.autoReapply.value = true
```
