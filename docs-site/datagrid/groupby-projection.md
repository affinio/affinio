---
title: GroupBy projection
---

# GroupBy projection

GroupBy is a **row‑model transformation**, not a UI feature.

## 1) Canonical pipeline

```
rows -> filter -> sort -> groupBy -> flattenTree -> virtualization
```

## 2) Row kinds

- `group` — virtual group row
- `leaf` — source row

## 3) GroupBy contract

```ts
interface DataGridGroupBySpec {
  fields: string[]
  expandedByDefault?: boolean
}
```

- `setGroupBy(spec | null)`
- `toggleGroup(groupKey)`

## 4) Selection semantics

Selection operates on the flattened stream. For adapters, use
`createGridSelectionContextFromFlattenedRows({ rows, colCount })`.

## 5) UI meta

Use `getDataGridRowRenderMeta(rowNode)` for `level/isGroup/isExpanded`.

Next: [/datagrid/row-models](/datagrid/row-models)
