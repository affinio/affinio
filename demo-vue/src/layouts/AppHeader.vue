<script setup lang="ts">
import { RouterLink } from "vue-router"
import ThemeToggle from "@/components/ThemeToggle.vue"

const props = defineProps<{ tagline?: string }>()
</script>

<template>
  <header class="sticky top-4 z-40 px-4 lg:px-8">
    <div
      class="glass-panel mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 text-(--text-primary) sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1">
        <p class="text-[0.65rem] uppercase tracking-[0.5em] text-(--text-muted)">Affino Labs</p>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold">@affino/menu-vue</h1>
          <span class="rounded-full border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] opacity-80">
            Alpha build
          </span>
        </div>
        <p class="text-sm text-(--text-muted)]">
          {{ props.tagline || "Diagonal intent and focus-safe menu primitives, demoed live." }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <a
          class="rounded-full border border-(--glass-border)] px-4 py-2 text-sm font-medium text-(--text-primary)] transition hover:border-(--glass-highlight)]"
          href="https://github.com/affino/menu"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <RouterLink
          to="/menu/simple"
          class="rounded-full bg-(--text-primary)] px-5 py-2 text-sm font-semibold text-[#05060a] shadow-xl transition hover:opacity-90"
        >
          Launch demos
        </RouterLink>
      </div>
    </div>
  </header>
</template>
