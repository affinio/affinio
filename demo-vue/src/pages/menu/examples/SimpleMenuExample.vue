<script setup lang="ts">
import { ref } from "vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"

const primaryActions = [
  { label: "Edit headline", description: "Tweak copy and CTA pairs", shortcut: "E" },
  { label: "Duplicate", description: "Clone layout and preserve bindings", shortcut: "D" },
  { label: "Share preview", description: "Generate signed review links", shortcut: "S" },
]

const secondaryActions = [
  { label: "Archive", description: "Freeze analytics without deleting", shortcut: "A" },
  { label: "Delete", description: "Remove project forever", shortcut: "Cmd+Del", danger: true },
]

const lastAction = ref("None yet")

function handleSelect(label: string) {
  lastAction.value = label
}
</script>

<template>
  <div class="menu-demo-inline">
    <UiMenu>
      <UiMenuTrigger as-child>
        <button class="menu-demo-trigger">Open Vue menu</button>
      </UiMenuTrigger>

      <UiMenuContent class="menu-playground-panel">
        <UiMenuLabel>Project</UiMenuLabel>
        <UiMenuSeparator />

        <UiMenuItem
          v-for="action in primaryActions"
          :key="action.label"
          @select="() => handleSelect(action.label)"
        >
          <div class="flex flex-1 flex-col text-left">
            <span class="text-sm font-semibold">{{ action.label }}</span>
            <span class="text-xs text-(--ui-menu-muted)">
              {{ action.description }}
            </span>
          </div>
          <span class="menu-shortcut">{{ action.shortcut }}</span>
        </UiMenuItem>

        <UiMenuSeparator />

        <UiMenuItem
          v-for="action in secondaryActions"
          :key="action.label"
          :danger="action.danger"
          @select="() => handleSelect(action.label)"
        >
          <div class="flex flex-1 flex-col text-left">
            <span class="text-sm font-semibold">{{ action.label }}</span>
            <span class="text-xs text-(--ui-menu-muted)">
              {{ action.description }}
            </span>
          </div>
          <span class="menu-shortcut">{{ action.shortcut }}</span>
        </UiMenuItem>
      </UiMenuContent>
    </UiMenu>

    <dl class="demo-last-action">
      <dt class="demo-last-action__label">Last action</dt>
      <dd class="demo-last-action__value">{{ lastAction }}</dd>
    </dl>
  </div>
</template>
