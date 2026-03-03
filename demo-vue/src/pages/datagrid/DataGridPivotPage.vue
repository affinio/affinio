<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import {
  useAffinoDataGrid,
  type DataGridAggOp,
  type DataGridColumnDef,
  type DataGridPivotLayoutSnapshot,
  type DataGridPivotSpec,
  type DataGridRowNode,
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
type PivotSubtotalPosition = "after" | "before"
type PivotGrandTotalColumnPosition = "last" | "first"

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

const rowFieldPrimary = ref<PivotField>("region")
const rowFieldSecondary = ref<PivotField>("team")
const columnField = ref<PivotField>("year")
const columnFieldSecondary = ref<PivotField>("quarter")
const valuePreset = ref<PivotValuePreset>("revenue:sum")
const columnSubtotals = ref(true)
const columnGrandTotal = ref(true)
const columnSubtotalPosition = ref<PivotSubtotalPosition>("after")
const columnGrandTotalPosition = ref<PivotGrandTotalColumnPosition>("last")
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
const initialPivotSnapshot = grid.api.rows.getSnapshot()
const rowModelRevision = ref(initialPivotSnapshot.revision ?? 0)
const pivotColumns = ref<readonly { id: string; label: string }[]>(
  (initialPivotSnapshot.pivotColumns ?? []).map(column => ({
    id: column.id,
    label: column.label,
  })),
)
const savedLayout = ref<DataGridPivotLayoutSnapshot<PivotDemoRow> | null>(null)
const drilldown = ref<{
  rowId: string | number
  columnId: string
  columnLabel: string
  valueField: string
  agg: DataGridAggOp
  cellValue: unknown
  matchCount: number
  truncated: boolean
  rows: readonly PivotDemoRow[]
} | null>(null)
const applyingImportedLayout = ref(false)

const unsubscribeRowsChanged = grid.api.events.on("rows:changed", payload => {
  const snapshot = payload.snapshot
  rowModelRevision.value = snapshot.revision ?? (rowModelRevision.value + 1)
  pivotColumns.value = (snapshot.pivotColumns ?? []).map(column => ({
    id: column.id,
    label: column.label,
  }))
})

onBeforeUnmount(() => {
  unsubscribeRowsChanged()
})

const visibleRows = computed(() => {
  void rowModelRevision.value
  return grid.api.rows.getCount()
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

const resolveValuePreset = (value: { field: string; agg: DataGridAggOp } | undefined): PivotValuePreset => {
  if (!value) {
    return "revenue:sum"
  }
  if (value.field === "orders" && value.agg === "sum") {
    return "orders:sum"
  }
  if (value.field === "latencyMs" && value.agg === "avg") {
    return "latencyMs:avg"
  }
  return "revenue:sum"
}

const applyPivotControlsFromModel = (model: DataGridPivotSpec | null): void => {
  applyingImportedLayout.value = true
  try {
    if (!model) {
      pivotEnabled.value = false
      return
    }
    pivotEnabled.value = true
    rowFieldPrimary.value = (model.rows[0] as PivotField | undefined) ?? "region"
    rowFieldSecondary.value = (model.rows[1] as PivotField | undefined) ?? "none"
    columnField.value = (model.columns[0] as PivotField | undefined) ?? "year"
    columnFieldSecondary.value = (model.columns[1] as PivotField | undefined) ?? "none"
    valuePreset.value = resolveValuePreset(model.values[0])
    columnSubtotals.value = model.columnSubtotals === true
    columnGrandTotal.value = model.columnGrandTotal === true
    columnSubtotalPosition.value = model.columnSubtotalPosition === "before" ? "before" : "after"
    columnGrandTotalPosition.value = model.columnGrandTotalPosition === "first" ? "first" : "last"
  } finally {
    applyingImportedLayout.value = false
  }
}

const buildPivotModel = (): DataGridPivotSpec | null => {
  if (!pivotEnabled.value) {
    return null
  }
  if (rowFieldPrimary.value === "none" || columnField.value === "none") {
    return null
  }
  const value = parseValuePreset(valuePreset.value)
  const rowAxes: string[] = [rowFieldPrimary.value]
  if (
    rowFieldSecondary.value !== "none"
    && rowFieldSecondary.value !== rowFieldPrimary.value
  ) {
    rowAxes.push(rowFieldSecondary.value)
  }
  const columnAxes: string[] = [columnField.value]
  if (
    columnFieldSecondary.value !== "none"
    && columnFieldSecondary.value !== columnField.value
    && !rowAxes.includes(columnFieldSecondary.value)
  ) {
    columnAxes.push(columnFieldSecondary.value)
  }
  return {
    rows: rowAxes,
    columns: columnAxes,
    values: [{ field: value.field, agg: value.agg }],
    rowSubtotals: true,
    columnSubtotals: columnSubtotals.value,
    columnGrandTotal: columnGrandTotal.value,
    columnSubtotalPosition: columnSubtotalPosition.value,
    columnGrandTotalPosition: columnGrandTotalPosition.value,
    grandTotal: true,
  }
}

const applyPivotModel = (): void => {
  const nextModel = buildPivotModel()
  grid.api.pivot.setModel(nextModel)
  drilldown.value = null
  const visibleSourceColumns = new Set<string>(nextModel?.rows ?? [])
  for (const column of columns) {
    grid.api.columns.setVisibility(
      column.key,
      nextModel ? visibleSourceColumns.has(column.key) : true,
    )
  }
  if (!nextModel) {
    status.value = "Pivot disabled"
    return
  }
  const value = nextModel.values[0]
  status.value = `Pivot: rows=${nextModel.rows.join(",")} columns=${nextModel.columns.join(",")} value=${value?.field}:${value?.agg} columnSubtotals=${nextModel.columnSubtotals ? "on" : "off"} columnGrandTotal=${nextModel.columnGrandTotal ? "on" : "off"} subtotalPos=${nextModel.columnSubtotalPosition ?? "after"} grandTotalColPos=${nextModel.columnGrandTotalPosition ?? "last"}`
}

watch([pivotEnabled, rowFieldPrimary, rowFieldSecondary, columnField, columnFieldSecondary, valuePreset, columnSubtotals, columnGrandTotal, columnSubtotalPosition, columnGrandTotalPosition], () => {
  if (applyingImportedLayout.value) {
    return
  }
  if (pivotEnabled.value) {
    if (rowFieldSecondary.value !== "none" && rowFieldSecondary.value === rowFieldPrimary.value) {
      rowFieldSecondary.value = "none"
    }
    if (columnField.value === rowFieldPrimary.value || columnField.value === rowFieldSecondary.value) {
      const fallback = (["year", "quarter", "region", "team", "owner"] as const).find(field => {
        return field !== rowFieldPrimary.value && field !== rowFieldSecondary.value
      })
      columnField.value = fallback ?? "year"
    }
    if (columnFieldSecondary.value !== "none") {
      const blocked = new Set<string>([rowFieldPrimary.value, rowFieldSecondary.value, columnField.value].filter(Boolean))
      if (blocked.has(columnFieldSecondary.value)) {
        const fallback = (["quarter", "year", "region", "team", "owner"] as const).find(field => {
          return !blocked.has(field)
        })
        columnFieldSecondary.value = fallback ?? "none"
      }
    }
  }
  applyPivotModel()
}, { immediate: true })

watch(rowCount, nextCount => {
  generation.value += 1
  rows.value = createRows(nextCount, generation.value)
  drilldown.value = null
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
  drilldown.value = null
  status.value = "Revenue / orders randomized"
}

const resetPivot = (): void => {
  pivotEnabled.value = true
  rowFieldPrimary.value = "region"
  rowFieldSecondary.value = "team"
  columnField.value = "year"
  columnFieldSecondary.value = "quarter"
  valuePreset.value = "revenue:sum"
  columnSubtotals.value = true
  columnGrandTotal.value = true
  columnSubtotalPosition.value = "after"
  columnGrandTotalPosition.value = "last"
  drilldown.value = null
  applyPivotModel()
}

const savePivotLayout = (): void => {
  savedLayout.value = grid.api.pivot.exportLayout()
  status.value = `Pivot layout saved (v${savedLayout.value.version})`
}

const reapplyPivotLayout = (): void => {
  if (!savedLayout.value) {
    status.value = "No saved pivot layout"
    return
  }
  const layout = savedLayout.value
  grid.api.pivot.importLayout(layout)
  applyPivotControlsFromModel(layout.pivotModel ?? null)
  drilldown.value = null
  status.value = "Saved pivot layout reapplied"
}

const formatMetricValue = (value: unknown): string => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "—"
    }
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value)
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  if (value == null) {
    return "—"
  }
  return String(value)
}

const handlePivotCellClick = (payload: {
  rowNode: DataGridRowNode<RowLike>
  rowIndex: number
  columnKey: string
  event: MouseEvent
}): void => {
  if (!pivotEnabled.value) {
    return
  }
  const pivotColumn = pivotColumns.value.find(column => column.id === payload.columnKey)
  if (!pivotColumn) {
    return
  }
  const result = grid.api.pivot.getCellDrilldown({
    rowId: payload.rowNode.rowId,
    columnId: payload.columnKey,
    limit: 60,
  })
  if (!result) {
    drilldown.value = null
    return
  }
  drilldown.value = {
    rowId: result.rowId,
    columnId: result.columnId,
    columnLabel: pivotColumn.label,
    valueField: result.valueField,
    agg: result.agg,
    cellValue: result.cellValue,
    matchCount: result.matchCount,
    truncated: result.truncated,
    rows: result.rows.map(entry => entry.data as PivotDemoRow),
  }
  status.value = `Drilldown ${pivotColumn.label}: ${result.matchCount} rows`
}

const expandPivotRows = (): void => {
  if (!pivotEnabled.value || rowFieldSecondary.value === "none") {
    return
  }
  grid.api.view.expandAllGroups()
  status.value = "Pivot row groups expanded"
}

const collapsePivotRows = (): void => {
  if (!pivotEnabled.value || rowFieldSecondary.value === "none") {
    return
  }
  grid.api.view.collapseAllGroups()
  status.value = "Pivot row groups collapsed"
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
        <RouterLink to="/datagrid/worker">Worker runtime</RouterLink>
      </div>
    </header>

    <section class="datagrid-pivot-page__workspace">
      <aside class="datagrid-pivot-page__sidebar">
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
            <select v-model="rowFieldPrimary">
              <option value="region">region</option>
              <option value="team">team</option>
              <option value="owner">owner</option>
              <option value="year">year</option>
              <option value="quarter">quarter</option>
              <option value="none">none</option>
            </select>
          </label>

          <label>
            <span>Rows axis 2</span>
            <select v-model="rowFieldSecondary">
              <option value="none">none</option>
              <option value="region">region</option>
              <option value="team">team</option>
              <option value="owner">owner</option>
              <option value="year">year</option>
              <option value="quarter">quarter</option>
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
            <span>Columns axis 2</span>
            <select v-model="columnFieldSecondary">
              <option value="none">none</option>
              <option value="quarter">quarter</option>
              <option value="year">year</option>
              <option value="region">region</option>
              <option value="team">team</option>
              <option value="owner">owner</option>
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

          <label>
            <span>Column subtotals</span>
            <select v-model="columnSubtotals">
              <option :value="true">On</option>
              <option :value="false">Off</option>
            </select>
          </label>

          <label>
            <span>Column grand total</span>
            <select v-model="columnGrandTotal">
              <option :value="true">On</option>
              <option :value="false">Off</option>
            </select>
          </label>

          <label>
            <span>Subtotal position</span>
            <select v-model="columnSubtotalPosition">
              <option value="after">after leaf columns</option>
              <option value="before">before leaf columns</option>
            </select>
          </label>

          <label>
            <span>Grand total column</span>
            <select v-model="columnGrandTotalPosition">
              <option value="last">last</option>
              <option value="first">first</option>
            </select>
          </label>

          <div class="datagrid-pivot-page__actions">
            <button type="button" @click="randomizeRevenue">Randomize values</button>
            <button type="button" @click="expandPivotRows">Expand rows</button>
            <button type="button" @click="collapsePivotRows">Collapse rows</button>
            <button type="button" @click="savePivotLayout">Save layout</button>
            <button type="button" @click="reapplyPivotLayout">Reapply layout</button>
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
            <div class="datagrid-pivot-page__metrics-status">
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

          <div class="datagrid-pivot-page__drilldown">
            <h3>Pivot cell drilldown</h3>
            <p v-if="!drilldown">Click a generated pivot cell in the grid.</p>
            <template v-else>
              <p>
                <strong>{{ drilldown.columnLabel }}</strong>
                · {{ drilldown.agg }}({{ drilldown.valueField }}) = {{ formatMetricValue(drilldown.cellValue) }}
                · matches {{ drilldown.matchCount }} rows<span v-if="drilldown.truncated"> (truncated)</span>
              </p>
              <ul>
                <li v-for="row in drilldown.rows.slice(0, 12)" :key="row.rowId">
                  {{ row.rowId }} · {{ row.region }} / {{ row.team }} / {{ row.owner }} / {{ row.year }}-{{ row.quarter }}
                  · {{ drilldown.valueField }}={{ formatMetricValue((row as Record<string, unknown>)[drilldown.valueField]) }}
                </li>
              </ul>
            </template>
          </div>
        </section>
      </aside>

      <div class="datagrid-pivot-page__stage">
        <DataGridSugarStage :grid="gridStage" :showPagination="false" :onDataCellClick="handlePivotCellClick" />
      </div>
    </section>
  </section>
</template>

<style scoped>
.datagrid-pivot-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
}

.datagrid-pivot-page__workspace {
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
}

.datagrid-pivot-page__sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
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
  grid-template-columns: minmax(0, 1fr);
  align-items: end;
  gap: 0.55rem;
  min-height: 0;
  overflow-y: auto;
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

.datagrid-pivot-page__metrics-status {
  grid-column: 1 / -1;
}

.datagrid-pivot-page__pivot-columns {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.6rem 0.7rem;
  min-height: 0;
  overflow: auto;
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

.datagrid-pivot-page__drilldown {
  margin-top: 0.6rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--glass-border);
}

.datagrid-pivot-page__drilldown h3 {
  margin: 0 0 0.32rem;
  font-size: 0.82rem;
}

.datagrid-pivot-page__drilldown p {
  margin: 0;
}

.datagrid-pivot-page__drilldown ul {
  margin-top: 0.38rem;
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
  .datagrid-pivot-page {
    grid-template-rows: auto auto minmax(0, 1fr);
  }

  .datagrid-pivot-page__workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .datagrid-pivot-page__sidebar {
    grid-template-rows: auto auto;
  }

  .datagrid-pivot-page__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
