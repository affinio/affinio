---
title: Migration guide
---

# Migration guide

Move from `.tmp/ui-table` to `@affino/datagrid-*`.

## 1) Import mapping

- `.tmp/ui-table/core/*` → `@affino/datagrid-core`
- `.tmp/ui-table/core/viewport/*` → `@affino/datagrid-core/advanced`
- `.tmp/ui-table/vue/*` → `@affino/datagrid-vue`

## 2) Renaming

- `UiTable.vue` → `DataGrid.vue`
- `UiTableViewportSimple.vue` → `DataGridViewport.vue`
- `UiTableOverlayLayer.vue` → `DataGridOverlayLayer.vue`

## 3) Pinning

- use `pin: "left" | "right" | "none"`
- do not rely on legacy pin fields

## 4) Recommended steps

1. Move imports to package root.
2. Switch components to `DataGrid*` names.
3. Integrate overlay via `getIntegrationSnapshot()`.
4. Run quality/perf gates.

## 5) Verification

- `pnpm run test:matrix:unit`
- `pnpm run test:matrix:integration`
- `pnpm run quality:gates:datagrid`

Next: [/datagrid/migration-compat](/datagrid/migration-compat)
