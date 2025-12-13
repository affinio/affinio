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
    <div class="flex flex-col gap-6">
      <UiMenu>
        <UiMenuTrigger as-child trigger="contextmenu">
          <div class="relative min-h-65 rounded-3xl border border-dashed border-white/20 bg-linear-to-br from-white/10 to-white/5 p-6 text-sm text-white">
            <div class="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p class="text-base font-semibold">Collaboration canvas</p>
              <p class="text-xs text-white/70">Right-click anywhere inside this zone</p>
              <div class="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
                <div class="rounded-2xl border border-white/10 px-3 py-2 text-left">
                  <p class="text-xs uppercase tracking-[0.3em] text-white/60">Nodes</p>
                  <p class="text-lg font-semibold">18</p>
                </div>
                <div class="rounded-2xl border border-white/10 px-3 py-2 text-left">
                  <p class="text-xs uppercase tracking-[0.3em] text-white/60">Links</p>
                  <p class="text-lg font-semibold">42</p>
                </div>
              </div>
            </div>
          </div>
        </UiMenuTrigger>
        <UiMenuContent>
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
      <div class="rounded-3xl border border-(--glass-border) bg-black/30 p-5 text-sm text-white/80">
        <p class="text-xs uppercase tracking-[0.3em] text-white/50">Recent actions</p>
        <ul class="mt-3 space-y-2">
          <li v-for="log in logs" :key="log" class="rounded-xl border border-white/10 px-3 py-2">{{ log }}</li>
          <li v-if="!logs.length" class="rounded-xl border border-dashed border-white/20 px-3 py-2">
            Awaiting your right-click.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
