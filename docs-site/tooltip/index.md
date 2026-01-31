---
title: Tooltip Overview
description: Headless tooltip core plus Vue adapters with floating and arrow helpers.
---

# Tooltip Overview

`@affino/tooltip-core` is the deterministic controller that powers Affino tooltips. It handles timers, ARIA wiring, geometry, arrow math, and live-region helpers. `@affino/tooltip-vue` wraps the core with Vue 3 composition utilities so you can keep full control over markup and styling.

## Architecture

```
┌──────────────────────────────────┐
│      @affino/tooltip-core        │
│  ──────────────────────────────   │
│  • Hover + focus timers          │
│  • ARIA + descriptions           │
│  • Geometry + collision          │
│  • Arrow math helpers            │
│  • Zero framework deps           │
└──────────────────────────────────┘
           ▲
           │
    ┌──────┴──────┐
    │ tooltip-vue │
    │ Controller  │
    │ + floating  │
    └─────────────┘
```

## @affino/tooltip-core

Use the core directly whenever you need hover/focus coordination in any framework or vanilla JS.

```ts
import { TooltipCore } from "@affino/tooltip-core"

const tooltip = new TooltipCore({ id: "plan-tooltip", openDelay: 120 })

const triggerProps = tooltip.getTriggerProps({ tabIndex: -1 })
const tooltipProps = tooltip.getTooltipProps()
const anchorRect = trigger.getBoundingClientRect()
const tooltipRect = bubble.getBoundingClientRect()
const position = tooltip.computePosition(anchorRect, tooltipRect, { placement: "top", align: "center" })
const arrowProps = tooltip.getArrowProps({ anchorRect, tooltipRect, position })
```

The new helpers keep arrows and live regions declarative:

- `getArrowProps({ anchorRect, tooltipRect, position, options })` – Returns dataset + style map for your arrow element.
- `getDescriptionProps({ id, politeness, role })` – Produces a hidden live-region node and mirrors tooltip state via `aria-hidden`.

## @affino/tooltip-vue

Vue 3 composition API helpers that mirror the core API while handling refs, teleport hosts, and positioning updates.

```vue
<script setup lang="ts">
import { computed } from "vue"
import { useTooltipController, useFloatingTooltip } from "@affino/tooltip-vue"

const controller = useTooltipController({ id: "plan-tooltip" })
const triggerProps = computed(() => controller.getTriggerProps())
const tooltipProps = computed(() => controller.getTooltipProps())
const floating = useFloatingTooltip(controller, {
  placement: "top",
  align: "start",
  gutter: 10,
  arrow: { size: 10, inset: 8 },
})
</script>

<template>
  <button ref="floating.triggerRef" v-bind="triggerProps">Inspect plan</button>

  <Teleport :to="floating.teleportTarget">
    <div v-if="controller.state.value.open" ref="floating.tooltipRef" v-bind="tooltipProps" :style="floating.tooltipStyle">
      <span v-if="floating.arrowProps" class="TooltipArrow" v-bind="floating.arrowProps" :style="floating.arrowProps.style" />
      <p>Always-on response across 11 regions.</p>
    </div>
  </Teleport>
</template>
```

### Floating helper perks

- Keeps tooltips inside a shared overlay host by default (configurable via `teleportTo`).
- Auto updates position on scroll/resize and exposes `updatePosition()` for custom triggers.
- Returns `arrowProps` so you can bind directly in templates.

### Live regions

`controller.getDescriptionProps()` mirrors the core helper. Combine it with `controller.getTriggerProps({ describedBy })` to reference persistent SR-only text next to the trigger while the tooltip content stays portable.

## Why ship your own tooltip?

- **Exact control** over layout + motion—no component library styles to undo.
- **Consistent timers** across tooltips, menus, dialogs thanks to the shared surface kernel.
- **Production-ready a11y** with ARIA, focus, and live-region helpers already wired.
- **Teleport-friendly** design: render inside drawers, modals, or portals without jumping through hoops.

## Learn more

- [Core API reference](/core/tooltip-core)
- [Vue adapter README](https://github.com/affinio/affinio/tree/main/packages/tooltip-vue)
- [Live demos](https://affino.dev) → Tooltip page
```