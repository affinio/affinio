<script setup lang="ts">
import PopoverPlayground from "@/components/PopoverPlayground.vue"
import PopoverSnoozeExample from "@/components/PopoverSnoozeExample.vue"

const highlights = [
  {
    title: "Layered surfaces",
    body: "PopoverCore shares the same kernel as menus, so nested flyouts reuse timers, focus guards, and overlay hosts.",
  },
  {
    title: "Directional control",
    body: "Placement + alignment props resolve into concrete coords, making transitions and arrow work deterministic.",
  },
  {
    title: "Adapter parity",
    body: "Vue composables mirror the React API, so building across design systems stays symmetrical.",
  },
]

const stats = [
  { label: "Focus return", value: "Automatic" },
  { label: "Viewport logic", value: "Collision-aware" },
  { label: "Adapters", value: "Vue + React" },
]
</script>

<template>
  <section class="popover-page">
    <header class="popover-hero">
      <div class="hero-copy">
        <p class="eyebrow">Floating surfaces</p>
        <h1>Popover flows for product ops</h1>
        <p>
          Use <span>@affino/popover-core</span> + <span>@affino/popover-vue</span> to light up contextual editors without falling back to modal
          takeovers. The controller handles focus loops, scroll locking, and outside interactions so you can layer
          complex authoring UI directly inline.
        </p>
        <div class="hero-actions">
          <a
            class="primary-action"
            href="https://github.com/affinidocs/menu/tree/main/docs-site/popover"
            target="_blank"
            rel="noreferrer"
          >
            Read the docs
          </a>
          <span class="hero-note">Arrow + placement helpers ship in core.</span>
        </div>
      </div>
      <ul class="hero-stats">
        <li v-for="stat in stats" :key="stat.label">
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
        </li>
      </ul>
    </header>

    <ul class="popover-highlights">
      <li v-for="item in highlights" :key="item.title">
        <p class="highlight-title">{{ item.title }}</p>
        <p class="highlight-body">{{ item.body }}</p>
      </li>
    </ul>

    <section class="popover-demos">
      <PopoverPlayground />
      <PopoverSnoozeExample />
    </section>

    <section class="popover-notes">
      <article>
        <h3>Composable control</h3>
        <p>
          `usePopoverController` exposes the exact trigger/content props from core, so you decide how to render. Pair it with
          `useFloatingPopover` when you want automatic positioning, or swap it out for CSS anchored positioning if you
          already have layout constraints.
        </p>
      </article>
      <article>
        <h3>Signals aware</h3>
        <p>
          The floating helper pipes outside pointer + focus events back through the controller, so custom logic such as
          analytics sampling or open guards stay centralized. Hooks also ship `returnFocus` + `lockScroll` toggles to
          tune modal vs. non-modal behavior per surface.
        </p>
      </article>
    </section>
  </section>
</template>

<style scoped>
.popover-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-bottom: 4rem;
}

.popover-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1.5rem, 4vw, 3rem);
  padding: 2.5rem;
  border-radius: 1.75rem;
  background: linear-gradient(135deg, #030712, #111827 55%, #0f172a);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 35px 55px rgba(2, 6, 23, 0.55);
}

.hero-copy h1 {
  font-size: clamp(2.1rem, 4vw, 3rem);
  line-height: 1.1;
  margin-bottom: 1rem;
}

.hero-copy p {
  margin: 0 0 1rem;
  color: rgba(226, 232, 240, 0.85);
}

.hero-copy span {
  color: #a5b4fc;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.primary-action {
  background: linear-gradient(120deg, #4c1d95, #7c3aed 45%, #ec4899);
  color: #fff;
  text-decoration: none;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 30px rgba(79, 70, 229, 0.45);
}

.hero-note {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.hero-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.hero-stats li {
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.stat-value {
  margin: 0;
  font-size: 1.35rem;
}

.stat-label {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.7);
}

.popover-highlights {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 0;
  padding: 0;
}

.popover-highlights li {
  padding: 1.2rem;
  border-radius: 1rem;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.highlight-title {
  margin: 0;
  font-weight: 600;
}

.highlight-body {
  margin: 0.4rem 0 0;
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.95rem;
}

.popover-demos {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .popover-demos {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: stretch;
  }
}

.popover-notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.popover-notes article {
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #020617;
  color: #cbd5f5;
}

.popover-notes h3 {
  margin: 0 0 0.5rem;
}

.popover-notes p {
  margin: 0;
  color: rgba(203, 213, 245, 0.8);
  line-height: 1.55;
}

@media (max-width: 640px) {
  .popover-hero {
    padding: 1.5rem;
  }
}
</style>
