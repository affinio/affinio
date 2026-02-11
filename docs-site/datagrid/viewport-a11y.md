---
title: Viewport and accessibility
---

# Viewport and accessibility

The viewport layer handles virtualization, visible row calculation, and DOM focus coordination.

## 1) Core concepts

- **Viewport** — visible area rectangle.
- **Row projection** — visible row range for render.
- **Column projection** — visible column set.

## 2) Invalidation and refresh

Core provides explicit sync points:

```ts
api.refreshRows("manual")
api.refreshColumns("manual")
```

Use them when:
- row heights change,
- columns are rebuilt,
- container size changes.

## 3) A11y contract

Recommended minimum in the adapter:
- a single active focus (roving tabindex),
- aria role for the grid container,
- aria‑col/row for cells,
- focus handling on scroll/selection.

## 4) Common mistakes

- Rendering extra rows without projection sync.
- Interrupted measurements during frequent resize.
- Focus loss on selection updates.

