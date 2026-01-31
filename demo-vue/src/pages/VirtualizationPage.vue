<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import {
  createAxisVirtualizer,
  type AxisVirtualizerState,
  type AxisVirtualizerStrategy,
} from "@affino/virtualization-core"

const ROW_HEIGHT = 44
const COLUMN_WIDTH = 160
const TOTAL_ROWS = 5000
const TOTAL_COLUMNS = 200

const regions = ["North America", "EMEA", "APAC", "LATAM"]
const tiers = ["Starter", "Growth", "Scale", "Enterprise"]
const healthStates = ["Stable", "Trending", "At Risk"]

interface RevenueRow {
  id: number
  company: string
  region: string
  tier: string
  mrr: number
  health: string
  rowIndex: number
}

interface GridColumn {
  id: number
  index: number
  label: string
}

interface AxisMeta {
  scrollDirection: number
}

interface AxisPayload {
  offsetPx: number
}

const dataset: RevenueRow[] = Array.from({ length: TOTAL_ROWS }, (_, index) => ({
  id: index + 1,
  rowIndex: index,
  company: `One Grid Co. ${index + 1}`,
  region: regions[index % regions.length] ?? regions[0]!,
  tier: tiers[index % tiers.length] ?? tiers[0]!,
  mrr: 1800 + Math.round(Math.sin(index / 8) * 900 + (index % 17) * 120),
  health: healthStates[index % healthStates.length] ?? healthStates[0]!,
}))

const columns: GridColumn[] = Array.from({ length: TOTAL_COLUMNS }, (_, index) => ({
  id: index + 1,
  index,
  label: index === 0 ? "Company" : `Metric ${index}`,
}))

const numberFormatter = new Intl.NumberFormat("en-US")
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function createFixedSizeStrategy(): AxisVirtualizerStrategy<AxisMeta, AxisPayload> {
  return {
    computeVisibleCount(context) {
      if (!context.virtualizationEnabled) {
        return context.totalCount
      }
      const size = Math.max(1, context.estimatedItemSize)
      const viewport = Math.max(size, context.viewportSize)
      return Math.max(1, Math.ceil(viewport / size))
    },
    clampScroll(value, context) {
      if (!context.virtualizationEnabled) {
        return 0
      }
      const safeValue = Number.isFinite(value) ? value : 0
      const size = Math.max(1, context.estimatedItemSize)
      const limit = Math.max(0, context.totalCount * size - context.viewportSize)
      if (!Number.isFinite(limit) || limit <= 0) {
        return 0
      }
      return Math.min(Math.max(0, safeValue), limit)
    },
    computeRange(offset, context, target) {
      if (!context.virtualizationEnabled) {
        target.start = 0
        target.end = context.totalCount
        target.payload = { offsetPx: 0 }
        return target
      }
      const size = Math.max(1, context.estimatedItemSize)
      const rawStart = Math.floor(offset / size) - context.overscanLeading
      const maxPoolStart = Math.max(context.totalCount - context.poolSize, 0)
      const start = Math.min(Math.max(0, rawStart), maxPoolStart)
      const end = Math.min(context.totalCount, start + context.poolSize)
      target.start = start
      target.end = end
      target.payload = { offsetPx: start * size }
      return target
    },
    getOffsetForIndex(index, context) {
      if (context.totalCount <= 0) return 0
      const size = Math.max(1, context.estimatedItemSize)
      const bounded = Math.max(0, Math.min(index, context.totalCount - 1))
      return bounded * size
    },
  }
}

function cloneState(source: AxisVirtualizerState<AxisPayload>): AxisVirtualizerState<AxisPayload> {
  return {
    ...source,
    payload: source.payload ? { ...source.payload } : source.payload,
  }
}

const verticalVirtualizer = createAxisVirtualizer<AxisMeta, AxisPayload>(
  "vertical",
  createFixedSizeStrategy(),
  { offsetPx: 0 },
)
const horizontalVirtualizer = createAxisVirtualizer<AxisMeta, AxisPayload>(
  "horizontal",
  createFixedSizeStrategy(),
  { offsetPx: 0 },
)

const verticalState = ref(cloneState(verticalVirtualizer.getState()))
const horizontalState = ref(cloneState(horizontalVirtualizer.getState()))

const virtualizationEnabled = ref(true)
const verticalOverscan = ref(12)
const horizontalOverscan = ref(8)
const viewportHeight = ref(0)
const viewportWidth = ref(0)
const scrollOffsetY = ref(0)
const scrollOffsetX = ref(0)
const scrollDirectionY = ref(0)
const scrollDirectionX = ref(0)
const viewportRef = ref<HTMLDivElement | null>(null)
const domNodeCount = ref(0)

let domMeasureFrame: number | null = null

function scheduleDomNodeCountUpdate() {
  if (typeof window === "undefined") return
  if (domMeasureFrame !== null) return
  domMeasureFrame = window.requestAnimationFrame(async () => {
    domMeasureFrame = null
    await nextTick()
    const viewport = viewportRef.value
    if (!viewport) return
    domNodeCount.value = viewport.querySelectorAll("*").length
  })
}

function syncVertical() {
  const snapshot = verticalVirtualizer.update({
    axis: "vertical",
    viewportSize: viewportHeight.value,
    scrollOffset: scrollOffsetY.value,
    virtualizationEnabled: virtualizationEnabled.value,
    estimatedItemSize: ROW_HEIGHT,
    totalCount: dataset.length,
    overscan: verticalOverscan.value,
    meta: { scrollDirection: scrollDirectionY.value },
  })
  verticalState.value = cloneState(snapshot)
  scheduleDomNodeCountUpdate()
}

function syncHorizontal() {
  const snapshot = horizontalVirtualizer.update({
    axis: "horizontal",
    viewportSize: viewportWidth.value,
    scrollOffset: scrollOffsetX.value,
    virtualizationEnabled: virtualizationEnabled.value,
    estimatedItemSize: COLUMN_WIDTH,
    totalCount: columns.length,
    overscan: horizontalOverscan.value,
    meta: { scrollDirection: scrollDirectionX.value },
  })
  horizontalState.value = cloneState(snapshot)
  scheduleDomNodeCountUpdate()
}

watch(
  () => [virtualizationEnabled.value, verticalOverscan.value, viewportHeight.value, scrollOffsetY.value, scrollDirectionY.value],
  () => {
    syncVertical()
  },
  { immediate: true },
)

watch(
  () => [virtualizationEnabled.value, horizontalOverscan.value, viewportWidth.value, scrollOffsetX.value, scrollDirectionX.value],
  () => {
    syncHorizontal()
  },
  { immediate: true },
)

function handleScroll(event: Event) {
  const target = event.currentTarget as HTMLElement
  const nextY = target.scrollTop
  const nextX = target.scrollLeft
  if (nextY !== scrollOffsetY.value) {
    scrollDirectionY.value = Math.sign(nextY - scrollOffsetY.value)
    scrollOffsetY.value = nextY
  }
  if (nextX !== scrollOffsetX.value) {
    scrollDirectionX.value = Math.sign(nextX - scrollOffsetX.value)
    scrollOffsetX.value = nextX
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const viewport = viewportRef.value
  if (!viewport) return
  viewportHeight.value = viewport.clientHeight
  viewportWidth.value = viewport.clientWidth
  scrollOffsetY.value = viewport.scrollTop
  scrollOffsetX.value = viewport.scrollLeft

  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target === viewport) {
        viewportHeight.value = entry.contentRect.height
        viewportWidth.value = entry.contentRect.width
        break
      }
    }
  })
  resizeObserver.observe(viewport)
  viewport.addEventListener("scroll", handleScroll, { passive: true })
  scheduleDomNodeCountUpdate()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  const viewport = viewportRef.value
  if (viewport) {
    viewport.removeEventListener("scroll", handleScroll)
  }
  if (domMeasureFrame !== null && typeof window !== "undefined") {
    window.cancelAnimationFrame(domMeasureFrame)
    domMeasureFrame = null
  }
})

const visibleRows = computed(() => dataset.slice(verticalState.value.startIndex, verticalState.value.endIndex))
const visibleColumns = computed(() => columns.slice(horizontalState.value.startIndex, horizontalState.value.endIndex))

const translateY = computed(() => verticalState.value.payload?.offsetPx ?? verticalState.value.startIndex * ROW_HEIGHT)
const translateX = computed(() => horizontalState.value.payload?.offsetPx ?? horizontalState.value.startIndex * COLUMN_WIDTH)

const totalHeightPx = dataset.length * ROW_HEIGHT
const totalWidthPx = columns.length * COLUMN_WIDTH

const datasetSummary = computed(() => [
  { label: "Rows", value: numberFormatter.format(dataset.length) },
  { label: "Columns", value: numberFormatter.format(columns.length) },
  { label: "Viewport", value: `${Math.round(viewportWidth.value)}px × ${Math.round(viewportHeight.value)}px` },
  { label: "Canvas", value: `${numberFormatter.format(totalWidthPx)}px × ${numberFormatter.format(totalHeightPx)}px` },
])

const rowMetrics = computed(() => [
  { label: "Row window", value: `${verticalState.value.startIndex} – ${verticalState.value.endIndex}` },
  { label: "Rendered rows", value: numberFormatter.format(verticalState.value.poolSize) },
  { label: "Row overscan", value: `${verticalState.value.overscanLeading} / ${verticalState.value.overscanTrailing}` },
  { label: "Scroll Y", value: `${Math.round(scrollOffsetY.value)}px` },
])

const columnMetrics = computed(() => [
  { label: "Column window", value: `${horizontalState.value.startIndex} – ${horizontalState.value.endIndex}` },
  { label: "Rendered columns", value: numberFormatter.format(horizontalState.value.poolSize) },
  { label: "Column overscan", value: `${horizontalState.value.overscanLeading} / ${horizontalState.value.overscanTrailing}` },
  { label: "Scroll X", value: `${Math.round(scrollOffsetX.value)}px` },
])

const virtualizationStatus = computed(() =>
  virtualizationEnabled.value ? "Virtualization enabled" : "Virtualization disabled",
)

const liveDomNodeCount = computed(() => numberFormatter.format(domNodeCount.value))

function getMetricValue(row: RevenueRow, column: GridColumn): string {
  if (column.index === 0) {
    return row.company
  }
  const delta = ((row.rowIndex + 1) * (column.index + 3)) % 37
  const metric = row.mrr + delta * 24
  return currencyFormatter.format(metric)
}
</script>

<template>
  <section class="one-grid">
    <header class="one-hero">
      <p class="one-eyebrow">One grid example</p>
      <div class="one-heading">
        <h2>Dual-axis virtualization with live metrics.</h2>
        <span class="powered-pill">Powered by @affino/virtualization-core</span>
      </div>
      <p class="one-body">
        Rows and columns share the same axis math, so a single surface can stream 5,000 × 200 cells without breaking a
        sweat. Toggle virtualization or overscan buckets and watch the render budget update in real time.
      </p>
      <div class="one-summary">
        <div v-for="metric in datasetSummary" :key="metric.label" class="summary-pill">
          <p class="summary-label">{{ metric.label }}</p>
          <p class="summary-value">{{ metric.value }}</p>
        </div>
      </div>
    </header>

    <div class="one-stage">
      <aside class="one-controls">
        <div class="control-card">
          <div class="control-header">
            <p class="control-label">Virtualization</p>
            <p class="control-status">{{ virtualizationStatus }}</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="virtualizationEnabled" />
            <span class="toggle-track">
              <span class="toggle-thumb" />
            </span>
            <span class="toggle-caption">{{ virtualizationEnabled ? "On" : "Off" }}</span>
          </label>
          <div class="toggle-alert" :class="{ 'is-critical': !virtualizationEnabled }" role="alert">
            <div class="alert-icon">⚠️</div>
            <div class="alert-copy">
              <p class="alert-title">
                {{ virtualizationEnabled ? "Keep virtualization on" : "Virtualization is off" }}
              </p>
              <p class="alert-text">
                Disabling virtualization renders 5,000 × 200 cells in one pass and will likely freeze the tab for several seconds.
              </p>
            </div>
          </div>
          <div class="dom-count">
            <p class="dom-label">Live DOM nodes</p>
            <p class="dom-value">{{ liveDomNodeCount }}</p>
          </div>
        </div>
        <div class="control-card">
          <div class="control-header">
            <p class="control-label">Row overscan</p>
            <p class="control-status">{{ verticalOverscan }} rows</p>
          </div>
          <input class="range" type="range" min="0" max="80" step="1" v-model.number="verticalOverscan" />
          <p class="range-hint">Higher values buffer rapid scroll spikes at the cost of extra DOM nodes.</p>
        </div>
        <div class="control-card">
          <div class="control-header">
            <p class="control-label">Column overscan</p>
            <p class="control-status">{{ horizontalOverscan }} cols</p>
          </div>
          <input class="range" type="range" min="0" max="40" step="1" v-model.number="horizontalOverscan" />
          <p class="range-hint">Balance horizontal velocity against the render budget.</p>
        </div>
        <div class="control-card">
          <p class="control-label">Live metrics</p>
          <dl class="metrics-grid">
            <div v-for="metric in rowMetrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ metric.value }}</dd>
            </div>
            <div v-for="metric in columnMetrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ metric.value }}</dd>
            </div>
          </dl>
        </div>
      </aside>

      <div class="one-grid-demo">
        <header class="demo-toolbar">
          <div>
            <p class="toolbar-label">Row window</p>
            <p class="toolbar-value">{{ verticalState.startIndex }} – {{ verticalState.endIndex }}</p>
          </div>
          <div>
            <p class="toolbar-label">Column window</p>
            <p class="toolbar-value">{{ horizontalState.startIndex }} – {{ horizontalState.endIndex }}</p>
          </div>
          <div>
            <p class="toolbar-label">Rendered cells</p>
            <p class="toolbar-value">{{ visibleRows.length * visibleColumns.length }}</p>
          </div>
          <div>
            <p class="toolbar-label">Overscan budget</p>
            <p class="toolbar-value">
              {{ verticalState.overscanLeading + verticalState.overscanTrailing }} rows ·
              {{ horizontalState.overscanLeading + horizontalState.overscanTrailing }} cols
            </p>
          </div>
        </header>

        <div ref="viewportRef" class="grid-viewport">
          <div class="grid-spacer" :style="{ height: `${totalHeightPx}px`, width: `${totalWidthPx}px` }">
            <div class="grid-canvas" :style="{ transform: `translate(${translateX}px, ${translateY}px)` }">
              <article
                v-for="row in visibleRows"
                :key="row.id"
                class="grid-row"
                :style="{ height: `${ROW_HEIGHT}px` }"
              >
                <div
                  v-for="column in visibleColumns"
                  :key="`${row.id}-${column.id}`"
                  class="grid-cell"
                  :style="{ width: `${COLUMN_WIDTH}px` }"
                >
                  <template v-if="column.index === 0">
                    <p class="company-name">{{ row.company }}</p>
                    <!-- <p class="company-meta">{{ getMetricTrend(row, column) }}</p> -->
                  </template>
                  <template v-else>
                    <p class="metric-value">{{ getMetricValue(row, column) }}</p>
                    <!-- <p class="metric-meta">{{ getMetricTrend(row, column) }}</p> -->
                  </template>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.one-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 1.25rem 3rem;
}

.one-hero {
  border-radius: 32px;
  padding: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--glass-border) 65%, transparent);
  background: radial-gradient(circle at 20% 20%, rgba(73, 95, 255, 0.25), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(18, 214, 255, 0.18), transparent 50%),
    color-mix(in srgb, var(--panel, #05060a) 92%, transparent);
  box-shadow: 0 40px 120px rgba(5, 6, 10, 0.45);
  color: var(--text-primary);
}

.one-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.one-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.one-heading h2 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 600;
}

.one-body {
  color: var(--text-muted);
  max-width: 760px;
  margin-bottom: 1.5rem;
}

.one-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
}

.summary-pill {
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  padding: 1rem 1.2rem;
  background: color-mix(in srgb, var(--panel, #0b0d16) 90%, transparent);
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.one-stage {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: 1.5rem;
  align-items: flex-start;
}

.one-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-card {
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--panel, #05060a) 92%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--glass-border) 35%, transparent);
}

.control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.control-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.control-status {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.toggle-track {
  width: 52px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--panel, #0b0d16) 90%, transparent);
  position: relative;
  transition: background 0.2s ease;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(120deg, var(--accent, #7b83ff), var(--accent-strong, #9b6fff));
  transition: transform 0.2s ease;
}

.toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(24px);
}

.toggle-caption {
  font-size: 0.85rem;
}

.toggle-alert {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  background: color-mix(in srgb, var(--panel, #0b0d16) 86%, transparent);
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.toggle-alert.is-critical {
  border-color: rgba(248, 113, 113, 0.8);
  box-shadow: 0 10px 30px rgba(248, 113, 113, 0.15);
}

.alert-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.alert-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.alert-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
}

.alert-text {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.toggle-alert.is-critical .alert-title {
  color: #fecdd3;
}

.dom-count {
  margin-top: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  border-top: 1px solid color-mix(in srgb, var(--glass-border) 35%, transparent);
  padding-top: 0.75rem;
}

.dom-label {
  margin: 0;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.dom-value {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

.range {
  width: 100%;
  accent-color: var(--accent, #6d7cff);
}

.range-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
}

.metrics-grid dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted);
}

.metrics-grid dd {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.one-grid-demo {
  border-radius: 32px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
  background: color-mix(in srgb, var(--panel, #05060a) 92%, transparent);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 560px;
}

.demo-toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
}

.toolbar-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.toolbar-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.grid-header {
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 55%, transparent);
  overflow: hidden;
}

.grid-header-spacer {
  position: relative;
}

.grid-header-row {
  display: flex;
  will-change: transform;
}

.grid-header-cell {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  border-right: 1px solid color-mix(in srgb, var(--glass-border) 35%, transparent);
  white-space: nowrap;
}

.grid-viewport {
  position: relative;
  overflow: auto;
  height: 100%;
  max-height: 600px;
}

.grid-spacer {
  position: relative;
}

.grid-canvas {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.grid-row {
  display: flex;
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 35%, transparent);
}

.grid-cell {
  padding: 0.75rem 1rem;
  border-right: 1px solid color-mix(in srgb, var(--glass-border) 25%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.grid-cell--pinned {
  background: color-mix(in srgb, var(--panel, #0b0d16) 85%, transparent);
  position: sticky;
  left: 0;
}

.company-name {
  margin: 0;
  font-weight: 600;
}

.company-meta,
.metric-meta {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.metric-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 960px) {
  .one-stage {
    grid-template-columns: 1fr;
  }

  .grid-header-cell,
  .grid-cell {
    padding: 0.5rem 0.75rem;
  }
}
</style>
