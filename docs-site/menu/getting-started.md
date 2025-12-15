---
title: Getting Started
description: Install Affino menus for Vue or React and render your first dropdown.
---

# Getting Started

Install whichever adapter fits your stack—both share the same controller contracts.

## Install

::: code-group
```bash [Vue]
pnpm add @affino/menu-vue
```

```bash [React]
pnpm add @affino/menu-react
```
:::

Each adapter bundles `@affino/menu-core` and ships unstyled so you can bring your own design system.

## Minimal dropdown

::: code-group
```vue [Vue]
<script setup lang="ts">
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
} from '@affino/menu-vue'

const actions = [
  { id: 'rename', label: 'Rename', shortcut: 'F2' },
  { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
]
</script>

<template>
  <UiMenu>
    <UiMenuTrigger asChild>
      <button class="MenuButton">File</button>
    </UiMenuTrigger>
    <UiMenuContent class="MenuPanel">
      <UiMenuItem
        v-for="action in actions"
        :key="action.id"
        :id="action.id"
        asChild
        @select="() => console.log(action.label)"
      >
        <button class="MenuItem">
          <span>{{ action.label }}</span>
          <kbd>{{ action.shortcut }}</kbd>
        </button>
      </UiMenuItem>
      <UiMenuSeparator class="MenuSeparator" />
      <UiMenuItem id="delete" danger asChild @select="() => console.log('Delete')">
        <button class="MenuItem danger">Delete</button>
      </UiMenuItem>
    </UiMenuContent>
  </UiMenu>
</template>
```

```tsx [React]
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
} from "@affino/menu-react"

const actions = [
  { id: "rename", label: "Rename", shortcut: "F2" },
  { id: "duplicate", label: "Duplicate", shortcut: "⌘D" },
]

export function ActionsMenu() {
  return (
    <UiMenu>
      <UiMenuTrigger asChild>
        <button className="MenuButton">File</button>
      </UiMenuTrigger>
      <UiMenuContent className="MenuPanel">
        {actions.map((action) => (
          <UiMenuItem key={action.id} id={action.id} asChild onSelect={() => console.log(action.label)}>
            <button className="MenuItem">
              <span>{action.label}</span>
              <kbd>{action.shortcut}</kbd>
            </button>
          </UiMenuItem>
        ))}
        <UiMenuSeparator className="MenuSeparator" />
        <UiMenuItem danger asChild onSelect={() => console.log("Delete")}>
          <button className="MenuItem danger">Delete</button>
        </UiMenuItem>
      </UiMenuContent>
    </UiMenu>
  )
}
```
:::

Style `.MenuButton`, `.MenuPanel`, and `.MenuItem` with any system—Affino only supplies the behavior.

## Submenus

Submenus share the same controller tree so pointer intent and focus management stay synchronized.

::: code-group
```vue [Vue]
<UiSubMenu>
  <UiSubMenuTrigger asChild>
    <button class="MenuItem">Share ></button>
  </UiSubMenuTrigger>
  <UiSubMenuContent class="MenuPanel">
    <UiMenuItem asChild @select="() => console.log('Copy link')">
      <button class="MenuItem">Copy link</button>
    </UiMenuItem>
    <UiMenuItem asChild @select="() => console.log('Email')">
      <button class="MenuItem">Send email</button>
    </UiMenuItem>
  </UiSubMenuContent>
</UiSubMenu>
```

```tsx [React]
<UiSubMenu>
  <UiSubMenuTrigger asChild>
    <button className="MenuItem">Share &gt;</button>
  </UiSubMenuTrigger>
  <UiSubMenuContent className="MenuPanel">
    <UiMenuItem asChild onSelect={() => console.log("Copy link")}>
      <button className="MenuItem">Copy link</button>
    </UiMenuItem>
    <UiMenuItem asChild onSelect={() => console.log("Email")}>
      <button className="MenuItem">Send email</button>
    </UiMenuItem>
  </UiSubMenuContent>
</UiSubMenu>
```
:::

## Context menus

Pass `trigger="contextmenu"` to listen for right-click events. Programmatic menus work the same way by calling `controller.setAnchor({ x, y, width: 0, height: 0 })` before `controller.open('pointer')`.

::: code-group
```vue [Vue]
<UiMenu>
  <UiMenuTrigger asChild trigger="contextmenu">
    <button class="MenuButton">Right click me</button>
  </UiMenuTrigger>
  <UiMenuContent class="MenuPanel">
    <UiMenuItem asChild @select="() => console.log('Refresh')">
      <button class="MenuItem">Refresh data</button>
    </UiMenuItem>
  </UiMenuContent>
</UiMenu>
```

```tsx [React]
<UiMenu>
  <UiMenuTrigger trigger="contextmenu" asChild>
    <button className="MenuButton">Right click me</button>
  </UiMenuTrigger>
  <UiMenuContent className="MenuPanel">
    <UiMenuItem asChild onSelect={() => console.log("Refresh")}>
      <button className="MenuItem">Refresh data</button>
    </UiMenuItem>
  </UiMenuContent>
</UiMenu>
```
:::

Need a deeper tour? See the [full getting-started guide](https://github.com/affinio/affinio/blob/main/docs/getting-started.md) for controller internals, SSR notes, and advanced flows.
