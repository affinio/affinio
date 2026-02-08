# DataGrid GroupBy RowModel Projection

Updated: `2026-02-08`

This document defines canonical GroupBy architecture for `@affino/datagrid-core`.

## Core Principle

GroupBy is a **row-model transformation** with **tree projection**, not a UI/header-only feature.

- UI adapters only render projection output.
- Group logic stays in RowModel layer.
- DataGrid remains a grid with projected virtual rows.

## Concept

GroupBy converts a flat row set into a deterministic hierarchy:

- group rows are virtual rows
- leaf rows are data rows
- hierarchy is expandable/collapsible

## Canonical Row Kinds

```ts
type DataGridRowKind = "group" | "leaf"

interface DataGridGroupRowNode {
  kind: "group"
  rowKey: string
  groupField: string
  groupValue: string
  level: number
  expanded: boolean
  childrenCount: number
}

interface DataGridLeafRowNode<T> {
  kind: "leaf"
  rowKey: string | number
  data: T
}
```

Rule: group rows are rows (not containers).

## Pipeline Order

```
raw rows
  -> optional filter
  -> optional sort
  -> groupBy(fields[])
  -> flattenTree(expandedState)
  -> virtualization window
```

Critical ordering:

- Grouping runs before flattening.
- Virtualization runs after flattening.
- Selection/range operations run on flattened rows.

## GroupBy Spec

```ts
interface DataGridGroupBySpec {
  fields: string[]
  expandedByDefault?: boolean
}
```

RowModel baseline contract:

- `setGroupBy(spec: DataGridGroupBySpec | null): void`
- `null` means plain non-grouped grid
- input rows are never mutated, only projected

## Expansion Contract

- `toggleGroup(groupKey: string): void`
- `groupKey` must be stable
- expansion state is stored separately from source rows
- snapshot surface carries `groupExpansion` (`expandedByDefault`, `toggledGroupKeys`)

## Selection Semantics (default)

- selecting group row selects only the group row
- shift range uses flattened row order
- no implicit child selection by default
- optional policy flag may enable group-to-children behavior

Core helper for adapters:

- `createGridSelectionContextFromFlattenedRows({ rows, colCount })` in `selectionState` builds selection context directly from current flattened projection (`group` + `leaf` rows).
- This keeps row-index clamping and row-id resolution aligned with flattened projection, including collapsed groups.

## UI Adapter Contract

UI needs only render metadata:

```ts
interface DataGridRowRenderMeta {
  level: number
  isGroup: boolean
  isExpanded?: boolean
  hasChildren?: boolean
}
```

Canonical helper:

- `getDataGridRowRenderMeta(rowNode)` in `@affino/datagrid-core` derives adapter render meta from row-model output.

- indent is derived from `level`
- disclosure icon is derived from `isGroup` and `isExpanded`
- virtualization remains tree-agnostic
