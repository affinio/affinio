---
title: Affino UI Lab
description: Core primitives and production adapters for Laravel and Vue.
---

# Affino

Affino is a core-first UI system: deterministic headless primitives plus thin adapters.

## Architecture

- **Core packages**: framework-agnostic TypeScript primitives.
- **Adapters**: runtime integrations for Laravel and Vue.
- **Overlay stack**: shared coordination via `@affino/overlay-kernel`.

## What is current

### Core primitives

- Surfaces: `surface-core`, `menu-core`, `tooltip-core`, `popover-core`, `dialog-core`
- Selection/Input: `selection-core`, `listbox-core`, `combobox-core`, `grid-selection-core`
- New primitives: `tabs-core`, `disclosure-core`
- Infrastructure: `overlay-kernel`, `overlay-host`, `focus-utils`, `aria-utils`, `virtualization-core`

### Adapters

- Laravel: `@affino/laravel-adapter` (+ component-level `*-laravel` packages)
- Vue: `@affino/vue-adapter` (+ component-level `*-vue` packages)

## Recommended entry points

### Laravel

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters({ diagnostics: import.meta.env.DEV })
```

### Vue

```ts
import { bootstrapAffinoVueAdapters } from "@affino/vue-adapter"

bootstrapAffinoVueAdapters({ diagnostics: import.meta.env.DEV })
```

## Documentation map

- Core references: [/core/dialog-core](/core/dialog-core), [/core/popover-core](/core/popover-core), [/core/tooltip-core](/core/tooltip-core)
- Adapter references: [/adapters/laravel](/adapters/laravel), [/adapters/vue](/adapters/vue)
- Systems: [/menu/](/menu/), [/dialog/](/dialog/), [/popover/](/popover/), [/tooltip/](/tooltip/), [/tabs/](/tabs/), [/disclosure/](/disclosure/)
