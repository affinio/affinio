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

## Pointer + focus orchestration

- Pointer entry schedules an open after `openDelay` (default `80ms`).
- Pointer leave schedules a close after `closeDelay` (default `150ms`), but re-entry cancels the timer.
- Focus opens immediately; blur closes immediately so keyboard users never fight timers.
- Imperative controls (`open`, `close`, `toggle`) override the timers for pinned/tool-driven flows.

```ts
triggerProps.onPointerEnter?.()
triggerProps.onPointerLeave?.()
tooltip.open("programmatic")
```

## Geometry helper

Use `computePosition(anchorRect, tooltipRect, options)` for collision-aware placement. It mirrors the menu/popover positioning API, letting you keep tooltips in fixed or absolute stacks depending on layout constraints.

```ts
const anchorRect = trigger.getBoundingClientRect()
const tooltipRect = surface.getBoundingClientRect()

const position = tooltip.computePosition(anchorRect, tooltipRect, {
  placement: "top",
  align: "center",
  gutter: 12,
})

Object.assign(surface.style, {
  position: "fixed",
  transform: `translate(${position.left}px, ${position.top}px)`
})
```

## Arrow helper

`getArrowProps` turns placement math into inline styles so adapters can keep arrow elements declarative.

```ts
const arrowProps = tooltip.getArrowProps({
  anchorRect,
  tooltipRect,
  position,
  options: { size: 12, inset: 8 },
})

Object.assign(arrowElement.dataset, {
  placement: arrowProps["data-placement"],
  align: arrowProps["data-align"],
})
Object.assign(arrowElement.style, arrowProps.style)
```

- `size` – square size in pixels (`10` default).
- `inset` – minimum distance from the tooltip edge (`4` default).
- `staticOffset` – manually nudge the arrow away from panel borders or shadows.

The helper clamps offsets to keep arrows within the tooltip bounds and exposes `--tooltip-arrow-size` for CSS variables.

## Live announcement helper

Use `getDescriptionProps` when tooltips double as validation or inline hints. Combine it with `getTriggerProps({ describedBy })` so controls reference both the tooltip content and a persistent live region.

```ts
const descriptionId = "field-tooltip-description"
const triggerProps = tooltip.getTriggerProps({ describedBy: descriptionId })
const descriptionProps = tooltip.getDescriptionProps({
  id: descriptionId,
  politeness: "assertive",
})
```

The description helper:

- Defaults to `role="status"`, `aria-live="polite"`, `aria-atomic=true`.
- Mirrors tooltip state through `data-state` and `aria-hidden`.
- Lets you opt into `role="alert"` / `aria-live="assertive"` for high-priority cues.

## Feature checklist

- **Shared kernel** – Reuses `@affino/surface-core`, so timers match menus and popovers.
- **Framework-agnostic** – Pure TypeScript with zero DOM dependencies.
- **Arrow-ready** – Built-in math for CSS-driven arrow nodes.
- **Accessible by default** – ARIA wiring, keyboard semantics, optional live regions.
- **Geometry aware** – Collision-safe positioning with viewport overrides.

## Framework adapters

- **[@affino/tooltip-vue](/tooltip/)** — Vue 3 hooks plus floating helpers.
- React adapter planned; the core can be consumed directly in React via custom hooks today.

## License

MIT
```}{