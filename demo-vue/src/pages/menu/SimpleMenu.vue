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
} from '@affino/menu-vue'
import ReactMount from '@/components/ReactMount.vue'
import { useFrameworkStore } from '@/stores/framework'
import SimpleMenuDemo from '@/react-demos/SimpleMenuDemo'

const primaryActions = [
  { label: 'Edit headline', description: 'Tweak copy and CTA pairs', shortcut: 'E' },
  { label: 'Duplicate', description: 'Clone layout and preserve bindings', shortcut: 'D' },
  { label: 'Share preview', description: 'Generate signed review links', shortcut: 'S' },
]

const secondaryActions = [
  { label: 'Archive', description: 'Freeze analytics without deleting', shortcut: 'A' },
  { label: 'Delete', description: 'Remove project forever', shortcut: 'Cmd+Del', danger: true },
]

const lastAction = ref<string>('None yet')

function handleSelect(label: string) {
  lastAction.value = label
}

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const usingVue = computed(() => current.value === 'vue')
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Primary flows</p>
      <h3 class="text-2xl font-semibold">Single trigger, instant confirmation.</h3>
      <p class="text-sm text-(--text-muted)">
        Showcase the classic click-to-open surface. `UiMenu` keeps focus inside the panel and streams select events so
        dashboards can react the moment an action fires.
      </p>
    </div>
    <template v-if="usingVue">
      <div class="menu-demo-surface flex flex-col items-center justify-center gap-6 text-center">
        <UiMenu>
          <UiMenuTrigger as-child>
            <button class="menu-demo-button">
              <span>Menu</span>
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="menu-playground-panel">
            <UiMenuLabel>Project</UiMenuLabel>
            <UiMenuSeparator />
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
        <div class="demo-last-action">
          <span class="demo-last-action__label">Last action</span>
          <span class="demo-last-action__value">{{ lastAction }}</span>
        </div>
      </div>
    </template>
    <ReactMount v-else :component="SimpleMenuDemo" :key="current" />
  </div>
</template>
