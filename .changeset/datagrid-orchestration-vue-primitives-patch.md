---
"@affino/datagrid-orchestration": patch
"@affino/datagrid-vue": patch
---

## Summary

Added reusable DataGrid orchestration primitives for linked-pane scroll sync, resize click guard, initial viewport recovery, and row-selection model (anchor/shift/reconcile).

## User impact

Consumers get a patch update with new advanced APIs for moving complex grid interaction behavior from component-local code into package-level composables.

## Migration

- No migration required.
- Optional adoption: replace local component logic with new APIs:
  - `useDataGridLinkedPaneScrollSync`
  - `useDataGridResizeClickGuard`
  - `useDataGridInitialViewportRecovery`
  - `useDataGridRowSelectionModel`

## Validation

- `pnpm --filter @affino/datagrid-orchestration type-check:public`
- `pnpm --filter @affino/datagrid-vue type-check:public`
