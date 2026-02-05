<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useTabsController } from "@affino/tabs-vue"

type Tab = {
  value: string
  label: string
  summary: string
  stat: string
  footnote: string
}

const tabs: Tab[] = [
  {
    value: "overview",
    label: "Overview",
    summary: "High-signal pieces that unblock product reviews and async planning.",
    stat: "14 tracks live",
    footnote: "Sits on top of your CMS or markdown sources.",
  },
  {
    value: "journeys",
    label: "Journeys",
    summary: "Player-style walkthroughs that pair overlay handles with focus traps.",
    stat: "6 guided flows",
    footnote: "Mix dialogs, menus, and disclosures as needed.",
  },
  {
    value: "signals",
    label: "Signals",
    summary: "Realtime change feed that batches updates from remote mutations.",
    stat: "24 watchers",
    footnote: "Can be fed from Livewire diagnostics to stay in sync.",
  },
]

const fallbackTab: Tab =
  tabs[0] ?? {
    value: "overview",
    label: "Overview",
    summary: "Fallback tab",
    stat: "—",
    footnote: "",
  }

const defaultValue = fallbackTab.value
const controller = useTabsController<string>(defaultValue)
const activeValue = computed(() => controller.state.value.value ?? defaultValue)
const activeTab = computed(() => tabs.find((tab) => tab.value === activeValue.value) ?? fallbackTab)
const lastSelection = ref(activeValue.value)

watch(activeValue, (value) => {
  lastSelection.value = value ?? defaultValue
})

function selectTab(value: string) {
  controller.select(value)
}

function clearTabs() {
  controller.clear()
}
</script>

<template>
  <section class="tabs-shell">
    <div class="tabs-header">
      <p>Affino tabs</p>
      <h2>Switch between focus areas without paying layout cost</h2>
      <p>Tabs stay headless so you can render triggers anywhere—from side-by-side grids to stacked mobile rows.</p>
    </div>

    <div class="tabs-controls">
      <div class="tab-trigger-group" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="tab-trigger"
          :class="{ 'is-active': activeValue === tab.value }"
          role="tab"
          :aria-selected="activeValue === tab.value"
          @click="selectTab(tab.value)"
        >
          <span>{{ tab.label }}</span>
          <small>{{ tab.stat }}</small>
        </button>
      </div>
      <button type="button" class="ghost" @click="clearTabs">Clear selection</button>
    </div>

    <article class="tabs-panel" role="tabpanel" :aria-label="activeTab.label">
      <header>
        <p class="eyebrow">{{ activeTab.label }} focus</p>
        <h3>{{ activeTab.stat }}</h3>
        <p>{{ activeTab.summary }}</p>
      </header>
      <footer>
        <span>Telemetry</span>
        <p>{{ activeTab.footnote }}</p>
      </footer>
    </article>

    <dl class="adapter-log">
      <div>
        <dt>Active tab</dt>
        <dd>{{ activeValue }}</dd>
      </div>
      <div>
        <dt>Last selection</dt>
        <dd>{{ lastSelection }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.tabs-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  background: linear-gradient(165deg, #ecfeff, #eef2ff);
  color: #0f172a;
  box-shadow: 0 35px 65px rgba(15, 23, 42, 0.25);
}

.tabs-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tabs-header p:first-child {
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.7rem;
  color: #94a3b8;
}

.tabs-controls {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.tab-trigger-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.tab-trigger {
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.85rem 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.tab-trigger.is-active {
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}

.tab-trigger span {
  font-size: 0.95rem;
}

.tab-trigger small {
  font-size: 0.78rem;
  color: #475569;
}

.tabs-controls .ghost {
  align-self: flex-start;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0.6rem 1.3rem;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}

.tabs-panel {
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tabs-panel header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tabs-panel .eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: #94a3b8;
}

.tabs-panel h3 {
  margin: 0;
  font-size: 2rem;
}

.tabs-panel p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.tabs-panel footer {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tabs-panel footer span {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.65rem;
  color: #94a3b8;
}

.adapter-log {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.adapter-log div {
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.8);
}

.adapter-log dt {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.65rem;
  color: #94a3b8;
}

.adapter-log dd {
  margin: 0.25rem 0 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
