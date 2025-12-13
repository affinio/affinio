<script setup lang="ts">
import { onMounted, ref } from "vue"

type ThemeMode = "light" | "dark"

const currentTheme = ref<ThemeMode>("dark")

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = mode
  if (mode === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  try {
    localStorage.setItem("affino-theme", mode)
  } catch (_) {
    // ignore storage errors in restricted environments
  }
}

function toggleTheme() {
  currentTheme.value = currentTheme.value === "dark" ? "light" : "dark"
  applyTheme(currentTheme.value)
}

onMounted(() => {
  let stored: ThemeMode | null = null
  try {
    const value = localStorage.getItem("affino-theme")
    if (value === "light" || value === "dark") {
      stored = value
    }
  } catch (_) {
    stored = null
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
  currentTheme.value = stored ?? (prefersDark ? "dark" : "light")
  applyTheme(currentTheme.value)
})
</script>

<template>
  <button
    type="button"
    class="relative flex h-10 w-24 items-center rounded-full border border-(--glass-border) bg-white/5 px-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-(--glass-highlight)] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)]"
    @click="toggleTheme"
    aria-label="Toggle theme"
  >
    <span
      class="pointer-events-none absolute inset-y-1 w-[calc(50%-0.35rem)] rounded-full bg-white text-[#05060a] shadow-lg transition duration-300"
      :class="currentTheme === 'dark' ? 'translate-x-[calc(100%+0.35rem)]' : 'translate-x-0'"
    ></span>
    <span class="flex-1 text-center" :class="currentTheme === 'light' ? 'text-[#05060a]' : 'text-white/60'">Light</span>
    <span class="flex-1 text-center" :class="currentTheme === 'dark' ? 'text-[#05060a]' : 'text-white/60'">Dark</span>
  </button>
</template>
