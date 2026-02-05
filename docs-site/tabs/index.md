---
title: Tabs System
description: Single-selection tabs primitive with Vue and Laravel adapters.
---

# Tabs System

## When to use

Use Tabs for one-of-many panel selection where active state is a value, not a boolean.

## Packages

| Package | Role |
| --- | --- |
| `@affino/tabs-core` | Headless tabs selection controller (`value` state). |
| `@affino/tabs-vue` | Vue composable wrapper (`useTabsController`). |
| `@affino/tabs-laravel` | Laravel hydration contract for tabs roots/triggers/panels. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/tabs-core @affino/tabs-vue @affino/tabs-laravel @affino/laravel-adapter
```

## Core API

```ts
import { TabsCore } from "@affino/tabs-core"

const tabs = new TabsCore("overview")
tabs.select("settings")
tabs.clear()
```

See full API at [/core/tabs-core](/core/tabs-core).

## Vue usage

```ts
import { useTabsController } from "@affino/tabs-vue"

const tabs = useTabsController("overview")
```

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()
```

## Manual control

Tabs supports `affino-tabs:manual` with `select` and `clear` actions.

```ts
document.dispatchEvent(
  new CustomEvent("affino-tabs:manual", {
    detail: { id: "profile-tabs", action: "select", value: "security" },
  }),
)
```

## Troubleshooting

- Selection not updating: verify tab values match exactly.
- No-op `select`: check current value is not already selected.
- Laravel command ignored: ensure root id matches manual event `id`.
