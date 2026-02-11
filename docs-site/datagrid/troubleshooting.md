---
title: Troubleshooting / FAQ
---

# Troubleshooting / FAQ

## 1) No selection or focus

- Check stable `rowId`/`id`/`key`.
- Ensure `grid.ui.bindDataCell` bindings are used.

## 2) UI does not update after data change

- Call `api.refreshRows("manual")`.
- Do not mutate `rows` in place without changing the reference.

## 3) Sort/filter “does not work”

- Ensure `column.key` has not changed.
- Ensure model state is not reset.

## 4) Focus lost on scroll

- Use roving tabindex.
- Ensure the active cell reapplies focus after virtual scroll.

## 5) Unexpected cell values

- Check commit/edit handlers.
- Ensure `draft` is cast correctly (string→number/boolean).

Next: [/datagrid](/datagrid/)
