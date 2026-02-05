---
title: Examples
description: Production menu patterns for Vue and React adapters.
---

# Examples

## 1) Basic actions menu

Use for simple command lists tied to one trigger.

```vue
<UiMenu>
  <UiMenuTrigger asChild><button>Actions</button></UiMenuTrigger>
  <UiMenuContent>
    <UiMenuItem id="edit">Edit</UiMenuItem>
    <UiMenuItem id="archive">Archive</UiMenuItem>
  </UiMenuContent>
</UiMenu>
```

## 2) Nested submenu

Use when actions branch into secondary categories.

```vue
<UiSubMenu>
  <UiSubMenuTrigger asChild><button class="MenuItem">Share ></button></UiSubMenuTrigger>
  <UiSubMenuContent>
    <UiMenuItem id="copy-link">Copy link</UiMenuItem>
    <UiMenuItem id="email">Send email</UiMenuItem>
  </UiSubMenuContent>
</UiSubMenu>
```

## 3) Context menu (right click)

Use for canvas/table/file-tree interactions.

```vue
<UiMenu>
  <UiMenuTrigger asChild trigger="contextmenu">
    <button>Right click me</button>
  </UiMenuTrigger>
  <UiMenuContent>
    <UiMenuItem id="refresh">Refresh</UiMenuItem>
    <UiMenuItem id="inspect">Inspect</UiMenuItem>
  </UiMenuContent>
</UiMenu>
```

## 4) Manual opening (programmatic)

Use when opening menu from shortcut/palette/controller.

```ts
controller.setAnchor({ x, y, width: 0, height: 0 })
controller.open("programmatic")
```

## Notes

- Keep item ids stable for analytics/shortcuts.
- Disabled items should remain registered for consistent keyboard indexing.
- For deeper behavior rules see [/core/menu-core](/core/menu-core).
