---
title: tabs-core
description: Core reference for @affino/tabs-core.
---

# @affino/tabs-core

> Stability: **Stable**

Headless tabs primitive for single-value selection.

## Overview

Use `tabs-core` when one active value controls visible panel state.

## Installation

```bash
npm install @affino/tabs-core
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

- `new TabsCore(defaultValue?)`
- `select(value)`
- `clear()`
- `getSnapshot()`
- `subscribe(listener)`
- `destroy()`

## Guarantees

- Duplicate `select(value)` is a no-op.
- Duplicate `clear()` is a no-op.
- Subscribers run only when snapshot value changes.
- `getSnapshot()` always returns a frozen immutable snapshot.

## Adapter usage

- Keep one source of truth for tabs state.
- Use snapshot value to map active trigger/panel attributes.
- Route manual runtime control (`affino-tabs:manual`) to `select`/`clear` in adapter layers.

## Related packages

- `@affino/tabs-laravel`
- `@affino/tabs-vue`
