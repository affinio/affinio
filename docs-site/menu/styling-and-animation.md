---
title: Styling & Animation
description: Visual styling hooks and motion patterns for Affino menus.
---

# Styling & Animation

Affino menu adapters are behavior-first and CSS-agnostic.

## Data attributes you can target

- `data-state="open|closed"` on trigger/panel
- `data-motion="from-top|from-bottom|from-left|from-right"` on panels
- `data-side` for resolved placement side
- item state attributes such as highlighted/disabled flags

## Example styling hooks

```css
.MenuItem[data-state="highlighted"] {
  background: color-mix(in srgb, var(--accent) 32%, transparent);
}

[data-motion="from-bottom"][data-state="open"] {
  opacity: 1;
  transform: translateY(0) scale(1);
}

[data-motion="from-bottom"][data-state="closed"] {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}
```

## Animation guidance

- Keep durations short: `120-180ms`.
- Prefer opacity + transform transitions.
- Avoid layout-affecting animation for nested submenu chains.

## Theming strategy

- Define menu tokens once (`--menu-bg`, `--menu-border`, `--menu-item-hover`).
- Map tokens in both Vue/React implementations.
- Reuse same token names in Laravel views to keep visual parity.

## Related

- Examples: [/menu/examples](/menu/examples)
- Core behavior: [/core/menu-core](/core/menu-core)
