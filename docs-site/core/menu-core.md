---
title: menu-core
description: Framework-agnostic headless menu engine.
---

# @affino/menu-core

Framework-agnostic headless menu engine with diagonal pointer prediction, keyboard navigation, and nested submenu support.

## Installation

```bash
npm install @affino/menu-core
```

## Core Concepts

### MenuController

The imperative API for controlling menu state:

```typescript
import { MenuController } from '@affino/menu-core'

const controller = new MenuController()

// Open at coordinates
controller.open({ x: 100, y: 200 })

// Close
controller.close()

// Highlight item
controller.highlightItem('item-id')

// Navigate
controller.moveHighlight('down')
```

### State Management

Subscribe to menu state changes:

```typescript
import { createMenuStore } from '@affino/menu-core'

const store = createMenuStore()

const unsubscribe = store.subscribe((state) => {
  console.log('Menu state:', state)
  // { isOpen, highlightedId, items, ... }
})
```

### Pointer Prediction

Diagonal mouse intent detection keeps submenus open during quick pointer moves:

```typescript
import { predictMouseIntent } from '@affino/menu-core'

const intent = predictMouseIntent({
  currentPos: { x: 100, y: 100 },
  previousPos: { x: 95, y: 98 },
  submenuBounds: { left: 200, top: 80, right: 400, bottom: 200 }
})

if (intent.shouldKeepSubmenuOpen) {
  // Delay submenu close
}
```

### Positioning

Collision-safe menu positioning with viewport awareness:

```typescript
import { computeMenuPosition } from '@affino/menu-core'

const position = computeMenuPosition({
  trigger: triggerElement.getBoundingClientRect(),
  menu: { width: 320, height: 400 },
  viewport: { width: window.innerWidth, height: window.innerHeight },
  placement: 'bottom-start',
  offset: { main: 8, cross: 0 }
})

// Returns: { x, y, placement: 'top-start' } (flipped if needed)
```

## Key Features

- **Zero dependencies** – Pure TypeScript, framework-agnostic
- **State machines** – Predictable state transitions
- **Pointer heuristics** – Diagonal intent detection
- **Keyboard navigation** – Arrow keys, Home/End, Enter/Escape
- **Focus management** – Roving tabindex, loop control
- **Nested submenus** – Infinite depth support
- **Positioning engine** – Collision detection and flipping
- **Accessibility** – ARIA roles and keyboard semantics

## Framework Adapters

Use framework adapters for reactive integrations:

- **[@affino/menu-vue](/menu/)** – Vue 3 renderless components
- **[@affino/menu-react](/menu/react)** – React 18 hooks and compounds

## API Reference

See the [Advanced guide](/menu/advanced) for full API documentation.

## TypeScript

Fully typed with comprehensive type definitions:

```typescript
import type {
  MenuState,
  MenuOptions,
  MenuController,
  MenuPosition,
  PointerIntent
} from '@affino/menu-core'
```

## License

MIT
