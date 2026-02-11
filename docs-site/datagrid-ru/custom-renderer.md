---
title: Custom renderer (useAffinoDataGridUi)
---

# Custom renderer

Ниже — минимальный каркас собственного рендера, который сохраняет все интерактивные контракты.

## 1) Инициализация

```ts
import { computed } from "vue"
import { useAffinoDataGridUi } from "@affino/datagrid-vue"

const grid = useAffinoDataGridUi({
  rows,
  columns: computed(() => columns.value),
  features,
})
```

## 2) Обязательные биндинги

- Header: `grid.ui.bindHeaderCell(columnKey)`
- Cell: `grid.ui.bindDataCell({ row, rowIndex, columnKey, value })`
- Editor: `grid.ui.bindInlineEditor({ rowKey, columnKey })`
- Context menu: `grid.ui.bindContextMenuRoot()` и `grid.ui.bindContextMenuAction(id)`
- Toolbar action: `grid.bindings.actionButton(id)`

## 3) Минимальный шаблон (Vue)

```vue
<table>
  <thead>
    <tr>
      <th v-for="col in columns" :key="col.key" v-bind="grid.ui.bindHeaderCell(col.key)">
        {{ col.label ?? col.key }}
      </th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(row, rowIndex) in grid.rows.value" :key="row.rowId">
      <td
        v-for="col in columns"
        :key="col.key"
        v-bind="grid.ui.bindDataCell({ row, rowIndex, columnKey: col.key, value: row[col.key] })"
      >
        {{ row[col.key] }}
      </td>
    </tr>
  </tbody>
</table>
```

## 4) A11y минимум

- Grid‑роль на контейнере
- Roving‑tabindex
- aria‑col/row для ячеек

