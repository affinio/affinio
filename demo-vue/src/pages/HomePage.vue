<script setup lang="ts">
import { RouterLink } from "vue-router"

const cores = [
  {
    title: "Menu Core",
    description:
      "Headless menu engine with pointer intent prediction, keyboard maps, and deterministic controllers.",
    to: "/menu/simple",
  },
  {
    title: "Selection Core",
    description:
      "Spreadsheet-grade selection logic for grids, trees, and canvases. Keyboard, range, and multi-anchor aware.",
    to: "/selection",
  },
  {
    title: "Virtualization Core",
    description:
      "High-performance row/column virtualization for massive datasets with zero layout thrashing.",
    to: "/one-grid",
  },
]
</script>

<template>
  <section class="space-y-16">
    <!-- HERO -->
    <header class="text-center space-y-6">
      <p class="text-xs uppercase tracking-[0.45em] text-(--text-muted)">
        Affino UI Cores
      </p>

      <h1 class="text-4xl md:text-5xl font-semibold leading-tight">
        High-performance UI cores<br />
        for complex interfaces
      </h1>

      <p class="mx-auto max-w-xl text-base text-(--text-muted)">
        Affino provides framework-agnostic core engines for menus, selection systems,
        and large virtualized layouts. Bring your own DOM, styling, and framework —
        we handle intent, focus, and performance.
      </p>

      <div class="flex justify-center gap-4">
        <RouterLink
          to="/menu/simple"
          class="rounded-full px-6 py-3 text-sm font-semibold border border-(--glass-border)
                 hover:border-(--glass-highlight) transition"
        >
          View demos
        </RouterLink>

        <a
          href="https://github.com/affinio"
          target="_blank"
          class="rounded-full px-6 py-3 text-sm font-semibold text-(--text-muted)
                 hover:text-(--text-primary) transition"
        >
          GitHub
        </a>
      </div>
    </header>

    <!-- CORES -->
    <section class="menu-grid">
      <article
        v-for="core in cores"
        :key="core.title"
        class="demo-card space-y-3"
      >
        <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">
          {{ core.title }}
        </p>

        <p class="text-base text-(--text-primary)">
          {{ core.description }}
        </p>

        <RouterLink
          :to="core.to"
          class="inline-block text-sm font-semibold text-(--accent)
                 hover:underline"
        >
          Open demo →
        </RouterLink>
      </article>
    </section>
  </section>
</template>
