# DataGrid Vue Adapter Integration Guide

Baseline date: `2026-02-07`
Package: `@affino/datagrid-vue`

## Current Stable Contract

As of this baseline, the stable public adapter API is settings persistence:

- `createPiniaTableSettingsAdapter`
- `useTableSettingsStore`

Source: `/Users/anton/Projects/affinio/packages/datagrid-vue/src/public.ts`

## Quick Start (Settings Adapter)

```ts
import { createPiniaTableSettingsAdapter, useTableSettingsStore } from "@affino/datagrid-vue"

const store = useTableSettingsStore()
const settingsAdapter = createPiniaTableSettingsAdapter(store)

// pass settingsAdapter into your grid config where UiTableSettingsAdapter is expected
```

Adapter interface is defined in:
`/Users/anton/Projects/affinio/packages/datagrid-core/src/tableSettingsAdapter.ts`

## What the Adapter Persists

- Column widths
- Sorting state
- Filter snapshot
- Pin state
- Group state

Store implementation:
`/Users/anton/Projects/affinio/packages/datagrid-vue/src/tableSettingsStore.ts`

## Integration Rules

- Use package-root imports for stable integration.
- Treat `src/*` imports as internal unless explicitly versioned later.
- Keep pin input canonical (`pin`) by the time data reaches runtime.
- Keep adapter lifecycle explicit for controller bridges: `init`, `sync`, `teardown`, `diagnostics`.

Lifecycle modules:
- `/Users/anton/Projects/affinio/packages/datagrid-vue/src/adapters/adapterLifecycle.ts`
- `/Users/anton/Projects/affinio/packages/datagrid-vue/src/adapters/selectionHeadlessAdapter.ts`
- `/Users/anton/Projects/affinio/packages/datagrid-vue/src/adapters/selectionControllerAdapter.ts`

## SSR and Storage Notes

- Store uses `localStorage` in browser.
- During SSR/non-browser contexts, it falls back to in-memory storage shim.

## Integration Test Coverage to Keep Green

- Adapter contract: mount/unmount/remount/hydration
  - `/Users/anton/Projects/affinio/packages/datagrid-vue/src/adapters/__tests__/selectionControllerAdapter.contract.spec.ts`
- Pin normalization contract
  - `/Users/anton/Projects/affinio/packages/datagrid-vue/src/adapters/__tests__/columnPinNormalization.spec.ts`

## Troubleshooting Link

For overlay/pinned/virtualization incidents see:
`/Users/anton/Projects/affinio/docs/datagrid-troubleshooting-runbook.md`
