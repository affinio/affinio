<script setup lang="ts">
import { computed } from "vue"
import { useTreeviewController, type TreeviewNode } from "@affino/treeview-vue"

type NodeValue =
  | "workspace"
  | "roadmap"
  | "backlog"
  | "sprint"
  | "qa"
  | "incidents"
  | "postmortems"
  | "archive"

const nodes: TreeviewNode<NodeValue>[] = [
  { value: "workspace", parent: null },
  { value: "roadmap", parent: "workspace" },
  { value: "backlog", parent: "roadmap" },
  { value: "sprint", parent: "roadmap" },
  { value: "qa", parent: "workspace" },
  { value: "incidents", parent: "qa" },
  { value: "postmortems", parent: "qa" },
  { value: "archive", parent: "workspace" },
]

const nodeMeta: Record<NodeValue, { title: string; detail: string }> = {
  workspace: { title: "Workspace", detail: "Primary product workspace root" },
  roadmap: { title: "Roadmap", detail: "Quarter planning lanes" },
  backlog: { title: "Backlog", detail: "Candidate stories and design spikes" },
  sprint: { title: "Sprint", detail: "Execution lane with active goals" },
  qa: { title: "Quality", detail: "Validation, incidents, and release gates" },
  incidents: { title: "Incidents", detail: "Live triage and recovery timelines" },
  postmortems: { title: "Postmortems", detail: "Root-cause notes and owner actions" },
  archive: { title: "Archive", detail: "Retired branches and snapshots" },
}

const childrenByParent = new Map<NodeValue | null, NodeValue[]>()
nodes.forEach((node) => {
  const siblings = childrenByParent.get(node.parent) ?? []
  siblings.push(node.value)
  childrenByParent.set(node.parent, siblings)
})

const levelByValue = new Map<NodeValue, number>()
const parentByValue = new Map<NodeValue, NodeValue | null>()
nodes.forEach((node) => {
  parentByValue.set(node.value, node.parent)
})
const resolveLevel = (value: NodeValue): number => {
  const cached = levelByValue.get(value)
  if (cached) {
    return cached
  }
  let level = 1
  let cursor = parentByValue.get(value) ?? null
  const visited = new Set<NodeValue>()
  while (cursor) {
    if (visited.has(cursor)) {
      break
    }
    visited.add(cursor)
    level += 1
    cursor = parentByValue.get(cursor) ?? null
  }
  levelByValue.set(value, level)
  return level
}

const treeview = useTreeviewController<NodeValue>({
  nodes,
  defaultExpanded: ["workspace", "roadmap", "qa"],
  defaultSelected: "backlog",
  defaultActive: "backlog",
  loop: true,
})

const visibleNodes = computed(() => {
  const visible = new Set(treeview.getVisibleValues())
  return nodes.filter((node) => visible.has(node.value))
})

const selectedMeta = computed(() => {
  const selected = treeview.state.value.selected
  if (!selected) {
    return null
  }
  return nodeMeta[selected]
})

const hasChildren = (value: NodeValue) => (childrenByParent.get(value) ?? []).length > 0

const onNodeKeydown = (event: KeyboardEvent, value: NodeValue) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      treeview.focusNext()
      break
    case "ArrowUp":
      event.preventDefault()
      treeview.focusPrevious()
      break
    case "Home":
      event.preventDefault()
      treeview.focusFirst()
      break
    case "End":
      event.preventDefault()
      treeview.focusLast()
      break
    case "Enter":
    case " ":
      event.preventDefault()
      treeview.select(value)
      break
    case "ArrowRight": {
      if (!hasChildren(value)) {
        return
      }
      event.preventDefault()
      if (!treeview.isExpanded(value)) {
        treeview.expand(value)
        return
      }
      const child = childrenByParent.get(value)?.[0]
      if (child) {
        treeview.focus(child)
      }
      break
    }
    case "ArrowLeft":
      event.preventDefault()
      if (treeview.isExpanded(value)) {
        treeview.collapse(value)
        return
      }
      if (parentByValue.get(value)) {
        treeview.focus(parentByValue.get(value) as NodeValue)
      }
      break
  }
}
</script>

<template>
  <section class="treeview-shell">
    <header class="treeview-header">
      <p>Affino treeview</p>
      <h3>Project map</h3>
      <p>Use keyboard arrows, Enter, Space, Home, and End to navigate nodes.</p>
    </header>

    <div class="treeview-rows" role="tree" aria-label="Project map treeview">
      <div
        v-for="node in visibleNodes"
        :key="node.value"
        class="treeview-row"
        :style="{ '--level': String(resolveLevel(node.value)) }"
      >
        <button
          v-if="hasChildren(node.value)"
          class="treeview-toggle"
          type="button"
          :aria-label="treeview.isExpanded(node.value) ? 'Collapse branch' : 'Expand branch'"
          @click="treeview.toggle(node.value)"
        >
          {{ treeview.isExpanded(node.value) ? "-" : "+" }}
        </button>
        <span v-else class="treeview-toggle treeview-toggle--ghost" aria-hidden="true">*</span>

        <button
          type="button"
          class="treeview-item"
          :class="{
            'is-active': treeview.isActive(node.value),
            'is-selected': treeview.isSelected(node.value),
          }"
          :aria-selected="treeview.isSelected(node.value) ? 'true' : 'false'"
          :aria-expanded="hasChildren(node.value) ? (treeview.isExpanded(node.value) ? 'true' : 'false') : undefined"
          :tabindex="treeview.isActive(node.value) ? 0 : -1"
          @click="treeview.select(node.value)"
          @keydown="onNodeKeydown($event, node.value)"
        >
          <strong>{{ nodeMeta[node.value].title }}</strong>
          <span>{{ nodeMeta[node.value].detail }}</span>
        </button>
      </div>
    </div>

    <footer class="treeview-footer">
      <p class="eyebrow">Current selection</p>
      <p v-if="selectedMeta">{{ selectedMeta.title }} | {{ selectedMeta.detail }}</p>
      <p v-else>No node selected</p>
    </footer>
  </section>
</template>

<style scoped>
.treeview-shell {
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: linear-gradient(165deg, #f8fafc, #e2e8f0);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.treeview-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.treeview-header p:first-child {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #64748b;
}

.treeview-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.treeview-header p:last-child {
  margin: 0;
  color: #475569;
}

.treeview-rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.treeview-row {
  --level-padding: calc((var(--level, 1) - 1) * 1.2rem);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem;
  align-items: start;
  padding-left: var(--level-padding);
}

.treeview-toggle {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: white;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.treeview-toggle--ghost {
  border-color: transparent;
  background: transparent;
  color: #94a3b8;
  cursor: default;
}

.treeview-item {
  text-align: left;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 0.8rem;
  background: white;
  padding: 0.55rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: #0f172a;
}

.treeview-item strong {
  font-size: 0.94rem;
}

.treeview-item span {
  font-size: 0.82rem;
  color: #475569;
}

.treeview-item.is-active {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.treeview-item.is-selected {
  border-color: rgba(37, 99, 235, 0.5);
  background: linear-gradient(180deg, #eff6ff, #dbeafe);
}

.treeview-footer {
  border-top: 1px dashed rgba(15, 23, 42, 0.18);
  padding-top: 0.85rem;
}

.treeview-footer .eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
}

.treeview-footer p:last-child {
  margin: 0.3rem 0 0;
  color: #1e293b;
}
</style>
