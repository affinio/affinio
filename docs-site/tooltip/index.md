---
title: Tooltip System
description: Headless tooltip core with Vue and Laravel adapters.
---

# Tooltip System

## When to use

Use Tooltip for lightweight hints and contextual descriptions tied to focus/hover intent.

## Packages

| Package | Role |
| --- | --- |
| `@affino/tooltip-core` | Headless tooltip controller + geometry helpers. |
| `@affino/tooltip-vue` | Vue composables (`useTooltipController`, `useFloatingTooltip`). |
| `@affino/tooltip-laravel` | Laravel hydration runtime for tooltip roots. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/tooltip-core @affino/tooltip-vue @affino/tooltip-laravel @affino/laravel-adapter
```

## Core API

```ts
import { TooltipCore } from "@affino/tooltip-core"

const tooltip = new TooltipCore({ openDelay: 80, closeDelay: 120 })
tooltip.open("programmatic")
```

See full API at [/core/tooltip-core](/core/tooltip-core).

## Vue usage

```ts
import { useTooltipController, useFloatingTooltip } from "@affino/tooltip-vue"

const controller = useTooltipController({ openDelay: 80, closeDelay: 120 })
const floating = useFloatingTooltip(controller, {
  placement: "top",
  align: "center",
  gutter: 8,
})
```

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()
```

## Manual control

Tooltip supports `affino-tooltip:manual`.

```ts
document.dispatchEvent(
  new CustomEvent("affino-tooltip:manual", {
    detail: { id: "name-tooltip", action: "open", reason: "programmatic" },
  }),
)
```

## Troubleshooting

- Tooltip never opens: check trigger mode/manual settings in dataset.
- Flicker on fast pointer moves: tune delays and pointer guard behavior.
- Wrong stacking over dialogs: ensure shared overlay manager path is active.
