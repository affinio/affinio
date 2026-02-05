---
title: Disclosure System
description: Boolean disclosure primitive with Vue and Laravel adapters.
---

# Disclosure System

## When to use

Use Disclosure for expandable/collapsible regions with simple open/closed state.

## Packages

| Package | Role |
| --- | --- |
| `@affino/disclosure-core` | Headless disclosure state machine (`open`). |
| `@affino/disclosure-vue` | Vue composable wrapper (`useDisclosureController`). |
| `@affino/disclosure-laravel` | Laravel hydration + manual controls for disclosure roots. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/disclosure-core @affino/disclosure-vue @affino/disclosure-laravel @affino/laravel-adapter
```

## Core API

```ts
import { DisclosureCore } from "@affino/disclosure-core"

const disclosure = new DisclosureCore(false)
disclosure.toggle()
```

See full API at [/core/disclosure-core](/core/disclosure-core).

## Vue usage

```ts
import { useDisclosureController } from "@affino/disclosure-vue"

const disclosure = useDisclosureController(false)
```

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()
```

## Manual control

Disclosure supports `affino-disclosure:manual`.

```ts
document.dispatchEvent(
  new CustomEvent("affino-disclosure:manual", {
    detail: { id: "faq-disclosure", action: "toggle" },
  }),
)
```

## Troubleshooting

- Section never opens: ensure root contains expected trigger/content dataset attributes.
- State resets after morph: use pinned/manual patterns when needed.
- Event ignored: verify `id` and action names are correct.
