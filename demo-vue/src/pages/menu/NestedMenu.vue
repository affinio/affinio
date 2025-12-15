<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
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
} from '@affino/menu-vue'
import ReactMount from '@/components/ReactMount.vue'
import { useFrameworkStore } from '@/stores/framework'
import NestedMenuDemo from '@/react-demos/NestedMenuDemo'

const stacks = [
  {
    label: 'Analytics',
    code: 'AN',
    note: 'Funnels, retention, pulse',
    items: ['Sessions', 'Funnel analysis', 'Cohort compare', 'Pulse alerts'],
  },
  {
    label: 'Automation',
    code: 'AU',
    note: 'Playbooks and jobs',
    items: ['Create schedule', 'Sync segments', 'Trigger webhooks'],
  },
  {
    label: 'Access',
    code: 'AC',
    note: 'Teams, roles, audit',
    items: ['Invite teammate', 'Promote to admin', 'Transfer ownership'],
  },
]

const lastSelection = ref('Waiting for highlight')

function handleSelect(label: string) {
  lastSelection.value = label
}

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const usingVue = computed(() => current.value === 'vue')
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Nested flow</p>
      <h3 class="text-2xl font-semibold">
        Deep submenus stay responsive thanks to diagonal hover prediction.
      </h3>
      <p class="text-sm text-(--text-muted)">
        `UiSubMenu` instances share the same tree. Hover intent prediction ensures users can travel
        diagonally without collapsing panels. Looping focus keeps keyboard users anchored.
      </p>
      <div class="rounded-2xl border border-(--glass-border) p-4 text-sm text-(--text-muted)">
        Pointer sampling offset, heading scores, and hover grace windows are configurable per menu.
        This demo uses slightly longer close delay for calmer automation browsing.
      </div>
    </div>
    <template v-if="usingVue">
      <div class="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
        <UiMenu :options="{ openDelay: 60, closeDelay: 140 }">
          <UiMenuTrigger as-child>
            <button class="menu-demo-button">
              <span>Menu</span>
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="menu-playground-panel">
            <UiMenuLabel>Stacks</UiMenuLabel>
            <UiMenuSeparator />
            <UiSubMenu v-for="stack in stacks" :key="stack.label">
              <UiSubMenuTrigger>
                <div class="flex flex-1 items-center gap-3 text-left">
                  <span class="stack-code-pill">{{ stack.code }}</span>
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold">{{ stack.label }}</span>
                    <span class="text-xs text-(--ui-menu-muted)">{{ stack.note }}</span>
                  </div>
                </div>
              </UiSubMenuTrigger>
              <UiSubMenuContent class="menu-playground-panel">
                <UiMenuItem
                  v-for="item in stack.items"
                  :key="item"
                  @select="() => handleSelect(item)"
                >
                  <span class="text-sm font-semibold">{{ item }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">Enter</span>
                </UiMenuItem>
              </UiSubMenuContent>
            </UiSubMenu>
          </UiMenuContent>
        </UiMenu>
        <div class="demo-last-action">
          <span class="demo-last-action__label">Last action</span>
          <span class="demo-last-action__value">{{ lastSelection }}</span>
        </div>
      </div>
    </template>
    <ReactMount v-else :component="NestedMenuDemo" :key="current" />
  </div>
</template>
