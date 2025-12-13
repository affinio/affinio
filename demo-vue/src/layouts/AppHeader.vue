<script setup lang="ts">
import { RouterLink } from "vue-router"

</script>

<template>
  <header class="sticky top-4 z-40 px-4 lg:px-8 mb-10">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 text-(--text-primary) sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1">
        
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold">@affino/menu-vue</h1>
          <span class="rounded-full border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] opacity-80">
            Alpha build
          </span>
        </div>
      </div>
      <RouterLink
          to="/menu/simple"
          class="rounded-full bg-(--text-primary)] px-5 py-2 font-semibold text-[#05060a] shadow-xl transition hover:opacity-90"
        >
          Launch demos
      </RouterLink>
    </div>
  </header>
</template>
