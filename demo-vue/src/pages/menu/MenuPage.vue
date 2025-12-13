<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router"
import { computed } from "vue"

const tabs = [
  {
    name: "menu.simple",
    label: "Simple actions",
    summary: "Primary actions with shortcuts and sections.",
    to: "/menu/simple",
  },
  {
    name: "menu.nested",
    label: "Nested workflows",
    summary: "Multi-level teams and automation paths.",
    to: "/menu/nested",
  },
  {
    name: "menu.context",
    label: "Context trigger",
    summary: "Right-click canvas with smart selection.",
    to: "/menu/context",
  },
  {
    name: "menu.command",
    label: "Command center",
    summary: "Toggleable signals and pinned segments.",
    to: "/menu/command",
  },
]

const route = useRoute()
const activeName = computed(() => route.name)
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Menu Studio</p>
      <h2 class="text-3xl font-semibold">Intent aware menus, rendered four different ways.</h2>
      <p class="text-base text-(--text-muted)">
        Each demo is a standalone route powered by the same `@affino/menu-vue` primitives. Tabs keep the UX discoverable
        while showcasing diagonal hover intent, context triggers, and subtree focus safety.
      </p>
    </header>
    <nav class="flex flex-wrap gap-3">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="tab-pill"
        :class="{ 'is-active': activeName === tab.name }"
      >
        <div class="text-sm font-semibold">{{ tab.label }}</div>
        <p class="text-xs" :class="activeName === tab.name ? 'text-[#05060a]/80' : 'text-(--text-muted)'">
          {{ tab.summary }}
        </p>
      </RouterLink>
    </nav>
    <div class="menu-stage">
      <RouterView />
    </div>
  </section>
</template>
