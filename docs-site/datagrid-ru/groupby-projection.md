---
title: GroupBy projection
---

# GroupBy projection

GroupBy — это **row‑model трансформация**, а не UI‑фича.

## 1) Канонический pipeline

```
rows -> filter -> sort -> groupBy -> flattenTree -> virtualization
```

## 2) Row kinds

- `group` — виртуальная строка‑группа
- `leaf` — исходная строка

## 3) Контракт GroupBy

```ts
interface DataGridGroupBySpec {
  fields: string[]
  expandedByDefault?: boolean
}
```

- `setGroupBy(spec | null)`
- `toggleGroup(groupKey)`

## 4) Selection семантика

Selection работает по flattened‑стриму. Для адаптера используйте
`createGridSelectionContextFromFlattenedRows({ rows, colCount })`.

## 5) UI‑мета

Используйте `getDataGridRowRenderMeta(rowNode)` для `level/isGroup/isExpanded`.

