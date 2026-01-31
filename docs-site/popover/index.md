---
title: Popover System
description: Headless popover core plus Vue adapter powered by Affino surfaces.
---

# Popover System

`@affino/popover-core` gives you the same deterministic surface semantics as menus and tooltips while staying 100% framework agnostic. Pair it with `@affino/popover-vue` when you need renderless Vue helpers that take care of ARIA wiring, outside clicks, scroll locking, and positioning.

## Packages

| Package | Description |
| --- | --- |
| **@affino/popover-core** | Headless controller with trigger/content prop helpers, escape + outside guards, and arrow positioning utilities. |
| **@affino/popover-vue** | Vue 3 composables (`usePopoverController`, `useFloatingPopover`) that wire refs to `computePosition()` and close on outside interactions. |

## Vue quick start

```vue
<script setup lang="ts">
import { usePopoverController, useFloatingPopover } from "@affino/popover-vue"

const controller = usePopoverController({ id: "filters" })
const floating = useFloatingPopover(controller, {
  placement: "bottom",
  align: "start",
  gutter: 12,
  arrow: { size: 12 },
})
</script>

<template>
  <button ref="floating.triggerRef" class="PopoverTrigger" v-bind="controller.getTriggerProps()">
    Filters
  </button>

  <Teleport :to="floating.teleportTarget">
    <div
      v-if="controller.state.value.open"
      ref="floating.contentRef"
      class="PopoverPanel"
      v-bind="controller.getContentProps({ role: 'dialog' })"
      :style="floating.contentStyle"
    >
      <span
        v-if="floating.arrowProps"
        class="PopoverArrow"
        v-bind="floating.arrowProps"
        :style="floating.arrowProps.style"
      />
      <slot />
    </div>
  </Teleport>
</template>
```

## Core behaviors

- Trigger props expose `aria-haspopup`, `aria-expanded`, and `aria-controls` so DOM remains declarative.
- Content props manage Escape handling and `aria-modal` toggles. Modal popovers can opt into scroll locking via the adapter.
- The floating helper teleports panels into an overlay host by default, updates inline geometry on resize/scroll, and restores focus to the trigger when the surface closes.
- `controller.interactOutside(event)` funnels outside pointer/focus intents through the core so analytics hooks fire before the surface closes.

Keep the panel focusable (`tabindex="-1"`) when it contains custom controls so keyboard users can land on it after the trigger opens the surface.
