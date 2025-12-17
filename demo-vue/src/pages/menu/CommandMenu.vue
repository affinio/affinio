<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"
import ReactMount from "@/components/ReactMount.vue"
import { useFrameworkStore } from "@/stores/framework"
import CommandMenuDemo from "@/react-demos/CommandMenuDemo"
import { createHighlighter } from "shiki"

const segments = [
  { label: "VIP accounts", key: "vip", detail: "MRR > 10K", metric: "+32%" },
  { label: "Churn risk", key: "risk", detail: "Low usage", metric: "12" },
  { label: "Beta testers", key: "beta", detail: "Cohort 4", metric: "64" },
]

const automationActions = [
  { label: "Dispatch nurture flow", detail: "Send drip to selected segments" },
  { label: "Export to warehouse", detail: "Sync snapshot to Snowflake" },
]

const activeKeys = ref(new Set<string>(["vip", "beta"]))
const lastAction = ref("Awaiting input")

function toggleSegment(key: string) {
  const next = new Set(activeKeys.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  activeKeys.value = next
  const segment = segments.find((entry) => entry.key === key)
  lastAction.value = segment
    ? `Toggled ${segment.label} (${next.has(key) ? "On" : "Off"})`
    : "Selection toggled"
}

const activeList = computed(() => Array.from(activeKeys.value))

function setAutomation(label: string) {
  lastAction.value = label
}

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const usingVue = computed(() => current.value === "vue")

const highlighted = ref("")

const source = `import { ref } from "vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"

const segments = [
  { label: "VIP accounts", key: "vip" },
  { label: "Churn risk", key: "risk" },
]

const activeSegments = ref(new Set(["vip"]))

function toggle(key: string) {
  const next = new Set(activeSegments.value)
  next.has(key) ? next.delete(key) : next.add(key)
  activeSegments.value = next
}

<UiMenu :options="{ closeOnSelect: false }">
  <UiMenuTrigger as-child>
    <button class="menu-demo-trigger">Segment actions</button>
  </UiMenuTrigger>
  <UiMenuContent>
    <UiMenuLabel>Segments</UiMenuLabel>
    <UiMenuItem
      v-for="segment in segments"
      :key="segment.key"
      @select="() => toggle(segment.key)"
    >
      <span>{{ segment.label }}</span>
      <span>{{ activeSegments.has(segment.key) ? "On" : "Off" }}</span>
    </UiMenuItem>
    <UiMenuSeparator />
    <UiMenuLabel>Automation</UiMenuLabel>
    <UiMenuItem @select="() => console.log('Dispatch flow')">
      Dispatch nurture flow
    </UiMenuItem>
  </UiMenuContent>
</UiMenu>
`

onMounted(async () => {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: ["vue"],
  })

  highlighted.value = highlighter.codeToHtml(source, {
    lang: "vue",
    theme: "github-dark",
  })
})
</script>

<template>
  <section class="menu-demo-block">
    <div class="menu-demo-description">
      <p class="menu-demo-eyebrow">Command center</p>
      <h3 class="menu-demo-title">Keep menus open for rapid multi-select flows.</h3>
      <p class="menu-demo-text">
        Toggle segments without ever closing the panel. Set <code>closeOnSelect: false</code> so operators can
        multi-select quickly while streaming updates to the summary chips below.
      </p>
    </div>

    <div class="demo-workspace">
      <template v-if="usingVue">
        <div class="menu-demo-surface flex flex-col gap-6 text-left">
          <UiMenu :options="{ closeOnSelect: false }">
            <UiMenuTrigger as-child>
              <button class="menu-demo-trigger">Segment actions</button>
            </UiMenuTrigger>
            <UiMenuContent class="menu-playground-panel">
              <UiMenuLabel>Segments</UiMenuLabel>
              <UiMenuItem
                v-for="segment in segments"
                :key="segment.key"
                @select="() => toggleSegment(segment.key)"
              >
                <div class="flex flex-col text-left">
                  <span class="text-sm font-semibold">{{ segment.label }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">{{ segment.detail }}</span>
                </div>
                <span
                  class="text-xs font-semibold"
                  :class="activeKeys.has(segment.key) ? 'text-emerald-400' : 'text-(--ui-menu-muted)'"
                >
                  {{ activeKeys.has(segment.key) ? "On" : "Off" }} · {{ segment.metric }}
                </span>
              </UiMenuItem>
              <UiMenuSeparator />
              <UiMenuLabel>Automation</UiMenuLabel>
              <UiMenuItem
                v-for="action in automationActions"
                :key="action.label"
                @select="() => setAutomation(action.label)"
              >
                <div class="flex flex-col text-left">
                  <span class="text-sm font-semibold">{{ action.label }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
                </div>
              </UiMenuItem>
            </UiMenuContent>
          </UiMenu>
          <div class="w-full space-y-3 text-sm text-(--text-muted)">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-(--text-soft)">Active segments</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="segment in activeList" :key="segment" class="demo-chip">
                  {{ segment }}
                </span>
                <span v-if="!activeList.length" class="demo-chip demo-chip--muted">
                  None selected yet
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <ReactMount v-else :component="CommandMenuDemo" :key="current" />
      <div class="demo-last-action">
        <span class="demo-last-action__label">Last action</span>
        <span class="demo-last-action__value">{{ lastAction }}</span>
      </div>
    </div>

    <pre class="demo-code">
<code>
  <code v-html="highlighted" />
</code>
</pre>
  </section>
</template>
