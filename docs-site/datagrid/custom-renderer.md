---
title: Custom renderer (useAffinoDataGridUi)
---

# Custom renderer

Below is a minimal scaffold for a custom renderer that preserves all interaction contracts.

## 1) Setup

```ts
import { computed } from "vue"
import { useAffinoDataGridUi } from "@affino/datagrid-vue"

const grid = useAffinoDataGridUi({
  rows,
  columns: computed(() => columns.value),
  features,
})
```

## 2) Required bindings

- Header: `grid.ui.bindHeaderCell(columnKey)`
- Cell: `grid.ui.bindDataCell({ row, rowIndex, columnKey, value })`
- Editor: `grid.ui.bindInlineEditor({ rowKey, columnKey })`
- Context menu: `grid.ui.bindContextMenuRoot()` and `grid.ui.bindContextMenuAction(id)`
- Toolbar action: `grid.bindings.actionButton(id)`

## 3) Minimal template (Vue)

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

## 4) A11y minimum

- Grid role on the container
- Roving tabindex
- aria‑col/row on cells

