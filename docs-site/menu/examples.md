---
title: Examples
description: Common menu patterns built with @affino/menu-vue.
---

# Examples

## Basic dropdown

```vue
<UiMenu>
  <UiMenuTrigger asChild>
    <button class="MenuButton">Actions</button>
  </UiMenuTrigger>

  <UiMenuContent class="MenuPanel">
    <UiMenuItem id="edit" asChild @select="edit">
      <button>Edit</button>
    </UiMenuItem>
    <UiMenuItem id="archive" asChild @select="archive">
      <button>Archive</button>
    </UiMenuItem>
  </UiMenuContent>
</UiMenu>
```

## Nested submenu

```vue
<UiMenu>
  <UiMenuTrigger asChild>
    <button class="MenuButton">Share</button>
  </UiMenuTrigger>

  <UiMenuContent class="MenuPanel">
    <UiMenuItem id="link" asChild @select="copyLink">
      <button>Copy link</button>
    </UiMenuItem>

    <UiSubMenu>
      <UiSubMenuTrigger asChild>
        <button class="MenuItem with-arrow">Send to…</button>
      </UiSubMenuTrigger>

      <UiSubMenuContent class="MenuPanel">
        <UiMenuItem id="email" asChild @select="shareByEmail">
          <button>Email</button>
        </UiMenuItem>
        <UiMenuItem id="slack" asChild @select="shareToSlack">
          <button>Slack</button>
        </UiMenuItem>
      </UiSubMenuContent>
    </UiSubMenu>
  </UiMenuContent>
</UiMenu>
```

Submenus inherit pointer prediction from the root, so diagonal movement keeps them open.

## Context menu

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiMenu } from '@affino/menu-vue'

const menuRef = ref<InstanceType<typeof UiMenu> | null>(null)

const showContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  const controller = menuRef.value?.controller
  if (!controller) return
  controller.setAnchor({ x: event.clientX, y: event.clientY, width: 0, height: 0 })
  controller.open('pointer')
}

const hideContextMenu = () => {
  const controller = menuRef.value?.controller
  controller?.close('pointer')
  controller?.setAnchor(null)
}
</script>

<template>
  <div class="Canvas" @contextmenu="showContextMenu" @pointerdown="hideContextMenu">
    <UiMenu ref="menuRef">
      <UiMenuContent class="MenuPanel">
        <UiMenuItem id="refresh" asChild @select="refresh">
          <button>Refresh data</button>
        </UiMenuItem>
        <UiMenuItem id="inspect" asChild @select="inspect">
          <button>Inspect node</button>
        </UiMenuItem>
      </UiMenuContent>
    </UiMenu>
  </div>
</template>
```

Need more patterns? Browse the [demo source](https://github.com/affinio/affinio/tree/main/demo-vue/src/pages/menu).
