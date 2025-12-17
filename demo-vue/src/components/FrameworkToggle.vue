<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useFrameworkStore, type Framework } from "@/stores/framework"

const store = useFrameworkStore()
const { current } = storeToRefs(store)

const frameworks: Array<{ label: string; value: Framework }> = [
  { label: "Vue 3", value: "vue" },
  { label: "React 18", value: "react" },
]

function selectFramework(value: Framework) {
  store.setFramework(value)
}
</script>

<template>
  <div
    class="framework-toggle"
    role="group"
    aria-label="Select framework for demos"
  >
    <button
      v-for="entry in frameworks"
      :key="entry.value"
      type="button"
      class="framework-toggle__option"
      :class="{ 'is-active': current === entry.value }"
      :aria-pressed="current === entry.value"
      @click="selectFramework(entry.value)"
    >
      <span class="framework-toggle__label">
        {{ entry.label }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.framework-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
}

.framework-toggle__option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-soft);
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.framework-toggle__option:hover {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
}

.framework-toggle__option.is-active {
  color: var(--text-primary);
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--accent) 22%, transparent),
    color-mix(in srgb, var(--accent-strong) 18%, transparent)
  );
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent),
    0 6px 18px rgba(15, 23, 42, 0.18);
}

.framework-toggle__option:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.framework-toggle__label {
  white-space: nowrap;
}

.framework-toggle__pill {
  font-size: 0.65rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
}

.framework-toggle__option.is-active .framework-toggle__pill {
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--glass-border));
}
</style>
