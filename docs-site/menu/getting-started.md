---
title: Getting Started
description: Install and ship your first Affino menu in Vue or React.
---

# Getting Started

## Choose adapter

- Vue 3: `@affino/menu-vue`
- React 18: `@affino/menu-react`
- Laravel runtime: `@affino/menu-laravel` via `@affino/laravel-adapter`

## Install

::: code-group
```bash [Vue]
pnpm add @affino/menu-vue
```

```bash [React]
pnpm add @affino/menu-react
```

```bash [Laravel runtime]
pnpm add @affino/menu-laravel @affino/laravel-adapter
```
:::

## First dropdown

::: code-group
```vue [Vue]
<script setup lang="ts">
import { UiMenu, UiMenuTrigger, UiMenuContent, UiMenuItem } from "@affino/menu-vue"
</script>

<template>
  <UiMenu>
    <UiMenuTrigger asChild>
      <button type="button">Actions</button>
    </UiMenuTrigger>
    <UiMenuContent>
      <UiMenuItem id="rename">Rename</UiMenuItem>
      <UiMenuItem id="duplicate">Duplicate</UiMenuItem>
    </UiMenuContent>
  </UiMenu>
</template>
```

```tsx [React]
import { UiMenu, UiMenuTrigger, UiMenuContent, UiMenuItem } from "@affino/menu-react"

export function ActionsMenu() {
  return (
    <UiMenu>
      <UiMenuTrigger asChild>
        <button type="button">Actions</button>
      </UiMenuTrigger>
      <UiMenuContent>
        <UiMenuItem id="rename">Rename</UiMenuItem>
        <UiMenuItem id="duplicate">Duplicate</UiMenuItem>
      </UiMenuContent>
    </UiMenu>
  )
}
```
:::

## Submenus and context menu

- Use `UiSubMenu` for nested actions.
- Use `trigger="contextmenu"` on trigger primitives for right-click menus.

## Next steps

- Patterns: [/menu/examples](/menu/examples)
- Styling: [/menu/styling-and-animation](/menu/styling-and-animation)
- Core internals: [/core/menu-core](/core/menu-core)
