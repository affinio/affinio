---
title: Tree data и grouped rows
---

# Tree data и grouped rows

Страница описывает tree-представление в DataGrid и роль `treeview-core`.

## 1) Два связанных сценария

1. **DataGrid tree/group rows**: grouped projection (`row.kind === "group"`) внутри DataGrid.
2. **`@affino/treeview-core`**: отдельный headless движок для standalone tree UI.

Если нужна tree-структура внутри DataGrid, используйте grouping/tree возможности DataGrid.
Если нужен отдельный tree-компонент, используйте `treeview-core`.

## 2) Контракт DataGrid tree

При включенных grouped/tree rows UI должен учитывать:

- `row.kind` (`"group"` или `"leaf"`)
- `row.groupMeta.level` для отступов
- `row.state.expanded` для состояния toggle

Управление через stable API:

```ts
api.rows.toggleGroup(groupKey)
api.rows.expandAllGroups()
api.rows.collapseAllGroups()
```

## 3) Использование во Vue sugar

В `useAffinoDataGrid` включите `features.tree`:

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

Управление в рантайме:

```ts
grid.features.tree.toggleGroup(groupKey)
```

## 4) Совместимость с worker/server

Tree/group projection работает в обычном row-model lifecycle.
Для тяжелых сценариев:

- используйте `worker-owned`, чтобы снизить main-thread dispatch cost
- используйте server-side/data-source модели, когда shaping должен контролировать backend

## 5) Связанные разделы

- Vue Sugar Playbook (Tree contract): [/datagrid-ru/vue-sugar-playbook](/datagrid-ru/vue-sugar-playbook)
- GroupBy projection: [/datagrid-ru/groupby-projection](/datagrid-ru/groupby-projection)
- Runtime modes: [/datagrid-ru/runtime-modes](/datagrid-ru/runtime-modes)
- Пакет `treeview-core`: [/core/treeview-core](/core/treeview-core)
