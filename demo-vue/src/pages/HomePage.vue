<script setup lang="ts">
import { RouterLink } from "vue-router"
import SimpleAdapterMenu from "@/components/SimpleAdapterMenu.vue"

const advancedFlows = [
  {
    title: "Disclosure",
    description: "Reveal compact insight stacks without dragging in a full dialog.",
    to: "/disclosure",
    label: "Disclosure demo",
  },
  {
    title: "Tabs",
    description: "Headless tabs that match the Livewire mirror.",
    to: "/tabs",
    label: "Tabs workspace",
  },
  {
    title: "Treeview",
    description: "Hierarchical navigation with keyboard-first focus paths.",
    to: "/treeview",
    label: "Treeview lab",
  },
  {
    title: "Menus",
    description: "Pointer intent, nested stacks, and context surfaces.",
    to: "/menu/simple",
    label: "Menu demos",
  },
  {
    title: "Dialogs",
    description: "Focus guards, optimistic closes, swipe-to-dismiss.",
    to: "/dialogs",
    label: "Dialog lab",
  },
  {
    title: "Tooltips & Popovers",
    description: "Shared timers + overlay kernel alignment.",
    to: "/tooltips",
    label: "Surface demos",
  },
  {
    title: "Selection",
    description: "Grid + listbox adapters with deterministic ranges.",
    to: "/selection",
    label: "Selection grid",
  },
  {
    title: "Virtualization",
    description: "Massive lists with zero layout thrash.",
    to: "/virtualization",
    label: "Virtualized grid",
  },
  {
    title: "DataGrid",
    description: "Full datagrid runtime with editing, pinning, and selection.",
    to: "/datagrid",
    label: "DataGrid demo",
  },
  {
    title: "DataGrid Sugar",
    description: "High-level useAffinoDataGrid API with ready bindings.",
    to: "/datagrid/sugar",
    label: "DataGrid sugar",
  },
  {
    title: "Livewire adapters",
    description: "Laravel demo mirrors this layout.",
    href: "http://127.0.0.1:4180",
    label: "Open Laravel demo",
  },
]

const vueBootstrap = `import { bootstrapAffinoVueAdapters } from "@affino/vue-adapter"

bootstrapAffinoVueAdapters({
  diagnostics: import.meta.env.DEV,
})`
</script>

<template>
  <section class="adapter-page">
    <header class="adapter-hero">
      <p class="adapter-hero__eyebrow">Affino adapters</p>
      <h1>Vue + Laravel demos with the same contract</h1>
      <p>
        Every demo on this page bootstraps the new adapter runtimes. The primary example is intentionally simple—
        tap it once to understand the contract, then jump to the advanced flows below only if you need more.
      </p>
      <div class="adapter-hero__actions">
        <RouterLink to="/menu/simple">View full menu demo</RouterLink>
        <a href="https://github.com/affinio/affinio/tree/main/packages/vue-adapter" target="_blank" rel="noreferrer">
          Vue adapter docs
        </a>
      </div>
    </header>

    <section class="adapter-simple">
      <SimpleAdapterMenu />
      <article class="adapter-code">
        <p>Bootstrap once per app</p>
        <pre aria-label="Vue adapter bootstrap snippet">{{ vueBootstrap }}</pre>
      </article>
    </section>

    <section class="adapter-advanced">
      <header>
        <p>Advanced flows</p>
        <h2>Keep exploring after the basics</h2>
        <p>
          Skip ahead to the heavy demos only when you need them. Each card opens a focused playground that shares the
          same adapter style as the Livewire version.
        </p>
      </header>
      <div class="adapter-grid">
        <template v-for="flow in advancedFlows" :key="flow.title">
          <RouterLink v-if="flow.to" :to="flow.to" class="adapter-card">
            <div>
              <p class="adapter-card__eyebrow">{{ flow.label }}</p>
              <h3>{{ flow.title }}</h3>
              <p>{{ flow.description }}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </RouterLink>

          <a v-else :href="flow.href" class="adapter-card" target="_blank" rel="noreferrer">
            <div>
              <p class="adapter-card__eyebrow">{{ flow.label }}</p>
              <h3>{{ flow.title }}</h3>
              <p>{{ flow.description }}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </a>
        </template>
      </div>
    </section>
  </section>
</template>

<style scoped>
.adapter-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2rem;
  border-radius: 2rem;
  background: linear-gradient(180deg, #fdfdfd, #f5f7fb);
  color: #0f172a;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);
}

@media (max-width: 768px) {
  .adapter-page {
    padding: 1.5rem;
  }
}

.adapter-hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.adapter-hero__eyebrow {
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #94a3b8;
}

.adapter-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
}

.adapter-hero p {
  margin: 0;
  font-size: 1.05rem;
  color: #475569;
}

.adapter-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.adapter-hero__actions a {
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: white;
  color: #0f172a;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.adapter-hero__actions a:first-child {
  background: #0f172a;
  color: white;
}

.adapter-hero__actions a:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
}

.adapter-simple {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: stretch;
}

.adapter-code {
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0f172a;
  color: #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.adapter-code p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.7rem;
  color: #cbd5f5;
}

.adapter-code pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.adapter-advanced {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.adapter-advanced header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.adapter-advanced header p:first-child {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.74rem;
  color: #94a3b8;
}

.adapter-advanced header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.adapter-advanced header p:last-child {
  margin: 0;
  color: #475569;
}

.adapter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.adapter-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: white;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: space-between;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.adapter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.adapter-card__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.7rem;
  color: #94a3b8;
}

.adapter-card h3 {
  margin: 0;
  font-size: 1.2rem;
}

.adapter-card p {
  margin: 0;
  color: #475569;
}

.adapter-card span:last-child {
  font-size: 1.2rem;
  color: #94a3b8;
  align-self: flex-end;
}
</style>
