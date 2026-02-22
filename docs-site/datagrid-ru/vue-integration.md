---
title: Vue интеграция (datagrid-vue)
---

# Vue интеграция

`@affino/datagrid-vue` содержит готовые composable‑API и базовый компонент `AffinoDataGridSimple` для быстрого старта.

## 1) Установка

```bash
pnpm add @affino/datagrid-vue
```

`@affino/datagrid-vue` сам подтягивает `@affino/datagrid-core` и `@affino/datagrid-orchestration`.
Для обычной Vue‑интеграции не нужно импортировать эти пакеты напрямую.

## 2) Быстрый старт с `AffinoDataGridSimple`

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

## 3) Передача features

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

Vue API reference (stable + advanced facade map): [/datagrid-ru/vue-api-reference](/datagrid-ru/vue-api-reference)

Полный playbook по sugar‑API: [/datagrid-ru/vue-sugar-playbook](/datagrid-ru/vue-sugar-playbook)

## 7) Runtime-редактирование без “прыжков” сортировки/фильтра (Excel-style)

`useDataGridRuntime` предоставляет high-level API для редактирования строк с заморозкой проекции во время ввода.

```ts
import { ref } from "vue"
import { useDataGridRuntime, type DataGridColumnDef } from "@affino/datagrid-vue"

const rows = ref([{ rowId: "r-1", service: "edge", tested_at: "2026-02-22T10:00:00Z" }])
const columns = ref<DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "tested_at", label: "Tested at", width: 220 },
])

const grid = useDataGridRuntime({ rows, columns })

// поведение по умолчанию (autoReapply=false): обновляет ячейку, но не пересортировывает/не перефильтровывает сразу
grid.applyEdits([{ rowId: "r-1", data: { tested_at: "2026-02-22T10:05:00Z" } }])

// позже — явный пересчёт sort/filter/group
grid.reapplyView()
```

Если нужен live-reapply:

```ts
grid.autoReapply.value = true
```
