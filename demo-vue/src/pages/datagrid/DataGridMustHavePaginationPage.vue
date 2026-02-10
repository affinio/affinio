<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import type { DataGridColumnDef, DataGridPaginationSnapshot } from "@affino/datagrid-core"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  region: string
  severity: "critical" | "high" | "medium" | "low"
  latencyMs: number
  updatedAt: string
}

interface PaginationApi {
  setPagination: (pagination: { pageSize: number; currentPage: number } | null) => void
  setPageSize: (pageSize: number | null) => void
  setCurrentPage: (page: number) => void
  getPaginationSnapshot: () => DataGridPaginationSnapshot
  refreshRows: (reason?: "manual" | "mount" | "sort-change" | "filter-change" | "viewport-change" | "reset") => void
}

interface GridRefShape {
  api?: PaginationApi
}

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 170 },
  { key: "region", label: "Region", width: 130 },
  { key: "severity", label: "Severity", width: 130 },
  { key: "latencyMs", label: "Latency", width: 130 },
  { key: "updatedAt", label: "Updated", width: 210 },
])

const rows = ref<IncidentRow[]>(
  Array.from({ length: 137 }, (_, index) => {
    const id = index + 1
    const severity: IncidentRow["severity"][] = ["critical", "high", "medium", "low"]
    const regions = ["us-east", "us-west", "eu-central", "ap-south"]
    const owners = ["NOC", "SRE", "Core", "Platform", "Payments"]
    return {
      rowId: `incident-${id}`,
      service: `service-${(id % 23) + 1}`,
      owner: owners[id % owners.length] ?? "NOC",
      region: regions[id % regions.length] ?? "us-east",
      severity: severity[id % severity.length] ?? "medium",
      latencyMs: 40 + ((id * 17) % 260),
      updatedAt: new Date(Date.UTC(2026, 1, 1 + (id % 28), id % 24, (id * 7) % 60)).toISOString(),
    }
  }),
)

const pageSize = ref(25)
const targetPage = ref(1)
const status = ref("Pagination scenario ready")
const paginationState = ref<DataGridPaginationSnapshot | null>(null)
const gridRef = ref<GridRefShape | null>(null)

const syncPaginationState = () => {
  const snapshot = gridRef.value?.api?.getPaginationSnapshot?.()
  if (!snapshot) {
    paginationState.value = null
    return
  }
  paginationState.value = snapshot
  pageSize.value = snapshot.enabled ? snapshot.pageSize : 0
  targetPage.value = snapshot.currentPage + 1
}

const setPageSizeValue = (nextPageSize: number | null) => {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  api.setPageSize(nextPageSize)
  api.setCurrentPage(0)
  syncPaginationState()
  status.value = nextPageSize && nextPageSize > 0
    ? `Page size applied: ${nextPageSize}`
    : "Pagination disabled"
}

const goToPage = (pageOneBased: number) => {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  api.setCurrentPage(Math.max(0, pageOneBased - 1))
  syncPaginationState()
  const snapshot = paginationState.value
  if (!snapshot) {
    return
  }
  status.value = `Page ${snapshot.currentPage + 1} / ${Math.max(snapshot.pageCount, 1)}`
}

const previousPage = () => {
  const snapshot = paginationState.value
  if (!snapshot) {
    return
  }
  goToPage(snapshot.currentPage)
}

const nextPage = () => {
  const snapshot = paginationState.value
  if (!snapshot) {
    return
  }
  goToPage(snapshot.currentPage + 2)
}

const refreshRoundtrip = () => {
  const api = gridRef.value?.api
  const snapshot = paginationState.value
  if (!api || !snapshot) {
    return
  }
  api.setPagination({
    pageSize: snapshot.pageSize,
    currentPage: snapshot.currentPage,
  })
  api.refreshRows("manual")
  syncPaginationState()
  status.value = "Snapshot roundtrip applied without state drift"
}

onMounted(() => {
  nextTick(() => {
    setPageSizeValue(pageSize.value)
    syncPaginationState()
  })
})
</script>

<template>
  <section class="datagrid-musthave-pagination">
    <header class="datagrid-musthave-pagination__header">
      <p class="datagrid-musthave-pagination__eyebrow">DataGrid Must-Have · Scenario 01</p>
      <h1>Pagination API (RowModel Snapshot Roundtrip)</h1>
      <p>
        Проверка контракта `pageSize/currentPage` в `rowModel/api`: page-local rows, стабильный snapshot, ручной refresh.
      </p>
      <div class="datagrid-musthave-pagination__links">
        <RouterLink to="/datagrid">Internal DataGrid</RouterLink>
        <RouterLink to="/datagrid/must-have/filtering">Filtering scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/column-state">Column state scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/reorder">Reorder scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/row-height">Row-height scenario</RouterLink>
        <RouterLink to="/datagrid/sugar">Sugar DataGrid</RouterLink>
      </div>
    </header>

    <div class="datagrid-musthave-pagination__layout">
      <aside class="datagrid-musthave-pagination__controls">
        <h2>Controls</h2>

        <label>
          <span>Page size</span>
          <select :value="pageSize" @change="setPageSizeValue(Number(($event.target as HTMLSelectElement).value))">
            <option :value="0">Disabled</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </label>

        <label>
          <span>Go to page</span>
          <div class="datagrid-musthave-pagination__row">
            <input
              v-model.number="targetPage"
              type="number"
              min="1"
              :max="Math.max(paginationState?.pageCount ?? 1, 1)"
            />
            <button type="button" @click="goToPage(targetPage)">Apply</button>
          </div>
        </label>

        <div class="datagrid-musthave-pagination__row">
          <button type="button" :disabled="(paginationState?.currentPage ?? 0) <= 0" @click="previousPage">Prev</button>
          <button
            type="button"
            :disabled="(paginationState?.currentPage ?? 0) >= Math.max((paginationState?.pageCount ?? 1) - 1, 0)"
            @click="nextPage"
          >
            Next
          </button>
        </div>

        <button type="button" @click="refreshRoundtrip">Snapshot Roundtrip + Refresh</button>

        <dl class="datagrid-musthave-pagination__metrics">
          <div>
            <dt>Total rows</dt>
            <dd>{{ paginationState?.totalRowCount ?? 0 }}</dd>
          </div>
          <div>
            <dt>Visible rows</dt>
            <dd>{{ paginationState && paginationState.startIndex >= 0 ? paginationState.endIndex - paginationState.startIndex + 1 : 0 }}</dd>
          </div>
          <div>
            <dt>Page</dt>
            <dd>{{ (paginationState?.currentPage ?? 0) + 1 }} / {{ Math.max(paginationState?.pageCount ?? 1, 1) }}</dd>
          </div>
          <div>
            <dt>Slice</dt>
            <dd>{{ paginationState?.startIndex ?? -1 }} - {{ paginationState?.endIndex ?? -1 }}</dd>
          </div>
        </dl>
      </aside>

      <main class="datagrid-musthave-pagination__grid">
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
.datagrid-musthave-pagination {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-musthave-pagination__header h1 {
  margin: 0.25rem 0;
}

.datagrid-musthave-pagination__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-pagination__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-pagination__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.datagrid-musthave-pagination__links a {
  font-size: 0.9rem;
}

.datagrid-musthave-pagination__layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 1rem;
  min-height: 560px;
}

.datagrid-musthave-pagination__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.datagrid-musthave-pagination__controls h2 {
  margin: 0;
  font-size: 1rem;
}

.datagrid-musthave-pagination__controls label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.datagrid-musthave-pagination__controls select,
.datagrid-musthave-pagination__controls input,
.datagrid-musthave-pagination__controls button {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.48rem 0.58rem;
}

.datagrid-musthave-pagination__controls button {
  cursor: pointer;
}

.datagrid-musthave-pagination__controls button:disabled {
  opacity: 0.55;
  cursor: default;
}

.datagrid-musthave-pagination__row {
  display: flex;
  gap: 0.5rem;
}

.datagrid-musthave-pagination__metrics {
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.datagrid-musthave-pagination__metrics div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.85rem;
}

.datagrid-musthave-pagination__metrics dt {
  color: var(--text-soft);
}

.datagrid-musthave-pagination__metrics dd {
  margin: 0;
  color: var(--text-primary);
}

.datagrid-musthave-pagination__grid {
  min-width: 0;
}

:deep(.affino-datagrid-simple__viewport) {
  max-height: calc(100vh - 290px);
}

@media (max-width: 1100px) {
  .datagrid-musthave-pagination__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
