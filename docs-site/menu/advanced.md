---
title: Advanced Topics
description: Internals, performance, and integration guidance for Affino menus.
---

# Advanced Topics

## Controller and tree internals

For low-level menu behavior, use `@affino/menu-core` directly:

- `MenuCore`
- `SubmenuCore`
- `createMenuTree`
- pointer intent helpers (`MousePrediction`, `predictMouseDirection`)

Reference: [/core/menu-core](/core/menu-core)

## Performance notes

- Prefer stable item registration over re-creating menu trees each render.
- Keep submenu depth shallow when possible.
- Use transform/opacity animation only for panel motion.

## Laravel integration notes

When using Laravel adapters in production, prefer one runtime bootstrap:

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"
bootstrapAffinoLaravelAdapters()
```

This keeps menu behavior aligned with dialogs/popovers/tooltips in the same app.

## Documentation links

- Menu overview: [/menu/](/menu/)
- Adapter runtime: [/adapters/laravel](/adapters/laravel)
- Overlay stack internals: [/core/overlay-kernel](/core/overlay-kernel)
