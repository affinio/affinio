<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import type { DataGridAdvancedFilterExpression, DataGridColumnDef, DataGridFilterSnapshot } from "@affino/datagrid-vue"
import { AffinoDataGridSimple } from "@affino/datagrid-vue/components"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  region: string
  severity: "critical" | "high" | "medium" | "low"
  updatedAt: string
  latencyMs: number
}

interface FilteringApi {
  getRowCount: () => number
  getRowModelSnapshot: () => { rowCount: number; filterModel: DataGridFilterSnapshot | null }
  setFilterModel: (filterModel: DataGridFilterSnapshot | null) => void
}

interface GridRefShape {
  api?: FilteringApi
}

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "service", label: "Service", width: 220 },
  { key: "owner", label: "Owner", width: 160 },
  { key: "region", label: "Region", width: 130 },
  { key: "severity", label: "Severity", width: 120 },
  { key: "latencyMs", label: "Latency", width: 120 },
  { key: "updatedAt", label: "Updated", width: 220 },
])

const regions = ["us-east", "us-west", "eu-central", "ap-south"] as const
const rows = ref<IncidentRow[]>(
  Array.from({ length: 180 }, (_, index) => {
    const id = index + 1
    const severity: IncidentRow["severity"][] = ["critical", "high", "medium", "low"]
    const owners = ["NOC", "SRE", "Core", "Platform", "Payments"]
    return {
      rowId: `row-${id}`,
      service: `service-${(id % 19) + 1}`,
      owner: owners[id % owners.length] ?? "NOC",
      region: regions[id % regions.length] ?? "us-east",
      severity: severity[id % severity.length] ?? "medium",
      latencyMs: 45 + ((id * 9) % 190),
      updatedAt: new Date(Date.UTC(2026, 0, 15 + (id % 25), id % 24, (id * 3) % 60)).toISOString(),
    }
  }),
)

const selectedRegions = ref<string[]>(["us-east", "eu-central"])
const updatedFrom = ref("2026-01-25T00:00")
const status = ref("Advanced filter scenario ready")
const visibleRows = ref(rows.value.length)
const activeFilterModel = ref<DataGridFilterSnapshot | null>(null)
const gridRef = ref<GridRefShape | null>(null)

const expressionPreview = computed(() => {
  const expression = buildExpression()
  return expression ? JSON.stringify(expression, null, 2) : "null"
})

function buildExpression(): DataGridAdvancedFilterExpression | null {
  const children: DataGridAdvancedFilterExpression[] = []
  if (selectedRegions.value.length > 0) {
    children.push({
      kind: "condition",
      key: "region",
      type: "set",
      operator: "in",
      value: [...selectedRegions.value],
    })
  }
  if (updatedFrom.value.trim().length > 0) {
    children.push({
      kind: "condition",
      key: "updatedAt",
      type: "date",
      operator: "gte",
      value: new Date(updatedFrom.value).toISOString(),
    })
  }
  if (children.length === 0) {
    return null
  }
  if (children.length === 1) {
    return children[0] ?? null
  }
  return {
    kind: "group",
    operator: "and",
    children,
  }
}

function syncFromApi() {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  visibleRows.value = api.getRowCount()
  activeFilterModel.value = api.getRowModelSnapshot().filterModel
}

function applyFilter() {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  const expression = buildExpression()
  const model: DataGridFilterSnapshot | null = expression
    ? {
        columnFilters: {},
        advancedFilters: {},
        advancedExpression: expression,
      }
    : null
  api.setFilterModel(model)
  syncFromApi()
  status.value = model ? "Advanced filter applied (set + date)" : "Filter cleared"
}

function clearFilter() {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  api.setFilterModel(null)
  syncFromApi()
  status.value = "Filter cleared"
}

function roundtripFilter() {
  const api = gridRef.value?.api
  if (!api) {
    return
  }
  const snapshotModel = api.getRowModelSnapshot().filterModel
  api.setFilterModel(snapshotModel)
  syncFromApi()
  status.value = "Snapshot roundtrip applied"
}

onMounted(() => {
  nextTick(() => {
    syncFromApi()
  })
})
</script>

<template>
  <section class="datagrid-musthave-filtering">
    <header class="datagrid-musthave-filtering__header">
      <p class="datagrid-musthave-filtering__eyebrow">DataGrid Must-Have · Scenario 02</p>
      <h1>Advanced Filtering (`set` + `date`) Roundtrip</h1>
      <p>Проверка единой AST-модели фильтра и roundtrip через `rowModelSnapshot.filterModel`.</p>
      <div class="datagrid-musthave-filtering__links">
        <RouterLink to="/datagrid/must-have/pagination">Pagination scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/column-state">Column state scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/reorder">Reorder scenario</RouterLink>
        <RouterLink to="/datagrid/must-have/row-height">Row-height scenario</RouterLink>
        <RouterLink to="/datagrid/sugar">Sugar DataGrid</RouterLink>
      </div>
    </header>

    <div class="datagrid-musthave-filtering__layout">
      <aside class="datagrid-musthave-filtering__controls">
        <h2>Filter controls</h2>

        <div class="datagrid-musthave-filtering__group">
          <p>Regions (`set`)</p>
          <label v-for="region in regions" :key="region">
            <input v-model="selectedRegions" type="checkbox" :value="region" />
            <span>{{ region }}</span>
          </label>
        </div>

        <label>
          <span>Updated from (`date >=`)</span>
          <input v-model="updatedFrom" type="datetime-local" />
        </label>

        <div class="datagrid-musthave-filtering__row">
          <button type="button" @click="applyFilter">Apply</button>
          <button type="button" @click="clearFilter">Clear</button>
          <button type="button" @click="roundtripFilter">Roundtrip</button>
        </div>

        <dl class="datagrid-musthave-filtering__metrics">
          <div>
            <dt>Total rows</dt>
            <dd>{{ rows.length }}</dd>
          </div>
          <div>
            <dt>Visible rows</dt>
            <dd>{{ visibleRows }}</dd>
          </div>
        </dl>

        <div class="datagrid-musthave-filtering__preview">
          <p>Expression preview</p>
          <pre>{{ expressionPreview }}</pre>
        </div>
      </aside>

      <main class="datagrid-musthave-filtering__grid">
        <AffinoDataGridSimple
          ref="gridRef"
          v-model:rows="rows"
          v-model:status="status"
          :columns="columns"
          :features="{ selection: false, clipboard: false, editing: false }"
          :show-toolbar="false"
          @action="syncFromApi"
        />
      </main>
    </div>
  </section>
</template>

<style scoped>
.datagrid-musthave-filtering {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-musthave-filtering__header h1 {
  margin: 0.25rem 0;
}

.datagrid-musthave-filtering__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-filtering__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-filtering__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.7rem;
}

.datagrid-musthave-filtering__layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 1rem;
  min-height: 560px;
}

.datagrid-musthave-filtering__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.datagrid-musthave-filtering__controls h2 {
  margin: 0;
  font-size: 1rem;
}

.datagrid-musthave-filtering__group p {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  color: var(--text-soft);
}

.datagrid-musthave-filtering__group label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
}

.datagrid-musthave-filtering__controls input,
.datagrid-musthave-filtering__controls button {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.45rem 0.58rem;
}

.datagrid-musthave-filtering__controls button {
  cursor: pointer;
}

.datagrid-musthave-filtering__row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.datagrid-musthave-filtering__metrics {
  margin: 0;
  display: grid;
  gap: 0.35rem;
}

.datagrid-musthave-filtering__metrics div {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  font-size: 0.85rem;
}

.datagrid-musthave-filtering__metrics dt {
  color: var(--text-soft);
}

.datagrid-musthave-filtering__metrics dd {
  margin: 0;
}

.datagrid-musthave-filtering__preview p {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  color: var(--text-soft);
}

.datagrid-musthave-filtering__preview pre {
  margin: 0;
  border: 1px solid var(--glass-border);
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  padding: 0.55rem;
  font-size: 0.74rem;
  overflow: auto;
  max-height: 180px;
}

.datagrid-musthave-filtering__grid {
  min-width: 0;
}

:deep(.affino-datagrid-simple__viewport) {
  max-height: calc(100vh - 290px);
}

@media (max-width: 1100px) {
  .datagrid-musthave-filtering__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
