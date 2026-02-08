<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import AffinoSelect from "@/components/AffinoSelect.vue"
import {
  createClientRowModel,
  createDataGridApi,
  createDataGridColumnModel,
  createDataGridCore,
  type DataGridColumnSnapshot,
  type DataGridFilterSnapshot,
  type DataGridRowNode,
  type DataGridSortState,
} from "@affino/datagrid-core"

type Severity = "critical" | "high" | "medium" | "low"
type Status = "stable" | "watch" | "degraded"

interface IncidentRow {
  rowId: string
  service: string
  owner: string
  region: string
  environment: "prod" | "staging" | "dev"
  deployment: string
  severity: Severity
  latencyMs: number
  errorRate: number
  availabilityPct: number
  mttrMin: number
  cpuPct: number
  memoryPct: number
  queueDepth: number
  throughputRps: number
  sloBurnRate: number
  incidents24h: number
  runbook: string
  channel: string
  updatedAt: string
  status: Status
}

type EditableColumnKey =
  | "owner"
  | "region"
  | "environment"
  | "deployment"
  | "severity"
  | "latencyMs"
  | "errorRate"
  | "availabilityPct"
  | "mttrMin"
  | "cpuPct"
  | "memoryPct"
  | "queueDepth"
  | "throughputRps"
  | "sloBurnRate"
  | "incidents24h"
  | "channel"
  | "runbook"
  | "status"

type InlineEditorMode = "text" | "select"

interface InlineEditorState {
  rowId: string
  columnKey: EditableColumnKey
  draft: string
  mode: InlineEditorMode
}

interface CellCoord {
  rowIndex: number
  columnIndex: number
}

interface CellSelectionRange {
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
}

interface SelectionOverlaySegment {
  key: string
  mode: "scroll"
  style: {
    top: string
    left: string
    width: string
    height: string
  }
}

type ColumnFilterKind = "text" | "enum" | "number"

interface AppliedColumnFilter {
  kind: ColumnFilterKind
  operator: string
  value: string
  value2?: string
}

interface ColumnFilterDraft {
  columnKey: string
  kind: ColumnFilterKind
  operator: string
  value: string
  value2: string
}

interface ColumnResizeState {
  columnKey: string
  startClientX: number
  startWidth: number
  lastWidth: number
}

const ROW_HEIGHT = 38
const OVERSCAN = 8
const DRAG_AUTO_SCROLL_EDGE_PX = 36
const DRAG_AUTO_SCROLL_MAX_STEP_PX = 28
const AUTO_SIZE_SAMPLE_LIMIT = 260
const AUTO_SIZE_CHAR_WIDTH = 7.2
const AUTO_SIZE_HORIZONTAL_PADDING = 28
const AUTO_SIZE_MAX_WIDTH = 640

const rowCount = ref(2400)
const seed = ref(1)
const query = ref("")
const sortPreset = ref("latency-desc")
const sortState = ref<readonly DataGridSortState[]>([
  { key: "latencyMs", direction: "desc" },
])
const pinStatusColumn = ref(false)
const lastAction = ref("Ready")
const rowCountOptions = [1200, 2400, 6400] as const
const sortPresetOptions = [
  { value: "latency-desc", label: "Latency desc" },
  { value: "latency-asc", label: "Latency asc" },
  { value: "errors-desc", label: "Errors desc" },
  { value: "service-asc", label: "Service asc" },
  { value: "custom", label: "Custom" },
] as const

const NUMERIC_COLUMN_KEYS = new Set<string>([
  "latencyMs",
  "errorRate",
  "availabilityPct",
  "mttrMin",
  "cpuPct",
  "memoryPct",
  "queueDepth",
  "throughputRps",
  "sloBurnRate",
  "incidents24h",
])

const ENUM_COLUMN_KEYS = new Set<string>(["severity", "status", "environment", "region"])

const TEXT_FILTER_OPERATOR_OPTIONS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "starts-with", label: "Starts with" },
] as const

const ENUM_FILTER_OPERATOR_OPTIONS = [
  { value: "is", label: "Is" },
  { value: "is-not", label: "Is not" },
] as const

const NUMBER_FILTER_OPERATOR_OPTIONS = [
  { value: "equals", label: "=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "between", label: "Between" },
] as const

const SORT_PRESETS: Record<string, readonly DataGridSortState[]> = {
  "latency-desc": [{ key: "latencyMs", direction: "desc" }],
  "latency-asc": [{ key: "latencyMs", direction: "asc" }],
  "errors-desc": [{ key: "errorRate", direction: "desc" }],
  "service-asc": [{ key: "service", direction: "asc" }],
}

const viewportRef = ref<HTMLDivElement | null>(null)
const headerRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const scrollLeft = ref(0)
const viewportHeight = ref(420)
const viewportWidth = ref(960)
const headerHeight = ref(ROW_HEIGHT)
const selectedRowIds = ref<Set<string>>(new Set())
const inlineEditor = ref<InlineEditorState | null>(null)
const cellAnchor = ref<CellCoord | null>(null)
const cellFocus = ref<CellCoord | null>(null)
const activeCell = ref<CellCoord | null>(null)
const activeFilterColumnKey = ref<string | null>(null)
const columnFilterDraft = ref<ColumnFilterDraft | null>(null)
const appliedColumnFilters = ref<Record<string, AppliedColumnFilter>>({})
const activeColumnResize = ref<ColumnResizeState | null>(null)
const isDragSelecting = ref(false)
const dragPointer = ref<{ clientX: number; clientY: number } | null>(null)
const isFillDragging = ref(false)
const fillPointer = ref<{ clientX: number; clientY: number } | null>(null)
const fillBaseRange = ref<CellSelectionRange | null>(null)
const fillPreviewRange = ref<CellSelectionRange | null>(null)

let dragAutoScrollFrame: number | null = null
let syncVisibleRowsFrame: number | null = null
let syncVisibleRowsPending = false
let viewportMeasureFrame: number | null = null
let viewportMeasurePending = false
let cachedVirtualRange = { start: 0, end: -1 }
let lastSyncedRowsRef: readonly IncidentRow[] | null = null
let lastSyncedRangeStart = Number.NaN
let lastSyncedRangeEnd = Number.NaN
let lastDragCoord: CellCoord | null = null

const sourceRows = ref<IncidentRow[]>(buildRows(rowCount.value, seed.value))

const rowModel = createClientRowModel<IncidentRow>({ rows: [] })
const columnModel = createDataGridColumnModel({
  columns: [
    { key: "select", label: "Select", width: 58, pin: "left" },
    { key: "service", label: "Service", width: 240, pin: "left" },
    { key: "owner", label: "Owner", width: 180 },
    { key: "region", label: "Region", width: 130 },
    { key: "environment", label: "Env", width: 120 },
    { key: "deployment", label: "Deployment", width: 170 },
    { key: "severity", label: "Severity", width: 130 },
    { key: "latencyMs", label: "Latency (ms)", width: 130 },
    { key: "errorRate", label: "Errors / h", width: 130 },
    { key: "availabilityPct", label: "Availability %", width: 140 },
    { key: "mttrMin", label: "MTTR (min)", width: 130 },
    { key: "cpuPct", label: "CPU %", width: 120 },
    { key: "memoryPct", label: "Memory %", width: 130 },
    { key: "queueDepth", label: "Queue Depth", width: 140 },
    { key: "throughputRps", label: "Throughput RPS", width: 150 },
    { key: "sloBurnRate", label: "SLO Burn", width: 130 },
    { key: "incidents24h", label: "Incidents 24h", width: 150 },
    { key: "channel", label: "Channel", width: 140 },
    { key: "runbook", label: "Runbook", width: 180 },
    { key: "updatedAt", label: "Updated", width: 170 },
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

const normalizedQuickFilter = computed(() => query.value.trim().toLowerCase())
const searchableColumnKeys = computed(() =>
  columnSnapshot.value.visibleColumns
    .map(column => column.key)
    .filter(key => key !== "select"),
)
const activeColumnFilterCount = computed(() => Object.keys(appliedColumnFilters.value).length)
const hasColumnFilters = computed(() => activeColumnFilterCount.value > 0)

const filteredAndSortedRows = computed<IncidentRow[]>(() => {
  const quickFilteredRows = normalizedQuickFilter.value
    ? sourceRows.value.filter(row => matchesQuery(row, normalizedQuickFilter.value, searchableColumnKeys.value))
    : sourceRows.value
  const columnFilteredRows = hasColumnFilters.value
    ? quickFilteredRows.filter(row => rowMatchesColumnFilters(row, appliedColumnFilters.value))
    : quickFilteredRows
  return sortRows(columnFilteredRows, sortState.value)
})

const selectedCount = computed(() => selectedRowIds.value.size)
const allFilteredSelected = computed(() => {
  if (filteredAndSortedRows.value.length === 0) return false
  return filteredAndSortedRows.value.every(row => selectedRowIds.value.has(row.rowId))
})
const someFilteredSelected = computed(() => {
  if (filteredAndSortedRows.value.length === 0) return false
  return filteredAndSortedRows.value.some(row => selectedRowIds.value.has(row.rowId))
})

const orderedColumns = computed(() => orderColumns(columnSnapshot.value.visibleColumns))
const navigableColumnIndexes = computed(() =>
  orderedColumns.value
    .map((column, index) => ({ column, index }))
    .filter(entry => entry.column.key !== "select")
    .map(entry => entry.index),
)
const orderedColumnMetrics = computed(() => {
  let start = 0
  return orderedColumns.value.map((column, columnIndex) => {
    const width = resolveColumnWidth(column)
    const metric = {
      key: column.key,
      columnIndex,
      start,
      width,
      end: start + width,
    }
    start += width
    return metric
  })
})
const templateColumns = computed(() => orderedColumnMetrics.value.map(metric => `${metric.width}px`).join(" "))

const stickyLeftOffsets = computed(() => {
  const offsets = new Map<string, number>()
  let offset = 0
  for (const column of orderedColumns.value) {
    if (column.pin !== "left") continue
    offsets.set(column.key, offset)
    offset += resolveColumnWidth(column)
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
    offset += resolveColumnWidth(column)
  }
  return offsets
})

const virtualRange = computed(() => {
  const total = filteredAndSortedRows.value.length
  if (total === 0) {
    if (cachedVirtualRange.start === 0 && cachedVirtualRange.end === -1) {
      return cachedVirtualRange
    }
    cachedVirtualRange = { start: 0, end: -1 }
    return cachedVirtualRange
  }
  const visible = Math.max(1, Math.ceil(viewportHeight.value / ROW_HEIGHT) + OVERSCAN * 2)
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN)
  const end = Math.min(total - 1, start + visible - 1)
  if (cachedVirtualRange.start === start && cachedVirtualRange.end === end) {
    return cachedVirtualRange
  }
  cachedVirtualRange = { start, end }
  return cachedVirtualRange
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

const cellSelectionRange = computed<CellSelectionRange | null>(() => {
  if (!cellAnchor.value || !cellFocus.value) {
    return null
  }
  const rowMax = filteredAndSortedRows.value.length - 1
  const columnMax = orderedColumns.value.length - 1
  if (rowMax < 0 || columnMax < 0) {
    return null
  }

  const startRow = Math.max(0, Math.min(cellAnchor.value.rowIndex, cellFocus.value.rowIndex, rowMax))
  const endRow = Math.max(0, Math.min(Math.max(cellAnchor.value.rowIndex, cellFocus.value.rowIndex), rowMax))
  const startColumn = Math.max(0, Math.min(cellAnchor.value.columnIndex, cellFocus.value.columnIndex, columnMax))
  const endColumn = Math.max(0, Math.min(Math.max(cellAnchor.value.columnIndex, cellFocus.value.columnIndex), columnMax))

  return {
    startRow,
    endRow,
    startColumn,
    endColumn,
  }
})

const selectedCellsCount = computed(() => {
  const range = cellSelectionRange.value
  if (!range) return 0
  return (range.endRow - range.startRow + 1) * (range.endColumn - range.startColumn + 1)
})
const activeFilterColumnLabel = computed(() => {
  if (!activeFilterColumnKey.value) {
    return "none"
  }
  const column = columnSnapshot.value.visibleColumns.find(item => item.key === activeFilterColumnKey.value)
  return column?.column.label ?? activeFilterColumnKey.value
})
const columnFilterOperatorOptions = computed(() => {
  const draft = columnFilterDraft.value
  if (!draft) {
    return [] as readonly { value: string; label: string }[]
  }
  if (draft.kind === "number") {
    return NUMBER_FILTER_OPERATOR_OPTIONS
  }
  if (draft.kind === "enum") {
    return ENUM_FILTER_OPERATOR_OPTIONS
  }
  return TEXT_FILTER_OPERATOR_OPTIONS
})
const activeColumnFilterEnumOptions = computed(() => {
  const draft = columnFilterDraft.value
  if (!draft || draft.kind !== "enum") {
    return [] as string[]
  }
  return resolveEnumFilterOptions(draft.columnKey)
})
const canApplyActiveColumnFilter = computed(() => {
  const draft = columnFilterDraft.value
  if (!draft) {
    return false
  }
  return doesFilterDraftHaveRequiredValues(draft)
})
const isColumnResizing = computed(() => activeColumnResize.value !== null)

const isQuickFilterActive = computed(() => normalizedQuickFilter.value.length > 0)
const quickFilterStatus = computed(() => {
  if (!isQuickFilterActive.value) {
    return "Quick filter: all rows"
  }
  const displayQuery = query.value.trim()
  return `Quick filter: "${displayQuery}" · ${filteredAndSortedRows.value.length}/${sourceRows.value.length}`
})

const sortSummary = computed(() => {
  if (!sortState.value.length) {
    return "none"
  }
  return sortState.value
    .map((entry, index) => `${index + 1}:${entry.key}:${entry.direction}`)
    .join(" | ")
})

const cellAnchorLabel = computed(() => {
  if (!cellAnchor.value) return "none"
  const column = orderedColumns.value[cellAnchor.value.columnIndex]
  if (!column) return "none"
  return `R${cellAnchor.value.rowIndex + 1} · ${column.key}`
})

const activeCellLabel = computed(() => {
  if (!activeCell.value) return "none"
  const column = orderedColumns.value[activeCell.value.columnIndex]
  if (!column) return "none"
  return `R${activeCell.value.rowIndex + 1} · ${column.key}`
})

function rangesEqual(a: CellSelectionRange | null, b: CellSelectionRange | null): boolean {
  if (!a || !b) {
    return false
  }
  return (
    a.startRow === b.startRow &&
    a.endRow === b.endRow &&
    a.startColumn === b.startColumn &&
    a.endColumn === b.endColumn
  )
}

function cellCoordsEqual(a: CellCoord | null, b: CellCoord | null): boolean {
  if (!a || !b) {
    return false
  }
  return a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex
}

function snapOverlayValue(value: number): number {
  const dpr = typeof window !== "undefined" && Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0
    ? window.devicePixelRatio
    : 1
  return Math.round(value * dpr) / dpr
}

function buildScrollOverlaySegments(range: CellSelectionRange, keyPrefix: string): SelectionOverlaySegment[] {
  if (!range) {
    return []
  }
  const top = headerHeight.value + range.startRow * ROW_HEIGHT
  const height = (range.endRow - range.startRow + 1) * ROW_HEIGHT

  const segments: Array<{ start: number; end: number; mode: "pinned-left" | "scroll" }> = []
  let currentMode: "pinned-left" | "scroll" | null = null
  let currentStart = range.startColumn

  for (let index = range.startColumn; index <= range.endColumn; index += 1) {
    const column = orderedColumns.value[index]
    const mode: "pinned-left" | "scroll" = column?.pin === "left" ? "pinned-left" : "scroll"
    if (!currentMode) {
      currentMode = mode
      currentStart = index
      continue
    }
    if (mode === currentMode) {
      continue
    }
    segments.push({ start: currentStart, end: index - 1, mode: currentMode })
    currentMode = mode
    currentStart = index
  }

  if (currentMode) {
    segments.push({ start: currentStart, end: range.endColumn, mode: currentMode })
  }

  return segments
    .map(segment => {
      if (segment.mode !== "scroll") {
        return null
      }
      const startMetric = orderedColumnMetrics.value[segment.start]
      const endMetric = orderedColumnMetrics.value[segment.end]
      if (!startMetric || !endMetric) {
        return null
      }
      const left = snapOverlayValue(startMetric.start)
      const width = snapOverlayValue(endMetric.end - startMetric.start)
      const snappedTop = snapOverlayValue(top)
      const snappedHeight = snapOverlayValue(height)

      return {
        key: `${keyPrefix}-${segment.mode}-${segment.start}-${segment.end}`,
        mode: "scroll",
        style: {
          top: `${Math.max(0, snappedTop)}px`,
          left: `${Math.max(0, left)}px`,
          width: `${Math.max(1, width)}px`,
          height: `${Math.max(1, snappedHeight)}px`,
        },
      } satisfies SelectionOverlaySegment
    })
    .filter((segment): segment is SelectionOverlaySegment => segment !== null)
}

const cellSelectionOverlaySegments = computed(() => {
  const range = cellSelectionRange.value
  if (!range) {
    return [] as SelectionOverlaySegment[]
  }
  return buildScrollOverlaySegments(range, "selection")
})

const fillPreviewOverlaySegments = computed(() => {
  const preview = fillPreviewRange.value
  const base = fillBaseRange.value
  if (!preview || !base || rangesEqual(preview, base)) {
    return [] as SelectionOverlaySegment[]
  }
  return buildScrollOverlaySegments(preview, "fill-preview")
})

const visibleColumnsWindow = computed(() => {
  const columns = orderedColumnMetrics.value
  if (!columns.length) {
    return { start: 0, end: 0, total: 0, keys: "none" }
  }

  const windowStart = Math.max(0, scrollLeft.value)
  const windowEnd = windowStart + Math.max(1, viewportWidth.value)
  let offset = 0
  let startIndex = 0
  let endIndex = columns.length - 1
  let found = false

  for (let index = 0; index < columns.length; index += 1) {
    const column = columns[index]
    if (!column) continue
    const columnStart = offset
    const columnEnd = columnStart + column.width
    const intersects = columnEnd > windowStart && columnStart < windowEnd
    if (intersects && !found) {
      startIndex = index
      found = true
    }
    if (intersects) {
      endIndex = index
    }
    offset = columnEnd
  }

  if (!found) {
    startIndex = Math.max(0, columns.length - 1)
    endIndex = startIndex
  }

  return {
    start: startIndex + 1,
    end: endIndex + 1,
    total: columns.length,
    keys: columns.slice(startIndex, endIndex + 1).map(column => column.key).join(" • ") || "none",
  }
})

function syncViewportHeight() {
  const element = viewportRef.value
  if (!element) return
  const height = Math.max(200, element.clientHeight - ROW_HEIGHT)
  if (height !== viewportHeight.value) {
    viewportHeight.value = height
  }
  if (element.clientWidth !== viewportWidth.value) {
    viewportWidth.value = element.clientWidth
  }
  if (headerRef.value) {
    const measuredHeaderHeight = Math.max(1, Math.round(headerRef.value.getBoundingClientRect().height))
    if (measuredHeaderHeight !== headerHeight.value) {
      headerHeight.value = measuredHeaderHeight
    }
  }
}

function flushViewportMeasure() {
  viewportMeasureFrame = null
  viewportMeasurePending = false
  syncViewportHeight()
}

function scheduleViewportMeasure() {
  if (viewportMeasurePending) {
    return
  }
  viewportMeasurePending = true
  if (typeof window === "undefined") {
    flushViewportMeasure()
    return
  }
  viewportMeasureFrame = window.requestAnimationFrame(flushViewportMeasure)
}

function syncVisibleRows() {
  const rows = filteredAndSortedRows.value
  const range = virtualRange.value
  const hasSameRowsRef = lastSyncedRowsRef === rows
  const hasSameRange = lastSyncedRangeStart === range.start && lastSyncedRangeEnd === range.end
  if (hasSameRowsRef && hasSameRange) {
    return
  }

  if (!hasSameRowsRef) {
    rowModel.setRows(rows)
  }

  if (range.end < range.start) {
    visibleRows.value = []
    lastSyncedRowsRef = rows
    lastSyncedRangeStart = range.start
    lastSyncedRangeEnd = range.end
    return
  }

  api.setViewportRange({
    start: range.start,
    end: range.end,
  })
  visibleRows.value = api.getRowsInRange<IncidentRow>({
    start: range.start,
    end: range.end,
  })
  lastSyncedRowsRef = rows
  lastSyncedRangeStart = range.start
  lastSyncedRangeEnd = range.end
}

function flushVisibleRowsSync() {
  syncVisibleRowsFrame = null
  syncVisibleRowsPending = false
  syncVisibleRows()
}

function scheduleVisibleRowsSync() {
  if (syncVisibleRowsPending) {
    return
  }
  syncVisibleRowsPending = true
  if (typeof window === "undefined") {
    flushVisibleRowsSync()
    return
  }
  syncVisibleRowsFrame = window.requestAnimationFrame(flushVisibleRowsSync)
}

function resetVisibleRowsSyncCache() {
  lastSyncedRowsRef = null
  lastSyncedRangeStart = Number.NaN
  lastSyncedRangeEnd = Number.NaN
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

function isSortableColumn(columnKey: string): boolean {
  return columnKey !== "select"
}

function getSortEntry(columnKey: string): { entry: DataGridSortState; index: number } | null {
  const index = sortState.value.findIndex(entry => entry.key === columnKey)
  if (index < 0) {
    return null
  }
  const entry = sortState.value[index]
  if (!entry) {
    return null
  }
  return { entry, index }
}

function getHeaderSortDirection(columnKey: string): "asc" | "desc" | null {
  return getSortEntry(columnKey)?.entry.direction ?? null
}

function getHeaderSortPriority(columnKey: string): number | null {
  const entry = getSortEntry(columnKey)
  if (!entry) {
    return null
  }
  return entry.index + 1
}

function getHeaderAriaSort(columnKey: string): "none" | "ascending" | "descending" {
  const direction = getHeaderSortDirection(columnKey)
  if (direction === "asc") {
    return "ascending"
  }
  if (direction === "desc") {
    return "descending"
  }
  return "none"
}

function cycleDirection(current: "asc" | "desc" | null): "asc" | "desc" | null {
  if (current === null) {
    return "asc"
  }
  if (current === "asc") {
    return "desc"
  }
  return null
}

function applySortFromHeader(columnKey: string, keepExisting: boolean) {
  if (!isSortableColumn(columnKey)) {
    return
  }
  const existing = getSortEntry(columnKey)
  const nextDirection = cycleDirection(existing?.entry.direction ?? null)
  const nextState: DataGridSortState[] = keepExisting
    ? [...sortState.value]
    : []

  if (existing) {
    nextState.splice(existing.index, 1)
  }

  if (nextDirection !== null) {
    nextState.push({ key: columnKey, direction: nextDirection })
  }

  if (nextState.length === sortState.value.length) {
    const same = nextState.every((entry, index) => {
      const previous = sortState.value[index]
      return previous?.key === entry.key && previous?.direction === entry.direction
    })
    if (same) {
      return
    }
  }

  sortState.value = nextState
}

function getColumnMinWidth(columnKey: string): number {
  if (columnKey === "select") {
    return 48
  }
  return 110
}

function clampColumnWidth(columnKey: string, width: number): number {
  return Math.max(getColumnMinWidth(columnKey), Math.min(AUTO_SIZE_MAX_WIDTH, Math.round(width)))
}

function isColumnResizable(columnKey: string): boolean {
  return columnKey !== "select"
}

function resolveColumnCurrentWidth(columnKey: string): number {
  const column = columnSnapshot.value.visibleColumns.find(entry => entry.key === columnKey)
  if (!column) {
    return getColumnMinWidth(columnKey)
  }
  return resolveColumnWidth(column)
}

function setColumnWidth(columnKey: string, width: number) {
  api.setColumnWidth(columnKey, clampColumnWidth(columnKey, width))
}

function sampleRowsForAutoSize(rows: readonly IncidentRow[], maxSamples: number): readonly IncidentRow[] {
  if (rows.length <= maxSamples) {
    return rows
  }
  const sample: IncidentRow[] = []
  const step = (rows.length - 1) / Math.max(1, maxSamples - 1)
  for (let index = 0; index < maxSamples; index += 1) {
    const row = rows[Math.round(index * step)]
    if (row) {
      sample.push(row)
    }
  }
  return sample
}

function estimateColumnAutoWidth(columnKey: string): number {
  const column = orderedColumns.value.find(entry => entry.key === columnKey)
  if (!column) {
    return getColumnMinWidth(columnKey)
  }
  const rows = sampleRowsForAutoSize(filteredAndSortedRows.value, AUTO_SIZE_SAMPLE_LIMIT)
  let maxTextLength = String(column.column.label ?? columnKey).length
  for (const row of rows) {
    const text = formatCellValue(columnKey, getRowCellValue(row, columnKey))
    if (text.length > maxTextLength) {
      maxTextLength = text.length
    }
  }
  const estimated = maxTextLength * AUTO_SIZE_CHAR_WIDTH + AUTO_SIZE_HORIZONTAL_PADDING
  return clampColumnWidth(columnKey, estimated)
}

function onHeaderResizeHandleMouseDown(columnKey: string, event: MouseEvent) {
  if (event.button !== 0 || !isColumnResizable(columnKey)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  if (isFillDragging.value) {
    stopFillSelection(false)
  }
  if (isDragSelecting.value) {
    stopDragSelection()
  }
  const startWidth = resolveColumnCurrentWidth(columnKey)
  activeColumnResize.value = {
    columnKey,
    startClientX: event.clientX,
    startWidth,
    lastWidth: startWidth,
  }
}

function onHeaderResizeHandleDoubleClick(columnKey: string, event: MouseEvent) {
  if (!isColumnResizable(columnKey)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  const nextWidth = estimateColumnAutoWidth(columnKey)
  setColumnWidth(columnKey, nextWidth)
  lastAction.value = `Auto-sized ${columnKey} to ${nextWidth}px`
}

function applyColumnResizeFromPointer(clientX: number) {
  const state = activeColumnResize.value
  if (!state) {
    return
  }
  const delta = clientX - state.startClientX
  const nextWidth = clampColumnWidth(state.columnKey, state.startWidth + delta)
  if (nextWidth === state.lastWidth) {
    return
  }
  setColumnWidth(state.columnKey, nextWidth)
  activeColumnResize.value = {
    ...state,
    lastWidth: nextWidth,
  }
}

function stopColumnResize() {
  const state = activeColumnResize.value
  if (!state) {
    return
  }
  activeColumnResize.value = null
  lastAction.value = `Resized ${state.columnKey} to ${state.lastWidth}px`
}

function onHeaderCellClick(columnKey: string, event: MouseEvent) {
  if (!isSortableColumn(columnKey)) {
    return
  }
  applySortFromHeader(columnKey, event.shiftKey)
}

function onHeaderCellKeyDown(columnKey: string, event: KeyboardEvent) {
  if (!isSortableColumn(columnKey)) {
    return
  }
  if (event.key !== "Enter" && event.key !== " ") {
    return
  }
  event.preventDefault()
  applySortFromHeader(columnKey, event.shiftKey)
}

function resolveColumnFilterKind(columnKey: string): ColumnFilterKind {
  if (ENUM_COLUMN_KEYS.has(columnKey)) {
    return "enum"
  }
  if (NUMERIC_COLUMN_KEYS.has(columnKey)) {
    return "number"
  }
  return "text"
}

function defaultFilterOperator(kind: ColumnFilterKind): string {
  if (kind === "number") return "equals"
  if (kind === "enum") return "is"
  return "contains"
}

function resolveEnumFilterOptions(columnKey: string): string[] {
  const editorOptions = getEditorOptions(columnKey)
  if (editorOptions && editorOptions.length) {
    return [...editorOptions]
  }
  const values = new Set<string>()
  for (const row of sourceRows.value) {
    const value = getRowCellValue(row, columnKey)
    if (typeof value === "undefined" || value === null) {
      continue
    }
    values.add(String(value))
  }
  return [...values].sort((left, right) => left.localeCompare(right))
}

function isColumnFilterActive(columnKey: string): boolean {
  return Boolean(appliedColumnFilters.value[columnKey])
}

function openColumnFilter(columnKey: string) {
  if (columnKey === "select") {
    return
  }
  const kind = resolveColumnFilterKind(columnKey)
  const current = appliedColumnFilters.value[columnKey]
  const enumOptions = kind === "enum" ? resolveEnumFilterOptions(columnKey) : []
  const draftValue = current?.value ?? (enumOptions[0] ?? "")
  const draftValue2 = current?.value2 ?? ""
  columnFilterDraft.value = {
    columnKey,
    kind,
    operator: current?.operator ?? defaultFilterOperator(kind),
    value: draftValue,
    value2: draftValue2,
  }
  activeFilterColumnKey.value = columnKey
}

function onHeaderFilterTriggerClick(columnKey: string) {
  if (activeFilterColumnKey.value === columnKey) {
    closeColumnFilterPanel()
    return
  }
  openColumnFilter(columnKey)
}

function closeColumnFilterPanel() {
  activeFilterColumnKey.value = null
  columnFilterDraft.value = null
}

function onFilterOperatorChange(value: string | number) {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  const nextOperator = String(value)
  columnFilterDraft.value = {
    ...draft,
    operator: nextOperator,
    value2: doesOperatorNeedSecondValue(draft.kind, nextOperator) ? draft.value2 : "",
  }
}

function onFilterEnumValueChange(value: string | number) {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  columnFilterDraft.value = {
    ...draft,
    value: String(value),
  }
}

function onFilterValueInput(event: Event) {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  columnFilterDraft.value = {
    ...draft,
    value: (event.target as HTMLInputElement).value,
  }
}

function onFilterSecondValueInput(event: Event) {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  columnFilterDraft.value = {
    ...draft,
    value2: (event.target as HTMLInputElement).value,
  }
}

function doesOperatorNeedSecondValue(kind: ColumnFilterKind, operator: string): boolean {
  return kind === "number" && operator === "between"
}

function doesFilterDraftHaveRequiredValues(draft: ColumnFilterDraft): boolean {
  if (!draft.value.trim()) {
    return false
  }
  if (doesOperatorNeedSecondValue(draft.kind, draft.operator) && !draft.value2.trim()) {
    return false
  }
  return true
}

function applyActiveColumnFilter() {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  const next = { ...appliedColumnFilters.value }
  if (!doesFilterDraftHaveRequiredValues(draft)) {
    delete next[draft.columnKey]
    appliedColumnFilters.value = next
    lastAction.value = `Cleared filter for ${draft.columnKey}`
    closeColumnFilterPanel()
    return
  }
  next[draft.columnKey] = {
    kind: draft.kind,
    operator: draft.operator,
    value: draft.value.trim(),
    value2: draft.value2.trim() || undefined,
  }
  appliedColumnFilters.value = next
  lastAction.value = `Filter applied: ${draft.columnKey}`
  closeColumnFilterPanel()
}

function resetActiveColumnFilter() {
  const draft = columnFilterDraft.value
  if (!draft) {
    return
  }
  const next = { ...appliedColumnFilters.value }
  delete next[draft.columnKey]
  appliedColumnFilters.value = next
  lastAction.value = `Filter reset: ${draft.columnKey}`
  closeColumnFilterPanel()
}

function clearAllColumnFilters() {
  if (!Object.keys(appliedColumnFilters.value).length) {
    closeColumnFilterPanel()
    return
  }
  appliedColumnFilters.value = {}
  lastAction.value = "All column filters cleared"
  closeColumnFilterPanel()
}

function buildFilterSnapshot(filters: Record<string, AppliedColumnFilter>): DataGridFilterSnapshot | null {
  const keys = Object.keys(filters)
  if (!keys.length) {
    return null
  }
  return {
    columnFilters: {},
    advancedFilters: Object.fromEntries(
      keys.map(key => {
        const filter = filters[key]
        const type = filter?.kind === "number" ? "number" : "text"
        return [
          key,
          {
            type,
            clauses: [
              {
                operator: filter?.operator ?? "equals",
                value: filter?.value ?? "",
                value2: filter?.value2,
              },
            ],
          },
        ]
      }),
    ),
  }
}

function matchTextFilter(value: unknown, operator: string, rawExpected: string): boolean {
  const haystack = String(value ?? "").toLowerCase()
  const expected = rawExpected.toLowerCase()
  if (operator === "equals") {
    return haystack === expected
  }
  if (operator === "starts-with") {
    return haystack.startsWith(expected)
  }
  return haystack.includes(expected)
}

function matchEnumFilter(value: unknown, operator: string, rawExpected: string): boolean {
  const current = String(value ?? "").toLowerCase()
  const expected = rawExpected.toLowerCase()
  if (operator === "is-not") {
    return current !== expected
  }
  return current === expected
}

function matchNumberFilter(value: unknown, operator: string, rawExpected: string, rawExpected2?: string): boolean {
  const current = Number(value)
  const expected = Number(rawExpected)
  if (!Number.isFinite(current) || !Number.isFinite(expected)) {
    return false
  }

  if (operator === "gt") return current > expected
  if (operator === "gte") return current >= expected
  if (operator === "lt") return current < expected
  if (operator === "lte") return current <= expected
  if (operator === "between") {
    const second = Number(rawExpected2)
    if (!Number.isFinite(second)) {
      return false
    }
    const lower = Math.min(expected, second)
    const upper = Math.max(expected, second)
    return current >= lower && current <= upper
  }
  return current === expected
}

function rowMatchesColumnFilters(row: IncidentRow, filters: Record<string, AppliedColumnFilter>): boolean {
  for (const [columnKey, filter] of Object.entries(filters)) {
    const value = getRowCellValue(row, columnKey)
    if (filter.kind === "number") {
      if (!matchNumberFilter(value, filter.operator, filter.value, filter.value2)) {
        return false
      }
      continue
    }
    if (filter.kind === "enum") {
      if (!matchEnumFilter(value, filter.operator, filter.value)) {
        return false
      }
      continue
    }
    if (!matchTextFilter(value, filter.operator, filter.value)) {
      return false
    }
  }
  return true
}

function resolveColumnWidth(column: DataGridColumnSnapshot): number {
  if (column.key === "select") {
    return Math.max(48, column.width ?? 58)
  }
  return Math.max(110, column.width ?? 160)
}

function isEditableColumn(columnKey: string): columnKey is EditableColumnKey {
  return [
    "owner",
    "region",
    "environment",
    "deployment",
    "severity",
    "latencyMs",
    "errorRate",
    "availabilityPct",
    "mttrMin",
    "cpuPct",
    "memoryPct",
    "queueDepth",
    "throughputRps",
    "sloBurnRate",
    "incidents24h",
    "channel",
    "runbook",
    "status",
  ].includes(columnKey)
}

function getEditorOptions(columnKey: string): readonly string[] | null {
  if (columnKey === "severity") return ["critical", "high", "medium", "low"]
  if (columnKey === "status") return ["stable", "watch", "degraded"]
  if (columnKey === "environment") return ["prod", "staging", "dev"]
  if (columnKey === "region") return ["us-east", "us-west", "eu-central", "ap-south"]
  return null
}

function isEnumColumn(columnKey: string): columnKey is Extract<EditableColumnKey, "severity" | "status" | "environment" | "region"> {
  return columnKey === "severity" || columnKey === "status" || columnKey === "environment" || columnKey === "region"
}

function isEditingCell(rowId: string, columnKey: string): boolean {
  return inlineEditor.value?.rowId === rowId && inlineEditor.value?.columnKey === columnKey
}

function updateEditorDraft(value: string) {
  if (!inlineEditor.value) return
  inlineEditor.value = { ...inlineEditor.value, draft: value }
}

function onEditorInput(event: Event) {
  updateEditorDraft((event.target as HTMLInputElement).value)
}

function onEditorAffinoSelectChange(value: string | number) {
  updateEditorDraft(String(value))
  commitInlineEdit()
}

function onSelectAllChange(event: Event) {
  toggleSelectAllFiltered((event.target as HTMLInputElement).checked)
}

function onRowSelectChange(rowId: string, event: Event) {
  toggleRowSelection(rowId, (event.target as HTMLInputElement).checked)
}

function clearQuickFilter() {
  if (!query.value) {
    return
  }
  query.value = ""
  lastAction.value = "Quick filter cleared"
}

function beginInlineEdit(
  row: IncidentRow,
  columnKey: string,
  mode: InlineEditorMode = "text",
  openPicker = false,
) {
  if (!isEditableColumn(columnKey)) return
  inlineEditor.value = {
    rowId: row.rowId,
    columnKey,
    draft: String(getRowCellValue(row, columnKey) ?? ""),
    mode,
  }
  lastAction.value = mode === "select"
    ? `Selecting ${columnKey} for ${row.service}`
    : `Editing ${columnKey} for ${row.service}`
  void focusInlineEditorElement(row.rowId, columnKey, mode, openPicker)
}

async function focusInlineEditorElement(
  rowId: string,
  columnKey: EditableColumnKey,
  mode: InlineEditorMode,
  openPicker: boolean,
) {
  await nextTick()
  const viewport = viewportRef.value
  if (!viewport) return
  const selector = `[data-inline-editor-row-id="${rowId}"][data-inline-editor-column-key="${columnKey}"]`
  const editorHost = viewport.querySelector(selector) as HTMLElement | null
  if (!editorHost) return
  const editor = editorHost.matches("input,textarea,select,button,[tabindex]")
    ? editorHost
    : (editorHost.querySelector("input,textarea,select,button,[tabindex]") as HTMLElement | null)
  if (!editor) return
  editor.focus()
  if (editor instanceof HTMLInputElement) {
    editor.select()
    return
  }
  if (mode === "select" && openPicker) {
    try {
      editor.click()
    } catch {
      // Ignore click-open failures for synthetic editors.
    }
  }
}

function cancelInlineEdit() {
  if (!inlineEditor.value) return
  inlineEditor.value = null
  lastAction.value = "Edit canceled"
}

function commitInlineEdit(): boolean {
  if (!inlineEditor.value) return false
  const editor = inlineEditor.value
  const nextDraft = editor.draft.trim()
  inlineEditor.value = null

  let updated = false
  sourceRows.value = sourceRows.value.map(row => {
    if (row.rowId !== editor.rowId) return row
    const nextRow = { ...row } as IncidentRow
    applyEditedValue(nextRow, editor.columnKey, nextDraft)
    if (editor.columnKey === "latencyMs" || editor.columnKey === "errorRate") {
      nextRow.status = resolveStatus(nextRow.latencyMs, nextRow.errorRate)
    }
    updated = true
    return nextRow
  })

  lastAction.value = updated ? `Saved ${editor.columnKey}` : "Edit target no longer available"
  return updated
}

function resolveNextEditableTarget(
  rowId: string,
  columnKey: string,
  direction: 1 | -1,
): { rowId: string; columnKey: EditableColumnKey; rowIndex: number; columnIndex: number } | null {
  const rows = filteredAndSortedRows.value
  const rowIndex = rows.findIndex(row => row.rowId === rowId)
  if (rowIndex < 0) return null

  const editableIndexes = orderedColumns.value
    .map((column, index) => ({ column, index }))
    .filter(entry => isEditableColumn(entry.column.key))
    .map(entry => entry.index)
  if (!editableIndexes.length) {
    return null
  }

  const currentColumnIndex = resolveColumnIndex(columnKey)
  const currentEditablePosition = editableIndexes.indexOf(currentColumnIndex)
  if (currentEditablePosition < 0) {
    return null
  }

  let nextRowIndex = rowIndex
  let nextEditablePosition = currentEditablePosition + direction
  if (nextEditablePosition >= editableIndexes.length) {
    nextEditablePosition = 0
    nextRowIndex += 1
  } else if (nextEditablePosition < 0) {
    nextEditablePosition = editableIndexes.length - 1
    nextRowIndex -= 1
  }

  if (nextRowIndex < 0 || nextRowIndex >= rows.length) {
    return null
  }
  const nextColumnIndex = editableIndexes[nextEditablePosition]
  if (nextColumnIndex === undefined) {
    return null
  }
  const nextColumn = orderedColumns.value[nextColumnIndex]
  const nextRow = rows[nextRowIndex]
  if (!nextColumn || !nextRow || !isEditableColumn(nextColumn.key)) {
    return null
  }
  return {
    rowId: nextRow.rowId,
    columnKey: nextColumn.key,
    rowIndex: nextRowIndex,
    columnIndex: nextColumnIndex,
  }
}

function focusInlineEditorTarget(target: { rowId: string; columnKey: EditableColumnKey; rowIndex: number; columnIndex: number }) {
  const row = filteredAndSortedRows.value.find(entry => entry.rowId === target.rowId)
  if (!row) {
    return
  }
  applyCellSelection({ rowIndex: target.rowIndex, columnIndex: target.columnIndex }, false)
  beginInlineEdit(row, target.columnKey, isEnumColumn(target.columnKey) ? "select" : "text")
}

function onEditorKeyDown(event: KeyboardEvent, rowId: string, columnKey: string) {
  if (!isEditableColumn(columnKey)) {
    return
  }
  if (event.key === "Escape") {
    event.preventDefault()
    cancelInlineEdit()
    return
  }
  if (event.key === "Enter") {
    event.preventDefault()
    commitInlineEdit()
    return
  }
  if (event.key === "Tab") {
    event.preventDefault()
    const direction: 1 | -1 = event.shiftKey ? -1 : 1
    const target = resolveNextEditableTarget(rowId, columnKey, direction)
    commitInlineEdit()
    if (target) {
      focusInlineEditorTarget(target)
    }
  }
}

function isSelectEditorCell(rowId: string, columnKey: string): boolean {
  return isEditingCell(rowId, columnKey) && inlineEditor.value?.mode === "select" && isEnumColumn(columnKey)
}

function shouldShowEnumTrigger(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (!isEnumColumn(columnKey) || inlineEditor.value || isDragSelecting.value || isFillDragging.value) {
    return false
  }
  return isActiveCell(row, columnKey)
}

function onEnumTriggerMouseDown(row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) {
  if (!isEnumColumn(columnKey)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  const coord = resolveCellCoord(row, columnKey)
  if (coord) {
    applyCellSelection(coord, false)
  }
  beginInlineEdit(row.data, columnKey, "select", true)
}

function applyEditedValue(row: IncidentRow, columnKey: EditableColumnKey, draft: string) {
  if (columnKey === "owner") {
    row.owner = draft || row.owner
    return
  }
  if (columnKey === "deployment") {
    row.deployment = draft || row.deployment
    return
  }
  if (columnKey === "channel") {
    row.channel = draft || row.channel
    return
  }
  if (columnKey === "runbook") {
    row.runbook = draft || row.runbook
    return
  }
  if (columnKey === "region") {
    row.region = (getEditorOptions("region")?.includes(draft) ? draft : row.region) as IncidentRow["region"]
    return
  }
  if (columnKey === "environment") {
    row.environment = (getEditorOptions("environment")?.includes(draft) ? draft : row.environment) as IncidentRow["environment"]
    return
  }
  if (columnKey === "severity") {
    row.severity = (getEditorOptions("severity")?.includes(draft) ? draft : row.severity) as Severity
    return
  }
  if (columnKey === "status") {
    row.status = (getEditorOptions("status")?.includes(draft) ? draft : row.status) as Status
    return
  }

  const numericValue = Number(draft)
  if (!Number.isFinite(numericValue)) {
    return
  }

  if (columnKey === "latencyMs") row.latencyMs = Math.max(1, Math.round(numericValue))
  if (columnKey === "errorRate") row.errorRate = Math.max(0, Math.round(numericValue))
  if (columnKey === "availabilityPct") row.availabilityPct = Math.min(100, Math.max(0, numericValue))
  if (columnKey === "mttrMin") row.mttrMin = Math.max(0, Math.round(numericValue))
  if (columnKey === "cpuPct") row.cpuPct = Math.min(100, Math.max(0, Math.round(numericValue)))
  if (columnKey === "memoryPct") row.memoryPct = Math.min(100, Math.max(0, Math.round(numericValue)))
  if (columnKey === "queueDepth") row.queueDepth = Math.max(0, Math.round(numericValue))
  if (columnKey === "throughputRps") row.throughputRps = Math.max(0, Math.round(numericValue))
  if (columnKey === "sloBurnRate") row.sloBurnRate = Math.max(0, Number(numericValue.toFixed(2)))
  if (columnKey === "incidents24h") row.incidents24h = Math.max(0, Math.round(numericValue))
}

function isRowSelected(rowId: string): boolean {
  return selectedRowIds.value.has(rowId)
}

function toggleRowSelection(rowId: string, selected?: boolean) {
  const next = new Set(selectedRowIds.value)
  const shouldSelect = typeof selected === "boolean" ? selected : !next.has(rowId)
  if (shouldSelect) {
    next.add(rowId)
  } else {
    next.delete(rowId)
  }
  selectedRowIds.value = next
}

function toggleSelectAllFiltered(selected: boolean) {
  const next = new Set(selectedRowIds.value)
  for (const row of filteredAndSortedRows.value) {
    if (selected) {
      next.add(row.rowId)
    } else {
      next.delete(row.rowId)
    }
  }
  selectedRowIds.value = next
}

function clearCellSelection() {
  cellAnchor.value = null
  cellFocus.value = null
  activeCell.value = null
  isDragSelecting.value = false
  isFillDragging.value = false
  dragPointer.value = null
  fillPointer.value = null
  fillBaseRange.value = null
  fillPreviewRange.value = null
  lastDragCoord = null
  stopColumnResize()
  stopAutoScrollFrameIfIdle()
}

function resolveRowIndex(row: DataGridRowNode<IncidentRow>): number {
  const candidate = [row.displayIndex, row.sourceIndex, row.originalIndex].find(value => Number.isFinite(value)) ?? 0
  const rowIndex = Math.trunc(candidate)
  return Math.max(0, rowIndex)
}

function resolveColumnIndex(columnKey: string): number {
  return orderedColumns.value.findIndex(column => column.key === columnKey)
}

function clampRowIndex(rowIndex: number): number {
  const maxRowIndex = Math.max(0, filteredAndSortedRows.value.length - 1)
  return Math.max(0, Math.min(maxRowIndex, Math.trunc(rowIndex)))
}

function getFirstNavigableColumnIndex(): number {
  return navigableColumnIndexes.value[0] ?? -1
}

function getLastNavigableColumnIndex(): number {
  const indexes = navigableColumnIndexes.value
  return indexes[indexes.length - 1] ?? -1
}

function resolveNearestNavigableColumnIndex(columnIndex: number, direction: 1 | -1 = 1): number {
  const indexes = navigableColumnIndexes.value
  if (!indexes.length) {
    return -1
  }
  if (indexes.includes(columnIndex)) {
    return columnIndex
  }
  if (direction > 0) {
    return indexes.find(index => index >= columnIndex) ?? getLastNavigableColumnIndex()
  }
  for (let index = indexes.length - 1; index >= 0; index -= 1) {
    const candidate = indexes[index]
    if (candidate !== undefined && candidate <= columnIndex) {
      return candidate
    }
  }
  return getFirstNavigableColumnIndex()
}

function getAdjacentNavigableColumnIndex(columnIndex: number, direction: 1 | -1): number {
  const indexes = navigableColumnIndexes.value
  if (!indexes.length) {
    return -1
  }
  const currentPos = indexes.indexOf(columnIndex)
  if (currentPos === -1) {
    return resolveNearestNavigableColumnIndex(columnIndex, direction)
  }
  const nextPos = Math.max(0, Math.min(indexes.length - 1, currentPos + direction))
  return indexes[nextPos] ?? columnIndex
}

function resolveCellCoord(row: DataGridRowNode<IncidentRow>, columnKey: string): CellCoord | null {
  if (columnKey === "select") {
    return null
  }
  const rawColumnIndex = resolveColumnIndex(columnKey)
  if (rawColumnIndex < 0) {
    return null
  }
  const columnIndex = resolveNearestNavigableColumnIndex(rawColumnIndex)
  if (columnIndex < 0) {
    return null
  }
  return {
    rowIndex: clampRowIndex(resolveRowIndex(row)),
    columnIndex,
  }
}

function normalizeCellCoord(coord: CellCoord): CellCoord | null {
  if (filteredAndSortedRows.value.length === 0 || orderedColumns.value.length === 0) {
    return null
  }
  const rowIndex = clampRowIndex(coord.rowIndex)
  const columnIndex = resolveNearestNavigableColumnIndex(Math.trunc(coord.columnIndex))
  if (columnIndex < 0) {
    return null
  }
  return { rowIndex, columnIndex }
}

function normalizeSelectionRange(range: CellSelectionRange): CellSelectionRange | null {
  const start = normalizeCellCoord({ rowIndex: range.startRow, columnIndex: range.startColumn })
  const end = normalizeCellCoord({ rowIndex: range.endRow, columnIndex: range.endColumn })
  if (!start || !end) {
    return null
  }
  return {
    startRow: Math.min(start.rowIndex, end.rowIndex),
    endRow: Math.max(start.rowIndex, end.rowIndex),
    startColumn: Math.min(start.columnIndex, end.columnIndex),
    endColumn: Math.max(start.columnIndex, end.columnIndex),
  }
}

function buildExtendedRange(baseRange: CellSelectionRange, coord: CellCoord): CellSelectionRange | null {
  return normalizeSelectionRange({
    startRow: coord.rowIndex < baseRange.startRow ? coord.rowIndex : baseRange.startRow,
    endRow: coord.rowIndex > baseRange.endRow ? coord.rowIndex : baseRange.endRow,
    startColumn: coord.columnIndex < baseRange.startColumn ? coord.columnIndex : baseRange.startColumn,
    endColumn: coord.columnIndex > baseRange.endColumn ? coord.columnIndex : baseRange.endColumn,
  })
}

function isCellWithinRange(rowIndex: number, columnIndex: number, range: CellSelectionRange): boolean {
  return (
    rowIndex >= range.startRow &&
    rowIndex <= range.endRow &&
    columnIndex >= range.startColumn &&
    columnIndex <= range.endColumn
  )
}

function positiveModulo(value: number, divisor: number): number {
  if (divisor <= 0) {
    return 0
  }
  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
}

function resolveCurrentCellCoord(): CellCoord | null {
  const candidate = activeCell.value ?? cellFocus.value ?? cellAnchor.value
  if (candidate) {
    return normalizeCellCoord(candidate)
  }
  const firstColumnIndex = getFirstNavigableColumnIndex()
  if (filteredAndSortedRows.value.length === 0 || firstColumnIndex < 0) {
    return null
  }
  return { rowIndex: 0, columnIndex: firstColumnIndex }
}

function applyCellSelection(nextCoord: CellCoord, extend: boolean, fallbackAnchor?: CellCoord, ensureVisible = true) {
  const normalized = normalizeCellCoord(nextCoord)
  if (!normalized) {
    return
  }
  let nextAnchor: CellCoord
  let nextFocus: CellCoord
  if (extend) {
    const anchor = cellAnchor.value ?? fallbackAnchor ?? activeCell.value ?? normalized
    nextAnchor = normalizeCellCoord(anchor) ?? normalized
    nextFocus = normalized
  } else {
    nextAnchor = normalized
    nextFocus = normalized
  }
  if (!cellCoordsEqual(cellAnchor.value, nextAnchor)) {
    cellAnchor.value = nextAnchor
  }
  if (!cellCoordsEqual(cellFocus.value, nextFocus)) {
    cellFocus.value = nextFocus
  }
  if (!cellCoordsEqual(activeCell.value, normalized)) {
    activeCell.value = normalized
  }
  if (ensureVisible) {
    ensureCellVisible(normalized)
  }
}

function ensureCellVisible(coord: CellCoord) {
  const viewport = viewportRef.value
  const columnMetric = orderedColumnMetrics.value[coord.columnIndex]
  if (!viewport || !columnMetric) {
    return
  }

  const rowTop = headerHeight.value + coord.rowIndex * ROW_HEIGHT
  const rowBottom = rowTop + ROW_HEIGHT
  const visibleTop = viewport.scrollTop + headerHeight.value
  const visibleBottom = viewport.scrollTop + viewport.clientHeight

  if (rowTop < visibleTop) {
    viewport.scrollTop = Math.max(0, rowTop - headerHeight.value)
  } else if (rowBottom > visibleBottom) {
    viewport.scrollTop = Math.max(0, rowBottom - viewport.clientHeight)
  }

  if (columnMetric.start < viewport.scrollLeft) {
    viewport.scrollLeft = Math.max(0, columnMetric.start)
  } else if (columnMetric.end > viewport.scrollLeft + viewport.clientWidth) {
    viewport.scrollLeft = Math.max(0, columnMetric.end - viewport.clientWidth)
  }

  scrollTop.value = viewport.scrollTop
  scrollLeft.value = viewport.scrollLeft
}

function resolveColumnIndexByAbsoluteX(absoluteX: number): number {
  const metrics = orderedColumnMetrics.value
  const lastMetric = metrics[metrics.length - 1]
  if (!lastMetric) {
    return -1
  }
  const clampedX = Math.max(0, Math.min(absoluteX, Math.max(0, lastMetric.end - 1)))
  for (const metric of metrics) {
    if (clampedX < metric.end) {
      return metric.columnIndex
    }
  }
  return lastMetric.columnIndex
}

function resolveCellCoordFromPointer(clientX: number, clientY: number): CellCoord | null {
  const viewport = viewportRef.value
  if (!viewport || filteredAndSortedRows.value.length === 0) {
    return null
  }

  const rect = viewport.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  const metrics = orderedColumnMetrics.value
  const lastMetric = metrics[metrics.length - 1]
  if (!lastMetric) {
    return null
  }
  const totalWidth = lastMetric.end
  if (totalWidth <= 0) {
    return null
  }

  let leftPinnedWidth = 0
  let rightPinnedWidth = 0
  for (const metric of metrics) {
    const column = orderedColumns.value[metric.columnIndex]
    if (column?.pin === "left") {
      leftPinnedWidth = metric.end
    } else if (column?.pin === "right") {
      rightPinnedWidth += metric.width
    }
  }

  const pointerXInViewport = clientX - rect.left
  const pointerYInViewport = clientY - rect.top
  const clampedY = Math.max(0, Math.min(rect.height - 1, pointerYInViewport))
  const rowRawIndex = Math.floor((viewport.scrollTop + clampedY - headerHeight.value) / ROW_HEIGHT)

  let absoluteX: number
  if (pointerXInViewport <= leftPinnedWidth) {
    absoluteX = pointerXInViewport
  } else if (rightPinnedWidth > 0 && pointerXInViewport >= rect.width - rightPinnedWidth) {
    absoluteX = totalWidth - rightPinnedWidth + (pointerXInViewport - (rect.width - rightPinnedWidth))
  } else {
    absoluteX = viewport.scrollLeft + pointerXInViewport
  }

  const columnRawIndex = resolveColumnIndexByAbsoluteX(absoluteX)
  if (columnRawIndex < 0) {
    return null
  }
  const columnIndex = resolveNearestNavigableColumnIndex(columnRawIndex)
  if (columnIndex < 0) {
    return null
  }

  return normalizeCellCoord({
    rowIndex: rowRawIndex,
    columnIndex,
  })
}

function resolveAxisAutoScrollDelta(pointer: number, min: number, max: number): number {
  if (max <= min) {
    return 0
  }
  if (pointer < min + DRAG_AUTO_SCROLL_EDGE_PX) {
    const intensity = Math.min(2, (min + DRAG_AUTO_SCROLL_EDGE_PX - pointer) / DRAG_AUTO_SCROLL_EDGE_PX)
    return -Math.ceil(DRAG_AUTO_SCROLL_MAX_STEP_PX * intensity)
  }
  if (pointer > max - DRAG_AUTO_SCROLL_EDGE_PX) {
    const intensity = Math.min(2, (pointer - (max - DRAG_AUTO_SCROLL_EDGE_PX)) / DRAG_AUTO_SCROLL_EDGE_PX)
    return Math.ceil(DRAG_AUTO_SCROLL_MAX_STEP_PX * intensity)
  }
  return 0
}

function applyDragSelectionFromPointer() {
  if (!isDragSelecting.value) {
    return
  }
  const pointer = dragPointer.value
  if (!pointer) {
    return
  }
  const coord = resolveCellCoordFromPointer(pointer.clientX, pointer.clientY)
  if (!coord) {
    return
  }
  if (cellCoordsEqual(lastDragCoord, coord)) {
    return
  }
  lastDragCoord = coord
  applyCellSelection(coord, true, undefined, false)
}

function applyFillPreviewFromPointer() {
  if (!isFillDragging.value) {
    return
  }
  const pointer = fillPointer.value
  const baseRange = fillBaseRange.value
  if (!pointer || !baseRange) {
    return
  }
  const coord = resolveCellCoordFromPointer(pointer.clientX, pointer.clientY)
  if (!coord) {
    return
  }
  const preview = buildExtendedRange(baseRange, coord)
  if (!preview) {
    return
  }
  if (rangesEqual(fillPreviewRange.value, preview)) {
    return
  }
  fillPreviewRange.value = preview
}

function isPointerInteractionActive(): boolean {
  return isDragSelecting.value || isFillDragging.value
}

function getActiveInteractionPointer() {
  if (isFillDragging.value) {
    return fillPointer.value
  }
  if (isDragSelecting.value) {
    return dragPointer.value
  }
  return null
}

function runDragAutoScrollFrame() {
  if (!isPointerInteractionActive()) {
    dragAutoScrollFrame = null
    return
  }

  const viewport = viewportRef.value
  const pointer = getActiveInteractionPointer()
  if (viewport && pointer) {
    const rect = viewport.getBoundingClientRect()
    const topBoundary = rect.top + headerHeight.value
    const deltaY = resolveAxisAutoScrollDelta(pointer.clientY, topBoundary, rect.bottom)
    const deltaX = resolveAxisAutoScrollDelta(pointer.clientX, rect.left, rect.right)

    if (deltaX !== 0 || deltaY !== 0) {
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      const nextTop = Math.max(0, Math.min(maxScrollTop, viewport.scrollTop + deltaY))
      const nextLeft = Math.max(0, Math.min(maxScrollLeft, viewport.scrollLeft + deltaX))

      if (nextTop !== viewport.scrollTop) {
        viewport.scrollTop = nextTop
      }
      if (nextLeft !== viewport.scrollLeft) {
        viewport.scrollLeft = nextLeft
      }

      scrollTop.value = viewport.scrollTop
      scrollLeft.value = viewport.scrollLeft
    }

    if (isFillDragging.value) {
      applyFillPreviewFromPointer()
    } else if (isDragSelecting.value) {
      applyDragSelectionFromPointer()
    }
  }

  dragAutoScrollFrame = window.requestAnimationFrame(runDragAutoScrollFrame)
}

function startInteractionAutoScroll() {
  if (dragAutoScrollFrame !== null) {
    return
  }
  dragAutoScrollFrame = window.requestAnimationFrame(runDragAutoScrollFrame)
}

function stopAutoScrollFrameIfIdle() {
  if (!isPointerInteractionActive() && dragAutoScrollFrame !== null) {
    window.cancelAnimationFrame(dragAutoScrollFrame)
    dragAutoScrollFrame = null
  }
}

function onSelectionHandleMouseDown(event: MouseEvent) {
  if (event.button !== 0) {
    return
  }
  const currentRange = cellSelectionRange.value
  if (!currentRange) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  viewportRef.value?.focus()
  isDragSelecting.value = false
  dragPointer.value = null
  isFillDragging.value = true
  fillBaseRange.value = { ...currentRange }
  fillPreviewRange.value = { ...currentRange }
  fillPointer.value = { clientX: event.clientX, clientY: event.clientY }
  startInteractionAutoScroll()
  lastAction.value = "Fill handle active"
}

function applyFillPreview() {
  const baseRange = fillBaseRange.value
  const previewRange = fillPreviewRange.value
  if (!baseRange || !previewRange || rangesEqual(baseRange, previewRange)) {
    return
  }

  const displayedRows = filteredAndSortedRows.value
  if (!displayedRows.length) {
    return
  }

  const baseHeight = baseRange.endRow - baseRange.startRow + 1
  if (baseHeight <= 0) {
    return
  }

  const sourceById = new Map(sourceRows.value.map(row => [row.rowId, row]))
  const mutableById = new Map<string, IncidentRow>()
  const statusNeedsRecompute = new Set<string>()
  const baseEditableKeys = new Set<EditableColumnKey>()

  for (let columnIndex = baseRange.startColumn; columnIndex <= baseRange.endColumn; columnIndex += 1) {
    const column = orderedColumns.value[columnIndex]
    if (column && isEditableColumn(column.key)) {
      baseEditableKeys.add(column.key)
    }
  }
  if (!baseEditableKeys.size) {
    return
  }

  const getMutableRow = (rowId: string): IncidentRow | null => {
    const existing = mutableById.get(rowId)
    if (existing) {
      return existing
    }
    const sourceRow = sourceById.get(rowId)
    if (!sourceRow) {
      return null
    }
    const clone = { ...sourceRow }
    mutableById.set(rowId, clone)
    return clone
  }

  let changedCells = 0
  for (let rowIndex = previewRange.startRow; rowIndex <= previewRange.endRow; rowIndex += 1) {
    const destinationDisplayRow = displayedRows[rowIndex]
    if (!destinationDisplayRow) {
      continue
    }
    for (let columnIndex = previewRange.startColumn; columnIndex <= previewRange.endColumn; columnIndex += 1) {
      if (isCellWithinRange(rowIndex, columnIndex, baseRange)) {
        continue
      }
      const column = orderedColumns.value[columnIndex]
      if (!column || !isEditableColumn(column.key) || !baseEditableKeys.has(column.key)) {
        continue
      }

      const sourceRowIndex = baseRange.startRow + positiveModulo(rowIndex - baseRange.startRow, baseHeight)
      const sourceDisplayRow = displayedRows[sourceRowIndex]
      if (!sourceDisplayRow) {
        continue
      }

      const sourceRow = sourceById.get(sourceDisplayRow.rowId)
      const destinationRow = getMutableRow(destinationDisplayRow.rowId)
      if (!sourceRow || !destinationRow) {
        continue
      }

      const nextValue = getRowCellValue(sourceRow, column.key)
      applyEditedValue(destinationRow, column.key, String(nextValue ?? ""))
      if (column.key === "latencyMs" || column.key === "errorRate") {
        statusNeedsRecompute.add(destinationRow.rowId)
      }
      changedCells += 1
    }
  }

  if (changedCells === 0) {
    return
  }

  for (const rowId of statusNeedsRecompute) {
    const row = mutableById.get(rowId)
    if (!row) continue
    row.status = resolveStatus(row.latencyMs, row.errorRate)
  }

  sourceRows.value = sourceRows.value.map(row => mutableById.get(row.rowId) ?? row)
  cellAnchor.value = { rowIndex: previewRange.startRow, columnIndex: previewRange.startColumn }
  cellFocus.value = { rowIndex: previewRange.endRow, columnIndex: previewRange.endColumn }
  activeCell.value = { rowIndex: previewRange.endRow, columnIndex: previewRange.endColumn }
  lastAction.value = `Fill applied (${changedCells} cells)`
}

function stopFillSelection(applyPreview: boolean) {
  if (applyPreview) {
    applyFillPreview()
  }
  isFillDragging.value = false
  fillPointer.value = null
  fillBaseRange.value = null
  fillPreviewRange.value = null
  stopAutoScrollFrameIfIdle()
}

function onGlobalMouseMove(event: MouseEvent) {
  if (activeColumnResize.value) {
    applyColumnResizeFromPointer(event.clientX)
    return
  }
  if (isFillDragging.value) {
    const pointer = fillPointer.value
    if (!pointer || pointer.clientX !== event.clientX || pointer.clientY !== event.clientY) {
      fillPointer.value = { clientX: event.clientX, clientY: event.clientY }
    }
    applyFillPreviewFromPointer()
    return
  }
  if (!isDragSelecting.value) {
    return
  }
  const pointer = dragPointer.value
  if (!pointer || pointer.clientX !== event.clientX || pointer.clientY !== event.clientY) {
    dragPointer.value = { clientX: event.clientX, clientY: event.clientY }
  }
  applyDragSelectionFromPointer()
}

function onGlobalMouseUp() {
  if (activeColumnResize.value) {
    stopColumnResize()
  }
  if (isFillDragging.value) {
    stopFillSelection(true)
  }
  if (isDragSelecting.value) {
    stopDragSelection()
  }
}

function onDataCellMouseDown(row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) {
  if (event.button !== 0 || columnKey === "select") {
    return
  }
  const targetNode = event.target as HTMLElement | null
  if (targetNode?.closest(".datagrid-stage__editor") || targetNode?.closest(".datagrid-stage__enum-trigger")) {
    return
  }
  if (inlineEditor.value) {
    commitInlineEdit()
  }
  const coord = resolveCellCoord(row, columnKey)
  if (!coord) {
    return
  }
  event.preventDefault()
  viewportRef.value?.focus()
  if (isFillDragging.value) {
    stopFillSelection(false)
  }
  isDragSelecting.value = true
  lastDragCoord = coord
  dragPointer.value = { clientX: event.clientX, clientY: event.clientY }
  applyCellSelection(coord, event.shiftKey, coord)
  startInteractionAutoScroll()
  lastAction.value = event.shiftKey
    ? `Extended selection to R${coord.rowIndex + 1} · ${columnKey}`
    : `Anchor set: R${coord.rowIndex + 1} · ${columnKey}`
}

function onDataCellMouseEnter(row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) {
  if (inlineEditor.value || !isDragSelecting.value || columnKey === "select") {
    return
  }
  const coord = resolveCellCoord(row, columnKey)
  if (!coord) {
    return
  }
  if (cellCoordsEqual(lastDragCoord, coord)) {
    return
  }
  lastDragCoord = coord
  dragPointer.value = { clientX: event.clientX, clientY: event.clientY }
  applyCellSelection(coord, true, undefined, false)
}

function stopDragSelection() {
  isDragSelecting.value = false
  dragPointer.value = null
  lastDragCoord = null
  stopAutoScrollFrameIfIdle()
}

function onViewportBlur(event: FocusEvent) {
  const viewport = viewportRef.value
  const nextFocused = event.relatedTarget as Node | null
  if (viewport && nextFocused && viewport.contains(nextFocused)) {
    return
  }
  stopDragSelection()
  stopFillSelection(false)
  stopColumnResize()
  if (inlineEditor.value) {
    commitInlineEdit()
  }
}

function resolveTabTarget(current: CellCoord, backwards: boolean): CellCoord | null {
  const columns = navigableColumnIndexes.value
  if (!columns.length) {
    return null
  }
  const currentPos = columns.indexOf(current.columnIndex)
  const resolvedPos = currentPos === -1
    ? columns.findIndex(index => index >= current.columnIndex)
    : currentPos
  const startPos = resolvedPos === -1 ? (backwards ? columns.length - 1 : 0) : resolvedPos
  let rowIndex = current.rowIndex
  let columnPos = startPos + (backwards ? -1 : 1)
  if (columnPos < 0) {
    columnPos = columns.length - 1
    rowIndex -= 1
  } else if (columnPos >= columns.length) {
    columnPos = 0
    rowIndex += 1
  }
  return normalizeCellCoord({
    rowIndex,
    columnIndex: columns[columnPos] ?? columns[0] ?? 0,
  })
}

function onViewportKeyDown(event: KeyboardEvent) {
  if (inlineEditor.value) {
    return
  }
  const current = resolveCurrentCellCoord()
  if (!current) {
    return
  }

  let target: CellCoord = { ...current }
  let extend = event.shiftKey
  const stepRows = Math.max(1, Math.floor((viewportHeight.value - headerHeight.value) / ROW_HEIGHT))

  switch (event.key) {
    case "ArrowUp":
      target.rowIndex -= 1
      break
    case "ArrowDown":
      target.rowIndex += 1
      break
    case "ArrowLeft":
      target.columnIndex = getAdjacentNavigableColumnIndex(current.columnIndex, -1)
      break
    case "ArrowRight":
      target.columnIndex = getAdjacentNavigableColumnIndex(current.columnIndex, 1)
      break
    case "PageUp":
      target.rowIndex -= stepRows
      break
    case "PageDown":
      target.rowIndex += stepRows
      break
    case "Home":
      if (event.ctrlKey || event.metaKey) {
        target = { rowIndex: 0, columnIndex: getFirstNavigableColumnIndex() }
      } else {
        target.columnIndex = getFirstNavigableColumnIndex()
      }
      break
    case "End":
      if (event.ctrlKey || event.metaKey) {
        target = { rowIndex: Math.max(0, filteredAndSortedRows.value.length - 1), columnIndex: getLastNavigableColumnIndex() }
      } else {
        target.columnIndex = getLastNavigableColumnIndex()
      }
      break
    case "Tab":
      {
        const nextTab = resolveTabTarget(current, event.shiftKey)
        if (!nextTab) {
          return
        }
        target = nextTab
      }
      extend = false
      break
    case "Enter":
      target.rowIndex += event.shiftKey ? -1 : 1
      extend = false
      break
    case "Escape":
      event.preventDefault()
      clearCellSelection()
      lastAction.value = "Cleared cell selection"
      return
    default:
      return
  }

  const normalized = normalizeCellCoord(target)
  if (!normalized) {
    return
  }
  event.preventDefault()
  applyCellSelection(normalized, extend, current)
}

function isCellInSelection(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  const range = cellSelectionRange.value
  if (!range || columnKey === "select") {
    return false
  }
  const rowIndex = resolveRowIndex(row)
  const columnIndex = resolveColumnIndex(columnKey)
  if (columnIndex < 0) {
    return false
  }
  return (
    rowIndex >= range.startRow &&
    rowIndex <= range.endRow &&
    columnIndex >= range.startColumn &&
    columnIndex <= range.endColumn
  )
}

function isAnchorCell(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (!cellAnchor.value || columnKey === "select") {
    return false
  }
  return resolveRowIndex(row) === cellAnchor.value.rowIndex && resolveColumnIndex(columnKey) === cellAnchor.value.columnIndex
}

function isActiveCell(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (!activeCell.value || columnKey === "select") {
    return false
  }
  return resolveRowIndex(row) === activeCell.value.rowIndex && resolveColumnIndex(columnKey) === activeCell.value.columnIndex
}

function isRangeEndCell(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  const range = cellSelectionRange.value
  if (!range || columnKey === "select") {
    return false
  }
  return resolveRowIndex(row) === range.endRow && resolveColumnIndex(columnKey) === range.endColumn
}

function shouldShowFillHandle(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (isFillDragging.value || inlineEditor.value) {
    return false
  }
  return isRangeEndCell(row, columnKey)
}

function isCellInFillPreview(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  const preview = fillPreviewRange.value
  const base = fillBaseRange.value
  if (!isFillDragging.value || !preview || columnKey === "select") {
    return false
  }
  const rowIndex = resolveRowIndex(row)
  const columnIndex = resolveColumnIndex(columnKey)
  if (columnIndex < 0) {
    return false
  }
  const inPreview = isCellWithinRange(rowIndex, columnIndex, preview)
  if (!inPreview) {
    return false
  }
  if (!base) {
    return true
  }
  return !isCellWithinRange(rowIndex, columnIndex, base)
}

function onViewportScroll(event: Event) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  const nextTop = target.scrollTop
  const nextLeft = target.scrollLeft
  if (nextTop !== scrollTop.value) {
    scrollTop.value = nextTop
  }
  if (nextLeft !== scrollLeft.value) {
    scrollLeft.value = nextLeft
  }
  if (inlineEditor.value) {
    commitInlineEdit()
  }
}

function randomizeRuntime() {
  if (inlineEditor.value) {
    commitInlineEdit()
  }
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
  selectedRowIds.value = new Set()
  inlineEditor.value = null
  clearCellSelection()
  lastAction.value = "Reset dataset"
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    viewportRef.value.scrollLeft = 0
    scrollTop.value = 0
    scrollLeft.value = 0
  }
}

watch(rowCount, () => {
  resetVisibleRowsSyncCache()
  sourceRows.value = buildRows(rowCount.value, seed.value)
  selectedRowIds.value = new Set()
  inlineEditor.value = null
  clearCellSelection()
  lastAction.value = `Regenerated ${rowCount.value} rows`
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    viewportRef.value.scrollLeft = 0
    scrollTop.value = 0
    scrollLeft.value = 0
  }
})

watch(pinStatusColumn, value => {
  api.setColumnPin("status", value ? "left" : "none")
  lastAction.value = value ? "Pinned status column" : "Unpinned status column"
})

watch(sortPreset, value => {
  if (value === "custom") {
    return
  }
  const preset = SORT_PRESETS[value]
  if (!preset) {
    return
  }
  sortState.value = preset.map(entry => ({ ...entry }))
})

watch(sortState, value => {
  rowModel.setSortModel(value)
  const presetEntry = Object.entries(SORT_PRESETS).find(([, preset]) => {
    if (preset.length !== value.length) {
      return false
    }
    return preset.every((entry, index) => {
      const current = value[index]
      return current?.key === entry.key && current?.direction === entry.direction
    })
  })
  const nextPreset = presetEntry?.[0] ?? "custom"
  if (sortPreset.value !== nextPreset) {
    sortPreset.value = nextPreset
  }
  lastAction.value = value.length
    ? `Sorted: ${value.map((entry, index) => `${index + 1}.${entry.key} ${entry.direction}`).join(", ")}`
    : "Sorting cleared"
}, { immediate: true, deep: true })

watch(appliedColumnFilters, value => {
  rowModel.setFilterModel(buildFilterSnapshot(value))
}, { immediate: true, deep: true })

watch([query, sortState, appliedColumnFilters], () => {
  resetVisibleRowsSyncCache()
  if (inlineEditor.value) {
    commitInlineEdit()
  }
  clearCellSelection()
}, { deep: true })

watch(sourceRows, rows => {
  const rowIdSet = new Set(rows.map(row => row.rowId))
  const next = new Set([...selectedRowIds.value].filter(rowId => rowIdSet.has(rowId)))
  if (next.size !== selectedRowIds.value.size) {
    selectedRowIds.value = next
  }
})

watch(
  [filteredAndSortedRows, virtualRange],
  () => {
    scheduleVisibleRowsSync()
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
  window.addEventListener("resize", scheduleViewportMeasure)
  window.addEventListener("mouseup", onGlobalMouseUp)
  window.addEventListener("mousemove", onGlobalMouseMove)
})

onBeforeUnmount(() => {
  stopFillSelection(false)
  stopDragSelection()
  stopColumnResize()
  if (syncVisibleRowsFrame !== null) {
    window.cancelAnimationFrame(syncVisibleRowsFrame)
    syncVisibleRowsFrame = null
  }
  syncVisibleRowsPending = false
  if (viewportMeasureFrame !== null) {
    window.cancelAnimationFrame(viewportMeasureFrame)
    viewportMeasureFrame = null
  }
  viewportMeasurePending = false
  unsubscribeColumns?.()
  unsubscribeColumns = null
  window.removeEventListener("resize", scheduleViewportMeasure)
  window.removeEventListener("mouseup", onGlobalMouseUp)
  window.removeEventListener("mousemove", onGlobalMouseMove)
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

function compareSortableValues(left: unknown, right: unknown): number {
  if (left == null && right == null) {
    return 0
  }
  if (left == null) {
    return 1
  }
  if (right == null) {
    return -1
  }
  if (typeof left === "number" && typeof right === "number") {
    if (left === right) return 0
    return left < right ? -1 : 1
  }
  const leftValue = String(left).toLowerCase()
  const rightValue = String(right).toLowerCase()
  return leftValue.localeCompare(rightValue)
}

function sortRows(rows: IncidentRow[], model: readonly DataGridSortState[]): IncidentRow[] {
  if (!model.length) {
    return rows
  }
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      for (const sortEntry of model) {
        const next = compareSortableValues(
          getRowCellValue(left.row, sortEntry.key),
          getRowCellValue(right.row, sortEntry.key),
        )
        if (next === 0) {
          continue
        }
        return sortEntry.direction === "asc" ? next : -next
      }
      return left.index - right.index
    })
    .map(entry => entry.row)
}

function matchesQuery(row: IncidentRow, normalizedQuery: string, columnKeys: readonly string[]): boolean {
  if (!normalizedQuery) {
    return true
  }

  const keys = columnKeys.length
    ? columnKeys
    : [
      "service",
      "owner",
      "region",
      "environment",
      "deployment",
      "severity",
      "status",
      "channel",
      "runbook",
    ]

  for (const key of keys) {
    const value = getRowCellValue(row, key)
    if (typeof value === "undefined" || value === null) {
      continue
    }
    if (String(value).toLowerCase().includes(normalizedQuery)) {
      return true
    }
  }
  return false
}

function resolveStatus(latencyMs: number, errorRate: number): Status {
  if (latencyMs > 380 || errorRate > 10) return "degraded"
  if (latencyMs > 270 || errorRate > 5) return "watch"
  return "stable"
}

function formatCellValue(columnKey: string, value: unknown): string {
  if (columnKey === "latencyMs" && Number.isFinite(value)) return `${Math.round(value as number)} ms`
  if (columnKey === "errorRate" && Number.isFinite(value)) return `${Math.round(value as number)}`
  if (columnKey === "availabilityPct" && Number.isFinite(value)) return `${(value as number).toFixed(2)}%`
  if ((columnKey === "cpuPct" || columnKey === "memoryPct") && Number.isFinite(value)) {
    return `${Math.round(value as number)}%`
  }
  if (columnKey === "throughputRps" && Number.isFinite(value)) return `${Math.round(value as number)} rps`
  if (columnKey === "mttrMin" && Number.isFinite(value)) return `${Math.round(value as number)} min`
  if (columnKey === "sloBurnRate" && Number.isFinite(value)) return `${(value as number).toFixed(2)}x`
  if (columnKey === "queueDepth" && Number.isFinite(value)) return `${Math.round(value as number)}`
  if (columnKey === "incidents24h" && Number.isFinite(value)) return `${Math.round(value as number)}`
  return String(value ?? "")
}

function getRowCellValue(row: IncidentRow, columnKey: string): unknown {
  return (row as unknown as Record<string, unknown>)[columnKey]
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
  const environments: IncidentRow["environment"][] = ["prod", "staging", "dev"]
  const severities: Severity[] = ["critical", "high", "medium", "low"]
  const channels = ["#noc", "#platform-alerts", "#payments-oncall", "#incident-bridge"]
  const runbooks = ["RB-101", "RB-204", "RB-305", "RB-410", "RB-512"]

  return Array.from({ length: count }, (_, index) => {
    const latencyMs = 110 + ((index * 31 + seedValue * 19) % 340)
    const errorRate = (index * 11 + seedValue * 7) % 14
    const availabilityPct = Math.max(97, 99.99 - ((index * 13 + seedValue * 5) % 140) / 100)
    const mttrMin = 8 + ((index * 7 + seedValue * 3) % 95)
    const cpuPct = 22 + ((index * 17 + seedValue * 11) % 73)
    const memoryPct = 30 + ((index * 19 + seedValue * 13) % 64)
    const queueDepth = (index * 29 + seedValue * 17) % 480
    const throughputRps = 60 + ((index * 37 + seedValue * 23) % 1900)
    const sloBurnRate = 0.3 + ((index * 5 + seedValue * 2) % 36) / 10
    const incidents24h = (index * 3 + seedValue) % 21
    const updatedAt = `2026-02-${String(((index + seedValue) % 27) + 1).padStart(2, "0")} ${String((index * 7) % 24).padStart(2, "0")}:${String((index * 13) % 60).padStart(2, "0")}`

    return {
      rowId: `incident-${seedValue}-${index + 1}`,
      service: `${services[index % services.length]}-${(index % 12) + 1}`,
      owner: owners[index % owners.length] ?? owners[0]!,
      region: regions[index % regions.length] ?? regions[0]!,
      environment: environments[(index + seedValue) % environments.length] ?? "prod",
      deployment: `release-${2026}.${((index + seedValue) % 11) + 1}.${(index % 9) + 1}`,
      severity: severities[(index + seedValue) % severities.length] ?? "medium",
      latencyMs,
      errorRate,
      availabilityPct,
      mttrMin,
      cpuPct,
      memoryPct,
      queueDepth,
      throughputRps,
      sloBurnRate,
      incidents24h,
      runbook: runbooks[(index + seedValue) % runbooks.length] ?? "RB-101",
      channel: channels[(index + seedValue) % channels.length] ?? "#noc",
      updatedAt,
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
          api), and now uses a wide column set to stress horizontal scroll.
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
        <AffinoSelect
          v-model="rowCount"
          class="datagrid-controls__select"
          :options="rowCountOptions"
        />
      </label>
      <label>
        <span>Search</span>
        <input v-model.trim="query" type="text" placeholder="quick filter: service / owner / region" />
      </label>
      <label>
        <span>Sort</span>
        <AffinoSelect
          v-model="sortPreset"
          class="datagrid-controls__select"
          :options="sortPresetOptions"
        />
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="pinStatusColumn" type="checkbox" />
        <span>Pin status column</span>
      </label>
      <button type="button" @click="randomizeRuntime">Runtime shift</button>
      <button type="button" class="ghost" @click="resetDataset">Reset</button>
      <button
        type="button"
        class="ghost datagrid-controls__clear-filter"
        :disabled="!isQuickFilterActive"
        @click="clearQuickFilter"
      >
        Clear filter
      </button>
      <p class="datagrid-controls__filter-indicator" :data-active="isQuickFilterActive ? 'true' : 'false'">
        {{ quickFilterStatus }}
      </p>
      <section
        v-if="columnFilterDraft"
        class="datagrid-column-filter"
        data-datagrid-filter-panel
        :data-column-key="columnFilterDraft.columnKey"
      >
        <header class="datagrid-column-filter__header">
          <p>Column filter</p>
          <strong>{{ activeFilterColumnLabel }}</strong>
        </header>
        <label>
          <span>Operator</span>
          <AffinoSelect
            class="datagrid-column-filter__select"
            data-datagrid-filter-operator
            :model-value="columnFilterDraft.operator"
            :options="columnFilterOperatorOptions"
            @update:modelValue="onFilterOperatorChange"
          />
        </label>
        <label v-if="columnFilterDraft.kind === 'enum'">
          <span>Value</span>
          <AffinoSelect
            class="datagrid-column-filter__select"
            data-datagrid-filter-value-select
            :model-value="columnFilterDraft.value"
            :options="activeColumnFilterEnumOptions"
            @update:modelValue="onFilterEnumValueChange"
          />
        </label>
        <label v-else>
          <span>Value</span>
          <input
            data-datagrid-filter-value
            :type="columnFilterDraft.kind === 'number' ? 'number' : 'text'"
            :step="columnFilterDraft.kind === 'number' ? '0.01' : undefined"
            :value="columnFilterDraft.value"
            @input="onFilterValueInput"
          />
        </label>
        <label v-if="doesOperatorNeedSecondValue(columnFilterDraft.kind, columnFilterDraft.operator)">
          <span>And</span>
          <input
            data-datagrid-filter-value-2
            type="number"
            step="0.01"
            :value="columnFilterDraft.value2"
            @input="onFilterSecondValueInput"
          />
        </label>
        <div class="datagrid-column-filter__actions">
          <button
            type="button"
            data-datagrid-filter-apply
            :disabled="!canApplyActiveColumnFilter"
            @click="applyActiveColumnFilter"
          >
            Apply
          </button>
          <button type="button" class="ghost" data-datagrid-filter-reset @click="resetActiveColumnFilter">Reset</button>
          <button
            type="button"
            class="ghost"
            data-datagrid-filter-clear-all
            :disabled="!hasColumnFilters"
            @click="clearAllColumnFilters"
          >
            Clear all
          </button>
          <button type="button" class="ghost" data-datagrid-filter-close @click="closeColumnFilterPanel">Close</button>
        </div>
      </section>
      <p class="datagrid-controls__status">{{ lastAction }} · Double-click any editable cell for inline edit.</p>
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
      <div>
        <dt>Selected</dt>
        <dd>{{ selectedCount }}</dd>
      </div>
      <div>
        <dt>Sort state</dt>
        <dd>{{ sortSummary }}</dd>
      </div>
      <div>
        <dt>Column filters</dt>
        <dd>{{ activeColumnFilterCount }}</dd>
      </div>
      <div>
        <dt>Visible columns window</dt>
        <dd>{{ visibleColumnsWindow.start }}-{{ visibleColumnsWindow.end }} / {{ visibleColumnsWindow.total }}</dd>
      </div>
      <div>
        <dt>Cells selected</dt>
        <dd>{{ selectedCellsCount }}</dd>
      </div>
      <div>
        <dt>Selection anchor</dt>
        <dd>{{ cellAnchorLabel }}</dd>
      </div>
      <div>
        <dt>Active cell</dt>
        <dd>{{ activeCellLabel }}</dd>
      </div>
    </section>

    <section class="datagrid-stage">
      <div
        ref="viewportRef"
        class="datagrid-stage__viewport"
        :class="{ 'is-drag-selecting': isDragSelecting, 'is-fill-dragging': isFillDragging, 'is-column-resizing': isColumnResizing }"
        tabindex="0"
        role="grid"
        aria-label="Datagrid viewport"
        @scroll="onViewportScroll"
        @keydown="onViewportKeyDown"
        @blur="onViewportBlur"
      >
        <div ref="headerRef" class="datagrid-stage__header" :style="{ gridTemplateColumns: templateColumns }">
          <div
            v-for="column in orderedColumns"
            :key="`header-${column.key}`"
            class="datagrid-stage__cell datagrid-stage__cell--header"
            :class="{
              'datagrid-stage__cell--sticky': isStickyColumn(column.key),
              'datagrid-stage__cell--select': column.key === 'select',
              'datagrid-stage__cell--sortable': isSortableColumn(column.key),
              'datagrid-stage__cell--filtered': isColumnFilterActive(column.key),
              'datagrid-stage__cell--filter-open': activeFilterColumnKey === column.key,
            }"
            :data-column-key="column.key"
            :style="getCellStyle(column.key)"
            role="columnheader"
            :tabindex="isSortableColumn(column.key) ? 0 : -1"
            :aria-sort="getHeaderAriaSort(column.key)"
            @click="onHeaderCellClick(column.key, $event)"
            @keydown="onHeaderCellKeyDown(column.key, $event)"
          >
            <template v-if="column.key === 'select'">
              <input
                type="checkbox"
                class="datagrid-stage__checkbox"
                :checked="allFilteredSelected"
                :indeterminate.prop="someFilteredSelected && !allFilteredSelected"
                @change="onSelectAllChange"
                aria-label="Select all filtered rows"
              />
            </template>
            <template v-else>
              <span class="datagrid-stage__header-label">{{ column.column.label ?? column.key }}</span>
              <span
                v-if="getHeaderSortDirection(column.key)"
                class="datagrid-stage__sort-indicator"
                :data-direction="getHeaderSortDirection(column.key)"
              >
                {{ getHeaderSortDirection(column.key) === "asc" ? "▲" : "▼" }}
                <span
                  v-if="(getHeaderSortPriority(column.key) ?? 0) > 1"
                  class="datagrid-stage__sort-priority"
                >
                  {{ getHeaderSortPriority(column.key) }}
                </span>
              </span>
              <button
                type="button"
                class="datagrid-stage__filter-trigger"
                :class="{ 'is-active': isColumnFilterActive(column.key) }"
                :data-column-key="column.key"
                data-datagrid-filter-trigger
                :aria-label="`Filter ${column.column.label ?? column.key}`"
                :aria-expanded="activeFilterColumnKey === column.key ? 'true' : 'false'"
                @click.stop="onHeaderFilterTriggerClick(column.key)"
                @keydown.stop
              >
                F
              </button>
              <button
                v-if="isColumnResizable(column.key)"
                type="button"
                class="datagrid-stage__resize-handle"
                data-datagrid-resize-handle
                :data-column-key="column.key"
                :aria-label="`Resize ${column.column.label ?? column.key}`"
                @click.stop.prevent
                @mousedown="onHeaderResizeHandleMouseDown(column.key, $event)"
                @dblclick="onHeaderResizeHandleDoubleClick(column.key, $event)"
              ></button>
            </template>
          </div>
        </div>

        <div :style="{ height: `${spacerTopHeight}px` }"></div>

        <div
          v-for="row in visibleRows"
          :key="row.rowId"
          class="datagrid-stage__row"
          :class="{ 'is-selected': isRowSelected(String(row.rowId)) }"
          :style="{ gridTemplateColumns: templateColumns }"
        >
          <div
            v-for="column in orderedColumns"
            :key="`${row.rowId}-${column.key}`"
            class="datagrid-stage__cell"
            :class="{
              'datagrid-stage__cell--numeric': ['latencyMs', 'errorRate', 'availabilityPct', 'mttrMin', 'cpuPct', 'memoryPct', 'queueDepth', 'throughputRps', 'sloBurnRate', 'incidents24h'].includes(column.key),
              'datagrid-stage__cell--status': column.key === 'status',
              'datagrid-stage__cell--editable': isEditableColumn(column.key),
              'datagrid-stage__cell--editing': isEditingCell(row.data.rowId, column.key),
              'datagrid-stage__cell--enum': isEnumColumn(column.key),
              'datagrid-stage__cell--select': column.key === 'select',
              'datagrid-stage__cell--range': isCellInSelection(row, column.key),
              'datagrid-stage__cell--fill-preview': isCellInFillPreview(row, column.key),
              'datagrid-stage__cell--anchor': isAnchorCell(row, column.key),
              'datagrid-stage__cell--active': isActiveCell(row, column.key),
              'datagrid-stage__cell--sticky': isStickyColumn(column.key),
              'datagrid-stage__cell--range-end': isRangeEndCell(row, column.key),
            }"
            :data-column-key="column.key"
            :data-row-id="row.rowId"
            :style="getCellStyle(column.key)"
            @mousedown="onDataCellMouseDown(row, column.key, $event)"
            @mouseenter="onDataCellMouseEnter(row, column.key, $event)"
            @dblclick="beginInlineEdit(row.data, column.key)"
          >
            <template v-if="column.key === 'select'">
              <input
                type="checkbox"
                class="datagrid-stage__checkbox"
                :checked="isRowSelected(String(row.rowId))"
                @change="onRowSelectChange(String(row.rowId), $event)"
                :aria-label="`Select ${row.data.service}`"
              />
            </template>

            <template v-else-if="isSelectEditorCell(row.data.rowId, column.key) && getEditorOptions(column.key)">
              <AffinoSelect
                class="datagrid-stage__editor datagrid-stage__editor-select"
                :data-inline-editor-row-id="row.data.rowId"
                :data-inline-editor-column-key="column.key"
                :model-value="inlineEditor?.draft ?? ''"
                :options="getEditorOptions(column.key) ?? []"
                @update:modelValue="updateEditorDraft(String($event))"
                @change="onEditorAffinoSelectChange"
                @keydown="onEditorKeyDown($event, row.data.rowId, column.key)"
                @blur="commitInlineEdit"
              />
            </template>

            <template v-else-if="isEditingCell(row.data.rowId, column.key)">
              <input
                class="datagrid-stage__editor datagrid-stage__editor-input"
                :data-inline-editor-row-id="row.data.rowId"
                :data-inline-editor-column-key="column.key"
                :type="['latencyMs', 'errorRate', 'availabilityPct', 'mttrMin', 'cpuPct', 'memoryPct', 'queueDepth', 'throughputRps', 'sloBurnRate', 'incidents24h'].includes(column.key) ? 'number' : 'text'"
                :step="column.key === 'sloBurnRate' || column.key === 'availabilityPct' ? '0.01' : '1'"
                :value="inlineEditor?.draft ?? ''"
                @input="onEditorInput"
                @keydown="onEditorKeyDown($event, row.data.rowId, column.key)"
                @blur="commitInlineEdit"
                autofocus
              />
            </template>

            <template v-else>
              {{ formatCellValue(column.key, getRowCellValue(row.data, column.key)) }}
            </template>

            <button
              v-if="shouldShowEnumTrigger(row, column.key)"
              type="button"
              class="datagrid-stage__enum-trigger"
              :aria-label="`Open options for ${column.key}`"
              @mousedown="onEnumTriggerMouseDown(row, column.key, $event)"
            >
              ▾
            </button>

            <span
              v-if="shouldShowFillHandle(row, column.key)"
              class="datagrid-stage__selection-handle datagrid-stage__selection-handle--cell"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionHandleMouseDown"
            ></span>
          </div>
        </div>

        <div
          v-for="segment in fillPreviewOverlaySegments"
          :key="segment.key"
          class="datagrid-stage__selection-overlay datagrid-stage__selection-overlay--fill"
          :style="segment.style"
        ></div>

        <div
          v-for="segment in cellSelectionOverlaySegments"
          :key="segment.key"
          class="datagrid-stage__selection-overlay"
          :style="segment.style"
        ></div>

        <div v-if="visibleRows.length === 0" class="datagrid-stage__empty">No rows matched current filters.</div>
        <div :style="{ height: `${spacerBottomHeight}px` }"></div>
      </div>
      <p class="datagrid-stage__hint">Visible columns: {{ visibleColumnsWindow.keys }}</p>
    </section>
  </section>
</template>

<style scoped>
.datagrid-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100dvh - 11.5rem);
  min-height: 640px;
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
.datagrid-controls > button {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
}

.datagrid-controls__select {
  min-width: 120px;
}

.datagrid-controls__select :deep(.affino-select__trigger) {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
}

.datagrid-controls__select :deep(.affino-select__surface) {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(8, 13, 24, 0.98);
}

.datagrid-controls input {
  min-width: 210px;
}

.datagrid-controls > button {
  cursor: pointer;
}

.datagrid-controls > button:hover {
  border-color: var(--accent-strong);
}

.datagrid-controls > button.ghost {
  background: transparent;
}

.datagrid-controls__clear-filter:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-soft);
}

.datagrid-column-filter {
  flex: 1 1 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.55rem;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 0.8rem;
  background: rgba(8, 14, 24, 0.94);
  padding: 0.7rem;
}

.datagrid-column-filter__header {
  grid-column: 1 / -1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  margin: 0;
}

.datagrid-column-filter__header p {
  margin: 0;
  font-size: 0.73rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.datagrid-column-filter__header strong {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-primary);
}

.datagrid-column-filter label {
  display: grid;
  gap: 0.35rem;
  align-content: start;
}

.datagrid-column-filter label span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.datagrid-column-filter input {
  min-width: 0;
  width: 100%;
}

.datagrid-column-filter__select :deep(.affino-select__trigger) {
  min-height: 2.1rem;
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 0.82rem;
}

.datagrid-column-filter__select :deep(.affino-select__surface) {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(8, 13, 24, 0.98);
}

.datagrid-column-filter__actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.datagrid-column-filter__actions button {
  border-radius: 0.55rem;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.datagrid-column-filter__actions button.ghost {
  background: transparent;
}

.datagrid-column-filter__actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.datagrid-controls__filter-indicator {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.datagrid-controls__filter-indicator[data-active="true"] {
  color: rgba(125, 211, 252, 0.95);
}

.datagrid-metrics {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: 1fr;
  height: 256px;
  overflow: auto;
  align-content: start;
  padding-right: 0.2rem;
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
  line-height: 1.3;
  overflow-wrap: anywhere;
  color: var(--text-primary);
}

.datagrid-stage {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  overflow: hidden;
}

.datagrid-stage__viewport {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  overflow: auto;
  background: rgba(5, 8, 16, 0.95);
}

.datagrid-stage__viewport:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.8);
  outline-offset: -2px;
}

.datagrid-stage__viewport.is-drag-selecting,
.datagrid-stage__viewport.is-drag-selecting .datagrid-stage__cell,
.datagrid-stage__viewport.is-fill-dragging,
.datagrid-stage__viewport.is-fill-dragging .datagrid-stage__cell {
  cursor: cell;
  user-select: none;
}

.datagrid-stage__viewport.is-column-resizing,
.datagrid-stage__viewport.is-column-resizing .datagrid-stage__cell {
  cursor: col-resize;
  user-select: none;
}

.datagrid-stage__header,
.datagrid-stage__row {
  display: grid;
  min-width: max-content;
}

.datagrid-stage__header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(6, 10, 20, 0.98);
  border-bottom: 1px solid rgba(145, 170, 210, 0.22);
}

.datagrid-stage__row {
  height: 38px;
  border-bottom: 1px solid rgba(145, 170, 210, 0.14);
}

.datagrid-stage__row.is-selected .datagrid-stage__cell {
  background: rgba(17, 49, 86, 0.68);
}

.datagrid-stage__row.is-selected .datagrid-stage__cell--sticky {
  background: rgba(20, 58, 101, 0.9);
}

.datagrid-stage__row.is-selected .datagrid-stage__cell--range {
  background: rgba(56, 189, 248, 0.22);
}

.datagrid-stage__cell {
  position: relative;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(145, 170, 210, 0.12);
  padding: 0 0.65rem;
  font-size: 0.78rem;
  line-height: 1.15;
  color: var(--text-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(7, 10, 19, 0.92);
}

.datagrid-stage__cell:last-child {
  border-right: none;
}

.datagrid-stage__cell--select {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.datagrid-stage__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #38bdf8;
  cursor: pointer;
}

.datagrid-stage__cell--header {
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-primary);
  background: rgba(11, 17, 31, 0.98);
  padding-right: 1.45rem;
}

.datagrid-stage__cell--header.datagrid-stage__cell--sortable {
  cursor: pointer;
}

.datagrid-stage__cell--header.datagrid-stage__cell--sortable:hover {
  background: rgba(18, 28, 47, 0.99);
}

.datagrid-stage__header-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.datagrid-stage__sort-indicator {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.62rem;
  color: rgba(125, 211, 252, 0.95);
}

.datagrid-stage__sort-priority {
  min-width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  line-height: 1;
}

.datagrid-stage__cell--header.datagrid-stage__cell--filtered {
  box-shadow: inset 0 -2px 0 rgba(125, 211, 252, 0.8);
}

.datagrid-stage__cell--header.datagrid-stage__cell--filter-open {
  background: rgba(19, 32, 54, 0.99);
}

.datagrid-stage__filter-trigger {
  flex: 0 0 auto;
  margin-left: 0.35rem;
  margin-right: 0.35rem;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(145, 170, 210, 0.45);
  background: rgba(8, 13, 23, 0.92);
  color: var(--text-soft);
  font-size: 0.58rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.datagrid-stage__filter-trigger:hover {
  border-color: rgba(125, 211, 252, 0.8);
  color: rgba(186, 230, 253, 0.98);
}

.datagrid-stage__filter-trigger.is-active {
  border-color: rgba(125, 211, 252, 0.85);
  background: rgba(8, 47, 73, 0.9);
  color: rgba(186, 230, 253, 1);
}

.datagrid-stage__resize-handle {
  position: absolute;
  top: 0;
  right: -1px;
  width: 9px;
  height: 100%;
  border: 0;
  border-right: 2px solid transparent;
  background: transparent;
  cursor: col-resize;
  z-index: 48;
  padding: 0;
}

.datagrid-stage__resize-handle:hover,
.datagrid-stage__viewport.is-column-resizing .datagrid-stage__resize-handle {
  border-right-color: rgba(125, 211, 252, 0.9);
}

.datagrid-stage__cell--numeric {
  justify-content: flex-end;
  text-align: right;
  color: #bae6fd;
}

.datagrid-stage__cell--numeric.datagrid-stage__cell--editing {
  justify-content: stretch;
}

.datagrid-stage__cell--status {
  font-weight: 600;
}

.datagrid-stage__cell--editable {
  cursor: text;
}

.datagrid-stage__cell--editable:hover {
  background: rgba(16, 30, 52, 0.88);
}

.datagrid-stage__cell--enum {
  padding-right: 1.8rem;
}

.datagrid-stage__cell--editing {
  padding: 2px 4px;
  z-index: 24;
  overflow: visible;
}

.datagrid-stage__cell--range {
  background: rgba(56, 189, 248, 0.14);
}

.datagrid-stage__cell--fill-preview {
  background: rgba(125, 211, 252, 0.14);
}

.datagrid-stage__cell--anchor {
  background: rgba(56, 189, 248, 0.2);
}

.datagrid-stage__cell--active {
  box-shadow: inset 0 0 0 2px rgba(186, 230, 253, 0.95);
}

.datagrid-stage__editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  z-index: 25;
}

.datagrid-stage__editor-input {
  border-radius: 0.35rem;
  border: 1px solid rgba(145, 170, 210, 0.35);
  background: rgba(9, 14, 25, 0.96);
  color: var(--text-primary);
  padding: 0 0.5rem;
  font-size: 0.76rem;
  line-height: 1.15;
}

.datagrid-stage__editor-select :deep(.affino-select__trigger) {
  height: 100%;
  min-height: 0;
  border-radius: 0.35rem;
  border: 1px solid rgba(145, 170, 210, 0.35);
  background: rgba(9, 14, 25, 0.96);
  color: var(--text-primary);
  padding: 0 0.5rem;
  font-size: 0.76rem;
  line-height: 1.15;
}

.datagrid-stage__editor-select :deep(.affino-select__surface) {
  min-width: max(100%, 132px);
  max-height: 220px;
  z-index: 64;
}

.datagrid-stage__editor-select :deep(.affino-select__option) {
  font-size: 0.74rem;
  min-height: 1.8rem;
  padding: 0.35rem 0.55rem;
}

.datagrid-stage__editor:focus {
  outline: none;
  border-color: rgba(125, 211, 252, 0.75);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25);
}

.datagrid-stage__editor-select:focus-within {
  border-color: rgba(125, 211, 252, 0.75);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25);
}

.datagrid-stage__enum-trigger {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(145, 170, 210, 0.45);
  border-radius: 4px;
  background: rgba(11, 18, 30, 0.95);
  color: rgba(186, 230, 253, 0.95);
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  z-index: 26;
  padding: 0;
}

.datagrid-stage__enum-trigger:hover {
  border-color: rgba(125, 211, 252, 0.8);
  background: rgba(17, 31, 53, 0.98);
}

.datagrid-stage__cell--sticky {
  position: sticky;
  z-index: 16;
  background: rgba(10, 17, 30, 0.98);
  box-shadow: 1px 0 0 rgba(145, 170, 210, 0.2);
  background-clip: padding-box;
  contain: paint;
}

.datagrid-stage__row .datagrid-stage__cell--sticky.datagrid-stage__cell--range {
  background: rgba(56, 189, 248, 0.24);
  box-shadow:
    inset 0 0 0 1px rgba(125, 211, 252, 0.55),
    1px 0 0 rgba(145, 170, 210, 0.2);
}

.datagrid-stage__row .datagrid-stage__cell--sticky.datagrid-stage__cell--anchor {
  background: rgba(56, 189, 248, 0.32);
  box-shadow:
    inset 0 0 0 2px rgba(186, 230, 253, 0.9),
    1px 0 0 rgba(145, 170, 210, 0.2);
}

.datagrid-stage__row .datagrid-stage__cell--sticky.datagrid-stage__cell--active {
  box-shadow:
    inset 0 0 0 2px rgba(186, 230, 253, 1),
    1px 0 0 rgba(145, 170, 210, 0.2);
}

.datagrid-stage__header .datagrid-stage__cell--sticky {
  z-index: 42;
  background: rgba(11, 17, 31, 0.99);
}

.datagrid-stage__row .datagrid-stage__cell--sticky {
  z-index: 18;
}

.datagrid-stage__cell--range-end {
  z-index: 20;
}

.datagrid-stage__selection-overlay {
  position: absolute;
  z-index: 12;
  border: 2px solid rgba(56, 189, 248, 0.92);
  background: rgba(56, 189, 248, 0.08);
  pointer-events: none;
  box-sizing: border-box;
  transform: translateZ(0);
  will-change: transform, width, height, top, left;
}

.datagrid-stage__selection-overlay--fill {
  z-index: 11;
  border-style: dashed;
  border-color: rgba(125, 211, 252, 0.9);
  background: rgba(56, 189, 248, 0.05);
}

.datagrid-stage__selection-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(125, 211, 252, 0.95);
  background: rgba(8, 47, 73, 0.95);
  box-sizing: border-box;
  pointer-events: auto;
  cursor: crosshair;
}

.datagrid-stage__selection-handle--cell {
  z-index: 27;
}

.datagrid-stage__empty {
  padding: 0.8rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.datagrid-stage__hint {
  margin: 0;
  padding: 0.55rem 0.8rem 0.7rem;
  border-top: 1px solid rgba(145, 170, 210, 0.12);
  font-size: 0.73rem;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  background: rgba(7, 10, 19, 0.86);
}

@media (max-width: 900px) {
  .datagrid-page {
    height: auto;
    min-height: 0;
  }

  .datagrid-metrics {
    height: auto;
    max-height: 260px;
  }

  .datagrid-controls__status {
    margin-left: 0;
    width: 100%;
  }
}
</style>
