# DataGrid Vue Adapter Integration Guide

Baseline date: `2026-02-08`
Package: `@affino/datagrid-vue`

## Current Stable Contract

As of this baseline, the stable public adapter API covers settings persistence and deterministic overlay transforms:

- `createDataGridVueRuntime`
- `useDataGridRuntime`
- `createDataGridSettingsAdapter`
- `useDataGridSettingsStore`
- `buildDataGridOverlayTransform`
- `buildDataGridOverlayTransformFromSnapshot`

Cross-platform runtime protocol (from core):

- `createDataGridAdapterRuntime`
- `resolveDataGridAdapterEventName`
- `DataGridAdapterRuntime`

Import path for protocol/runtime/viewport power-user APIs:
- `@affino/datagrid-core/advanced`

Source: `/Users/anton/Projects/affinio/packages/datagrid-vue/src/public.ts`

## Quick Start (Settings + Overlay Determinism)

```ts
import {
  createDataGridVueRuntime,
  useDataGridRuntime,
  createDataGridSettingsAdapter,
  useDataGridSettingsStore,
  buildDataGridOverlayTransformFromSnapshot,
} from "@affino/datagrid-vue"
import { createDataGridViewportController } from "@affino/datagrid-core/advanced"

const runtime = createDataGridVueRuntime({ rows, columns })
await runtime.api.start()

const { api, columnSnapshot } = useDataGridRuntime({ rows, columns })

const store = useDataGridSettingsStore()
const settingsAdapter = createDataGridSettingsAdapter(store)

// pass settingsAdapter into your grid config where DataGridSettingsAdapter is expected

const viewport = createDataGridViewportController({ resolvePinMode })
const integration = viewport.getIntegrationSnapshot()

const overlayTransform = buildDataGridOverlayTransformFromSnapshot({
  viewportWidth: integration.viewportWidth,
  viewportHeight: integration.viewportHeight,
  scrollLeft: integration.scrollLeft,
  scrollTop: integration.scrollTop,
  pinnedOffsetLeft: integration.overlaySync.pinnedOffsetLeft,
  pinnedOffsetRight: integration.overlaySync.pinnedOffsetRight,
})
```

Adapter interface is defined in:
`/Users/anton/Projects/affinio/packages/datagrid-core/src/dataGridSettingsAdapter.ts`

## What the Adapter Persists

- Column widths
- Sorting state
- Filter snapshot
- Pin state
- Group state

Store implementation:
`/Users/anton/Projects/affinio/packages/datagrid-vue/src/tableSettingsStore.ts`

## Integration Rules

- Use tiered imports:
  - stable: package-root imports
  - power-user runtime/viewport: `@affino/datagrid-core/advanced`
- Treat `src/*` imports as internal unless explicitly versioned later.
- Keep pin input canonical (`pin`) by the time data reaches runtime.
- Read runtime geometry from `viewport.getIntegrationSnapshot()` instead of direct DOM probing.
- Build overlay transforms through `buildDataGridOverlayTransform*` helpers.
- Keep adapter lifecycle explicit for controller bridges: `init`, `sync`, `teardown`, `diagnostics`.
- Expose plugin integrations through `pluginContext.getCapabilityMap()` (no direct host-expose passthrough).

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

Deterministic setup reference:
`/Users/anton/Projects/affinio/docs/datagrid-deterministic-integration-setup.md`

Cross-platform adapter protocol reference:
`/Users/anton/Projects/affinio/docs/datagrid-cross-platform-adapter-protocol.md`
