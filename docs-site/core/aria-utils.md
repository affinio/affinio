---
title: aria-utils
description: Core reference for @affino/aria-utils.
---

# @affino/aria-utils

> Stability: **Stable**

Opinionated helpers for wiring ARIA attributes on dialog-like surfaces.

## Overview

Use these helpers to keep ARIA wiring deterministic in custom dialog/surface implementations.

## Installation

```bash
npm install @affino/aria-utils
```

## Quick start

```ts
import { ensureDialogAria } from "@affino/aria-utils"

ensureDialogAria({
  surface: dialogEl,
  labelId: "settings-title",
  fallbackLabel: "Settings dialog",
  warn: true,
})
```

## What it does

- Ensures `role="dialog"` and `aria-modal="true"`.
- Applies `aria-labelledby` (or `aria-label` fallback).
- Discovers descriptions via `[data-dialog-description]` or `.dialog-description` and wires `aria-describedby`.
- Emits a warning in development when no description is found.

## API

- `ensureDialogAria(options)`
  - `surface` (required) - dialog root element.
  - `labelId` / `fallbackLabel` - for `aria-labelledby` or `aria-label`.
  - `warn` - toggles dev warnings.
  - `descriptionSelectors`, `descriptionIdPrefix`, `console` - customization points.

- `discoverDescription(surface, options)`
  - Finds the first description node using selectors.

## Related packages

- `@affino/dialog-core`
- `@affino/dialog-laravel`
- `@affino/focus-utils`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
