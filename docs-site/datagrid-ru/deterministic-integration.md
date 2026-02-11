---
title: Deterministic integration
---

# Deterministic integration

Этот раздел — стабильный путь интеграции pinned/overlay/viewport состояния.

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

Читайте геометрию только из `state`:
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

## 3) Инварианты

- Не читайте приватные DOM‑трансформы.
- Не вычисляйте pinned‑offset вручную, если он есть в snapshot.
- Повторный refresh без delta не должен менять output.

