<script setup lang="ts">
import AccountCombobox from "./examples/AccountCombobox.vue"
import { segmentOptions } from "@/data/comboboxOptions"

const keyboardCombos = [
  { combo: "Cmd + K", detail: "focus + open the surface" },
  { combo: "Arrow keys", detail: "cycle resiliently across 15K+ rows" },
  { combo: "Enter", detail: "commit without blocking the overlay queue" },
]

const segmentHighlights = segmentOptions.slice(0, 5)
</script>

<template>
  <section class="combobox-page">
    <header class="combobox-hero">
      <p class="combobox-eyebrow">Combobox core</p>
      <div class="combobox-headline">
        <h2>Overlay-first lookup that never blinks.</h2>
        <p class="combobox-preamble">
          <strong>@affino/combobox-core</strong> drives the listbox and state machine while the overlay kernel keeps the
          surface prioritized. The Vue adapter simply binds filter text → snapshots and lets the kernel decide when it is safe to paint.
        </p>
      </div>
      <ul class="combobox-shortcuts">
        <li v-for="shortcut in keyboardCombos" :key="shortcut.combo" class="shortcut-chip">
          <span class="shortcut-combo">{{ shortcut.combo }}</span>
          <span class="shortcut-detail">{{ shortcut.detail }}</span>
        </li>
      </ul>
    </header>

    <div class="combobox-stage">
      <AccountCombobox />

      <aside class="combobox-side">
        <p class="side-eyebrow">Signal-driven segments</p>
        <h3>Headless state piped straight into Vue.</h3>
        <p class="side-copy">
          These cards come from the very same linear selection snapshots that power the combobox. The adapter exposes
          the raw ranges, so highlighting a segment or multi-selecting chips requires zero additional wiring.
        </p>

        <ul class="segment-list">
          <li v-for="segment in segmentHighlights" :key="segment.id" class="segment-card">
            <div>
              <p class="segment-label">{{ segment.label }}</p>
              <p class="segment-description">{{ segment.description }}</p>
            </div>
            <span class="segment-metric">{{ segment.metric }}</span>
          </li>
        </ul>
      </aside>
    </div>

    <section class="combobox-kernel">
      <div>
        <p class="combobox-eyebrow">Overlay kernel</p>
        <h3>Every combobox is just another overlay entry.</h3>
        <p>
          By registering with `overlayKind: "combobox"` and priority `80`, the surface can yield to dialogs and urgent menus without losing focus. The HUD stack immediately reflects this new kind, so QA can see collisions before they ship.
        </p>
      </div>
      <div class="kernel-grid">
        <div>
          <p class="kernel-label">Owner</p>
          <p class="kernel-value">vue-combobox</p>
        </div>
        <div>
          <p class="kernel-label">Priority</p>
          <p class="kernel-value">80 - elevated search</p>
        </div>
        <div>
          <p class="kernel-label">Traits</p>
            <p class="kernel-value">non-modal - returns focus manually</p>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.combobox-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2.5rem 1.5rem 3.5rem;
}

.combobox-hero {
  border-radius: 30px;
  border: 1px solid var(--glass-border);
  padding: 2.25rem;
  background: radial-gradient(circle at top left, rgba(58, 139, 255, 0.18), rgba(58, 139, 255, 0) 60%),
    radial-gradient(circle at 30% 120%, rgba(244, 114, 182, 0.25), transparent 55%),
    var(--surface-card);
  box-shadow: 0 25px 60px rgba(5, 8, 18, 0.35);
}

.combobox-eyebrow {
  margin: 0 0 1rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.combobox-headline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.combobox-headline h2 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.1rem);
}

.combobox-preamble {
  color: var(--text-muted);
  max-width: 680px;
}

.combobox-shortcuts {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  padding: 0;
  margin: 1.5rem 0 0;
}

.shortcut-chip {
  border-radius: 18px;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 85%, transparent);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.shortcut-combo {
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.shortcut-detail {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.combobox-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .combobox-stage {
    grid-template-columns: 1fr;
  }
}

.combobox-side {
  border-radius: 28px;
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
  background: var(--surface-alt);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.side-eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.combobox-side h3 {
  margin: 0;
  font-size: 1.5rem;
}

.side-copy {
  margin: 0;
  color: var(--text-muted);
}

.segment-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
}

.segment-card {
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(4, 7, 15, 0.65);
}

.segment-label {
  margin: 0;
  font-weight: 600;
}

.segment-description {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.segment-metric {
  align-self: center;
  font-size: 0.85rem;
  color: var(--accent-strong);
}

.combobox-kernel {
  border-radius: 28px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.18), transparent);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 2rem;
  align-items: center;
}

@media (max-width: 900px) {
  .combobox-kernel {
    grid-template-columns: 1fr;
  }
}

.combobox-kernel h3 {
  margin: 0.4rem 0 1rem;
  font-size: 1.8rem;
}

.combobox-kernel p {
  margin: 0;
  color: var(--text-muted);
}

.kernel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.kernel-label {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.kernel-value {
  margin: 0.2rem 0 0;
  font-size: 1rem;
  color: var(--text-primary);
}
</style>
