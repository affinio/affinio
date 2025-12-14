---
title: Getting Started
description: Install @affino/menu-vue and render your first dropdown.
---

# Getting Started

## Install

```bash
pnpm add @affino/menu-vue
# npm install @affino/menu-vue
# yarn add @affino/menu-vue
```

Menu Vue depends on Vue 3.4+ and ships unstyled.

## Minimal dropdown

```vue
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

Style `.MenuButton`, `.MenuPanel`, and `.MenuItem` with any system you prefer—Menu Vue only handles behavior.

Need the deep-dive? See the [full getting-started guide](https://github.com/affinio/affinio/blob/main/docs/getting-started.md).
