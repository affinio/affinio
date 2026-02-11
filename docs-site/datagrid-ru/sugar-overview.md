---
title: DataGrid Sugar — обзор
---

# DataGrid Sugar — обзор

Sugar — это более высокий уровень API для тех, кто хочет быстро собрать DataGrid **без прямого доступа к Core**. Вы включаете нужные функции, а sugar‑слой берёт на себя модели, selection, clipboard и editing.

Если нужно, UX можно довести до «AG Grid‑like polished»: фиксированный toolbar, компактные popover‑фильтры в заголовках и визуальные индикаторы сортировки/пиннинга/групп.

## Для кого

- нужен быстрый старт без сложной интеграции;
- хочется конфигурации вместо ручной сборки Core;
- важно включать функции без оркестраторов.

## Что входит

- единая точка входа `useAffinoDataGrid`;
- флаги selection/clipboard/editing/filtering/tree/summary/visibility/keyboardNavigation;
- pagination, column‑state и history helpers;
- готовые bindings для header/cell/editor/context menu.

## Быстрый старт

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

## Контракт без Core

Доступ к Core не нужен. Sugar даёт безопасные хелперы:

- `grid.componentProps` для готового компонента
- `grid.bindings.*` для кастомной разметки
- `grid.features.*` для включения функций

