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

const lastAction = ref<string>("None yet")

function handleSelect(label: string) {
  lastAction.value = label
}
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Starter pattern</p>
      <h3 class="text-2xl font-semibold">
        Classic trigger plus content stack. Perfect for ship-ready dropdowns without design lock-in.
      </h3>
      <p class="text-sm text-(--text-muted)">
        Use `UiMenu`, `UiMenuTrigger`, and `UiMenuContent` to bind keyboard-safe actions to any element. Slots remain fully
        under your control, and events bubble up through the controller.
      </p>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-2xl border border-(--glass-border) px-4 py-3">
          <p class="text-xs uppercase tracking-[0.3em] text-(--text-muted)">Open latency</p>
          <p class="text-lg font-semibold">12 ms</p>
        </div>
        <div class="rounded-2xl border border-(--glass-border) px-4 py-3">
          <p class="text-xs uppercase tracking-[0.3em] text-(--text-muted)">Pointer grace</p>
          <p class="text-lg font-semibold">Enabled</p>
        </div>
      </div>
    </div>
    <div class="rounded-3xl border border-(--glass-border) bg-black/20 p-6 backdrop-blur">
      <UiMenu>
        <UiMenuTrigger as-child>
          <button
            class="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-base font-semibold text-white shadow-lg transition hover:border-white/30"
          >
            Project actions
            <span class="text-sm font-medium text-white/60">Press Enter</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent>
          <UiMenuLabel>Project</UiMenuLabel>
          <UiMenuItem
            v-for="action in primaryActions"
            :key="action.label"
            @select="() => handleSelect(action.label)"
          >
            <div class="flex flex-1 flex-col">
              <span class="text-sm font-semibold">{{ action.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ action.description }}</span>
            </div>
            <span class="text-xs text-(--ui-menu-muted)">{{ action.shortcut }}</span>
          </UiMenuItem>
          <UiMenuSeparator />
          <UiMenuItem
            v-for="action in secondaryActions"
            :key="action.label"
            :danger="action.danger"
            @select="() => handleSelect(action.label)"
          >
            <div class="flex flex-1 flex-col">
              <span class="text-sm font-semibold">{{ action.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ action.description }}</span>
            </div>
            <span class="text-xs text-(--ui-menu-muted)">{{ action.shortcut }}</span>
          </UiMenuItem>
        </UiMenuContent>
      </UiMenu>
      <p class="mt-6 text-sm text-white/70">
        Last action:
        <span class="font-semibold text-white">{{ lastAction }}</span>
      </p>
    </div>
  </div>
</template>
