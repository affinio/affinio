<script setup lang="ts">
import { RouterLink } from "vue-router"
import SimpleAdapterTabs from "@/components/SimpleAdapterTabs.vue"

const highlightCards = [
  {
    title: "Stateless markup",
    detail: "The controller only needs a value string. Render triggers as cards, pills, or toolbar buttons.",
  },
  {
    title: "Server aware",
    detail: "Livewire dispatches `affino-tabs:manual` with the same payload, so both demos stay identical.",
  },
  {
    title: "Composable",
    detail: "Pair tabs with menus, dialogs, or disclosures to form multi-surface navigation labs.",
  },
]

const tabsSnippet = `import { useTabsController } from "@affino/tabs-vue"

const tabs = useTabsController("overview")

function select(value) {
  tabs.select(value)
}`
</script>

<template>
  <section class="adapter-page">
    <header class="adapter-hero">
      <p class="adapter-hero__eyebrow">Affino tabs</p>
      <h1>Intentional context switching that mirrors Livewire tabs 1:1</h1>
      <p>
        Tabs bridge overlay stacks, documentation viewers, and multi-step forms. Keep the runtime lean while unlocking
        server-driven controls.
      </p>
      <div class="adapter-hero__actions">
        <RouterLink to="/">Back to overview</RouterLink>
        <a href="http://127.0.0.1:4180/tabs" target="_blank" rel="noreferrer">Open Laravel mirror</a>
        <a href="https://github.com/affinio/affinio/tree/main/packages/tabs-core" target="_blank" rel="noreferrer">
          Tabs docs
        </a>
      </div>
    </header>

    <section class="adapter-simple">
      <SimpleAdapterTabs />
      <article class="adapter-code">
        <p>Controller scaffold</p>
        <pre aria-label="Tabs snippet">{{ tabsSnippet }}</pre>
      </article>
    </section>

    <section class="adapter-highlights">
      <header>
        <p>Shipping notes</p>
        <h2>Drop into menus, dashboards, or Livewire modules</h2>
        <p>
          The helpers expose `select`, `clear`, and snapshot data so you can power charts, logs, and overlays off the
          current tab.
        </p>
      </header>
      <div class="adapter-grid">
        <article v-for="card in highlightCards" :key="card.title">
          <h3>{{ card.title }}</h3>
          <p>{{ card.detail }}</p>
        </article>
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
  background: linear-gradient(180deg, #f8fafc, #e0f2fe);
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
  letter-spacing: 0.35em;
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

.adapter-hero__actions a,
.adapter-hero__actions :global(a.router-link-active) {
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
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
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
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: rgba(226, 232, 240, 0.75);
}

.adapter-code pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap;
  font-size: 0.85rem;
  line-height: 1.6;
}

.adapter-highlights {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.adapter-highlights header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.adapter-highlights header p:first-child {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.72rem;
  color: #94a3b8;
}

.adapter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.adapter-grid article {
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1.25rem;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.adapter-grid h3 {
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
}

.adapter-grid p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}
</style>
