<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router"
import { computed } from "vue"

const tabs = [
  {
    name: "menu.simple",
    label: "Simple actions",
    to: "/menu/simple",
  },
  {
    name: "menu.nested",
    label: "Nested workflows",
    to: "/menu/nested",
  },
  {
    name: "menu.context",
    label: "Context trigger",
    to: "/menu/context",
  },
  {
    name: "menu.command",
    label: "Command center",
    to: "/menu/command",
  },
  {
    name: "menu.stress",
    label: "Overload",
    to: "/menu/stress",
  },
]

const route = useRoute()
const activeName = computed(() => route.name)
</script>

<template>
  <section class="space-y-6">
    <p class="text-xs uppercase tracking-[0.3em] text-(--text-soft)">
      Switch frameworks via the toggle in the header to compare Vue 3 and React 18 adapters.
    </p>
    <nav class="flex flex-wrap gap-3">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="tab-pill"
        :class="{ 'is-active': activeName === tab.name }"
      >
        <div class="text-sm font-semibold">{{ tab.label }}</div>
      </RouterLink>
    </nav>
    <RouterView />
  </section>
</template>
