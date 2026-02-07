---
title: disclosure-core
description: Core reference for @affino/disclosure-core.
---

# @affino/disclosure-core

> Stability: **Stable**

Core primitive for disclosure/collapsible behavior with deterministic boolean state.

## Overview

Use `disclosure-core` for expandable sections where state is open/closed and framework adapters own rendering.

## Installation

```bash
npm install @affino/disclosure-core
```

## Quick start

```ts
import { DisclosureCore } from "@affino/disclosure-core"

const disclosure = new DisclosureCore(false)

disclosure.open()
disclosure.close()
disclosure.toggle()

const snapshot = disclosure.getSnapshot()
const isOpen = disclosure.isOpen()
```

## Core API

- `new DisclosureCore(defaultOpen?)`
- `open()`
- `close()`
- `toggle()`
- `isOpen()`
- `getSnapshot()`
- `subscribe(listener)`
- `destroy()`

## Guarantees

- Duplicate open/close calls are no-ops.
- Subscribers are notified only on state transitions.
- `getSnapshot()` returns frozen immutable values.
- Snapshot reference is stable between no-op operations.

## Adapter usage

- Keep one source of truth for disclosure state.
- Bind rendered state directly from snapshots.
- Route manual runtime actions (`affino-disclosure:manual`) to open/close/toggle in adapter layers.

## Related packages

- `@affino/disclosure-laravel`
- `@affino/disclosure-vue`
