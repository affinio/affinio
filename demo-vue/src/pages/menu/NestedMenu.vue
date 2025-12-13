<script setup lang="ts">
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-vue"

const stacks = [
  {
    label: "Analytics",
    code: "AN",
    note: "Funnels, retention, pulse",
    items: ["Sessions", "Funnel analysis", "Cohort compare", "Pulse alerts"],
  },
  {
    label: "Automation",
    code: "AU",
    note: "Playbooks and jobs",
    items: ["Create schedule", "Sync segments", "Trigger webhooks"],
  },
  {
    label: "Access",
    code: "AC",
    note: "Teams, roles, audit",
    items: ["Invite teammate", "Promote to admin", "Transfer ownership"],
  },
]
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Nested flow</p>
      <h3 class="text-2xl font-semibold">Deep submenus stay responsive thanks to diagonal hover prediction.</h3>
      <p class="text-sm text-(--text-muted)">
        `UiSubMenu` instances share the same tree. Hover intent prediction ensures users can travel diagonally without
        collapsing panels. Looping focus keeps keyboard users anchored.
      </p>
      <div class="rounded-2xl border border-(--glass-border) p-4 text-sm text-(--text-muted)">
        Pointer sampling offset, heading scores, and hover grace windows are configurable per menu. This demo uses
        slightly longer close delay for calmer automation browsing.
      </div>
    </div>
    <div class="rounded-3xl border border-(--glass-border) bg-white/5 p-6 text-base text-white backdrop-blur">
      <UiMenu :options="{ openDelay: 60, closeDelay: 140 }">
        <UiMenuTrigger as-child>
          <button
            class="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left font-semibold"
          >
            Choose workspace stack
            <span class="text-sm font-medium text-white/60">Arrow keys ready</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent>
          <UiMenuLabel>Stacks</UiMenuLabel>
          <UiMenuSeparator />
          <UiSubMenu v-for="stack in stacks" :key="stack.label">
            <UiSubMenuTrigger>
              <div class="flex flex-1 items-center gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  {{ stack.code }}
                </span>
                <div class="flex flex-col text-left">
                  <span class="text-sm font-semibold">{{ stack.label }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">{{ stack.note }}</span>
                </div>
              </div>
            </UiSubMenuTrigger>
            <UiSubMenuContent>
              <UiMenuItem v-for="item in stack.items" :key="item">
                <span class="text-sm font-semibold">{{ item }}</span>
                <span class="text-xs text-(--ui-menu-muted)">Enter</span>
              </UiMenuItem>
            </UiSubMenuContent>
          </UiSubMenu>
        </UiMenuContent>
      </UiMenu>
    </div>
  </div>
</template>
