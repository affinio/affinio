---
title: disclosure-core
description: Core reference for @affino/disclosure-core.
---

# @affino/disclosure-core

> Stability: **Stable**

Core primitive for disclosure/collapsible behavior with deterministic boolean state.

## Overview

Use `disclosure-core` for expandable sections where state is simply open/closed and you want a framework-agnostic controller.

## Installation

```bash
npm install @affino/disclosure-core
```

## State

```ts
type DisclosureState = {
  open: boolean
}
```

## Quick start

```ts
import { DisclosureCore } from "@affino/disclosure-core"

const disclosure = new DisclosureCore(false)

disclosure.open()
disclosure.close()
disclosure.toggle()
const snapshot = disclosure.getSnapshot()
```

## Core API

Main methods:

- `open()`
- `close()`
- `toggle()`
- `getSnapshot()`
- `subscribe(listener)`
- `destroy()`

## Related packages

- `@affino/disclosure-vue`
- `@affino/disclosure-laravel`
- `@affino/laravel-adapter`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
