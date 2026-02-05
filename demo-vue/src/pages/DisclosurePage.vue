<script setup lang="ts">
import { RouterLink } from "vue-router"
import SimpleAdapterDisclosure from "@/components/SimpleAdapterDisclosure.vue"

const highlightCards = [
  {
    title: "Deterministic state",
    detail: "`DisclosureCore` publishes a snapshot stream so your telemetry, logs, and animations stay synced.",
  },
  {
    title: "Manual parity",
    detail: "Livewire demos dispatch the same manual events, so Vue + Laravel stay visually identical.",
  },
  {
    title: "No markup opinions",
    detail: "Ship glassmorphism, brute-force utility classes, or native details/summary—Affino stays headless.",
  },
]

const disclosureSnippet = `import { useDisclosureController } from "@affino/disclosure-vue"
import { computed } from "vue"

const disclosure = useDisclosureController(false)
const isOpen = computed(() => disclosure.state.value.open)

function toggle() {
  disclosure.toggle()
}`
</script>

<template>
  <section class="adapter-page">
    <header class="adapter-hero">
      <p class="adapter-hero__eyebrow">Affino disclosure</p>
      <h1>Build decisive reveal moments—Vue and Laravel share every detail</h1>
      <p>
        The primitive is just a controller. Wire buttons, aria attributes, transitions, and logs however you like while
        staying perfectly in sync with Livewire.
      </p>
      <div class="adapter-hero__actions">
        <RouterLink to="/">Back to overview</RouterLink>
        <a href="http://127.0.0.1:4180/disclosures" target="_blank" rel="noreferrer">Open Laravel mirror</a>
        <a href="https://github.com/affinio/affinio/tree/main/packages/disclosure-core" target="_blank" rel="noreferrer">
          Disclosure docs
        </a>
      </div>
    </header>

    <section class="adapter-simple">
      <SimpleAdapterDisclosure />
      <article class="adapter-code">
        <p>Controller scaffold</p>
        <pre aria-label="Disclosure snippet">{{ disclosureSnippet }}</pre>
      </article>
    </section>

    <section class="adapter-highlights">
      <header>
        <p>Why adapters</p>
        <h2>Pair neutral state machines with your own UI language</h2>
        <p>
          The same manual events hydrate Livewire blades, so every change you see here ships 1:1 into the Laravel demo.
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
  background: linear-gradient(180deg, #020617, #0f172a);
  color: #f8fafc;
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.85);
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
  color: rgba(248, 250, 252, 0.7);
}

.adapter-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.adapter-hero p {
  margin: 0;
  color: rgba(226, 232, 240, 0.85);
  font-size: 1.05rem;
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
  border: 1px solid rgba(248, 250, 252, 0.25);
  background: rgba(248, 250, 252, 0.1);
  color: #f8fafc;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.adapter-hero__actions a:first-child {
  background: #f8fafc;
  color: #0f172a;
}

.adapter-hero__actions a:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.4);
}

.adapter-simple {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: stretch;
}

.adapter-code {
  border-radius: 1.5rem;
  border: 1px solid rgba(248, 250, 252, 0.2);
  background: rgba(15, 23, 42, 0.75);
  color: #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.adapter-code p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: rgba(226, 232, 240, 0.8);
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
  color: rgba(248, 250, 252, 0.6);
}

.adapter-highlights header h2,
.adapter-highlights header p:last-child {
  margin: 0;
  color: rgba(248, 250, 252, 0.9);
}

.adapter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.adapter-grid article {
  border-radius: 1.25rem;
  border: 1px solid rgba(248, 250, 252, 0.15);
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.65);
  box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.08);
}

.adapter-grid h3 {
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
}

.adapter-grid p {
  margin: 0;
  color: rgba(226, 232, 240, 0.85);
  line-height: 1.6;
}
</style>
