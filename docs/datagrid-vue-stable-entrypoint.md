# DataGrid Vue Stable Entrypoint (Common Usage)

Updated: `2026-02-08`

This document defines the minimal stable entrypoint for common `@affino/datagrid-vue` integrations.

## Stable Entrypoints

- Primary: `@affino/datagrid-vue`
- Explicit alias: `@affino/datagrid-vue/stable`

Both entrypoints are contract-equivalent and export the same stable symbols.
Legacy helper names `buildSelectionOverlayTransform*` are no longer exported from root/stable surface.

## Stable Surface (Minimal)

- `useDataGridSettingsStore`
- `createDataGridSettingsAdapter`
- `createDataGridVueRuntime`
- `useDataGridRuntime`
- `buildDataGridOverlayTransform`
- `buildDataGridOverlayTransformFromSnapshot`
- `mapDataGridA11yGridAttributes`
- `mapDataGridA11yCellAttributes`

No advanced/internal hooks are part of this surface.

Advanced hooks are available only via:
- `@affino/datagrid-vue/advanced`

## Common Usage Example

```ts
import {
  createDataGridVueRuntime,
  useDataGridRuntime,
  useDataGridSettingsStore,
  createDataGridSettingsAdapter,
  buildDataGridOverlayTransformFromSnapshot,
} from "@affino/datagrid-vue"
```

## Contract Guard

- Root and stable entrypoint parity is validated by:
  - `/Users/anton/Projects/affinio/packages/datagrid-vue/src/__tests__/publicApi.contract.spec.ts`

## Legacy Mapping

- `useTableSettingsStore` -> `useDataGridSettingsStore`
- `createPiniaTableSettingsAdapter` -> `createDataGridSettingsAdapter`
- `buildSelectionOverlayTransform` -> `buildDataGridOverlayTransform`
- `buildSelectionOverlayTransformFromSnapshot` -> `buildDataGridOverlayTransformFromSnapshot`
