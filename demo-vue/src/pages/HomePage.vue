<script setup lang="ts">
import { RouterLink } from "vue-router"

const highlights = [
  {
    title: "Headless primitives",
    detail: "Drop the returned props onto any trigger or panel and keep your exact DOM tree.",
  },
  {
    title: "Pointer intent engine",
    detail: "Grace zones and timers stop submenus from closing when the cursor zigzags.",
  },
  {
    title: "Controller automation",
    detail: "Open, close, highlight, or select from scripts, tests, and analytics hooks.",
  },
]

const docsUrl = import.meta.env.VITE_DOCS_URL ?? "/menu/"
</script>

<template>
  <section class="space-y-10">
    <div class="menu-stage">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div class="flex-1 space-y-4">
          <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Headless menu kit</p>
          <h2 class="text-4xl font-semibold leading-tight">Headless menus that feel native.</h2>
          <p class="text-base text-(--text-muted)">
            @affino/menu-vue lets Vue 3 teams keep their markup, styling, and routing while we handle intent-aware
            pointer logic, focus safety, and keyboard maps.
          </p>
          <p class="text-base text-(--text-muted)">
            Controllers expose open, close, highlight, and select so automation, analytics, and shortcuts plug in
            without wrappers.
          </p>
          <div class="flex flex-wrap gap-3">
            <RouterLink
              to="/menu/simple"
              class="rounded-full border border-(--glass-border) hover:border-(--glass-highlight) px-6 py-3 text-sm font-semibold shadow-xl transition hover:opacity-90"
            >
              Explore live demos
            </RouterLink>
            <a
              :href="docsUrl"
              target="_blank"
              rel="noreferrer"
              class="rounded-full border border-(--glass-border) px-6 py-3 text-sm font-semibold text-(--text-primary) transition hover:border-(--glass-highlight)"
            >
              Read the docs
            </a>
          </div>
        </div>
        <div class="menu-spotlight flex-1 space-y-4">
          <div class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Signals</div>
          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-2xl border border-(--glass-border) px-4 py-3">
              <div>
                <p class="text-sm font-semibold">Mouse prediction</p>
                <p class="text-xs text-(--text-muted)">Diagonal grace zones enabled</p>
              </div>
              <span class="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">Active</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-(--glass-border) px-4 py-3">
              <div>
                <p class="text-sm font-semibold">Focus safety</p>
                <p class="text-xs text-(--text-muted)">Loop + restore on close</p>
              </div>
              <span class="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200">Pinned</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-(--glass-border) px-4 py-3">
              <div>
                <p class="text-sm font-semibold">Controller API</p>
                <p class="text-xs text-(--text-muted)">open, close, highlight, select</p>
              </div>
              <span class="rounded-full bg-fuchsia-400/20 px-3 py-1 text-xs font-semibold text-fuchsia-200">Realtime</span>
            </div>
          </div>
          <p class="text-xs uppercase tracking-[0.4em] text-(--text-muted)">Telemetry updated every 16ms</p>
        </div>
      </div>
    </div>

    <div class="menu-grid">
      <article v-for="feature in highlights" :key="feature.title" class="demo-card space-y-2">
        <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">{{ feature.title }}</p>
        <p class="text-base text-(--text-primary)">{{ feature.detail }}</p>
      </article>
    </div>
  </section>
</template>
