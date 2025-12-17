<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { storeToRefs } from "pinia"

import ThemeToggle from "@/components/ThemeToggle.vue"
import FrameworkToggle from "@/components/FrameworkToggle.vue"
import { useFrameworkStore } from "@/stores/framework"

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)

const frameworkLabel = computed(() =>
  current.value === "vue" ? "Vue examples" : "React examples"
)

const route = useRoute()

const activeCore = computed(() => {
  if (route.path.startsWith("/menu")) return "Menu"
  if (route.path.startsWith("/selection")) return "Selection"
  if (route.path.startsWith("/virtualization")) return "Virtualization"
  return "Overview"
})

// Какие cores реально имеют адаптеры
const coreCapabilities: Record<string, { adapters: boolean }> = {
  menu: { adapters: true },
  selection: { adapters: false },
  virtualization: { adapters: false },
}

const subtitle = computed(() => {
  const key = activeCore.value.toLowerCase()
  const hasAdapters = coreCapabilities[key]?.adapters

  if (!hasAdapters) return "Core concepts · Vue reference examples"
  return frameworkLabel.value
})
</script>

<template>
  <header class="sticky top-4 z-40 px-4 lg:px-8 mb-10">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl px-6 py-4
             text-(--text-primary) backdrop-blur-xl
             border border-(--glass-border)
             bg-(--glass-bg)
             sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: Brand -->
      <div class="flex flex-col gap-1">
        <RouterLink to="/" class="hover:opacity-90">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold tracking-tight">
              Affino
            </h1>
            <span class="header-pill">alpha</span>
          </div>
        </RouterLink>

        <div class="text-xs text-(--text-soft)">
          {{ activeCore }} · {{ subtitle }}
        </div>
      </div>

      
      <!-- Center: Controls -->
      <div class="flex items-center gap-3">
        <!-- Framework toggle is meaningful only where adapters exist -->
        <FrameworkToggle v-if="activeCore === 'Menu'" />
      </div>

      <!-- Right: Core navigation -->
      <nav class="hidden md:flex items-center gap-5 text-sm font-medium">
        <RouterLink to="/menu" class="nav-link">Menu</RouterLink>
        <RouterLink to="/selection" class="nav-link">Selection</RouterLink>
        <RouterLink to="/virtualization" class="nav-link">Virtualization</RouterLink>
        <span class="nav-link-disabled">Table</span>
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
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
</style>
