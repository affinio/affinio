<script setup lang="ts">
import { computed, ref } from "vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"

const canvasActions = [
  { label: "Create sticky", detail: "Drop a note at cursor" },
  { label: "Link block", detail: "Connect nodes with arrows" },
  { label: "Summon command palette", detail: "Open overlay", shortcut: "Ctrl+K" },
]

const destructiveActions = [
  { label: "Clear selection", detail: "Deselect everything" },
  { label: "Delete selection", detail: "Remove highlighted nodes", danger: true },
]

const logs = ref<string[]>([])

function pushLog(entry: string) {
  const stamp = new Date().toLocaleTimeString()
  logs.value = [`${entry} at ${stamp}`, ...logs.value].slice(0, 3)
}

const lastLog = computed(() => logs.value[0] ?? "Awaiting your gesture")
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Context trigger</p>
      <h3 class="text-2xl font-semibold">Right-click anywhere to invite the menu at pointer coordinates.</h3>
      <p class="text-sm text-(--text-muted)">
        Pass `trigger="contextmenu"` to `UiMenuTrigger` and the controller automatically positions content at the pointer
        origin. Keep your own DOM element (here: a diagram canvas) via `asChild`.
      </p>
      <div class="rounded-2xl border border-(--glass-border) p-4 text-sm text-(--text-muted)">
        Tip: pair with controller `openAt(point)` for fully custom gesture systems. The core stays framework-agnostic.
      </div>
    </div>
    <div class="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
      <UiMenu>
        <UiMenuTrigger as-child trigger="contextmenu">
          <button class="menu-demo-button">
            <span>Context Menu (Right-click)</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent class="menu-playground-panel">
          <UiMenuLabel>Canvas</UiMenuLabel>
          <UiMenuItem v-for="action in canvasActions" :key="action.label" @select="() => pushLog(action.label)">
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ action.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
            </div>
            <span v-if="action.shortcut" class="text-xs text-(--ui-menu-muted)">{{ action.shortcut }}</span>
          </UiMenuItem>
          <UiMenuSeparator />
          <UiMenuItem
            v-for="action in destructiveActions"
            :key="action.label"
            :danger="action.danger"
            @select="() => pushLog(action.label)"
          >
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ action.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
            </div>
          </UiMenuItem>
        </UiMenuContent>
      </UiMenu>
      <div class="demo-last-action">
        <span class="demo-last-action__label">Last action</span>
        <span class="demo-last-action__value">{{ lastLog }}</span>
      </div>
    </div>
  </div>
</template>
