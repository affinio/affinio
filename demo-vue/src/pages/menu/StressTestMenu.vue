<script setup lang="ts">
import { computed, reactive, ref, defineComponent, h } from "vue"
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
const dynamicItems = reactive(
  Array.from({ length: 20 }, (_, index) => ({ id: index + 1, label: `Dynamic ${index + 1}` }))
)

const enableScrollableContainer = ref(false)
const enableTransform = ref(false)
const enableRTL = ref(false)
const enableNested = ref(true)
const nestedDepthOptions = [3, 5, 10] as const
const nestedDepth = ref<(typeof nestedDepthOptions)[number]>(3)
const widthOptions = [280, 340, 420, 520] as const
const menuMaxWidth = ref<(typeof widthOptions)[number]>(340)

const lastEvent = ref("Awaiting selection")

const panelStyle = computed(() => ({
  height: enableScrollableContainer.value ? "320px" : "auto",
  overflow: enableScrollableContainer.value ? "auto" : "visible",
  transform: enableTransform.value ? "scale(0.94)" : "none",
  "--ui-menu-max-width": `${menuMaxWidth.value}px`,
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
    description: "Toggle the submenu chain on/off.",
    ref: enableNested,
  },
] as const

const NestedChain = defineComponent({
  name: "NestedChain",
  props: {
    level: { type: Number, required: true },
    maxLevel: { type: Number, required: true },
  },
  setup(props) {
    return () => {
      const children = [
        h(UiMenuLabel, null, () => `Level ${props.level}`),
        h(UiMenuSeparator),
        h(
          UiMenuItem,
          { onSelect: () => onSelect(`L${props.level}-A`) },
          { default: () => `Level ${props.level} - A` },
        ),
        h(
          UiMenuItem,
          { onSelect: () => onSelect(`L${props.level}-B`) },
          { default: () => `Level ${props.level} - B` },
        ),
      ] as Array<ReturnType<typeof h>>

      if (props.level < props.maxLevel) {
        children.push(
          h(NestedChain, {
            level: props.level + 1,
            maxLevel: props.maxLevel,
          }),
        )
      } else {
        children.push(h(UiMenuSeparator))
        children.push(
          h(
            UiMenuItem,
            { danger: true, onSelect: onDanger },
            { default: () => "Dangerous leaf" },
          ),
        )
      }

      return h(
        UiSubMenu,
        null,
        {
          default: () => [
            h(UiSubMenuTrigger, null, () => `Nested level ${props.level}`),
            h(
              UiSubMenuContent,
              { class: "menu-playground-panel", style: { "--ui-menu-max-width": `${menuMaxWidth.value}px` } },
              { default: () => children },
            ),
          ],
        },
      )
    }
  },
})

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
    <div :class="['space-y-6', enableRTL ? 'order-2 lg:order-2' : 'order-1 lg:order-1']">
      <div class="space-y-4">
        <p class="text-sm uppercase tracking-[0.4em] text-(--text-muted)">Performance lab</p>
        <h3 class="text-2xl font-semibold">Stress menus with 1K items, transforms, and RTL in one place.</h3>
        <p class="text-sm text-(--text-muted)">
          Use this playground to reproduce the gnarly cases product engineers send us. Crank the item count, wrap the
          menu in scrollable parents, flip direction, or disable nested chains — the controller keeps intent and focus
          logic in sync.
        </p>
        <ul class="space-y-2 text-sm text-(--text-muted)">
          <li>Diagonal prediction and viewport collision continue to run at 60fps.</li>
          <li>State machine stays deterministic even with hundreds of items in the tree.</li>
          <li>Great for QA teams validating transform + scroll containers.</li>
        </ul>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div
            v-for="stat in stressStats"
            :key="stat.label"
            class="rounded-2xl border border-(--glass-border) px-4 py-3"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-(--text-muted)">{{ stat.label }}</p>
            <p class="text-lg font-semibold text-(--text-primary)">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-(--glass-border) p-5 text-sm text-(--text-muted)">
        <p class="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Dataset controls</p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <label class="flex flex-col text-left">
            Items count
            <select
              v-model.number="selectedCount"
              class="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
            >
              <option v-for="count in itemCounts" :key="count" :value="count">{{ count }}</option>
            </select>
          </label>
          <label class="flex flex-col text-left">
            Nested depth
            <select
              v-model.number="nestedDepth"
              class="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
            >
              <option v-for="depth in nestedDepthOptions" :key="depth" :value="depth">{{ depth }} levels</option>
            </select>
          </label>
          <label class="flex flex-col text-left">
            Menu max width
            <select
              v-model.number="menuMaxWidth"
              class="dataset-select mt-2 rounded-2xl px-4 py-2 text-base font-semibold"
            >
              <option v-for="width in widthOptions" :key="width" :value="width">{{ width }} px</option>
            </select>
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              class="dataset-button rounded-full px-4 py-2 text-sm font-semibold"
              @click="addDynamic"
            >
              Add dynamic
            </button>
            <button
              type="button"
              class="dataset-button rounded-full px-4 py-2 text-sm font-semibold"
              @click="removeDynamic"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-(--glass-border) p-5">
        <p class="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Edge-case toggles</p>
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
              <span class="toggle-indicator" :class="toggle.ref.value ? 'is-on' : 'is-off'"></span>
            </div>
            <p class="text-xs text-(--text-muted)">{{ toggle.description }}</p>
          </button>
        </div>
      </div>
    </div>

    <div
      :class="[
        'menu-demo-surface flex flex-col items-center justify-center gap-6 text-center',
        enableRTL ? 'order-1 lg:order-1' : 'order-2 lg:order-2',
      ]"
      :dir="dirAttr"
    >
      <div class="stress-target flex w-full flex-col items-center gap-6" :style="panelStyle">
        <p class="text-sm text-(--text-soft)">
          {{ enableScrollableContainer ? "Scroll parent" : "Free layout" }} ·
          {{ enableTransform ? "Transformed" : "Normal" }} container
        </p>
        <div v-if="enableScrollableContainer" class="w-full space-y-3 text-left text-sm leading-relaxed text-(--text-muted)">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum gravida velit non orci bibendum, in
            vulputate odio aliquet. Integer cursus nibh ac tellus consequat, id tempor risus fermentum.
          </p>
          <p>
            Vivamus non arcu sit amet magna pellentesque efficitur. Donec pharetra sem vitae arcu suscipit, vel
            faucibus nibh fermentum. Cras lacinia erat ac dui ornare, in facilisis nulla gravida.
          </p>
        </div>
        <UiMenu>
          <UiMenuTrigger trigger="both" as-child>
            <button class="menu-demo-button">
              <span>Open stress-test menu</span>
              <span>{{ enableRTL ? "RTL layout" : "LTR layout" }}</span>
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="menu-playground-panel" :style="{ '--ui-menu-max-width': `${menuMaxWidth}px` }">
            <UiMenuLabel>Root items ({{ selectedCount }})</UiMenuLabel>
            <UiMenuSeparator />
            <UiMenuItem v-for="n in selectedCount" :key="`root-${n}`" @select="() => onSelect(n)">
              Item {{ n }}
            </UiMenuItem>
            <UiMenuSeparator />
            <UiMenuLabel>Dynamic items ({{ dynamicItems.length }})</UiMenuLabel>
            <UiMenuItem v-for="item in dynamicItems" :key="item.id" @select="() => onSelect(item.label)">
              {{ item.label }}
            </UiMenuItem>
            <UiMenuSeparator />
            <component v-if="enableNested" :is="NestedChain" :level="1" :max-level="nestedDepth" />
            <UiMenuSeparator />
            <UiMenuItem danger @select="onDanger">Delete something</UiMenuItem>
          </UiMenuContent>
        </UiMenu>
      </div>
      <div class="demo-last-action">
        <span class="demo-last-action__label">Last action</span>
        <span class="demo-last-action__value">{{ lastEvent }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dataset-select {
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dataset-select:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.dataset-button {
  border: 1px solid var(--glass-border);
  background: var(--surface-button);
  color: var(--text-primary);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.dataset-button:hover {
  border-color: var(--glass-highlight);
  background: var(--surface-button-hover);
  transform: translateY(-1px);
}

.dataset-button:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.stress-toggle {
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
  background: var(--surface-card);
  padding: 1rem 1.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.stress-toggle[aria-pressed='true'] {
  border-color: var(--glass-highlight);
  background: var(--surface-card-strong);
}

.toggle-indicator {
  width: 2.1rem;
  height: 1.15rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 0.2rem;
  background: color-mix(in srgb, var(--surface-alt) 76%, transparent);
}

.toggle-indicator::after {
  content: "";
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: var(--text-primary);
  transition: transform 0.2s ease;
}

.toggle-indicator.is-on {
  background: linear-gradient(120deg, var(--accent, #8b5cf6), var(--accent-strong, #38bdf8));
  border-color: transparent;
}

.toggle-indicator.is-on::after {
  transform: translateX(0.85rem);
}

.toggle-indicator.is-off::after {
  transform: translateX(0);
}

.stress-target {
  border-radius: 2rem;
  border: 1px dashed var(--glass-border);
  padding: 1.5rem;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  transition: transform 0.2s ease;
}

</style>
