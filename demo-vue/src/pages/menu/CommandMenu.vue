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

const segments = [
  { label: "VIP accounts", key: "vip", detail: "MRR > 10K", metric: "+32%" },
  { label: "Churn risk", key: "risk", detail: "Low usage", metric: "12" },
  { label: "Beta testers", key: "beta", detail: "Cohort 4", metric: "64" },
]

const automationActions = [
  { label: "Dispatch nurture flow", detail: "Send drip to selected segments" },
  { label: "Export to warehouse", detail: "Sync snapshot to Snowflake" },
]

const activeKeys = ref(new Set<string>(["vip", "beta"]))
const lastAction = ref("Awaiting input")

function toggleSegment(key: string) {
  const next = new Set(activeKeys.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  activeKeys.value = next
  const segment = segments.find((entry) => entry.key === key)
  lastAction.value = segment
    ? `Toggled ${segment.label} (${next.has(key) ? "On" : "Off"})`
    : "Selection toggled"
}

const activeList = computed(() => Array.from(activeKeys.value))

function setAutomation(label: string) {
  lastAction.value = label
}
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Command center</p>
      <h3 class="text-2xl font-semibold">Keep menus open for rapid multi-select flows.</h3>
      <p class="text-sm text-(--text-muted)">
        Set `closeOnSelect: false` so operators can toggle multiple segments without re-opening the panel. Selections are
        reflected instantly in the summary chips.
      </p>
      <div class="rounded-2xl border border-(--glass-border) p-4 text-sm text-(--text-muted)">
        Controller callbacks fire on each highlight so you can stream telemetry or update charts alongside the menu.
      </div>
    </div>
    <div class="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
      <UiMenu :options="{ closeOnSelect: false }">
        <UiMenuTrigger as-child>
          <button class="menu-demo-button">
            <span>Menu</span>
          </button>
        </UiMenuTrigger>
        <UiMenuContent class="menu-playground-panel">
          <UiMenuLabel>Segments</UiMenuLabel>
          <UiMenuItem
            v-for="segment in segments"
            :key="segment.key"
            @select="() => toggleSegment(segment.key)"
          >
            <div class="flex flex-col text-left">
              <span class="text-sm font-semibold">{{ segment.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ segment.detail }}</span>
            </div>
            <span
              class="text-xs font-semibold"
              :class="activeKeys.has(segment.key) ? 'text-emerald-400' : 'text-(--ui-menu-muted)'
              "
            >
              {{ activeKeys.has(segment.key) ? 'On' : 'Off' }} - {{ segment.metric }}
            </span>
          </UiMenuItem>
          <UiMenuSeparator />
          <UiMenuLabel>Automation</UiMenuLabel>
          <UiMenuItem v-for="action in automationActions" :key="action.label" @select="() => setAutomation(action.label)">
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ action.label }}</span>
              <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
            </div>
          </UiMenuItem>
        </UiMenuContent>
      </UiMenu>
      <div class="w-full space-y-3 text-sm text-(--text-muted)">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Active segments</p>
          <div class="mt-2 flex flex-wrap justify-center gap-2">
            <span v-for="segment in activeList" :key="segment" class="demo-chip">
              {{ segment }}
            </span>
            <span v-if="!activeList.length" class="demo-chip demo-chip--muted">
              None selected yet
            </span>
          </div>
        </div>
        <div class="demo-last-action">
          <span class="demo-last-action__label">Last action</span>
          <span class="demo-last-action__value">{{ lastAction }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
