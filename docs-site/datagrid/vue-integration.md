---
title: Vue integration (datagrid-vue)
---

# Vue integration

`@affino/datagrid-vue` provides composable APIs and a basic `AffinoDataGridSimple` component for quick start.

## 1) Install

```bash
pnpm add @affino/datagrid-vue @affino/datagrid-core @affino/datagrid-orchestration
```

## 2) Quick start with `AffinoDataGridSimple`

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AffinoDataGridSimple } from "@affino/datagrid-vue"
import type { DataGridColumnDef } from "@affino/datagrid-core"

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

Full sugar API playbook: [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)

