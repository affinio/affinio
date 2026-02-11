---
title: Vue интеграция (datagrid-vue)
---

# Vue интеграция

`@affino/datagrid-vue` содержит готовые composable‑API и базовый компонент `AffinoDataGridSimple` для быстрого старта.

## 1) Установка

```bash
pnpm add @affino/datagrid-vue @affino/datagrid-core @affino/datagrid-orchestration
```

## 2) Быстрый старт с `AffinoDataGridSimple`

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

## 3) Передача features

```ts
const features = {
  selection: true,
  clipboard: true,
  editing: {
    enabled: true,
    mode: "cell",
  },
}
```

```vue
<AffinoDataGridSimple
  v-model:rows="rows"
  :columns="columns"
  :features="features"
/>
```

## 4) Обязательная стабильная идентификация строки

По умолчанию компонент ищет `rowId`, затем `id`, затем `key`. Если это не подходит — задайте `features.selection.resolveRowKey(row, index)`.

## 5) События действий

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
  // логирование, уведомления, аналитика
}
```

## 6) Глубокая кастомизация

Для кастомной разметки и виртуализации используйте `useAffinoDataGridUi` и собственный рендер.

Полный playbook по sugar‑API: [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)

Дальше: [/datagrid/orchestration](/datagrid/orchestration)
