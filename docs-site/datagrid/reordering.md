---
title: Column/Row reordering
---

# Column/Row reordering

Sugar doesn’t provide a dedicated wrapper yet, but basic integration is possible with a custom UI.

## 1) Columns

Recommended contract:

- Drag handle on the header.
- Reorder in `columnModel` via explicit column updates.

```ts
const next = [...columns.value]
// swap/move columns
columns.value = next
api.columns.setAll(next)
```

## 2) Rows

For row reordering:

- Move data in `rows`.
- Call `api.view.reapply()`.

```ts
const nextRows = [...rows.value]
// reorder rows
rows.value = nextRows
api.view.reapply()
```

## 3) Validation

- Validate `rowId` stability.
- Ensure selection/focus isn’t lost during reorder.
