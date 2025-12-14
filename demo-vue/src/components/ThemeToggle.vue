<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

type ThemeMode = "light" | "dark"
type ThemeVariant = "default" | "compact"

const props = defineProps<{ variant?: ThemeVariant }>()

const variant = computed<ThemeVariant>(() => props.variant ?? "default")
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
    class="theme-toggle"
    :class="{ 'theme-toggle--compact': variant === 'compact' }"
    @click="toggleTheme"
    aria-label="Toggle color theme"
    :aria-pressed="currentTheme === 'dark' ? 'true' : 'false'"
  >
    <span
      class="theme-toggle__thumb"
      :class="currentTheme === 'dark' ? 'is-dark' : 'is-light'"
      aria-hidden="true"
    ></span>
    <span class="theme-toggle__label" :class="{ 'is-active': currentTheme === 'light' }">Light</span>
    <span class="theme-toggle__label" :class="{ 'is-active': currentTheme === 'dark' }">Dark</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  width: 6.2rem;
  height: 2.5rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--surface-alt) 88%, transparent);
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  overflow: hidden;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.theme-toggle--compact {
  width: 5rem;
  height: 2.1rem;
  padding: 0 0.45rem;
  font-size: 0.58rem;
}

.theme-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 65%, transparent);
}

.theme-toggle:hover {
  border-color: var(--glass-highlight);
}

.theme-toggle__thumb {
  position: absolute;
  inset: 0.25rem;
  width: calc(50% - 0.35rem);
  border-radius: inherit;
  background: var(--text-primary);
  color: var(--page-bg);
  box-shadow: 0 12px 30px rgba(5, 6, 15, 0.35);
  transition: transform 0.3s ease;
  will-change: transform;
}

.theme-toggle--compact .theme-toggle__thumb {
  inset: 0.2rem;
  width: calc(50% - 0.25rem);
}

.theme-toggle__thumb.is-dark {
  transform: translateX(100%);
}

.theme-toggle__thumb.is-light {
  transform: translateX(0);
}

.theme-toggle__label {
  position: relative;
  z-index: 1;
  flex: 1;
  text-align: center;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.theme-toggle__label.is-active {
  color: var(--text-primary);
}

[data-theme='light'] .theme-toggle__thumb {
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
}
</style>
