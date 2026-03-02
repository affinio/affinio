<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import {
  useAffinoDataGrid,
  type DataGridAggOp,
  type DataGridColumnDef,
  type DataGridPivotSpec,
  type UseAffinoDataGridResult,
} from "@affino/datagrid-vue"
import DataGridSugarStage from "@/components/DataGridSugarStage.vue"

interface PivotDemoRow {
  rowId: string
  team: "core" | "payments" | "platform" | "growth"
  owner: "NOC" | "SRE" | "Payments" | "Platform"
  region: "AMER" | "EMEA" | "APAC"
  year: "2024" | "2025" | "2026"
  quarter: "Q1" | "Q2" | "Q3" | "Q4"
  orders: number
  revenue: number
  latencyMs: number
}

type RowLike = {
  rowId?: string | number
  rowKey?: string | number
}

type PivotField = "none" | "team" | "owner" | "region" | "year" | "quarter"
type PivotValuePreset = "revenue:sum" | "orders:sum" | "latencyMs:avg"

const columns: readonly DataGridColumnDef[] = [
  { key: "region", label: "Region", width: 130, pin: "left" },
  { key: "team", label: "Team", width: 140, pin: "left" },
  { key: "owner", label: "Owner", width: 140 },
  { key: "year", label: "Year", width: 110 },
  { key: "quarter", label: "Quarter", width: 110 },
  { key: "orders", label: "Orders", width: 130 },
  { key: "revenue", label: "Revenue", width: 150 },
  { key: "latencyMs", label: "Latency ms", width: 130 },
]

const TEAMS: readonly PivotDemoRow["team"][] = ["core", "payments", "platform", "growth"]
const OWNERS: readonly PivotDemoRow["owner"][] = ["NOC", "SRE", "Payments", "Platform"]
const REGIONS: readonly PivotDemoRow["region"][] = ["AMER", "EMEA", "APAC"]
const YEARS: readonly PivotDemoRow["year"][] = ["2024", "2025", "2026"]
const QUARTERS: readonly PivotDemoRow["quarter"][] = ["Q1", "Q2", "Q3", "Q4"]

const createRows = (count: number, generation = 1): PivotDemoRow[] => {
  const normalized = Math.max(60, Math.round(count))
  const rows: PivotDemoRow[] = []
  for (let index = 0; index < normalized; index += 1) {
    const seed = index + generation * 13
    // Keep pivot axes independent so region/year produce a full matrix in demos.
    const region = REGIONS[index % REGIONS.length] ?? "AMER"
    const year = YEARS[Math.floor(index / REGIONS.length) % YEARS.length] ?? "2024"
    const quarter = QUARTERS[Math.floor(index / (REGIONS.length * YEARS.length)) % QUARTERS.length] ?? "Q1"
    const team = TEAMS[(Math.floor(index / (REGIONS.length * YEARS.length * QUARTERS.length)) + generation) % TEAMS.length] ?? "core"
    const owner = OWNERS[(seed + Math.floor(index / REGIONS.length)) % OWNERS.length] ?? "NOC"
    rows.push({
      rowId: `pivot-row-${generation}-${index + 1}`,
      region,
      team,
      owner,
      year,
      quarter,
      orders: 12 + ((seed * 11) % 260),
      revenue: 1800 + ((seed * 37) % 19000),
      latencyMs: 22 + ((seed * 17) % 340),
    })
  }
  return rows
}

const rowCount = ref(480)
const generation = ref(1)
const rows = ref<PivotDemoRow[]>(createRows(rowCount.value, generation.value))

const rowField = ref<PivotField>("region")
const columnField = ref<PivotField>("year")
const valuePreset = ref<PivotValuePreset>("revenue:sum")
const pivotEnabled = ref(true)
const status = ref("Pivot active")

const grid = useAffinoDataGrid<PivotDemoRow>({
  rows,
  columns,
  initialSortState: [{ key: "revenue", direction: "desc" }],
  features: {
    selection: {
      enabled: true,
      resolveRowKey: row => {
        if (typeof row.rowId === "string" || typeof row.rowId === "number") {
          return String(row.rowId)
        }
        if (typeof (row as unknown as RowLike).rowKey === "string" || typeof (row as unknown as RowLike).rowKey === "number") {
          return String((row as unknown as RowLike).rowKey)
        }
        throw new Error("[DataGridPivotPage] Missing stable row key (rowId/rowKey).")
      },
    },
    filtering: { enabled: true },
    headerFilters: { enabled: true, maxUniqueValues: 120 },
    interactions: {
      enabled: true,
      range: { enabled: true, fill: true, move: true },
    },
    statusBar: { enabled: true },
    feedback: { enabled: true, maxEvents: 80 },
    keyboardNavigation: true,
  },
})

const gridStage = computed(() => grid as unknown as UseAffinoDataGridResult<RowLike>)
const rowModelRevision = ref(0)
const pivotColumns = ref<readonly { id: string; label: string }[]>([])

const unsubscribeRowModel = grid.rowModel.subscribe(snapshot => {
  rowModelRevision.value = snapshot.revision ?? (rowModelRevision.value + 1)
  pivotColumns.value = (snapshot.pivotColumns ?? []).map(column => ({
    id: column.id,
    label: column.label,
  }))
})

onBeforeUnmount(() => {
  unsubscribeRowModel()
})

const visibleRows = computed(() => {
  void rowModelRevision.value
  return grid.rowModel.getRowCount()
})

const previewPivotColumns = computed(() => pivotColumns.value.slice(0, 8))

const parseValuePreset = (preset: PivotValuePreset): { field: "revenue" | "orders" | "latencyMs"; agg: DataGridAggOp } => {
  if (preset === "orders:sum") {
    return { field: "orders", agg: "sum" }
  }
  if (preset === "latencyMs:avg") {
    return { field: "latencyMs", agg: "avg" }
  }
  return { field: "revenue", agg: "sum" }
}

const buildPivotModel = (): DataGridPivotSpec | null => {
  if (!pivotEnabled.value) {
    return null
  }
  if (rowField.value === "none" || columnField.value === "none") {
    return null
  }
  const value = parseValuePreset(valuePreset.value)
  return {
    rows: [rowField.value],
    columns: [columnField.value],
    values: [{ field: value.field, agg: value.agg }],
  }
}

const applyPivotModel = (): void => {
  const nextModel = buildPivotModel()
  grid.api.setPivotModel(nextModel)
  const visibleSourceColumns = new Set<string>(nextModel?.rows ?? [])
  for (const column of columns) {
    grid.api.setColumnVisibility(
      column.key,
      nextModel ? visibleSourceColumns.has(column.key) : true,
    )
  }
  if (!nextModel) {
    status.value = "Pivot disabled"
    return
  }
  const value = nextModel.values[0]
  status.value = `Pivot: rows=${nextModel.rows.join(",")} columns=${nextModel.columns.join(",")} value=${value?.field}:${value?.agg}`
}

watch([pivotEnabled, rowField, columnField, valuePreset], () => {
  if (pivotEnabled.value && rowField.value !== "none" && rowField.value === columnField.value) {
    columnField.value = columnField.value === "year" ? "quarter" : "year"
  }
  applyPivotModel()
}, { immediate: true })

watch(rowCount, nextCount => {
  generation.value += 1
  rows.value = createRows(nextCount, generation.value)
  status.value = `Dataset rebuilt: ${rows.value.length} rows`
})

const randomizeRevenue = (): void => {
  generation.value += 1
  rows.value = rows.value.map((row, index) => ({
    ...row,
    revenue: 1700 + (((index + generation.value) * 53) % 21000),
    orders: 10 + (((index + generation.value) * 9) % 280),
    latencyMs: 20 + (((index + generation.value) * 15) % 360),
  }))
  status.value = "Revenue / orders randomized"
}

const resetPivot = (): void => {
  pivotEnabled.value = true
  rowField.value = "region"
  columnField.value = "year"
  valuePreset.value = "revenue:sum"
  applyPivotModel()
}
</script>

<template>
  <section class="datagrid-pivot-page">
    <header class="datagrid-pivot-page__header">
      <div>
        <p class="datagrid-pivot-page__eyebrow">DataGrid Demo · Pivot</p>
        <h1>Pivot route (obvious business scenario)</h1>
        <p>
          Example: sales operations matrix. Configure rows, columns and aggregation live,
          then inspect generated pivot columns directly in the grid.
        </p>
      </div>
      <div class="datagrid-pivot-page__links">
        <RouterLink to="/datagrid">Main DataGrid</RouterLink>
        <RouterLink to="/datagrid/sugar">DataGrid Sugar</RouterLink>
        <RouterLink to="/datagrid/must-have/tree-data">TreeData must-have</RouterLink>
      </div>
    </header>

    <section class="datagrid-pivot-page__controls">
      <label>
        <span>Rows in source dataset</span>
        <select v-model.number="rowCount">
          <option :value="240">240</option>
          <option :value="480">480</option>
          <option :value="1200">1200</option>
        </select>
      </label>

      <label>
        <span>Pivot enabled</span>
        <select v-model="pivotEnabled">
          <option :value="true">On</option>
          <option :value="false">Off</option>
        </select>
      </label>

      <label>
        <span>Rows axis</span>
        <select v-model="rowField">
          <option value="region">region</option>
          <option value="team">team</option>
          <option value="owner">owner</option>
          <option value="year">year</option>
          <option value="quarter">quarter</option>
          <option value="none">none</option>
        </select>
      </label>

      <label>
        <span>Columns axis</span>
        <select v-model="columnField">
          <option value="year">year</option>
          <option value="quarter">quarter</option>
          <option value="region">region</option>
          <option value="team">team</option>
          <option value="owner">owner</option>
          <option value="none">none</option>
        </select>
      </label>

      <label>
        <span>Value aggregation</span>
        <select v-model="valuePreset">
          <option value="revenue:sum">revenue:sum</option>
          <option value="orders:sum">orders:sum</option>
          <option value="latencyMs:avg">latencyMs:avg</option>
        </select>
      </label>

      <div class="datagrid-pivot-page__actions">
        <button type="button" @click="randomizeRevenue">Randomize values</button>
        <button type="button" @click="resetPivot">Reset pivot preset</button>
      </div>

      <dl class="datagrid-pivot-page__metrics">
        <div>
          <dt>Visible rows</dt>
          <dd>{{ visibleRows }}</dd>
        </div>
        <div>
          <dt>Pivot columns</dt>
          <dd>{{ pivotColumns.length }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{{ status }}</dd>
        </div>
      </dl>
    </section>

    <section class="datagrid-pivot-page__pivot-columns">
      <h2>Generated pivot columns</h2>
      <p v-if="previewPivotColumns.length === 0">No pivot columns generated yet.</p>
      <ul v-else>
        <li v-for="column in previewPivotColumns" :key="column.id">{{ column.label }}</li>
      </ul>
    </section>

    <div class="datagrid-pivot-page__stage">
      <DataGridSugarStage :grid="gridStage" :showPagination="false" />
    </div>
  </section>
</template>

<style scoped>
.datagrid-pivot-page {
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
}

.datagrid-pivot-page__header h1 {
  margin: 0.2rem 0 0.35rem;
}

.datagrid-pivot-page__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-pivot-page__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-pivot-page__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.65rem;
}

.datagrid-pivot-page__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.65rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 0.55rem;
}

.datagrid-pivot-page__controls label {
  display: grid;
  gap: 0.22rem;
  font-size: 0.74rem;
  color: var(--text-soft);
}

.datagrid-pivot-page__controls select {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.48rem;
  font-size: 0.8rem;
}

.datagrid-pivot-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
}

.datagrid-pivot-page__actions button {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.52rem;
  cursor: pointer;
}

.datagrid-pivot-page__metrics {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
}

.datagrid-pivot-page__metrics div {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  padding: 0.38rem 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
}

.datagrid-pivot-page__metrics dt {
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-pivot-page__metrics dd {
  margin: 0.14rem 0 0;
  font-size: 0.82rem;
  color: var(--text-primary);
}

.datagrid-pivot-page__pivot-columns {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.6rem 0.7rem;
}

.datagrid-pivot-page__pivot-columns h2 {
  margin: 0 0 0.35rem;
  font-size: 0.92rem;
}

.datagrid-pivot-page__pivot-columns p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.datagrid-pivot-page__pivot-columns ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.24rem;
}

.datagrid-pivot-page__pivot-columns li {
  border: 1px solid var(--glass-border);
  border-radius: 0.45rem;
  padding: 0.3rem 0.42rem;
  font-size: 0.74rem;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
}

.datagrid-pivot-page__stage {
  min-height: 0;
  overflow: hidden;
}

:deep(.datagrid-sugar-stage) {
  height: 100%;
}

:deep(.datagrid-sugar-stage__viewport) {
  height: 100%;
  max-height: none;
}

@media (max-width: 1280px) {
  .datagrid-pivot-page__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
