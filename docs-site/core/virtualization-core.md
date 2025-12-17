---
title: virtualization-core
description: High-performance virtual scrolling engine.
---

# @affino/virtualization-core

::: warning Coming Soon
This package is under active development and not yet published to npm.
:::

Framework-agnostic virtual scrolling engine for rendering large lists and grids with minimal DOM nodes.

## Planned Features

- **Window-based rendering** – Only render visible items
- **Variable item heights** – Dynamic sizing with estimation
- **Bi-directional scrolling** – Horizontal and vertical virtualization
- **Overscan control** – Pre-render buffer zones
- **Smooth scrolling** – Sub-pixel positioning
- **Sticky headers** – Fixed section headers
- **Zero layout shift** – Accurate scroll container sizing

## Architecture

```
┌────────────────────────────────────┐
│  @affino/virtualization-core       │
│  ─────────────────────────────────  │
│  • Viewport calculations           │
│  • Item range computation          │
│  • Scroll synchronization          │
│  • Size estimation                 │
│  • Zero framework dependencies     │
└────────────────────────────────────┘
```

## Framework Adapters (Planned)

- **@affino/virtualization-vue** – Vue 3 components
- **@affino/virtualization-react** – React 18 hooks

## Use Cases

- Long lists (thousands of items)
- Data tables with many rows
- Infinite scroll feeds
- Timeline views
- Chat message lists

## Status

Currently in design phase. Follow progress on [GitHub](https://github.com/affinio/affinio).

## License

MIT
