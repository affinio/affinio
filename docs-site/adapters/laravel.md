---
title: Laravel Adapter
description: Single bootstrap runtime for all Affino Laravel adapters.
---

# @affino/laravel-adapter

`@affino/laravel-adapter` is the production entry point for Affino in Laravel + Livewire apps.
It wires all Laravel adapters behind one idempotent bootstrap call.

## Covered components

- Dialog
- Tooltip
- Popover
- Menu
- Listbox
- Combobox
- Tabs
- Disclosure

## Installation

```bash
pnpm add @affino/laravel-adapter
```

## Bootstrap

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters({
  registerScrollGuards: true,
  diagnostics: import.meta.env.DEV,
})
```

`bootstrapAffinoLaravelAdapters` is the public contract. Prefer it over calling component bootstraps directly.

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `registerScrollGuards` | `true` | Closes transient overlays on scroll (`tooltip`, `popover`, `combobox`, `menu`) unless pinned/modal/manual. |
| `diagnostics` | `false` | Exposes a readonly diagnostics snapshot at `window.__affinoLaravelDiagnostics`. |

## Manual event protocol

The adapter routes custom events to component handles:

- `affino-dialog:manual`
- `affino-tooltip:manual`
- `affino-popover:manual`
- `affino-menu:manual`
- `affino-listbox:manual`
- `affino-combobox:manual`
- `affino-tabs:manual`
- `affino-disclosure:manual`

Example:

```ts
document.dispatchEvent(
  new CustomEvent("affino-dialog:manual", {
    detail: { id: "settings-dialog", action: "close", reason: "programmatic" },
  }),
)
```

For exact action payloads per component, see `packages/laravel-adapter/README.md`.
