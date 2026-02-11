---
title: Deterministic integration
---

# Deterministic integration

This section defines the stable integration path for pinned/overlay/viewport state.

## 1) Core snapshot (source of truth)

```ts
import { createDataGridViewportController } from "@affino/datagrid-core/advanced"

const viewport = createDataGridViewportController({ resolvePinMode })
viewport.attach(containerEl, headerEl)
viewport.setViewportMetrics({
  containerWidth: 1280,
  containerHeight: 720,
  headerHeight: 52,
})
viewport.refresh(true)

const state = viewport.getIntegrationSnapshot()
```

Read geometry only from `state`:
- `visibleRowRange`
- `visibleColumnRange`
- `pinnedWidth`
- `overlaySync`

## 2) Overlay transform

```ts
import { buildDataGridOverlayTransformFromSnapshot } from "@affino/datagrid-vue"

const transform = buildDataGridOverlayTransformFromSnapshot({
  viewportWidth: state.viewportWidth,
  viewportHeight: state.viewportHeight,
  scrollLeft: state.scrollLeft,
  scrollTop: state.scrollTop,
  pinnedOffsetLeft: state.overlaySync.pinnedOffsetLeft,
  pinnedOffsetRight: state.overlaySync.pinnedOffsetRight,
})
```

## 3) Invariants

- Do not read private DOM transforms.
- Do not compute pinned offsets manually if they are in the snapshot.
- A repeated refresh without delta must not change output.

