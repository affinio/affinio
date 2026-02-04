---
title: aria-utils
description: ARIA wiring helpers for dialog surfaces.
---

# @affino/aria-utils

Opinionated helpers for wiring ARIA attributes on dialog-like surfaces.

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

## License

MIT
