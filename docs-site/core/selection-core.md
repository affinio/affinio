---
title: selection-core
description: Spreadsheet-grade cell selection engine.
---

# @affino/selection-core

::: warning Coming Soon
This package is under active development and not yet published to npm.
:::

Framework-agnostic selection engine for spreadsheet-grade cell selection with keyboard and mouse navigation.

## Planned Features

- **Multi-cell selection** – Drag, shift-click, keyboard ranges
- **Fill handle** – Excel-style auto-fill drag
- **Clipboard integration** – Copy/paste with formats
- **Keyboard navigation** – Arrow keys, Home/End, Ctrl/Cmd modifiers
- **Selection shapes** – Rectangular, multi-range, non-contiguous
- **Auto-scroll** – Viewport scrolling during selection
- **Frozen panes** – Fixed rows/columns
- **Cell editing** – In-place edit with navigation

## Architecture

```
┌────────────────────────────────────┐
│   @affino/selection-core           │
│  ─────────────────────────────────  │
│  • Selection state machine         │
│  • Keyboard navigation             │
│  • Mouse/touch gestures            │
│  • Fill handle logic               │
│  • Clipboard operations            │
│  • Zero framework dependencies     │
└────────────────────────────────────┘
```

## Framework Adapters (Planned)

- **@affino/selection-vue** – Vue 3 components
- **@affino/selection-react** – React 18 hooks

## Use Cases

- Spreadsheet applications
- Data grids
- Table editors
- Financial dashboards
- Analytics interfaces

## Inspiration

Modeled after Excel and Google Sheets selection behavior with full keyboard support and accessibility compliance.

## Status

Currently in design phase. Follow progress on [GitHub](https://github.com/affinio/affinio).

## License

MIT
