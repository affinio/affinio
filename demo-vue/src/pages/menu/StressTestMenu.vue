<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuSeparator,
  UiMenuLabel,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-vue"

const itemCounts = [50, 200, 500, 1000]
const selectedCount = ref<number>(200)
const dynamicItems = reactive(Array.from({ length: 20 }, (_, index) => ({ id: index + 1, label: `Dynamic ${index + 1}` })))

const enableScrollableContainer = ref(false)
const enableTransform = ref(false)
const enableRTL = ref(false)
const enableNested = ref(true)

const lastEvent = ref("Awaiting selection")

const panelStyle = computed(() => ({
  height: enableScrollableContainer.value ? "320px" : "auto",
  overflow: enableScrollableContainer.value ? "auto" : "visible",
  transform: enableTransform.value ? "scale(0.94)" : "none",
}))

const dirAttr = computed(() => (enableRTL.value ? "rtl" : "ltr"))

const stressStats = computed(() => [
  { label: "Root items", value: selectedCount.value.toString() },
  { label: "Dynamic set", value: dynamicItems.length.toString() },
  { label: "Submenus", value: enableNested.value ? "Enabled" : "Disabled" },
])

const toggles = [
  {
    key: "scroll",
    label: "Scroll container",
    description: "Wrap in a 320px viewport to test parent scrolling.",
    ref: enableScrollableContainer,
  },
  {
    key: "transform",
    label: "Parent transform",
    description: "Scale the parent to surface GPU edge cases.",
    ref: enableTransform,
  },
  {
    key: "rtl",
    label: "RTL",
    description: "Flip layout direction and pointer heuristics.",
    ref: enableRTL,
  },
  {
    key: "nested",
    label: "Nested levels",
    description: "Toggle 3-level submenu chain.",
    ref: enableNested,
  },
] as const

function onSelect(label: string | number) {
  const payload = typeof label === "number" ? `Item ${label}` : label
  lastEvent.value = payload
}

function onDanger() {
  lastEvent.value = "Danger invoked"
}

function addDynamic() {
  const nextId = dynamicItems.length + 1
  dynamicItems.push({ id: nextId, label: `Dynamic ${nextId}` })
}

function removeDynamic() {
  if (dynamicItems.length === 0) return
  dynamicItems.pop()
}
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted">Performance lab</p>
      <h3 class="text-2xl font-semibold">Stress menus with 1K items, transforms, and RTL in one place.</h3>
      <p class="text-sm text-(--text-muted">
        Use this playground to reproduce the gnarly cases product engineers send us. Crank the item count, wrap the menu
        in scrollable parents, flip direction, or disable nested chains — the controller keeps intent and focus logic in
        sync.
      </p>
      <ul class="space-y-2 text-sm text-(--text-muted">
        <li>Diagonal prediction and viewport collision continue to run at 60fps.</li>
        <li>State machine stays deterministic even with hundreds of items in the tree.</li>
        <li>Great for QA teams validating transform + scroll containers.</li>
      </ul>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div v-for="stat in stressStats" :key="stat.label" class="rounded-2xl border border-(--glass-border px-4 py-3">
          <p class="text-xs uppercase tracking-[0.3em] text-(--text-muted">{{ stat.label }}</p>
          <p class="text-lg font-semibold text-(--text-primary">{{ stat.value }}</p>
        </div>
      </div>
    </div>
    <div class="space-y-6">
      <div class="rounded-3xl border border-(--glass-border bg-black/20 p-6 backdrop-blur">
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex flex-col text-sm text-(--text-muted">
            Items count
            <select v-model="selectedCount" class="mt-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-base font-semibold text-white">
              <option v-for="count in itemCounts" :key="count" :value="count">{{ count }}</option>
            </select>
          </label>
          <div class="flex gap-2">
            <button type="button" class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50" @click="addDynamic">
              Add dynamic
            </button>
            <button type="button" class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50" @click="removeDynamic">
              Remove
            </button>
          </div>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <button
            v-for="toggle in toggles"
            :key="toggle.key"
            type="button"
            class="stress-toggle"
            :aria-pressed="toggle.ref.value"
            @click="toggle.ref.value = !toggle.ref.value"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">{{ toggle.label }}</span>
              <span
                class="toggle-indicator"
                :class="toggle.ref.value ? 'is-on' : 'is-off'"
              ></span>
            </div>
            <p class="text-xs text-(--text-muted">{{ toggle.description }}</p>
          </button>
        </div>
      </div>
      <div
        class="rounded-3xl border border-(--glass-border bg-white/5 p-6 text-white backdrop-blur"
        :dir="dirAttr"
      >
        <div class="mb-4 flex items-center justify-between text-sm text-white/70">
          <p>Stress target surface</p>
          <p>{{ enableScrollableContainer ? "Scroll parent" : "Free layout" }}</p>
        </div>
        <div class="stress-target" :style="panelStyle">
          <UiMenu>
            <UiMenuTrigger trigger="both" as-child>
              <button class="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left text-base font-semibold text-white shadow-lg transition hover:border-white/40">
                Open stress-test menu
                <span class="text-sm font-medium text-white/60">{{ enableRTL ? "RTL" : "LTR" }}</span>
              </button>
            </UiMenuTrigger>
            <UiMenuContent class="menu-playground-panel">
              <UiMenuLabel>Root items ({{ selectedCount }})</UiMenuLabel>
              <UiMenuSeparator />
              <UiMenuItem
                v-for="n in selectedCount"
                :key="`root-${n}`"
                @select="() => onSelect(n)"
              >
                Item {{ n }}
              </UiMenuItem>
              <UiMenuSeparator />
              <UiMenuLabel>Dynamic items ({{ dynamicItems.length }})</UiMenuLabel>
              <UiMenuItem
                v-for="item in dynamicItems"
                :key="item.id"
                @select="() => onSelect(item.label)"
              >
                {{ item.label }}
              </UiMenuItem>
              <UiMenuSeparator />
              <UiSubMenu v-if="enableNested">
                <UiSubMenuTrigger>Nested level 1</UiSubMenuTrigger>
                <UiSubMenuContent class="menu-playground-panel">
                  <UiMenuLabel>Level 1</UiMenuLabel>
                  <UiMenuSeparator />
                  <UiMenuItem @select="() => onSelect('L1-A')">Level 1 - A</UiMenuItem>
                  <UiSubMenu>
                    <UiSubMenuTrigger>Nested level 2</UiSubMenuTrigger>
                    <UiSubMenuContent class="menu-playground-panel">
                      <UiMenuLabel>Level 2</UiMenuLabel>
                      <UiMenuSeparator />
                      <UiMenuItem @select="() => onSelect('L2-A')">Level 2 - A</UiMenuItem>
                      <UiMenuItem @select="() => onSelect('L2-B')">Level 2 - B</UiMenuItem>
                      <UiSubMenu>
                        <UiSubMenuTrigger>Nested level 3</UiSubMenuTrigger>
                        <UiSubMenuContent class="menu-playground-panel">
                          <UiMenuLabel>Level 3</UiMenuLabel>
                          <UiMenuSeparator />
                          <UiMenuItem @select="() => onSelect('L3-A')">Level 3 - A</UiMenuItem>
                          <UiMenuItem @select="() => onSelect('L3-B')">Level 3 - B</UiMenuItem>
                          <UiMenuItem @select="() => onSelect('L3-C')">Level 3 - C</UiMenuItem>
                          <UiMenuSeparator />
                          <UiMenuItem danger @select="onDanger">Dangerous</UiMenuItem>
                        </UiSubMenuContent>
                      </UiSubMenu>
                    </UiSubMenuContent>
                  </UiSubMenu>
                </UiSubMenuContent>
              </UiSubMenu>
              <UiMenuSeparator />
              <UiMenuItem danger @select="onDanger">Delete something</UiMenuItem>
            </UiMenuContent>
          </UiMenu>
        </div>
        <p class="mt-4 text-sm text-white/80">
          Last action: <span class="font-semibold text-white">{{ lastEvent }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stress-toggle {
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  padding: 0.9rem 1.1rem;
  text-align: left;
  color: var(--text-primary, #fff);
  transition: border 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.stress-toggle:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.toggle-indicator {
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 0.15rem;
}

.toggle-indicator::after {
  content: "";
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
}

.toggle-indicator.is-on {
  background: linear-gradient(120deg, var(--accent, #8b5cf6), var(--accent-strong, #38bdf8));
  border-color: transparent;
}

.toggle-indicator.is-on::after {
  transform: translateX(0.9rem);
}

.toggle-indicator.is-off::after {
  transform: translateX(0);
}

.stress-target {
  border-radius: 2rem;
  border: 1px dashed rgba(255, 255, 255, 0.25);
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

:global(.menu-playground-panel[data-state="closed"]) {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
}

:global(.menu-playground-panel[data-state="open"]) {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.14s ease, transform 0.14s ease;
}

:global(.menu-playground-panel[data-motion="from-bottom"][data-state="closed"]) {
  opacity: 0;
  transform: translateY(6px) scale(0.95);
}

:global(.menu-playground-panel[data-motion="from-bottom"][data-state="open"]) {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.2, 0.8, 0.4, 1);
}

:global(.menu-playground-panel[data-motion="from-left"][data-state="closed"]) {
  opacity: 0;
  transform: translateX(-6px);
}

:global(.menu-playground-panel[data-motion="from-left"][data-state="open"]) {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.16s ease, transform 0.16s ease;
}
</style>
