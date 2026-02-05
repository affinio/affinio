<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useDisclosureController } from "@affino/disclosure-vue"

type Insight = {
  title: string
  context: string
  metric: string
  meta: string
}

const insights: Insight[] = [
  { title: "Research pulse", context: "Weekly round", metric: "+18% completion", meta: "Updated 6m ago" },
  { title: "Design QA", context: "Checklist", metric: "3 blockers", meta: "Auto-triaged" },
  { title: "Launch ops", context: "Crew sync", metric: "7 owners", meta: "Crew ready" },
]

const controller = useDisclosureController(false)
const isOpen = computed(() => controller.state.value.open)
const lastEvent = ref("Waiting for interaction")

watch(isOpen, (next) => {
  lastEvent.value = next ? "Panel expanded" : "Panel collapsed"
})

function togglePanel() {
  controller.toggle()
}

function closePanel() {
  controller.close()
}
</script>

<template>
  <section class="disclosure-shell">
    <header>
      <p>Affino disclosure</p>
      <h2>One trigger, intentional copy, instant context</h2>
      <p>
        The controller stays headless—Vue just reacts to `state.value.open`. Wire the surface however you like and keep a
        tight log for accessibility tooling.
      </p>
    </header>

    <div class="disclosure-actions">
      <button type="button" class="primary" @click="togglePanel">Toggle project pulses</button>
      <button type="button" class="ghost" :disabled="!isOpen" @click="closePanel">Force close</button>
    </div>

    <article class="disclosure-panel" :data-state="isOpen ? 'open' : 'closed'">
      <div class="panel-copy">
        <p class="eyebrow">Notifications</p>
        <h3>Studio sync feed</h3>
        <p>Give teammates a single disclosure for everything that is actionable this hour.</p>
      </div>

      <ul class="panel-list">
        <li v-for="insight in insights" :key="insight.title">
          <div>
            <strong>{{ insight.title }}</strong>
            <span>{{ insight.context }}</span>
          </div>
          <div>
            <em>{{ insight.metric }}</em>
            <small>{{ insight.meta }}</small>
          </div>
        </li>
      </ul>
    </article>

    <dl class="adapter-log">
      <div>
        <dt>Disclosure state</dt>
        <dd>{{ isOpen ? "Open" : "Closed" }}</dd>
      </div>
      <div>
        <dt>Last event</dt>
        <dd>{{ lastEvent }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.disclosure-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  background: linear-gradient(140deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.75)), #0f172a;
  color: #f8fafc;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.45);
}

.disclosure-shell header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.disclosure-shell header p:first-child {
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.7rem;
  color: rgba(248, 250, 252, 0.7);
}

.disclosure-shell header h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.disclosure-shell header p:last-child {
  margin: 0;
  color: rgba(248, 250, 252, 0.75);
  line-height: 1.6;
}

.disclosure-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.disclosure-actions button {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
}

.disclosure-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.disclosure-actions .primary {
  background: linear-gradient(120deg, #38bdf8, #a855f7);
  color: #0f172a;
  box-shadow: 0 18px 40px rgba(56, 189, 248, 0.3);
}

.disclosure-actions .ghost {
  background: rgba(148, 163, 184, 0.15);
  color: #f8fafc;
  border: 1px solid rgba(248, 250, 252, 0.25);
}

.disclosure-panel {
  border-radius: 1.5rem;
  border: 1px solid rgba(248, 250, 252, 0.15);
  background: rgba(15, 23, 42, 0.65);
  padding: 1.5rem;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.disclosure-panel[data-state="open"] {
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.panel-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.panel-copy .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.7rem;
  color: rgba(148, 163, 184, 0.8);
  margin: 0;
}

.panel-copy h3 {
  margin: 0;
  font-size: 1.4rem;
}

.panel-copy p:last-child {
  margin: 0;
  color: rgba(226, 232, 240, 0.8);
}

.panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-list li {
  border-radius: 1rem;
  border: 1px solid rgba(248, 250, 252, 0.08);
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.75);
}

.panel-list strong {
  display: block;
  font-size: 1rem;
}

.panel-list span {
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.85rem;
}

.panel-list em {
  font-style: normal;
  font-weight: 600;
  color: #38bdf8;
}

.panel-list small {
  display: block;
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
}

.adapter-log {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.adapter-log div {
  border-radius: 1rem;
  border: 1px solid rgba(248, 250, 252, 0.2);
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.adapter-log dt {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.85);
}

.adapter-log dd {
  margin: 0.25rem 0 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
