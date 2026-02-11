---
title: Migration and compatibility
---

# Migration and compatibility

This section helps you move between versions, keep contracts stable, and avoid regressions.

## 1) Row identity contract

- Each row must have a stable `rowId` (or `id`/`key`).
- If row shape is unstable, provide `features.selection.resolveRowKey(row, index)`.

## 2) Data updates

- When replacing data, use `api.refreshRows("manual")`.
- When changing columns, use `api.refreshColumns("manual")`.

## 3) Sort/filter stability

- Keep column `key` stable between versions.
- Avoid renaming `key` without migrating state.

## 4) UI back‑compat

If you change the UI adapter:

- keep bindings `grid.ui.bindHeaderCell`, `grid.ui.bindDataCell`,
- keep a11y roles and roving tabindex,
- do not break `actionButton` and context‑menu contracts.

## 5) When things diverge

- Capture `api.getRowSnapshot()` before/after the change.
- Compare `sort/filter/group` models.
- Use runtime events for diagnostics.

Next: [/datagrid](/datagrid/)
