<script setup lang="ts">
import { RouterLink } from "vue-router"
import SimpleAdapterTreeview from "@/components/SimpleAdapterTreeview.vue"

const highlights = [
  {
    title: "Same core contract",
    detail: "Vue and Livewire share `@affino/treeview-core`, so focus and expansion stay consistent.",
  },
  {
    title: "Keyboard-first",
    detail: "Arrow navigation, Home/End, Enter, and Space mirror the ARIA treeview interaction pattern.",
  },
  {
    title: "Manual bridge ready",
    detail: "Laravel can dispatch `affino-treeview:manual` for server-driven focus and selection workflows.",
  },
]

const snippet = `import { useTreeviewController } from "@affino/treeview-vue"

const tree = useTreeviewController({
  nodes,
  defaultExpanded: ["root"],
})`
</script>

<template>
  <section class="adapter-page">
    <header class="adapter-hero">
      <p class="adapter-hero__eyebrow">Affino treeview</p>
      <h1>Hierarchical navigation with deterministic keyboard behavior</h1>
      <p>
        Treeview adapters keep expansion, active descendants, and selected nodes in sync across Vue and Livewire
        surfaces.
      </p>
      <div class="adapter-hero__actions">
        <RouterLink to="/">Back to overview</RouterLink>
        <a href="http://127.0.0.1:4180/treeview" target="_blank" rel="noreferrer">Open Laravel mirror</a>
        <a href="https://github.com/affinio/affinio/tree/main/packages/treeview-core" target="_blank" rel="noreferrer">
          Treeview docs
        </a>
      </div>
    </header>

    <section class="adapter-simple">
      <SimpleAdapterTreeview />
      <article class="adapter-code">
        <p>Controller scaffold</p>
        <pre aria-label="Treeview snippet">{{ snippet }}</pre>
      </article>
    </section>

    <section class="adapter-highlights">
      <header>
        <p>Shipping notes</p>
        <h2>Built for nested operator workflows</h2>
      </header>
      <div class="adapter-grid">
        <article v-for="card in highlights" :key="card.title">
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
  background: var(--surface);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(18px);
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
  color: var(--text-muted);
}

.adapter-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
}

.adapter-hero p {
  margin: 0;
  color: var(--text-soft);
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
  border: 1px solid var(--glass-border);
  background: var(--surface-card);
  color: var(--text-primary);
  transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.adapter-hero__actions a:first-child {
  background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 70%, transparent), var(--accent-strong));
  color: #05060a;
}

.adapter-hero__actions a:hover {
  transform: translateY(-1px);
  border-color: var(--glass-highlight);
  background: var(--surface-button-hover);
}

.adapter-simple {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.adapter-code {
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
  background: rgba(5, 8, 14, 0.9);
  color: #e2e8f0;
  padding: 1.5rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.adapter-code p {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: var(--text-muted);
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

.adapter-highlights header p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.adapter-highlights header h2 {
  margin: 0.4rem 0 0;
}

.adapter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.adapter-grid article {
  border-radius: 1.25rem;
  border: 1px solid var(--glass-border);
  padding: 1.25rem;
  background: var(--surface-card);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.adapter-grid h3 {
  margin: 0 0 0.35rem;
}

.adapter-grid p {
  margin: 0;
  color: var(--text-soft);
}
</style>
