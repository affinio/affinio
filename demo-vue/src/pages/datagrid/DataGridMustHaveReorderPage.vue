<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import type { DataGridClientRowReorderInput, DataGridColumnDef, DataGridRowNode } from "@affino/datagrid-core"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  priority: number
}

interface ClientRowModelLike {
  reorderRows: (input: DataGridClientRowReorderInput) => boolean
  setPageSize: (pageSize: number | null) => void
  setCurrentPage: (page: number) => void
  getRowsInRange: (range: { start: number; end: number }) => readonly DataGridRowNode<IncidentRow>[]
}

interface GridRefShape {
  rowModel?: ClientRowModelLike
}

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 180 },
  { key: "priority", label: "Priority", width: 110 },
])

const rows = ref<IncidentRow[]>(
  Array.from({ length: 24 }, (_, index) => ({
    rowId: `row-${index + 1}`,
    service: `svc-${index + 1}`,
    owner: ["NOC", "SRE", "Core", "Platform"][index % 4] ?? "NOC",
    priority: index + 1,
  })),
)

const gridRef = ref<GridRefShape | null>(null)
const status = ref("Client row reorder scenario ready")
const visibleHead = ref<string[]>([])

const visibleHeadText = computed(() => visibleHead.value.join(", "))

const syncVisibleHead = () => {
  const rowModel = gridRef.value?.rowModel
  if (!rowModel) {
    return
  }
  const head = rowModel.getRowsInRange({ start: 0, end: 7 })
  visibleHead.value = head
    .filter(row => row.kind === "leaf")
    .map(row => String((row.row as IncidentRow).priority))
}

const applyReorder = (input: DataGridClientRowReorderInput, label: string) => {
  const rowModel = gridRef.value?.rowModel
  if (!rowModel) {
    return
  }
  const moved = rowModel.reorderRows(input)
  syncVisibleHead()
  status.value = moved ? `${label} applied` : `${label} skipped`
}

const moveFirstToEnd = () => {
  applyReorder({ fromIndex: 0, toIndex: 24 }, "Move first -> end")
}

const moveLastToTop = () => {
  applyReorder({ fromIndex: 23, toIndex: 0 }, "Move last -> top")
}

const moveBlock = () => {
  applyReorder({ fromIndex: 2, toIndex: 12, count: 3 }, "Move block [3..5] -> after 12")
}

const paginateAndReorder = () => {
  const rowModel = gridRef.value?.rowModel
  if (!rowModel) {
    return
  }
  rowModel.setPageSize(8)
  rowModel.setCurrentPage(1)
  const moved = rowModel.reorderRows({ fromIndex: 10, toIndex: 1 })
  syncVisibleHead()
  status.value = moved
    ? "Reorder done with pagination (pageSize=8, currentPage=2)"
    : "Reorder with pagination skipped"
}

onMounted(() => {
  nextTick(() => {
    syncVisibleHead()
  })
})
</script>

<template>
  <section class="datagrid-musthave-reorder">
    <header class="datagrid-musthave-reorder__header">
      <p class="datagrid-musthave-reorder__eyebrow">DataGrid Must-Have · Scenario 04</p>
      <h1>Client Row Reordering</h1>
      <p>Deterministic reorder pipeline on client row model with stable projection after mutation.</p>
      <div class="datagrid-musthave-reorder__links">
        <RouterLink to="/datagrid/must-have/pagination">Pagination</RouterLink>
        <RouterLink to="/datagrid/must-have/filtering">Filtering</RouterLink>
        <RouterLink to="/datagrid/must-have/column-state">Column state</RouterLink>
        <RouterLink to="/datagrid/must-have/row-height">Row-height</RouterLink>
      </div>
    </header>

    <div class="datagrid-musthave-reorder__layout">
      <aside class="datagrid-musthave-reorder__controls">
        <h2>Reorder actions</h2>
        <button type="button" @click="moveFirstToEnd">Move first to end</button>
        <button type="button" @click="moveLastToTop">Move last to top</button>
        <button type="button" @click="moveBlock">Move block (count=3)</button>
        <button type="button" @click="paginateAndReorder">Reorder with pagination</button>
        <button type="button" @click="syncVisibleHead">Read visible head</button>

        <p class="datagrid-musthave-reorder__metric">Visible head priorities: {{ visibleHeadText }}</p>
      </aside>

      <main class="datagrid-musthave-reorder__grid">
        <AffinoDataGridSimple
          ref="gridRef"
          v-model:rows="rows"
          v-model:status="status"
          :columns="columns"
          :features="{ selection: false, clipboard: false, editing: false }"
          :show-toolbar="false"
        />
      </main>
    </div>
  </section>
</template>

<style scoped>
.datagrid-musthave-reorder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-musthave-reorder__header h1 {
  margin: 0.25rem 0;
}

.datagrid-musthave-reorder__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-reorder__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-reorder__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.7rem;
}

.datagrid-musthave-reorder__layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 1rem;
  min-height: 560px;
}

.datagrid-musthave-reorder__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.datagrid-musthave-reorder__controls h2 {
  margin: 0;
  font-size: 1rem;
}

.datagrid-musthave-reorder__controls button {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.48rem 0.58rem;
  cursor: pointer;
}

.datagrid-musthave-reorder__metric {
  margin: 0.4rem 0 0;
  font-size: 0.84rem;
}

.datagrid-musthave-reorder__grid {
  min-width: 0;
}

:deep(.affino-datagrid-simple__viewport) {
  max-height: calc(100vh - 290px);
}

@media (max-width: 1100px) {
  .datagrid-musthave-reorder__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
