---
title: Tree data and grouped rows
---

# Tree data and grouped rows

This page describes tree-like rendering in DataGrid and where `treeview-core` fits.

## 1) Two related concepts

1. **DataGrid tree/group rows**: grouped row projection (`row.kind === "group"`) inside DataGrid.
2. **`@affino/treeview-core`**: standalone headless tree engine for generic tree UIs.

If you need grouped tree rows inside DataGrid, use DataGrid grouping/tree features.
If you need a standalone tree widget, use `treeview-core`.

## 2) DataGrid tree contract

When grouped/tree rows are enabled, UI must respect:

- `row.kind` (`"group"` vs `"leaf"`)
- `row.groupMeta.level` for indentation
- `row.state.expanded` for toggle state

Toggle with stable API:

```ts
api.rows.toggleGroup(groupKey)
api.rows.expandAllGroups()
api.rows.collapseAllGroups()
```

## 3) Vue sugar usage

In `useAffinoDataGrid`, enable tree grouping via `features.tree`:

```ts
const grid = useAffinoDataGrid({
  rows,
  columns,
  features: {
    tree: {
      enabled: true,
      initialGroupBy: {
        fields: ["owner"],
        expandedByDefault: true,
      },
    },
  },
})
```

Runtime control:

```ts
grid.features.tree.toggleGroup(groupKey)
```

## 4) Server and worker compatibility

Tree/group projection works with normal row-model lifecycle and diagnostics.
For high pressure scenarios:

- use `worker-owned` to reduce main-thread dispatch pressure
- use server-side/data-source models when backend should own data shaping

## 5) Related docs

- Vue Sugar Playbook (Tree contract): [/datagrid/vue-sugar-playbook](/datagrid/vue-sugar-playbook)
- GroupBy projection: [/datagrid/groupby-projection](/datagrid/groupby-projection)
- Runtime modes: [/datagrid/runtime-modes](/datagrid/runtime-modes)
- `treeview-core` package: [/core/treeview-core](/core/treeview-core)
