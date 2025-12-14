---
title: Styling & Animation
description: Theme Menu Vue with CSS variables or utility classes.
---

# Styling & Animation

Menu Vue ships zero CSS. Style it using whatever system you already have.

## Data attributes to target

- `data-state="open" | "closed"` on panels and triggers.
- `data-motion="from-top" | "from-bottom" | "from-left" | "from-right"` on panels.
- `data-side` mirrors the resolved placement.
- `data-state="highlighted"` and `aria-disabled="true"` on items.

Example hooks:

```css
.MenuItem[data-state="highlighted"] {
  background: color-mix(in srgb, var(--accent) 40%, transparent);
}

[data-motion="from-bottom"][data-state="closed"] {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
  pointer-events: none;
}
```

## Simple animation

```css
[data-motion="from-bottom"] {
  transition: opacity 140ms ease, transform 140ms cubic-bezier(.2,.8,.4,1);
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

Pair these hooks with Tailwind variants (`data-[state=open]:animate-in`), Motion One, or any animation library.

For advanced theming ideas, check the [demo stylesheets](https://github.com/affinio/affinio/blob/main/demo-vue/src/assets/main.css).
