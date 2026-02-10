<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import FrameworkToggle from '@/components/FrameworkToggle.vue'
import { useFrameworkStore } from '@/stores/framework'

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)

const frameworkLabel = computed(() => (current.value === 'vue' ? 'Vue examples' : 'React examples'))

const route = useRoute()

const activeCore = computed(() => {
  if (route.path.startsWith('/menu')) return 'Menu'
  if (route.path.startsWith('/selection')) return 'Selection'
  if (route.path.startsWith('/combobox')) return 'Combobox'
  if (route.path.startsWith('/virtualization')) return 'Virtualization'
  if (route.path.startsWith('/datagrid')) return 'DataGrid'
  if (route.path.startsWith('/tooltips')) return 'Tooltips'
  if (route.path.startsWith('/dialogs')) return 'Dialog'
  if (route.path.startsWith('/popovers')) return 'Popover'
  if (route.path.startsWith('/tabs')) return 'Tabs'
  if (route.path.startsWith('/disclosure')) return 'Disclosure'
  if (route.path.startsWith('/treeview')) return 'Treeview'
  return 'Overview'
})

// Какие cores реально имеют адаптеры
const coreCapabilities: Record<string, { adapters: boolean }> = {
  menu: { adapters: true },
  dialog: { adapters: true },
  disclosure: { adapters: true },
  selection: { adapters: false },
  combobox: { adapters: true },
  tabs: { adapters: true },
  treeview: { adapters: true },
  virtualization: { adapters: false },
  datagrid: { adapters: true },
  tooltips: { adapters: true },
  popover: { adapters: true },
}

const subtitle = computed(() => {
  const key = activeCore.value.toLowerCase()
  const hasAdapters = coreCapabilities[key]?.adapters

  if (!hasAdapters) return 'Core concepts · Vue reference examples'
  return frameworkLabel.value
})
</script>

<template>
  <header class="sticky top-4 z-40 px-4 lg:px-8 mb-10">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl px-6 py-4 text-(--text-primary) backdrop-blur-xl border border-(--glass-border) bg-(--glass-bg) sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: Brand -->
      <div class="flex flex-col gap-1">
        <RouterLink to="/" class="hover:opacity-90">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold tracking-tight">Affino</h1>
            <span class="header-pill">alpha</span>
          </div>
        </RouterLink>

        <div class="text-xs text-(--text-soft)">{{ activeCore }} · {{ subtitle }}</div>
      </div>

      <!-- Center: Controls -->
      <div class="flex items-center gap-3">
        <!-- Framework toggle is meaningful only where adapters exist -->
        <FrameworkToggle v-if="activeCore === 'Menu'" />
      </div>

      <!-- Right: Core navigation -->
      <nav class="hidden md:flex items-center gap-5 text-sm font-medium">
        <RouterLink to="/menu" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/menu') }"
          >
            Menu
          </a>
        </RouterLink>

        <RouterLink to="/selection" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/selection') }"
          >
            Selection
          </a>
        </RouterLink>

        <RouterLink to="/combobox" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/combobox') }"
          >
            Combobox
          </a>
        </RouterLink>

        <RouterLink to="/dialogs" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/dialogs') }"
          >
            Dialogs
          </a>
        </RouterLink>

        <RouterLink to="/virtualization" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/virtualization') }"
          >
            Virtualization
          </a>
        </RouterLink>

        <RouterLink to="/datagrid" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path === '/datagrid' }"
          >
            DataGrid
          </a>
        </RouterLink>

        <RouterLink to="/datagrid/sugar" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/datagrid/sugar') }"
          >
            DataGrid Sugar
          </a>
        </RouterLink>

        <RouterLink to="/datagrid/must-have/pagination" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/datagrid/must-have') }"
          >
            DataGrid Must-Have
          </a>
        </RouterLink>

        <RouterLink to="/popovers" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/popovers') }"
          >
            Popovers
          </a>
        </RouterLink>

        <RouterLink to="/tooltips" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/tooltips') }"
          >
            Tooltips
          </a>
        </RouterLink>

        <RouterLink to="/treeview" v-slot="{ href }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': route.path.startsWith('/treeview') }"
          >
            Treeview
          </a>
        </RouterLink>

        <!-- GitHub -->
        <a
          href="https://github.com/affinio/affinio"
          target="_blank"
          rel="noreferrer"
          class="github-link"
          aria-label="Affino on GitHub"
        >
          <svg viewBox="0 0 24 24" class="github-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 .5C5.73.5.5 5.74.5 12.18c0 5.15 3.44 9.52 8.2 11.06.6.12.82-.27.82-.6
           0-.3-.01-1.09-.02-2.14-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8
           -1.09-.77.08-.76.08-.76 1.2.09 1.83 1.26 1.83 1.26
           1.07 1.86 2.8 1.32 3.48 1.01.11-.8.42-1.32.76-1.62
           -2.66-.31-5.47-1.36-5.47-6.06
           0-1.34.46-2.44 1.22-3.3
           -.12-.31-.53-1.56.12-3.25
           0 0 1-.33 3.3 1.26
           .96-.27 1.98-.41 3-.41
           1.02 0 2.04.14 3 .41
           2.3-1.59 3.3-1.26 3.3-1.26
           .65 1.69.24 2.94.12 3.25
           .76.86 1.22 1.96 1.22 3.3
           0 4.71-2.81 5.75-5.49 6.05
           .43.38.81 1.12.81 2.26
           0 1.63-.02 2.95-.02 3.35
           0 .33.22.72.83.6
           4.76-1.54 8.19-5.91 8.19-11.06
           C23.5 5.74 18.27.5 12 .5Z"
            />
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header-pill {
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  padding: 0.35rem 0.9rem;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.header-cta {
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  color: #05060a;
  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.header-cta:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.header-cta:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.nav-link {
  color: var(--text-soft);
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link-disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.nav-link--active {
  color: var(--text-primary);
  position: relative;
}

.nav-link--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
}

.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-soft);
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

.github-link:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.github-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 6px;
}

.github-icon {
  width: 18px;
  height: 18px;
}
</style>
