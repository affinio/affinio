<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import {
  createClientRowModel,
  createDataGridApi,
  createDataGridColumnModel,
  createDataGridCore,
  type DataGridColumnSnapshot,
  type DataGridRowNode,
} from "@affino/datagrid-core"

type Severity = "critical" | "high" | "medium" | "low"
type Status = "stable" | "watch" | "degraded"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  region: string
  severity: Severity
  latencyMs: number
  errorRate: number
  status: Status
}

const ROW_HEIGHT = 38
const OVERSCAN = 8

const rowCount = ref(2400)
const seed = ref(1)
const query = ref("")
const sortMode = ref("latency-desc")
const pinStatusColumn = ref(false)
const lastAction = ref("Ready")

const viewportRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(420)

const sourceRows = ref<IncidentRow[]>(buildRows(rowCount.value, seed.value))

const rowModel = createClientRowModel<IncidentRow>({ rows: [] })
const columnModel = createDataGridColumnModel({
  columns: [
    { key: "service", label: "Service", width: 240, pin: "left" },
    { key: "owner", label: "Owner", width: 180 },
    { key: "region", label: "Region", width: 130 },
    { key: "severity", label: "Severity", width: 130 },
    { key: "latencyMs", label: "Latency (ms)", width: 130 },
    { key: "errorRate", label: "Errors / h", width: 130 },
    { key: "status", label: "Status", width: 130 },
  ],
})
const core = createDataGridCore({
  services: {
    rowModel: { name: "rowModel", model: rowModel },
    columnModel: { name: "columnModel", model: columnModel },
    viewport: {
      name: "viewport",
      setViewportRange(range) {
        rowModel.setViewportRange(range)
      },
    },
  },
})
const api = createDataGridApi({ core })

const columnSnapshot = ref(api.getColumnModelSnapshot())
const visibleRows = ref<readonly DataGridRowNode<IncidentRow>[]>([])

let unsubscribeColumns: (() => void) | null = null

const filteredAndSortedRows = computed<IncidentRow[]>(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  const filtered = normalizedQuery
    ? sourceRows.value.filter(row => matchesQuery(row, normalizedQuery))
    : sourceRows.value
  return sortRows(filtered, sortMode.value)
})

const orderedColumns = computed(() => orderColumns(columnSnapshot.value.visibleColumns))
const templateColumns = computed(() => orderedColumns.value.map(column => `${Math.max(110, column.width ?? 160)}px`).join(" "))

const stickyLeftOffsets = computed(() => {
  const offsets = new Map<string, number>()
  let offset = 0
  for (const column of orderedColumns.value) {
    if (column.pin !== "left") continue
    offsets.set(column.key, offset)
    offset += Math.max(110, column.width ?? 160)
  }
  return offsets
})

const stickyRightOffsets = computed(() => {
  const offsets = new Map<string, number>()
  let offset = 0
  for (let index = orderedColumns.value.length - 1; index >= 0; index -= 1) {
    const column = orderedColumns.value[index]
    if (!column || column.pin !== "right") continue
    offsets.set(column.key, offset)
    offset += Math.max(110, column.width ?? 160)
  }
  return offsets
})

const virtualRange = computed(() => {
  const total = filteredAndSortedRows.value.length
  if (total === 0) {
    return { start: 0, end: -1 }
  }
  const visible = Math.max(1, Math.ceil(viewportHeight.value / ROW_HEIGHT) + OVERSCAN * 2)
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN)
  const end = Math.min(total - 1, start + visible - 1)
  return { start, end }
})

const spacerTopHeight = computed(() => Math.max(0, virtualRange.value.start * ROW_HEIGHT))
const spacerBottomHeight = computed(() => {
  const total = filteredAndSortedRows.value.length
  if (total === 0 || virtualRange.value.end < virtualRange.value.start) {
    return 0
  }
  return Math.max(0, (total - (virtualRange.value.end + 1)) * ROW_HEIGHT)
})

const rangeLabel = computed(() => {
  const total = filteredAndSortedRows.value.length
  if (total === 0 || virtualRange.value.end < virtualRange.value.start) {
    return "0-0"
  }
  return `${virtualRange.value.start + 1}-${virtualRange.value.end + 1}`
})

function syncViewportHeight() {
  const element = viewportRef.value
  if (!element) return
  const height = Math.max(200, element.clientHeight - ROW_HEIGHT)
  if (height !== viewportHeight.value) {
    viewportHeight.value = height
  }
}

function syncVisibleRows() {
  const rows = filteredAndSortedRows.value
  rowModel.setRows(rows)

  if (virtualRange.value.end < virtualRange.value.start) {
    visibleRows.value = []
    return
  }

  api.setViewportRange({
    start: virtualRange.value.start,
    end: virtualRange.value.end,
  })
  visibleRows.value = api.getRowsInRange<IncidentRow>({
    start: virtualRange.value.start,
    end: virtualRange.value.end,
  })
}

function getCellStyle(columnKey: string): Record<string, string> {
  const leftOffset = stickyLeftOffsets.value.get(columnKey)
  if (typeof leftOffset === "number") {
    return { left: `${leftOffset}px` }
  }
  const rightOffset = stickyRightOffsets.value.get(columnKey)
  if (typeof rightOffset === "number") {
    return { right: `${rightOffset}px` }
  }
  return {}
}

function isStickyColumn(columnKey: string): boolean {
  return stickyLeftOffsets.value.has(columnKey) || stickyRightOffsets.value.has(columnKey)
}

function onViewportScroll(event: Event) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  scrollTop.value = target.scrollTop
}

function randomizeRuntime() {
  seed.value += 1
  sourceRows.value = sourceRows.value.map((row, index) => {
    const latencyShift = ((index + seed.value) % 7) * 5 - 12
    const nextLatency = Math.max(20, row.latencyMs + latencyShift)
    const nextErrors = Math.max(0, row.errorRate + ((index + seed.value) % 5) - 2)
    return {
      ...row,
      latencyMs: nextLatency,
      errorRate: nextErrors,
      status: resolveStatus(nextLatency, nextErrors),
    }
  })
  lastAction.value = "Applied runtime shift"
}

function resetDataset() {
  seed.value = 1
  sourceRows.value = buildRows(rowCount.value, seed.value)
  lastAction.value = "Reset dataset"
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    scrollTop.value = 0
  }
}

watch(rowCount, () => {
  sourceRows.value = buildRows(rowCount.value, seed.value)
  lastAction.value = `Regenerated ${rowCount.value} rows`
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    scrollTop.value = 0
  }
})

watch(pinStatusColumn, value => {
  api.setColumnPin("status", value ? "left" : "none")
  lastAction.value = value ? "Pinned status column" : "Unpinned status column"
})

watch(
  [filteredAndSortedRows, virtualRange],
  () => {
    syncVisibleRows()
  },
  { immediate: true },
)

onMounted(() => {
  void api.start()
  unsubscribeColumns = columnModel.subscribe(snapshot => {
    columnSnapshot.value = snapshot
  })
  syncViewportHeight()
  syncVisibleRows()
  window.addEventListener("resize", syncViewportHeight)
})

onBeforeUnmount(() => {
  unsubscribeColumns?.()
  unsubscribeColumns = null
  window.removeEventListener("resize", syncViewportHeight)
  void core.dispose()
})

function orderColumns(columns: readonly DataGridColumnSnapshot[]): DataGridColumnSnapshot[] {
  const left: DataGridColumnSnapshot[] = []
  const center: DataGridColumnSnapshot[] = []
  const right: DataGridColumnSnapshot[] = []
  for (const column of columns) {
    if (column.pin === "left") {
      left.push(column)
      continue
    }
    if (column.pin === "right") {
      right.push(column)
      continue
    }
    center.push(column)
  }
  return [...left, ...center, ...right]
}

function sortRows(rows: IncidentRow[], mode: string): IncidentRow[] {
  const next = [...rows]
  switch (mode) {
    case "latency-asc":
      return next.sort((a, b) => a.latencyMs - b.latencyMs)
    case "errors-desc":
      return next.sort((a, b) => b.errorRate - a.errorRate)
    case "service-asc":
      return next.sort((a, b) => a.service.localeCompare(b.service))
    case "latency-desc":
    default:
      return next.sort((a, b) => b.latencyMs - a.latencyMs)
  }
}

function matchesQuery(row: IncidentRow, normalizedQuery: string): boolean {
  return (
    row.service.toLowerCase().includes(normalizedQuery) ||
    row.owner.toLowerCase().includes(normalizedQuery) ||
    row.region.toLowerCase().includes(normalizedQuery) ||
    row.severity.toLowerCase().includes(normalizedQuery) ||
    row.status.toLowerCase().includes(normalizedQuery)
  )
}

function resolveStatus(latencyMs: number, errorRate: number): Status {
  if (latencyMs > 380 || errorRate > 10) return "degraded"
  if (latencyMs > 270 || errorRate > 5) return "watch"
  return "stable"
}

function formatCellValue(columnKey: string, value: unknown): string {
  if (columnKey === "latencyMs" && Number.isFinite(value)) return `${Math.round(value as number)} ms`
  if (columnKey === "errorRate" && Number.isFinite(value)) return `${Math.round(value as number)}`
  return String(value ?? "")
}

function getRowCellValue(row: IncidentRow, columnKey: string): unknown {
  return (row as Record<string, unknown>)[columnKey]
}

function buildRows(count: number, seedValue: number): IncidentRow[] {
  const services = [
    "edge-gateway",
    "identity-api",
    "billing-sync",
    "search-indexer",
    "audit-stream",
    "ops-console",
    "realtime-feed",
    "notification-router",
  ]
  const owners = ["NOC", "Infra", "Platform", "Growth", "Payments", "Data"]
  const regions = ["us-east", "us-west", "eu-central", "ap-south"]
  const severities: Severity[] = ["critical", "high", "medium", "low"]

  return Array.from({ length: count }, (_, index) => {
    const latencyMs = 110 + ((index * 31 + seedValue * 19) % 340)
    const errorRate = (index * 11 + seedValue * 7) % 14
    return {
      rowId: `incident-${seedValue}-${index + 1}`,
      service: `${services[index % services.length]}-${(index % 12) + 1}`,
      owner: owners[index % owners.length] ?? owners[0]!,
      region: regions[index % regions.length] ?? regions[0]!,
      severity: severities[(index + seedValue) % severities.length] ?? "medium",
      latencyMs,
      errorRate,
      status: resolveStatus(latencyMs, errorRate),
    }
  })
}
</script>

<template>
  <section class="datagrid-page">
    <header class="datagrid-hero">
      <div>
        <p class="datagrid-hero__eyebrow">datagrid showcase</p>
        <h2>Vue demo on headless datagrid-core</h2>
        <p>
          This playground renders a virtualized dataset through the public core API (row model + column model + grid
          api), without unstable adapter internals.
        </p>
      </div>

      <div class="datagrid-hero__chips" aria-label="Datagrid foundation">
        <span>@affino/datagrid-core</span>
        <span>createClientRowModel</span>
        <span>createDataGridApi</span>
      </div>
    </header>

    <section class="datagrid-controls" aria-label="Dataset controls">
      <label>
        <span>Rows</span>
        <select v-model.number="rowCount">
          <option :value="1200">1200</option>
          <option :value="2400">2400</option>
          <option :value="6400">6400</option>
        </select>
      </label>
      <label>
        <span>Search</span>
        <input v-model.trim="query" type="text" placeholder="service / owner / region" />
      </label>
      <label>
        <span>Sort</span>
        <select v-model="sortMode">
          <option value="latency-desc">Latency desc</option>
          <option value="latency-asc">Latency asc</option>
          <option value="errors-desc">Errors desc</option>
          <option value="service-asc">Service asc</option>
        </select>
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="pinStatusColumn" type="checkbox" />
        <span>Pin status column</span>
      </label>
      <button type="button" @click="randomizeRuntime">Runtime shift</button>
      <button type="button" class="ghost" @click="resetDataset">Reset</button>
      <p class="datagrid-controls__status">{{ lastAction }}</p>
    </section>

    <section class="datagrid-metrics" aria-label="Viewport metrics">
      <div>
        <dt>Total</dt>
        <dd>{{ sourceRows.length }}</dd>
      </div>
      <div>
        <dt>Filtered</dt>
        <dd>{{ filteredAndSortedRows.length }}</dd>
      </div>
      <div>
        <dt>Window</dt>
        <dd>{{ rangeLabel }}</dd>
      </div>
    </section>

    <section class="datagrid-stage">
      <div ref="viewportRef" class="datagrid-stage__viewport" @scroll="onViewportScroll">
        <div class="datagrid-stage__header" :style="{ gridTemplateColumns: templateColumns }">
          <div
            v-for="column in orderedColumns"
            :key="`header-${column.key}`"
            class="datagrid-stage__cell datagrid-stage__cell--header"
            :class="{ 'datagrid-stage__cell--sticky': isStickyColumn(column.key) }"
            :style="getCellStyle(column.key)"
          >
            {{ column.column.label ?? column.key }}
          </div>
        </div>

        <div :style="{ height: `${spacerTopHeight}px` }"></div>

        <div
          v-for="row in visibleRows"
          :key="row.rowId"
          class="datagrid-stage__row"
          :style="{ gridTemplateColumns: templateColumns }"
        >
          <div
            v-for="column in orderedColumns"
            :key="`${row.rowId}-${column.key}`"
            class="datagrid-stage__cell"
            :class="{
              'datagrid-stage__cell--numeric': column.key === 'latencyMs' || column.key === 'errorRate',
              'datagrid-stage__cell--status': column.key === 'status',
              'datagrid-stage__cell--sticky': isStickyColumn(column.key),
            }"
            :style="getCellStyle(column.key)"
          >
            {{ formatCellValue(column.key, getRowCellValue(row.data, column.key)) }}
          </div>
        </div>

        <div v-if="visibleRows.length === 0" class="datagrid-stage__empty">No rows matched current filters.</div>
        <div :style="{ height: `${spacerBottomHeight}px` }"></div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.datagrid-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-hero {
  display: grid;
  gap: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  background: linear-gradient(130deg, rgba(11, 18, 29, 0.94), rgba(20, 34, 58, 0.92));
  padding: 1.25rem;
}

.datagrid-hero__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-soft);
}

.datagrid-hero h2 {
  margin: 0.35rem 0;
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  color: var(--text-primary);
}

.datagrid-hero p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.datagrid-hero__chips span {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  color: var(--text-soft);
  background: rgba(255, 255, 255, 0.04);
}

.datagrid-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid var(--glass-border);
  background: rgba(9, 12, 20, 0.84);
  padding: 0.9rem;
}

.datagrid-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.datagrid-controls input,
.datagrid-controls select,
.datagrid-controls button {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
}

.datagrid-controls input {
  min-width: 210px;
}

.datagrid-controls button {
  cursor: pointer;
}

.datagrid-controls button:hover {
  border-color: var(--accent-strong);
}

.datagrid-controls button.ghost {
  background: transparent;
}

.datagrid-controls__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.datagrid-controls__toggle input {
  min-width: auto;
  width: 1rem;
  height: 1rem;
  padding: 0;
}

.datagrid-controls__status {
  margin: 0 0 0 auto;
  font-size: 0.8rem;
  color: var(--text-soft);
}

.datagrid-metrics {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.datagrid-metrics div {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: rgba(7, 10, 19, 0.86);
  padding: 0.55rem 0.8rem;
}

.datagrid-metrics dt {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--text-muted);
}

.datagrid-metrics dd {
  margin: 0.25rem 0 0;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.datagrid-stage {
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  overflow: hidden;
}

.datagrid-stage__viewport {
  max-height: 460px;
  overflow: auto;
  background: rgba(5, 8, 16, 0.95);
}

.datagrid-stage__header,
.datagrid-stage__row {
  display: grid;
  min-width: max-content;
}

.datagrid-stage__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(6, 10, 20, 0.98);
  border-bottom: 1px solid rgba(145, 170, 210, 0.22);
}

.datagrid-stage__row {
  min-height: 38px;
  border-bottom: 1px solid rgba(145, 170, 210, 0.14);
}

.datagrid-stage__cell {
  border-right: 1px solid rgba(145, 170, 210, 0.12);
  padding: 0.55rem 0.7rem;
  font-size: 0.78rem;
  color: var(--text-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(7, 10, 19, 0.92);
}

.datagrid-stage__cell:last-child {
  border-right: none;
}

.datagrid-stage__cell--header {
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-primary);
  background: rgba(11, 17, 31, 0.98);
}

.datagrid-stage__cell--numeric {
  text-align: right;
  color: #bae6fd;
}

.datagrid-stage__cell--status {
  font-weight: 600;
}

.datagrid-stage__cell--sticky {
  position: sticky;
  z-index: 12;
  background: rgba(10, 17, 30, 0.98);
  box-shadow: 1px 0 0 rgba(145, 170, 210, 0.2);
}

.datagrid-stage__empty {
  padding: 0.8rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .datagrid-controls__status {
    margin-left: 0;
    width: 100%;
  }
}
</style>
