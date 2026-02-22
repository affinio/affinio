<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import {
  createClientRowModel,
  createDataGridColumnModel,
  type DataGridColumnDef,
} from "@affino/datagrid-vue"
import {
  createDataGridViewportController,
  type DataGridImperativeRowUpdatePayload,
  type DataGridVirtualWindowSnapshot,
} from "@affino/datagrid-vue/advanced"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  summary: string
  lineWeight: number
}

interface VisibleRowEntry {
  rowId: string
  displayIndex: number
  data: IncidentRow
}

const columns: readonly DataGridColumnDef[] = [
  { key: "service", label: "Service", width: 200 },
  { key: "owner", label: "Owner", width: 160 },
  { key: "summary", label: "Summary", width: 560 },
]

const rows = Array.from({ length: 1800 }, (_, index) => {
  const id = index + 1
  const owners = ["NOC", "SRE", "Core", "Platform", "Payments"]
  const lineWeight = (id % 5) + 1
  const burst = "Degradation ".repeat(lineWeight)
  return {
    rowId: `incident-${id}`,
    service: `service-${(id % 57) + 1}`,
    owner: owners[id % owners.length] ?? "NOC",
    summary: `${burst} in region ${(id % 4) + 1}. Investigating queue depth and saturation.`,
    lineWeight,
  } satisfies IncidentRow
})

const viewportRef = ref<HTMLDivElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const visibleRows = ref<readonly VisibleRowEntry[]>([])
const virtualWindow = ref<DataGridVirtualWindowSnapshot | null>(null)
const renderedRange = ref<{ start: number; end: number }>({ start: 0, end: -1 })
const estimatedRowHeight = ref(38)
const rowHeightMode = ref<"auto" | "fixed">("auto")
const baseRowHeight = ref(38)
const status = ref("Row-height auto scenario ready")

const rowModel = createClientRowModel<IncidentRow>({
  rows,
  resolveRowId: row => row.rowId,
})
const columnModel = createDataGridColumnModel({ columns })

const controller = createDataGridViewportController({
  resolvePinMode: () => "none",
  rowModel,
  columnModel,
  imperativeCallbacks: {
    onRows(payload: DataGridImperativeRowUpdatePayload) {
      const nextRows = (payload.visibleRows ?? [])
        .map(entry => {
          const data = entry.row as IncidentRow
          const displayIndex = Number.isFinite(entry.displayIndex)
            ? Math.trunc(entry.displayIndex as number)
            : entry.originalIndex
          return {
            rowId: String(entry.rowId),
            displayIndex,
            data,
          } satisfies VisibleRowEntry
        })
      visibleRows.value = nextRows
      const fallbackStart = Number.isFinite(payload.startIndex) ? Math.max(0, Math.trunc(payload.startIndex)) : 0
      const fallbackEnd = Number.isFinite(payload.endIndex)
        ? Math.max(fallbackStart - 1, Math.trunc(payload.endIndex))
        : fallbackStart - 1
      const firstVisibleDisplayIndex = nextRows[0]?.displayIndex
      const lastVisibleDisplayIndex = nextRows[nextRows.length - 1]?.displayIndex
      const rangeStart = typeof firstVisibleDisplayIndex === "number" && Number.isFinite(firstVisibleDisplayIndex)
        ? Math.max(0, Math.trunc(firstVisibleDisplayIndex))
        : fallbackStart
      const rangeEnd = typeof lastVisibleDisplayIndex === "number" && Number.isFinite(lastVisibleDisplayIndex)
        ? Math.max(rangeStart - 1, Math.trunc(lastVisibleDisplayIndex))
        : fallbackEnd
      renderedRange.value = {
        start: rangeStart,
        end: rangeEnd,
      }
      if (Number.isFinite(payload.rowHeight) && payload.rowHeight > 0) {
        estimatedRowHeight.value = payload.rowHeight
      }
    },
    onWindow(payload) {
      virtualWindow.value = payload.virtualWindow
    },
  },
})

let resizeObserver: ResizeObserver | null = null

const totalRows = computed(() => virtualWindow.value?.rowTotal ?? rows.length)
const visibleStart = computed(() => virtualWindow.value?.rowStart ?? 0)
const visibleEnd = computed(() => virtualWindow.value?.rowEnd ?? Math.max(0, visibleRows.value.length - 1))
const visibleCount = computed(() => Math.max(0, visibleEnd.value - visibleStart.value + 1))
const renderedStart = computed(() => Math.max(0, renderedRange.value.start))
const renderedEnd = computed(() => Math.max(renderedStart.value - 1, renderedRange.value.end))
const renderedCount = computed(() => Math.max(0, renderedEnd.value - renderedStart.value + 1))

const spacerTopHeight = computed(() => Math.max(0, renderedStart.value * estimatedRowHeight.value))
const spacerBottomHeight = computed(() => {
  const remaining = Math.max(0, totalRows.value - renderedEnd.value - 1)
  return remaining * estimatedRowHeight.value
})

const rowHeightSnapshot = computed(() => ({
  mode: rowHeightMode.value,
  base: baseRowHeight.value,
  estimated: Number(estimatedRowHeight.value.toFixed(2)),
}))

function resolveRowVisualStyle(row: VisibleRowEntry) {
  if (rowHeightMode.value === "fixed") {
    const fixedHeight = Math.max(24, baseRowHeight.value)
    return {
      "--fixed-row-height": `${fixedHeight}px`,
      height: `${fixedHeight}px`,
      minHeight: `${fixedHeight}px`,
      maxHeight: `${fixedHeight}px`,
      paddingTop: "0px",
      paddingBottom: "0px",
      alignItems: "center",
      overflow: "hidden",
    }
  }
  const base = Math.max(2, row.data.lineWeight)
  return {
    paddingTop: `${4 + base}px`,
    paddingBottom: `${4 + base}px`,
  }
}

function syncViewportMetrics() {
  const viewport = viewportRef.value
  const header = headerRef.value
  if (!viewport || !header) {
    return
  }
  controller.setViewportMetrics({
    containerWidth: viewport.clientWidth,
    containerHeight: viewport.clientHeight,
    headerHeight: header.clientHeight,
  })
}

function onViewportScroll(event: Event) {
  controller.handleScroll(event)
}

function onToggleMode(nextMode: "auto" | "fixed") {
  rowHeightMode.value = nextMode
  status.value = nextMode === "auto"
    ? "Auto row-height mode enabled (cache + measurement)"
    : "Fixed row-height mode enabled"
}

watch(rowHeightMode, mode => {
  controller.setRowHeightMode(mode)
  controller.refresh(true)
})

watch(baseRowHeight, value => {
  controller.setBaseRowHeight(value)
  controller.refresh(true)
  status.value = `Base row height set to ${value}px`
})

onMounted(() => {
  const viewport = viewportRef.value
  const header = headerRef.value
  if (!viewport || !header) {
    return
  }
  controller.attach(viewport, header)
  controller.setBaseRowHeight(baseRowHeight.value)
  controller.setRowHeightMode(rowHeightMode.value)
  syncViewportMetrics()
  controller.refresh(true)

  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(() => {
      syncViewportMetrics()
      controller.refresh(false)
    })
    resizeObserver.observe(viewport)
    resizeObserver.observe(header)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  controller.dispose()
  rowModel.dispose()
  columnModel.dispose()
})
</script>

<template>
  <section class="datagrid-musthave-row-height">
    <header class="datagrid-musthave-row-height__header">
      <p class="datagrid-musthave-row-height__eyebrow">DataGrid Must-Have · Scenario 05</p>
      <h1>Row Height Auto Mode + Core Cache</h1>
      <p>
        Mixed-height rows under virtualization. Controller measures visible rows by `data-row-index`, stores bounded cache,
        and updates estimated row height deterministically.
      </p>
      <div class="datagrid-musthave-row-height__links">
        <RouterLink to="/datagrid/must-have/pagination">Pagination</RouterLink>
        <RouterLink to="/datagrid/must-have/filtering">Filtering</RouterLink>
        <RouterLink to="/datagrid/must-have/column-state">Column state</RouterLink>
        <RouterLink to="/datagrid/must-have/reorder">Reorder</RouterLink>
      </div>
    </header>

    <div class="datagrid-musthave-row-height__layout">
      <aside class="datagrid-musthave-row-height__controls">
        <h2>Controls</h2>
        <div class="datagrid-musthave-row-height__mode">
          <button
            type="button"
            :class="{ 'is-active': rowHeightMode === 'auto' }"
            @click="onToggleMode('auto')"
          >
            Auto
          </button>
          <button
            type="button"
            :class="{ 'is-active': rowHeightMode === 'fixed' }"
            @click="onToggleMode('fixed')"
          >
            Fixed
          </button>
        </div>

        <label>
          <span>Base row height</span>
          <input v-model.number="baseRowHeight" min="20" max="80" type="range" />
          <strong>{{ baseRowHeight }}px</strong>
        </label>

        <dl class="datagrid-musthave-row-height__metrics">
          <div>
            <dt>Total rows</dt>
            <dd>{{ totalRows }}</dd>
          </div>
          <div>
            <dt>Visible window</dt>
            <dd>{{ visibleStart + 1 }} - {{ visibleEnd + 1 }}</dd>
          </div>
          <div>
            <dt>Visible count</dt>
            <dd>{{ visibleCount }}</dd>
          </div>
          <div>
            <dt>Rendered count</dt>
            <dd>{{ renderedCount }}</dd>
          </div>
          <div>
            <dt>Estimated row height</dt>
            <dd>{{ rowHeightSnapshot.estimated }}px</dd>
          </div>
        </dl>

        <p class="datagrid-musthave-row-height__status">{{ status }}</p>
      </aside>

      <main class="datagrid-musthave-row-height__stage">
        <div ref="headerRef" class="datagrid-musthave-row-height__grid-header">
          <span class="col-service">Service</span>
          <span class="col-owner">Owner</span>
          <span class="col-summary">Summary</span>
        </div>

        <div ref="viewportRef" class="datagrid-musthave-row-height__viewport" @scroll="onViewportScroll">
          <div :style="{ height: `${spacerTopHeight}px` }"></div>

          <article
            v-for="row in visibleRows"
            :key="row.rowId"
            class="datagrid-musthave-row-height__row"
            :class="{ 'is-fixed': rowHeightMode === 'fixed' }"
            :data-row-index="row.displayIndex"
            :style="resolveRowVisualStyle(row)"
          >
            <span class="col-service">{{ row.data.service }}</span>
            <span class="col-owner">{{ row.data.owner }}</span>
            <span class="col-summary">{{ row.data.summary }}</span>
          </article>

          <div :style="{ height: `${spacerBottomHeight}px` }"></div>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.datagrid-musthave-row-height {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datagrid-musthave-row-height__header h1 {
  margin: 0.25rem 0;
}

.datagrid-musthave-row-height__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-row-height__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-row-height__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.7rem;
}

.datagrid-musthave-row-height__layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 1rem;
  min-height: 620px;
}

.datagrid-musthave-row-height__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.datagrid-musthave-row-height__controls h2 {
  margin: 0;
  font-size: 1rem;
}

.datagrid-musthave-row-height__mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.datagrid-musthave-row-height__mode button {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.45rem 0.6rem;
  cursor: pointer;
}

.datagrid-musthave-row-height__mode button.is-active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 50%, transparent);
}

.datagrid-musthave-row-height__controls label {
  display: grid;
  gap: 0.35rem;
}

.datagrid-musthave-row-height__metrics {
  margin: 0;
  display: grid;
  gap: 0.4rem;
}

.datagrid-musthave-row-height__metrics div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.86rem;
}

.datagrid-musthave-row-height__metrics dt {
  color: var(--text-soft);
}

.datagrid-musthave-row-height__metrics dd {
  margin: 0;
  font-weight: 600;
}

.datagrid-musthave-row-height__status {
  margin: 0.4rem 0 0;
  font-size: 0.82rem;
  color: var(--text-soft);
}

.datagrid-musthave-row-height__stage {
  border: 1px solid var(--glass-border);
  border-radius: 0.8rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 88%, transparent);
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.datagrid-musthave-row-height__grid-header {
  display: grid;
  grid-template-columns: 200px 160px minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--glass-border);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-soft);
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 92%, transparent);
}

.datagrid-musthave-row-height__viewport {
  overflow: auto;
  height: calc(100vh - 280px);
  min-height: 440px;
}

.datagrid-musthave-row-height__row {
  display: grid;
  grid-template-columns: 200px 160px minmax(0, 1fr);
  gap: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
  padding-inline: 0.75rem;
  font-size: 0.86rem;
}

.datagrid-musthave-row-height__row .col-service {
  font-weight: 600;
}

.datagrid-musthave-row-height__row .col-owner {
  color: var(--text-soft);
}

.datagrid-musthave-row-height__row .col-summary {
  color: var(--text-primary);
  line-height: 1.36;
  word-break: break-word;
}

.datagrid-musthave-row-height__row.is-fixed .col-summary {
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1100px) {
  .datagrid-musthave-row-height__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
