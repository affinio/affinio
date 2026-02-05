---
title: tabs-core
description: Core reference for @affino/tabs-core.
---

# @affino/tabs-core

> Stability: **Stable**

Headless tabs primitive built as single-value selection.

## Overview

Use `tabs-core` when one active value should drive which panel is visible, with portable state across frameworks.

## Installation

```bash
npm install @affino/tabs-core
```

## State

```ts
type TabsState<Value = string> = {
  value: Value | null
}
```

## Quick start

```ts
import { TabsCore } from "@affino/tabs-core"

const tabs = new TabsCore<string>("overview")

tabs.select("settings")
tabs.clear()
const snapshot = tabs.getSnapshot()
```

## Core API

Main methods:

- `select(value)`
- `clear()`
- `getSnapshot()`
- `subscribe(listener)`
- `destroy()`

## Related packages

- `@affino/tabs-vue`
- `@affino/tabs-laravel`
- `@affino/laravel-adapter`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
