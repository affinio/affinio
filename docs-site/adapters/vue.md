---
title: Vue Adapter
description: App-level integration runtime for Affino Vue overlays.
---

# @affino/vue-adapter

`@affino/vue-adapter` provides a single app-level bootstrap for shared Vue overlay integration.

It centralizes:

- Overlay host provisioning
- Overlay manager lifecycle
- Optional diagnostics exposure

## Installation

```bash
pnpm add @affino/vue-adapter
```

## Bootstrap API

```ts
import { bootstrapAffinoVueAdapters } from "@affino/vue-adapter"

bootstrapAffinoVueAdapters({
  diagnostics: import.meta.env.DEV,
})
```

You can also use plugin mode:

```ts
import { createAffinoVuePlugin } from "@affino/vue-adapter"

app.use(createAffinoVuePlugin({ diagnostics: import.meta.env.DEV }))
```

## Scope

`@affino/vue-adapter` is intentionally focused on overlay runtime integration.

Non-overlay primitives are consumed directly through their Vue packages:

- `@affino/tabs-vue`
- `@affino/disclosure-vue`

## Diagnostics

When enabled, runtime diagnostics are available under:

```ts
window.__affinoVueDiagnostics
```

Current snapshot fields include manager/stack/host status metadata.
