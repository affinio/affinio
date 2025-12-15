<script setup lang="ts">
import { computed } from "vue"
import { RouterLink } from "vue-router"
import { storeToRefs } from "pinia"
import ThemeToggle from "@/components/ThemeToggle.vue"
import FrameworkToggle from "@/components/FrameworkToggle.vue"
import { useFrameworkStore } from "@/stores/framework"

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const activeLabel = computed(() => (current.value === "vue" ? "@affino/menu-vue" : "@affino/menu-react"))
</script>

<template>
  <header class="sticky top-4 z-40 px-4 lg:px-8 mb-10">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 text-(--text-primary) sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1">
        <RouterLink to="/" class="hover:opacity-90">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-semibold">{{ activeLabel }}</h1>
            <span class="header-pill">Alpha build</span>
          </div>
        </RouterLink>
      </div>
      <div class="flex gap-3 items-center">
        <FrameworkToggle />
        <ThemeToggle variant="compact" />
        <RouterLink to="/menu/simple" class="header-cta">Demos</RouterLink>
      </div>
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
</style>
