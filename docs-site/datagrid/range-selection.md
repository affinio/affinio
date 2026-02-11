---
title: Range selection engine
---

# Range selection engine

The range engine handles anchor/focus/range and hot paths for bulk operations.

## 1) Core concepts

- **Anchor** — starting cell.
- **Focus** — current active cell.
- **Range** — rectangle between anchor and focus.

## 2) Basic operations

```ts
// pseudo‑operations at orchestration level
orchestration.selection.setAnchor({ rowIndex: 0, colKey: "service" })
orchestration.selection.setFocus({ rowIndex: 5, colKey: "owner" })
const range = orchestration.selection.getRange()
```

## 3) What the UI adapter must do

- Ensure a single active focus.
- Support shift‑selection to build a range.
- Preserve anchor/focus on scroll.

## 4) Diagnostics

- Validate `rowIndex`/`colKey` against the current model.
- Use runtime events to inspect transitions.

Next: [/datagrid/fill-handle](/datagrid/fill-handle)
