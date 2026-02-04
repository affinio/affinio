---
title: tooltip-core
description: Deterministic tooltip controller with arrow and live-region helpers.
---

# @affino/tooltip-core

Headless tooltip controller built on `@affino/surface-core`. It orchestrates hover/focus timers, ARIA wiring, geometry, and arrow math without dictating markup or styling.

## Installation

```bash
npm install @affino/tooltip-core
```

## Quick start

```ts
import { TooltipCore } from "@affino/tooltip-core"

const tooltip = new TooltipCore({ id: "sla-tooltip", openDelay: 100 })

const triggerProps = tooltip.getTriggerProps()
const tooltipProps = tooltip.getTooltipProps()
```

Spread the props across any DOM nodes. The controller keeps `aria-describedby`, pointer/focus handlers, and `data-state` attributes in sync with the internal state machine.

## Core API

Constructor options:

- `id` (string) - stable surface id.
- `openDelay` / `closeDelay` (number) - shared surface timers.
- `defaultOpen` (boolean) - start in the open state for SSR previews.
- `overlayKind`, `overlayManager`, `getOverlayManager`, `overlayEntryTraits` - optional integration with `@affino/overlay-kernel`.

Instance methods:

- `open(reason?)`, `close(reason?)`, `toggle()`
- `subscribe(listener)`
- `getTriggerProps(options?)`
- `getTooltipProps()`
- `getArrowProps(params)`
- `getDescriptionProps(options?)`
- `computePosition(anchorRect, tooltipRect, options?)`

## Arrow helper

```ts
const arrowProps = tooltip.getArrowProps({
  anchorRect,
  tooltipRect,
  position,
  options: { size: 12, inset: 8 },
})
```

The helper returns `data-placement`, `data-align`, and inline styles so your arrow element stays declarative.

## Live announcement helper

```ts
const descriptionProps = tooltip.getDescriptionProps({
  id: "field-tooltip-description",
  politeness: "assertive",
})
```

The description helper sets `role`, `aria-live`, and `aria-atomic`, and mirrors `data-state` / `aria-hidden` to help with accessibility-friendly tooltips.

## Related packages

- `@affino/tooltip-vue` - Vue 3 adapter with floating helpers
- `@affino/overlay-kernel` - global overlay stacking for tooltips

## License

MIT
