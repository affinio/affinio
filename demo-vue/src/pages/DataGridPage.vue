<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import AffinoSelect from "@/components/AffinoSelect.vue"
import {
  type DataGridColumnDef,
  type DataGridColumnSnapshot,
  type DataGridFilterSnapshot,
  type DataGridRowNode,
  type DataGridSortState,
} from "@affino/datagrid-core"
import {
  useDataGridContextMenu,
  useDataGridRuntime,
  type DataGridContextMenuActionId,
} from "@affino/datagrid-vue"
import {
  useDataGridCellNavigation,
  useDataGridCellPointerDownRouter,
  useDataGridCellPointerHoverRouter,
  useDataGridDragPointerSelection,
  useDataGridClipboardBridge,
  useDataGridClipboardMutations,
  useDataGridContextMenuAnchor,
  useDataGridContextMenuActionRouter,
  useDataGridDragSelectionLifecycle,
  useDataGridFillSelectionLifecycle,
  useDataGridRangeMoveLifecycle,
  useDataGridRangeMoveStart,
  useDataGridGlobalMouseDownContextMenuCloser,
  useDataGridGlobalPointerLifecycle,
  useDataGridHeaderContextActions,
  useDataGridHeaderResizeOrchestration,
  useDataGridHeaderSortOrchestration,
  useDataGridInlineEditorKeyRouter,
  useDataGridIntentHistory,
  useDataGridKeyboardCommandRouter,
  useDataGridPointerAutoScroll,
  useDataGridAxisAutoScrollDelta,
  useDataGridCellVisibilityScroller,
  useDataGridPointerCellCoordResolver,
  useDataGridPointerPreviewRouter,
  useDataGridTabTargetResolver,
  useDataGridViewportBlurHandler,
  useDataGridViewportContextMenuRouter,
} from "@affino/datagrid-vue/advanced"
import {
  type DataGridTransactionAffectedRange,
} from "@affino/datagrid-core/advanced"

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

interface GridMutationSnapshot {
  sourceRows: IncidentRow[]
  cellAnchor: CellCoord | null
  cellFocus: CellCoord | null
  activeCell: CellCoord | null
  copiedSelectionRange: CellSelectionRange | null
}

interface IntentTransactionDescriptor {
  intent: "paste" | "cut" | "clear" | "fill" | "move" | "edit"
  label: string
  affectedRange: CellSelectionRange | null
}

type GroupByColumnKey =
  | "none"
  | "service"
  | "owner"
  | "region"
  | "environment"
  | "severity"
  | "status"

const ROW_HEIGHT = 38
const OVERSCAN = 8
const DRAG_AUTO_SCROLL_EDGE_PX = 36
const DRAG_AUTO_SCROLL_MAX_STEP_PX = 28
const AUTO_SIZE_SAMPLE_LIMIT = 260
const AUTO_SIZE_CHAR_WIDTH = 7.2
const AUTO_SIZE_HORIZONTAL_PADDING = 28
const AUTO_SIZE_MAX_WIDTH = 640
const GRID_HINT_ID = "datagrid-a11y-hint"
const FILTER_PANEL_TITLE_ID = "datagrid-filter-panel-title"

const rowCount = ref(2400)
const seed = ref(1)
const query = ref("")
const sortPreset = ref("latency-desc")
const groupBy = ref<GroupByColumnKey>("none")
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
const groupByOptions = [
  { value: "none", label: "None" },
  { value: "service", label: "Service" },
  { value: "owner", label: "Owner" },
  { value: "region", label: "Region" },
  { value: "environment", label: "Environment" },
  { value: "severity", label: "Severity" },
  { value: "status", label: "Status" },
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

const DATA_GRID_COLUMNS: readonly DataGridColumnDef[] = [
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
]

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
const columnWidthOverrides = ref<Record<string, number>>({})
const copiedSelectionRange = ref<CellSelectionRange | null>(null)
const lastCopiedPayload = ref("")
const isDragSelecting = ref(false)
const dragPointer = ref<{ clientX: number; clientY: number } | null>(null)
const isFillDragging = ref(false)
const fillPointer = ref<{ clientX: number; clientY: number } | null>(null)
const fillBaseRange = ref<CellSelectionRange | null>(null)
const fillPreviewRange = ref<CellSelectionRange | null>(null)
const isRangeMoving = ref(false)
const rangeMovePointer = ref<{ clientX: number; clientY: number } | null>(null)
const rangeMoveBaseRange = ref<CellSelectionRange | null>(null)
const rangeMoveOrigin = ref<CellCoord | null>(null)
const rangeMovePreviewRange = ref<CellSelectionRange | null>(null)

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
const {
  contextMenu: copyContextMenu,
  contextMenuRef: copyMenuRef,
  contextMenuStyle: copyContextMenuStyle,
  contextMenuActions,
  closeContextMenu: closeCopyContextMenu,
  openContextMenu: openCopyContextMenu,
  onContextMenuKeyDown,
} = useDataGridContextMenu({
  isColumnResizable,
  onBeforeOpen: closeColumnFilterPanel,
})

function cloneCoord(coord: CellCoord | null): CellCoord | null {
  return coord ? { ...coord } : null
}

function cloneRange(range: CellSelectionRange | null): CellSelectionRange | null {
  return range ? { ...range } : null
}

function cloneRows(rows: readonly IncidentRow[]): IncidentRow[] {
  return rows.map(row => ({ ...row }))
}

function captureGridMutationSnapshot(): GridMutationSnapshot {
  return {
    sourceRows: cloneRows(sourceRows.value),
    cellAnchor: cloneCoord(cellAnchor.value),
    cellFocus: cloneCoord(cellFocus.value),
    activeCell: cloneCoord(activeCell.value),
    copiedSelectionRange: cloneRange(copiedSelectionRange.value),
  }
}

function applyGridMutationSnapshot(snapshot: GridMutationSnapshot) {
  sourceRows.value = cloneRows(snapshot.sourceRows)
  cellAnchor.value = cloneCoord(snapshot.cellAnchor)
  cellFocus.value = cloneCoord(snapshot.cellFocus)
  activeCell.value = cloneCoord(snapshot.activeCell)
  copiedSelectionRange.value = cloneRange(snapshot.copiedSelectionRange)
}

function toTransactionRange(range: CellSelectionRange | null): DataGridTransactionAffectedRange | null {
  if (!range) {
    return null
  }
  return {
    startRow: range.startRow,
    endRow: range.endRow,
    startColumn: range.startColumn,
    endColumn: range.endColumn,
  }
}

function toSingleCellRange(coord: CellCoord | null): CellSelectionRange | null {
  if (!coord) {
    return null
  }
  return {
    startRow: coord.rowIndex,
    endRow: coord.rowIndex,
    startColumn: coord.columnIndex,
    endColumn: coord.columnIndex,
  }
}

const history = useDataGridIntentHistory<GridMutationSnapshot>({
  maxHistoryDepth: 120,
  captureSnapshot: captureGridMutationSnapshot,
  applySnapshot: applyGridMutationSnapshot,
  logger: console,
})
const clipboard = useDataGridClipboardBridge<IncidentRow, CellSelectionRange>({
  copiedSelectionRange,
  lastCopiedPayload,
  resolveCopyRange,
  getRowAtIndex(rowIndex) {
    return filteredAndSortedRows.value[rowIndex]
  },
  getColumnKeyAtIndex(columnIndex) {
    return orderedColumns.value[columnIndex]?.key ?? null
  },
  getCellValue(row, columnKey) {
    return getRowCellValue(row, columnKey)
  },
  setLastAction(message) {
    lastAction.value = message
  },
  closeContextMenu: closeCopyContextMenu,
})

async function recordIntentTransaction(
  descriptor: IntentTransactionDescriptor,
  beforeSnapshot: GridMutationSnapshot,
): Promise<void> {
  await history.recordIntentTransaction(
    {
      intent: descriptor.intent,
      label: descriptor.label,
    affectedRange: toTransactionRange(descriptor.affectedRange),
    },
    beforeSnapshot,
  )
}

const clipboardMutations = useDataGridClipboardMutations<
  IncidentRow,
  EditableColumnKey,
  CellSelectionRange,
  CellCoord,
  GridMutationSnapshot
>({
  sourceRows,
  setSourceRows(rows) {
    sourceRows.value = cloneRows(rows)
  },
  cloneRow(row) {
    return { ...row }
  },
  resolveRowId(row) {
    return row.rowId
  },
  resolveCopyRange,
  resolveCurrentCellCoord,
  normalizeCellCoord,
  normalizeSelectionRange,
  resolveRowAtViewIndex(rowIndex) {
    return filteredAndSortedRows.value[rowIndex]
  },
  resolveColumnKeyAtIndex(columnIndex) {
    const column = orderedColumns.value[columnIndex]
    if (!column || !isEditableColumn(column.key)) {
      return null
    }
    return column.key
  },
  isEditableColumn,
  canApplyPastedValue,
  applyEditedValue,
  clearValueForCut,
  finalizeMutableRows(rowsById) {
    for (const row of rowsById.values()) {
      row.status = resolveStatus(row.latencyMs, row.errorRate)
    }
  },
  applySelectionRange(range) {
    cellAnchor.value = { rowIndex: range.startRow, columnIndex: range.startColumn }
    cellFocus.value = { rowIndex: range.endRow, columnIndex: range.endColumn }
    activeCell.value = { rowIndex: range.startRow, columnIndex: range.startColumn }
  },
  closeContextMenu: closeCopyContextMenu,
  setLastAction(message) {
    lastAction.value = message
  },
  readClipboardPayload: clipboard.readClipboardPayload,
  parseClipboardMatrix: clipboard.parseClipboardMatrix,
  copySelection,
  captureBeforeSnapshot: captureGridMutationSnapshot,
  async recordIntentTransaction(descriptor, beforeSnapshot) {
    await recordIntentTransaction(
      {
        intent: descriptor.intent,
        label: descriptor.label,
        affectedRange: descriptor.affectedRange,
      },
      beforeSnapshot,
    )
  },
})
const headerSortOrchestration = useDataGridHeaderSortOrchestration({
  sortState,
  isSortableColumn,
})
const {
  getHeaderSortDirection,
  getHeaderSortPriority,
  getHeaderAriaSort,
  applySortFromHeader,
  applyExplicitSort,
} = headerSortOrchestration
const headerResize = useDataGridHeaderResizeOrchestration<IncidentRow>({
  resolveColumnBaseWidth(columnKey) {
    const column = orderedColumns.value.find(entry => entry.key === columnKey)
    return typeof column?.column.width === "number" ? column.column.width : null
  },
  resolveColumnLabel(columnKey) {
    const column = orderedColumns.value.find(entry => entry.key === columnKey)
    return column?.column.label ? String(column.column.label) : columnKey
  },
  resolveRowsForAutoSize() {
    return filteredAndSortedRows.value
  },
  resolveCellText(row, columnKey) {
    return formatCellValue(columnKey, getRowCellValue(row, columnKey))
  },
  resolveColumnWidthOverride(columnKey) {
    return columnWidthOverrides.value[columnKey] ?? null
  },
  resolveColumnMinWidth(columnKey) {
    if (columnKey === "select") {
      return 48
    }
    return 110
  },
  applyColumnWidth(columnKey, width) {
    api.setColumnWidth(columnKey, width)
  },
  isColumnResizable,
  isFillDragging() {
    return isFillDragging.value
  },
  stopFillSelection,
  isDragSelecting() {
    return isDragSelecting.value
  },
  stopDragSelection,
  setLastAction(message) {
    lastAction.value = message
  },
  autoSizeSampleLimit: AUTO_SIZE_SAMPLE_LIMIT,
  autoSizeCharWidth: AUTO_SIZE_CHAR_WIDTH,
  autoSizeHorizontalPadding: AUTO_SIZE_HORIZONTAL_PADDING,
  autoSizeMaxWidth: AUTO_SIZE_MAX_WIDTH,
})
const {
  activeColumnResize,
  isColumnResizing,
  setColumnWidth,
  estimateColumnAutoWidth,
  onHeaderResizeHandleMouseDown,
  onHeaderResizeHandleDoubleClick,
  applyColumnResizeFromPointer,
  stopColumnResize,
} = headerResize
const headerContextActions = useDataGridHeaderContextActions({
  isSortableColumn,
  applyExplicitSort,
  openColumnFilter,
  estimateColumnAutoWidth,
  setColumnWidth,
  closeContextMenu: closeCopyContextMenu,
  setLastAction(message) {
    lastAction.value = message
  },
})
const contextMenuAnchor = useDataGridContextMenuAnchor({
  resolveCurrentCellCoord,
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveRowAtIndex(rowIndex) {
    return filteredAndSortedRows.value[rowIndex]
  },
  resolveColumnAtIndex(columnIndex) {
    return orderedColumns.value[columnIndex]
  },
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  isMultiCellSelection,
  isCoordInsideRange,
  openContextMenu(x, y, context) {
    openCopyContextMenu(x, y, context)
  },
  isColumnContextEnabled(column) {
    return column.key !== "select"
  },
})
const contextMenuActionRouter = useDataGridContextMenuActionRouter({
  resolveContextMenuState() {
    return {
      zone: copyContextMenu.value.zone,
      columnKey: copyContextMenu.value.columnKey,
    }
  },
  runHeaderContextAction(action, columnKey) {
    return headerContextActions.runHeaderContextAction(action, columnKey)
  },
  copySelection,
  pasteSelection,
  cutSelection,
  clearCurrentSelection,
  closeContextMenu: closeCopyContextMenu,
})
const viewportContextMenuRouter = useDataGridViewportContextMenuRouter({
  isInteractionBlocked() {
    return isDragSelecting.value || isFillDragging.value || isRangeMoving.value || isColumnResizing.value
  },
  isRangeMoveModifierActive,
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  resolveCellCoordFromDataset,
  applyCellSelection,
  resolveActiveCellCoord() {
    return activeCell.value
  },
  setActiveCellCoord(coord) {
    activeCell.value = coord
  },
  cellCoordsEqual,
  isMultiCellSelection,
  isCoordInsideRange,
  openContextMenu(x, y, context) {
    openCopyContextMenu(x, y, context)
  },
  closeContextMenu: closeCopyContextMenu,
  isColumnContextEnabled(columnKey) {
    return columnKey !== "select"
  },
})
const viewportBlurHandler = useDataGridViewportBlurHandler({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveContextMenuElement() {
    return copyMenuRef.value
  },
  stopDragSelection,
  stopFillSelection,
  stopRangeMove,
  stopColumnResize,
  closeContextMenu: closeCopyContextMenu,
  hasInlineEditor() {
    return inlineEditor.value !== null
  },
  commitInlineEdit,
})
const cellPointerDownRouter = useDataGridCellPointerDownRouter<DataGridRowNode<IncidentRow>, CellCoord, CellSelectionRange>({
  isSelectionColumn(columnKey) {
    return columnKey === "select"
  },
  isRangeMoveModifierActive,
  isEditorInteractionTarget(target) {
    return !!target?.closest(".datagrid-stage__editor") || !!target?.closest(".datagrid-stage__enum-trigger")
  },
  hasInlineEditor() {
    return inlineEditor.value !== null
  },
  commitInlineEdit,
  resolveCellCoord,
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  isCoordInsideRange,
  startRangeMove,
  closeContextMenu: closeCopyContextMenu,
  focusViewport() {
    viewportRef.value?.focus()
  },
  isFillDragging() {
    return isFillDragging.value
  },
  stopFillSelection,
  setDragSelecting(value) {
    isDragSelecting.value = value
  },
  setLastDragCoord(coord) {
    lastDragCoord = coord
  },
  setDragPointer(pointer) {
    dragPointer.value = pointer
  },
  applyCellSelection,
  startInteractionAutoScroll,
  setLastAction(message) {
    lastAction.value = message
  },
})
const cellPointerHoverRouter = useDataGridCellPointerHoverRouter<DataGridRowNode<IncidentRow>, CellCoord>({
  hasInlineEditor() {
    return inlineEditor.value !== null
  },
  isDragSelecting() {
    return isDragSelecting.value
  },
  isSelectionColumn(columnKey) {
    return columnKey === "select"
  },
  resolveCellCoord,
  resolveLastDragCoord() {
    return lastDragCoord
  },
  setLastDragCoord(coord) {
    lastDragCoord = coord
  },
  cellCoordsEqual,
  setDragPointer(pointer) {
    dragPointer.value = pointer
  },
  applyCellSelection,
})
const dragPointerSelection = useDataGridDragPointerSelection<CellCoord>({
  isDragSelecting() {
    return isDragSelecting.value
  },
  resolveDragPointer() {
    return dragPointer.value
  },
  resolveCellCoordFromPointer,
  resolveLastDragCoord() {
    return lastDragCoord
  },
  setLastDragCoord(coord) {
    lastDragCoord = coord
  },
  cellCoordsEqual,
  applyCellSelection,
})
const dragSelectionLifecycle = useDataGridDragSelectionLifecycle<CellCoord>({
  setDragSelecting(value) {
    isDragSelecting.value = value
  },
  clearDragPointer() {
    dragPointer.value = null
  },
  clearLastDragCoord() {
    lastDragCoord = null
  },
  stopAutoScrollFrameIfIdle,
  resolveLastDragCoord() {
    return lastDragCoord
  },
})
const fillSelectionLifecycle = useDataGridFillSelectionLifecycle<CellSelectionRange>({
  applyFillPreview,
  setFillDragging(value) {
    isFillDragging.value = value
  },
  clearFillPointer() {
    fillPointer.value = null
  },
  clearFillBaseRange() {
    fillBaseRange.value = null
  },
  clearFillPreviewRange() {
    fillPreviewRange.value = null
  },
  stopAutoScrollFrameIfIdle,
  resolveFillPreviewRange() {
    return fillPreviewRange.value
  },
})
const rangeMoveLifecycle = useDataGridRangeMoveLifecycle({
  applyRangeMove,
  setRangeMoving(value) {
    isRangeMoving.value = value
  },
  clearRangeMovePointer() {
    rangeMovePointer.value = null
  },
  clearRangeMoveBaseRange() {
    rangeMoveBaseRange.value = null
  },
  clearRangeMoveOrigin() {
    rangeMoveOrigin.value = null
  },
  clearRangeMovePreviewRange() {
    rangeMovePreviewRange.value = null
  },
  stopAutoScrollFrameIfIdle,
  onApplyRangeMoveError(error) {
    console.error("[DataGrid] applyRangeMove failed", error)
    lastAction.value = "Move failed"
  },
})
const rangeMoveStart = useDataGridRangeMoveStart<CellCoord, CellSelectionRange>({
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  isCoordInsideRange,
  closeContextMenu: closeCopyContextMenu,
  focusViewport() {
    viewportRef.value?.focus()
  },
  stopDragSelection,
  stopFillSelection,
  setRangeMoving(value) {
    isRangeMoving.value = value
  },
  setRangeMovePointer(pointer) {
    rangeMovePointer.value = pointer
  },
  setRangeMoveBaseRange(range) {
    rangeMoveBaseRange.value = range
  },
  setRangeMoveOrigin(coord) {
    rangeMoveOrigin.value = coord
  },
  setRangeMovePreviewRange(range) {
    rangeMovePreviewRange.value = range
  },
  startInteractionAutoScroll,
  setLastAction(message) {
    lastAction.value = message
  },
})
const pointerCellCoordResolver = useDataGridPointerCellCoordResolver<CellCoord>({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveRowCount() {
    return filteredAndSortedRows.value.length
  },
  resolveColumnMetrics() {
    return orderedColumnMetrics.value
  },
  resolveColumns() {
    return orderedColumns.value
  },
  resolveHeaderHeight() {
    return headerHeight.value
  },
  resolveRowHeight() {
    return ROW_HEIGHT
  },
  resolveNearestNavigableColumnIndex,
  normalizeCellCoord,
})
const axisAutoScrollDelta = useDataGridAxisAutoScrollDelta({
  edgePx: DRAG_AUTO_SCROLL_EDGE_PX,
  maxStepPx: DRAG_AUTO_SCROLL_MAX_STEP_PX,
})
const cellVisibilityScroller = useDataGridCellVisibilityScroller<CellCoord>({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveColumnMetric(columnIndex) {
    return orderedColumnMetrics.value[columnIndex] ?? null
  },
  resolveHeaderHeight() {
    return headerHeight.value
  },
  resolveRowHeight() {
    return ROW_HEIGHT
  },
  setScrollPosition(position) {
    scrollTop.value = position.top
    scrollLeft.value = position.left
  },
})
const pointerPreviewRouter = useDataGridPointerPreviewRouter<CellCoord, CellSelectionRange>({
  isFillDragging() {
    return isFillDragging.value
  },
  resolveFillPointer() {
    return fillPointer.value
  },
  resolveFillBaseRange() {
    return fillBaseRange.value
  },
  resolveFillPreviewRange() {
    return fillPreviewRange.value
  },
  setFillPreviewRange(range) {
    fillPreviewRange.value = range
  },
  isRangeMoving() {
    return isRangeMoving.value
  },
  resolveRangeMovePointer() {
    return rangeMovePointer.value
  },
  resolveRangeMoveBaseRange() {
    return rangeMoveBaseRange.value
  },
  resolveRangeMoveOrigin() {
    return rangeMoveOrigin.value
  },
  resolveRangeMovePreviewRange() {
    return rangeMovePreviewRange.value
  },
  setRangeMovePreviewRange(range) {
    rangeMovePreviewRange.value = range
  },
  resolveCellCoordFromPointer,
  buildExtendedRange,
  normalizeSelectionRange,
  rangesEqual,
})
const pointerAutoScroll = useDataGridPointerAutoScroll({
  resolveInteractionState() {
    return {
      isRangeMoving: isRangeMoving.value,
      isFillDragging: isFillDragging.value,
      isDragSelecting: isDragSelecting.value,
    }
  },
  resolveRangeMovePointer() {
    return rangeMovePointer.value
  },
  resolveFillPointer() {
    return fillPointer.value
  },
  resolveDragPointer() {
    return dragPointer.value
  },
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveHeaderHeight() {
    return headerHeight.value
  },
  resolveAxisAutoScrollDelta,
  setScrollPosition(next) {
    scrollTop.value = next.top
    scrollLeft.value = next.left
  },
  applyRangeMovePreviewFromPointer,
  applyFillPreviewFromPointer,
  applyDragSelectionFromPointer,
})
const globalPointerLifecycle = useDataGridGlobalPointerLifecycle({
  resolveInteractionState() {
    return {
      isRangeMoving: isRangeMoving.value,
      isColumnResizing: activeColumnResize.value !== null,
      isFillDragging: isFillDragging.value,
      isDragSelecting: isDragSelecting.value,
    }
  },
  resolveRangeMovePointer() {
    return rangeMovePointer.value
  },
  setRangeMovePointer(pointer) {
    rangeMovePointer.value = pointer
  },
  applyRangeMovePreviewFromPointer,
  stopRangeMove,
  applyColumnResizeFromPointer,
  stopColumnResize,
  resolveFillPointer() {
    return fillPointer.value
  },
  setFillPointer(pointer) {
    fillPointer.value = pointer
  },
  applyFillPreviewFromPointer,
  stopFillSelection,
  resolveDragPointer() {
    return dragPointer.value
  },
  setDragPointer(pointer) {
    dragPointer.value = pointer
  },
  applyDragSelectionFromPointer,
  stopDragSelection,
})
const globalMouseDownContextMenuCloser = useDataGridGlobalMouseDownContextMenuCloser({
  isContextMenuVisible() {
    return copyContextMenu.value.visible
  },
  resolveContextMenuElement() {
    return copyMenuRef.value
  },
  closeContextMenu: closeCopyContextMenu,
})
const keyboardCommandRouter = useDataGridKeyboardCommandRouter({
  isRangeMoving: () => isRangeMoving.value,
  isContextMenuVisible: () => copyContextMenu.value.visible,
  closeContextMenu: closeCopyContextMenu,
  focusViewport() {
    viewportRef.value?.focus()
  },
  openContextMenuFromCurrentCell,
  runHistoryAction,
  copySelection,
  pasteSelection,
  cutSelection,
  stopRangeMove,
  setLastAction(message) {
    lastAction.value = message
  },
})
const inlineEditorKeyRouter = useDataGridInlineEditorKeyRouter({
  isEditableColumn,
  cancelInlineEdit,
  commitInlineEdit,
  resolveNextEditableTarget,
  focusInlineEditorTarget,
})
const tabTargetResolver = useDataGridTabTargetResolver<CellCoord>({
  resolveNavigableColumnIndexes() {
    return navigableColumnIndexes.value
  },
  normalizeCellCoord,
})
const cellNavigation = useDataGridCellNavigation<CellCoord>({
  resolveCurrentCellCoord,
  resolveTabTarget: tabTargetResolver.resolveTabTarget,
  normalizeCellCoord,
  getAdjacentNavigableColumnIndex,
  getFirstNavigableColumnIndex,
  getLastNavigableColumnIndex,
  getLastRowIndex() {
    return Math.max(0, filteredAndSortedRows.value.length - 1)
  },
  resolveStepRows() {
    return Math.max(1, Math.floor((viewportHeight.value - headerHeight.value) / ROW_HEIGHT))
  },
  closeContextMenu: closeCopyContextMenu,
  clearCellSelection,
  setLastAction(message) {
    lastAction.value = message
  },
  applyCellSelection,
})

const {
  rowModel,
  api,
  columnSnapshot,
  setRows,
  syncRowsInRange,
} = useDataGridRuntime<IncidentRow>({
  columns: DATA_GRID_COLUMNS,
  services: {
    transaction: history.transactionService,
  },
})
const visibleRows = ref<readonly DataGridRowNode<IncidentRow>[]>([])

const normalizedQuickFilter = computed(() => query.value.trim().toLowerCase())
const searchableColumnKeys = computed(() =>
  columnSnapshot.value.visibleColumns
    .map(column => column.key)
    .filter(key => key !== "select"),
)
const activeColumnFilterCount = computed(() => Object.keys(appliedColumnFilters.value).length)
const hasColumnFilters = computed(() => activeColumnFilterCount.value > 0)

function withGroupingSortPriority(
  model: readonly DataGridSortState[],
  groupByKey: GroupByColumnKey,
): readonly DataGridSortState[] {
  if (groupByKey === "none") {
    return model
  }
  const withoutGroupKey = model.filter(entry => entry.key !== groupByKey)
  const groupEntry = model.find(entry => entry.key === groupByKey)
  return [{ key: groupByKey, direction: groupEntry?.direction ?? "asc" }, ...withoutGroupKey]
}

const filteredAndSortedRows = computed<IncidentRow[]>(() => {
  const quickFilteredRows = normalizedQuickFilter.value
    ? sourceRows.value.filter(row => matchesQuery(row, normalizedQuickFilter.value, searchableColumnKeys.value))
    : sourceRows.value
  const columnFilteredRows = hasColumnFilters.value
    ? quickFilteredRows.filter(row => rowMatchesColumnFilters(row, appliedColumnFilters.value))
    : quickFilteredRows
  return sortRows(columnFilteredRows, withGroupingSortPriority(sortState.value, groupBy.value))
})

function resolveGroupValue(row: IncidentRow, columnKey: GroupByColumnKey): string {
  if (columnKey === "none") {
    return ""
  }
  const raw = getRowCellValue(row, columnKey)
  const normalized = String(raw ?? "").trim()
  return normalized.length > 0 ? normalized : "(empty)"
}

const groupMeta = computed(() => {
  const starts = new Set<string>()
  const values = new Map<string, string>()
  const counts = new Map<string, number>()

  if (groupBy.value === "none") {
    return { starts, values, counts, groups: 0 }
  }

  let previousGroupValue: string | null = null
  let currentStartRowId: string | null = null

  for (const row of filteredAndSortedRows.value) {
    const rowId = String(row.rowId)
    const currentGroupValue = resolveGroupValue(row, groupBy.value)
    if (previousGroupValue === null || currentGroupValue !== previousGroupValue) {
      starts.add(rowId)
      values.set(rowId, currentGroupValue)
      counts.set(rowId, 1)
      previousGroupValue = currentGroupValue
      currentStartRowId = rowId
      continue
    }
    if (!currentStartRowId) {
      continue
    }
    counts.set(currentStartRowId, (counts.get(currentStartRowId) ?? 0) + 1)
  }

  return { starts, values, counts, groups: starts.size }
})
const groupCount = computed(() => groupMeta.value.groups)
const groupBySummary = computed(() => {
  if (groupBy.value === "none") {
    return "none"
  }
  return `${groupBy.value}`
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
const copiedCellsCount = computed(() => {
  const range = copiedSelectionRange.value
  if (!range) {
    return 0
  }
  return (range.endRow - range.startRow + 1) * (range.endColumn - range.startColumn + 1)
})

const isQuickFilterActive = computed(() => normalizedQuickFilter.value.length > 0)
const quickFilterStatus = computed(() => {
  if (!isQuickFilterActive.value) {
    return "Quick filter: all rows"
  }
  const displayQuery = query.value.trim()
  return `Quick filter: "${displayQuery}" · ${filteredAndSortedRows.value.length}/${sourceRows.value.length}`
})
const gridRowCount = computed(() => filteredAndSortedRows.value.length + 1)
const activeCellDescendantId = computed(() => {
  const active = activeCell.value
  if (!active) {
    return null
  }
  const row = filteredAndSortedRows.value[active.rowIndex]
  const column = orderedColumns.value[active.columnIndex]
  if (!row || !column) {
    return null
  }
  return getGridCellId(String(row.rowId), column.key)
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

const canUndoHistory = history.canUndo
const canRedoHistory = history.canRedo

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

const rangeMoveOverlaySegments = computed(() => {
  const preview = rangeMovePreviewRange.value
  const base = rangeMoveBaseRange.value
  if (!isRangeMoving.value || !preview || !base || rangesEqual(preview, base)) {
    return [] as SelectionOverlaySegment[]
  }
  return buildScrollOverlaySegments(preview, "move-preview")
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
    setRows(rows)
  }

  if (range.end < range.start) {
    visibleRows.value = []
    lastSyncedRowsRef = rows
    lastSyncedRangeStart = range.start
    lastSyncedRangeEnd = range.end
    return
  }

  visibleRows.value = syncRowsInRange({
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

function sanitizeDomIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function getGridCellId(rowId: string, columnKey: string): string {
  return `datagrid-cell-${sanitizeDomIdPart(rowId)}-${sanitizeDomIdPart(columnKey)}`
}

function getHeaderCellId(columnKey: string): string {
  return `datagrid-header-${sanitizeDomIdPart(columnKey)}`
}

function getColumnAriaIndex(columnKey: string): number {
  return Math.max(1, resolveColumnIndex(columnKey) + 1)
}

function getRowAriaIndex(row: DataGridRowNode<IncidentRow>): number {
  return Math.max(2, resolveRowIndex(row) + 2)
}

function isStickyColumn(columnKey: string): boolean {
  return stickyLeftOffsets.value.has(columnKey) || stickyRightOffsets.value.has(columnKey)
}

function isGroupedByColumn(columnKey: string): boolean {
  return groupBy.value !== "none" && columnKey === groupBy.value
}

function isSortableColumn(columnKey: string): boolean {
  return columnKey !== "select"
}

function isColumnResizable(columnKey: string): boolean {
  return columnKey !== "select"
}

function onHeaderCellClick(columnKey: string, event: MouseEvent) {
  if (!isSortableColumn(columnKey)) {
    return
  }
  applySortFromHeader(columnKey, event.shiftKey)
}

function onHeaderCellKeyDown(columnKey: string, event: KeyboardEvent) {
  if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
    if (columnKey === "select") {
      return
    }
    event.preventDefault()
    const target = event.currentTarget as HTMLElement | null
    const rect = target?.getBoundingClientRect()
    const x = rect ? rect.left + Math.min(rect.width - 8, Math.max(8, rect.width * 0.5)) : 24
    const y = rect ? rect.bottom - 6 : 24
    openCopyContextMenu(x, y, { zone: "header", columnKey })
    return
  }
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
  const beforeSnapshot = captureGridMutationSnapshot()
  const editCoord = resolveCellCoordFromDataset(editor.rowId, editor.columnKey)
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
  if (updated) {
    void recordIntentTransaction(
      {
        intent: "edit",
        label: `Edit ${editor.columnKey}`,
        affectedRange: toSingleCellRange(editCoord),
      },
      beforeSnapshot,
    )
  }
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
  inlineEditorKeyRouter.dispatchEditorKeyDown(event, rowId, columnKey)
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

function isColumnClearableForCut(columnKey: EditableColumnKey): boolean {
  return columnKey !== "region" && columnKey !== "environment" && columnKey !== "severity" && columnKey !== "status"
}

function canApplyPastedValue(columnKey: EditableColumnKey, draft: string): boolean {
  if (columnKey === "owner" || columnKey === "deployment" || columnKey === "channel" || columnKey === "runbook") {
    return draft.trim().length > 0
  }
  if (columnKey === "region" || columnKey === "environment" || columnKey === "severity" || columnKey === "status") {
    return Boolean(getEditorOptions(columnKey)?.includes(draft))
  }
  return Number.isFinite(Number(draft))
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
  closeCopyContextMenu()
  stopRangeMove(false)
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

function isCoordInsideRange(coord: CellCoord, range: CellSelectionRange): boolean {
  return (
    coord.rowIndex >= range.startRow &&
    coord.rowIndex <= range.endRow &&
    coord.columnIndex >= range.startColumn &&
    coord.columnIndex <= range.endColumn
  )
}

function isRangeMoveModifierActive(event: MouseEvent | KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey
}

function startRangeMove(coord: CellCoord, pointer: { clientX: number; clientY: number }) {
  return rangeMoveStart.startRangeMove(coord, pointer)
}

function getSelectionEdgeSides(row: DataGridRowNode<IncidentRow>, columnKey: string): {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
} {
  const range = cellSelectionRange.value
  if (!range || columnKey === "select") {
    return { top: false, right: false, bottom: false, left: false }
  }
  const rowIndex = resolveRowIndex(row)
  const columnIndex = resolveColumnIndex(columnKey)
  if (columnIndex < 0 || !isCellWithinRange(rowIndex, columnIndex, range)) {
    return { top: false, right: false, bottom: false, left: false }
  }
  return {
    top: rowIndex === range.startRow,
    right: columnIndex === range.endColumn,
    bottom: rowIndex === range.endRow,
    left: columnIndex === range.startColumn,
  }
}

function shouldShowSelectionMoveHandle(
  row: DataGridRowNode<IncidentRow>,
  columnKey: string,
  side: "top" | "right" | "bottom" | "left",
): boolean {
  if (isRangeMoving.value || isFillDragging.value || inlineEditor.value) {
    return false
  }
  const sides = getSelectionEdgeSides(row, columnKey)
  return sides[side]
}

function onSelectionMoveHandleMouseDown(
  row: DataGridRowNode<IncidentRow>,
  columnKey: string,
  event: MouseEvent,
) {
  if (event.button !== 0) {
    return
  }
  const coord = resolveCellCoord(row, columnKey)
  if (!coord) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  startRangeMove(coord, event)
}

function isMultiCellSelection(range: CellSelectionRange | null): boolean {
  if (!range) {
    return false
  }
  return range.startRow !== range.endRow || range.startColumn !== range.endColumn
}

function onCopyMenuKeyDown(event: KeyboardEvent) {
  onContextMenuKeyDown(event, {
    onEscape() {
      viewportRef.value?.focus()
    },
  })
}

function clearCopiedSelectionFlash() {
  clipboard.clearCopiedSelectionFlash()
}

function resolveCopyRange(): CellSelectionRange | null {
  const selected = cellSelectionRange.value
  if (selected) {
    return selected
  }
  const current = resolveCurrentCellCoord()
  if (!current) {
    return null
  }
  return {
    startRow: current.rowIndex,
    endRow: current.rowIndex,
    startColumn: current.columnIndex,
    endColumn: current.columnIndex,
  }
}

function normalizeClipboardValue(value: unknown): string {
  if (typeof value === "undefined" || value === null) {
    return ""
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return String(value)
}

async function copySelection(trigger: "keyboard" | "context-menu"): Promise<boolean> {
  return clipboard.copySelection(trigger)
}

function clearValueForCut(row: IncidentRow, columnKey: EditableColumnKey): boolean {
  if (columnKey === "owner") {
    if (row.owner === "") return false
    row.owner = ""
    return true
  }
  if (columnKey === "deployment") {
    if (row.deployment === "") return false
    row.deployment = ""
    return true
  }
  if (columnKey === "channel") {
    if (row.channel === "") return false
    row.channel = ""
    return true
  }
  if (columnKey === "runbook") {
    if (row.runbook === "") return false
    row.runbook = ""
    return true
  }
  if (!isColumnClearableForCut(columnKey)) {
    return false
  }
  if (columnKey === "latencyMs") {
    if (row.latencyMs === 0) return false
    row.latencyMs = 0
    return true
  }
  if (columnKey === "errorRate") {
    if (row.errorRate === 0) return false
    row.errorRate = 0
    return true
  }
  if (columnKey === "availabilityPct") {
    if (row.availabilityPct === 0) return false
    row.availabilityPct = 0
    return true
  }
  if (columnKey === "mttrMin") {
    if (row.mttrMin === 0) return false
    row.mttrMin = 0
    return true
  }
  if (columnKey === "cpuPct") {
    if (row.cpuPct === 0) return false
    row.cpuPct = 0
    return true
  }
  if (columnKey === "memoryPct") {
    if (row.memoryPct === 0) return false
    row.memoryPct = 0
    return true
  }
  if (columnKey === "queueDepth") {
    if (row.queueDepth === 0) return false
    row.queueDepth = 0
    return true
  }
  if (columnKey === "throughputRps") {
    if (row.throughputRps === 0) return false
    row.throughputRps = 0
    return true
  }
  if (columnKey === "sloBurnRate") {
    if (row.sloBurnRate === 0) return false
    row.sloBurnRate = 0
    return true
  }
  if (columnKey === "incidents24h") {
    if (row.incidents24h === 0) return false
    row.incidents24h = 0
    return true
  }
  return false
}

function applyValueForMove(row: IncidentRow, columnKey: string, value: string): boolean {
  if (columnKey === "select") {
    return false
  }
  if (isEditableColumn(columnKey)) {
    applyEditedValue(row, columnKey, value)
    return true
  }
  const record = row as unknown as Record<string, unknown>
  if (!(columnKey in record)) {
    return false
  }
  const current = record[columnKey]
  if (typeof current === "number") {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) {
      return false
    }
    record[columnKey] = numeric
    return true
  }
  if (typeof current === "boolean") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true" || normalized === "1") {
      record[columnKey] = true
      return true
    }
    if (normalized === "false" || normalized === "0") {
      record[columnKey] = false
      return true
    }
    return false
  }
  record[columnKey] = value
  return true
}

function clearValueForMove(row: IncidentRow, columnKey: string): boolean {
  if (columnKey === "select") {
    return false
  }
  if (isEditableColumn(columnKey)) {
    return clearValueForCut(row, columnKey)
  }
  const record = row as unknown as Record<string, unknown>
  if (!(columnKey in record)) {
    return false
  }
  const current = record[columnKey]
  if (typeof current === "number") {
    if (current === 0) {
      return false
    }
    record[columnKey] = 0
    return true
  }
  if (typeof current === "boolean") {
    if (!current) {
      return false
    }
    record[columnKey] = false
    return true
  }
  if (current == null || String(current) === "") {
    return false
  }
  record[columnKey] = ""
  return true
}

async function pasteSelection(trigger: "keyboard" | "context-menu"): Promise<boolean> {
  return clipboardMutations.pasteSelection(trigger)
}

async function clearCurrentSelection(trigger: "context-menu" | "keyboard"): Promise<boolean> {
  return clipboardMutations.clearCurrentSelection(trigger)
}

async function cutSelection(trigger: "keyboard" | "context-menu"): Promise<boolean> {
  return clipboardMutations.cutSelection(trigger)
}

async function onContextMenuAction(action: DataGridContextMenuActionId) {
  await contextMenuActionRouter.runContextMenuAction(action)
}

function resolveCellCoordFromDataset(rowId: string, columnKey: string): CellCoord | null {
  const rowIndex = filteredAndSortedRows.value.findIndex(row => String(row.rowId) === rowId)
  if (rowIndex < 0) {
    return null
  }
  const columnIndex = resolveColumnIndex(columnKey)
  if (columnIndex < 0) {
    return null
  }
  return normalizeCellCoord({ rowIndex, columnIndex })
}

function ensureCellVisible(coord: CellCoord) {
  cellVisibilityScroller.ensureCellVisible(coord)
}

function resolveColumnIndexByAbsoluteX(absoluteX: number): number {
  return pointerCellCoordResolver.resolveColumnIndexByAbsoluteX(absoluteX)
}

function resolveCellCoordFromPointer(clientX: number, clientY: number): CellCoord | null {
  return pointerCellCoordResolver.resolveCellCoordFromPointer(clientX, clientY)
}

function resolveAxisAutoScrollDelta(pointer: number, min: number, max: number): number {
  return axisAutoScrollDelta.resolveAxisAutoScrollDelta(pointer, min, max)
}

function applyDragSelectionFromPointer() {
  dragPointerSelection.applyDragSelectionFromPointer()
}

function applyFillPreviewFromPointer() {
  pointerPreviewRouter.applyFillPreviewFromPointer()
}

function applyRangeMovePreviewFromPointer() {
  pointerPreviewRouter.applyRangeMovePreviewFromPointer()
}

function startInteractionAutoScroll() {
  pointerAutoScroll.startInteractionAutoScroll()
}

function stopAutoScrollFrameIfIdle() {
  pointerAutoScroll.stopAutoScrollFrameIfIdle()
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
  stopRangeMove(false)
  isDragSelecting.value = false
  dragPointer.value = null
  isFillDragging.value = true
  fillBaseRange.value = { ...currentRange }
  fillPreviewRange.value = { ...currentRange }
  fillPointer.value = { clientX: event.clientX, clientY: event.clientY }
  startInteractionAutoScroll()
  lastAction.value = "Fill handle active"
}

function applyRangeMove(): boolean {
  const baseRange = rangeMoveBaseRange.value
  const targetRange = rangeMovePreviewRange.value
  if (!baseRange || !targetRange || rangesEqual(baseRange, targetRange)) {
    return false
  }
  const beforeSnapshot = captureGridMutationSnapshot()

  const sourceById = new Map(sourceRows.value.map(row => [row.rowId, row]))
  const mutableById = new Map<string, IncidentRow>()
  const statusNeedsRecompute = new Set<string>()
  const moveEntries: Array<{
    sourceRowId: string
    sourceColumnKey: string
    targetRowId: string
    targetColumnKey: string
    value: string
  }> = []

  const getMutableRow = (rowId: string): IncidentRow | null => {
    const existing = mutableById.get(rowId)
    if (existing) {
      return existing
    }
    const source = sourceById.get(rowId)
    if (!source) {
      return null
    }
    const clone = { ...source }
    mutableById.set(rowId, clone)
    return clone
  }

  let blocked = 0
  const sourceRowsSnapshot = filteredAndSortedRows.value
  for (let rowOffset = 0; rowOffset <= baseRange.endRow - baseRange.startRow; rowOffset += 1) {
    const sourceRowIndex = baseRange.startRow + rowOffset
    const targetRowIndex = targetRange.startRow + rowOffset
    const sourceRowNode = sourceRowsSnapshot[sourceRowIndex]
    const targetRowNode = sourceRowsSnapshot[targetRowIndex]
    if (!sourceRowNode || !targetRowNode) {
      blocked += baseRange.endColumn - baseRange.startColumn + 1
      continue
    }
    for (let columnOffset = 0; columnOffset <= baseRange.endColumn - baseRange.startColumn; columnOffset += 1) {
      const sourceColumnIndex = baseRange.startColumn + columnOffset
      const targetColumnIndex = targetRange.startColumn + columnOffset
      const sourceColumn = orderedColumns.value[sourceColumnIndex]
      const targetColumn = orderedColumns.value[targetColumnIndex]
      if (!sourceColumn || !targetColumn || sourceColumn.key === "select" || targetColumn.key === "select") {
        blocked += 1
        continue
      }
      moveEntries.push({
        sourceRowId: String(sourceRowNode.rowId),
        sourceColumnKey: sourceColumn.key,
        targetRowId: String(targetRowNode.rowId),
        targetColumnKey: targetColumn.key,
        value: normalizeClipboardValue(getRowCellValue(sourceRowNode, sourceColumn.key)),
      })
    }
  }

  if (!moveEntries.length) {
    if (blocked > 0) {
      lastAction.value = `Move blocked (${blocked} cells)`
    }
    return false
  }

  const sourceCellsToClear = new Map<string, Set<string>>()
  for (const entry of moveEntries) {
    const set = sourceCellsToClear.get(entry.sourceRowId) ?? new Set<string>()
    set.add(entry.sourceColumnKey)
    sourceCellsToClear.set(entry.sourceRowId, set)
  }

  for (const [rowId, columns] of sourceCellsToClear.entries()) {
    const mutable = getMutableRow(rowId)
    if (!mutable) {
      blocked += columns.size
      continue
    }
    for (const columnKey of columns) {
      const didClear = clearValueForMove(mutable, columnKey)
      if (!didClear) {
        blocked += 1
        continue
      }
      if (columnKey === "latencyMs" || columnKey === "errorRate") {
        statusNeedsRecompute.add(mutable.rowId)
      }
    }
  }

  let applied = 0
  for (const entry of moveEntries) {
    const mutable = getMutableRow(entry.targetRowId)
    if (!mutable) {
      blocked += 1
      continue
    }
    const didApply = applyValueForMove(mutable, entry.targetColumnKey, entry.value)
    if (!didApply) {
      blocked += 1
      continue
    }
    if (entry.targetColumnKey === "latencyMs" || entry.targetColumnKey === "errorRate") {
      statusNeedsRecompute.add(mutable.rowId)
    }
    applied += 1
  }

  for (const rowId of statusNeedsRecompute) {
    const row = mutableById.get(rowId)
    if (!row) continue
    row.status = resolveStatus(row.latencyMs, row.errorRate)
  }

  sourceRows.value = sourceRows.value.map(row => mutableById.get(row.rowId) ?? row)
  cellAnchor.value = { rowIndex: targetRange.startRow, columnIndex: targetRange.startColumn }
  cellFocus.value = { rowIndex: targetRange.endRow, columnIndex: targetRange.endColumn }
  activeCell.value = { rowIndex: targetRange.startRow, columnIndex: targetRange.startColumn }
  void recordIntentTransaction(
    {
      intent: "move",
      label: blocked > 0
        ? `Move ${applied} cells (blocked ${blocked})`
        : `Move ${applied} cells`,
      affectedRange: targetRange,
    },
    beforeSnapshot,
  )
  lastAction.value = blocked > 0
    ? `Moved ${applied} cells, blocked ${blocked}`
    : `Moved ${applied} cells`
  return applied > 0
}

function applyFillPreview() {
  const baseRange = fillBaseRange.value
  const previewRange = fillPreviewRange.value
  if (!baseRange || !previewRange || rangesEqual(baseRange, previewRange)) {
    return
  }
  const beforeSnapshot = captureGridMutationSnapshot()

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
  void recordIntentTransaction(
    {
      intent: "fill",
      label: `Fill ${changedCells} cells`,
      affectedRange: previewRange,
    },
    beforeSnapshot,
  )
  lastAction.value = `Fill applied (${changedCells} cells)`
}

function stopFillSelection(applyPreview: boolean) {
  fillSelectionLifecycle.stopFillSelection(applyPreview)
}

function stopRangeMove(applyPreview: boolean) {
  rangeMoveLifecycle.stopRangeMove(applyPreview)
}

function onGlobalMouseMove(event: MouseEvent) {
  globalPointerLifecycle.dispatchGlobalMouseMove(event)
}

function onGlobalMouseDown(event: MouseEvent) {
  globalMouseDownContextMenuCloser.dispatchGlobalMouseDown(event)
}

function onGlobalMouseUp(event: MouseEvent) {
  globalPointerLifecycle.dispatchGlobalMouseUp(event)
}

function onGlobalPointerUp(event: PointerEvent) {
  globalPointerLifecycle.dispatchGlobalPointerUp(event)
}

function onGlobalPointerCancel() {
  globalPointerLifecycle.dispatchGlobalPointerCancel()
}

function onGlobalContextMenuCapture(event: MouseEvent) {
  globalPointerLifecycle.dispatchGlobalContextMenuCapture(event)
}

function onGlobalWindowBlur() {
  globalPointerLifecycle.dispatchGlobalWindowBlur()
}

function onDataCellMouseDown(row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) {
  cellPointerDownRouter.dispatchCellPointerDown(row, columnKey, event)
}

function onViewportContextMenu(event: MouseEvent) {
  viewportContextMenuRouter.dispatchViewportContextMenu(event)
}

function onDataCellMouseEnter(row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) {
  cellPointerHoverRouter.dispatchCellPointerEnter(row, columnKey, event)
}

function stopDragSelection() {
  dragSelectionLifecycle.stopDragSelection()
}

function onViewportBlur(event: FocusEvent) {
  viewportBlurHandler.handleViewportBlur(event)
}

function openContextMenuFromCurrentCell() {
  contextMenuAnchor.openContextMenuFromCurrentCell()
}

function onViewportKeyDown(event: KeyboardEvent) {
  if (inlineEditor.value) {
    return
  }
  if (keyboardCommandRouter.dispatchKeyboardCommands(event)) {
    return
  }
  cellNavigation.dispatchNavigation(event)
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

function isCellInCopiedRange(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  const range = copiedSelectionRange.value
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

function isGroupStartRow(row: DataGridRowNode<IncidentRow>): boolean {
  if (groupBy.value === "none") {
    return false
  }
  return groupMeta.value.starts.has(String(row.rowId))
}

function shouldShowGroupBadge(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (!isGroupedByColumn(columnKey)) {
    return false
  }
  return isGroupStartRow(row)
}

function resolveGroupBadgeText(row: DataGridRowNode<IncidentRow>): string {
  const rowId = String(row.rowId)
  const groupValue = groupMeta.value.values.get(rowId) ?? ""
  const count = groupMeta.value.counts.get(rowId) ?? 0
  return `${groupValue} (${count})`
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

function isCellInMovePreview(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  const preview = rangeMovePreviewRange.value
  const base = rangeMoveBaseRange.value
  if (!isRangeMoving.value || !preview || columnKey === "select") {
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
  if (copyContextMenu.value.visible) {
    closeCopyContextMenu()
  }
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

async function runHistoryAction(direction: "undo" | "redo", trigger: "keyboard" | "control"): Promise<boolean> {
  if (inlineEditor.value) {
    commitInlineEdit()
  }
  closeCopyContextMenu()
  if (direction === "undo" && !canUndoHistory.value) {
    lastAction.value = "Nothing to undo"
    return false
  }
  if (direction === "redo" && !canRedoHistory.value) {
    lastAction.value = "Nothing to redo"
    return false
  }
  try {
    const committedId = await history.runHistoryAction(direction)
    if (!committedId) {
      lastAction.value = direction === "undo" ? "Nothing to undo" : "Nothing to redo"
      return false
    }
    lastAction.value = direction === "undo"
      ? `Undo ${committedId} (${trigger})`
      : `Redo ${committedId} (${trigger})`
    return true
  } catch (error) {
    console.error(`[DataGrid] ${direction} failed`, error)
    lastAction.value = direction === "undo" ? "Undo failed" : "Redo failed"
    return false
  }
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
  rowModel.setSortModel(withGroupingSortPriority(value, groupBy.value))
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

watch(groupBy, value => {
  rowModel.setSortModel(withGroupingSortPriority(sortState.value, value))
  lastAction.value = value === "none" ? "Grouping disabled" : `Grouped by ${value}`
})

watch(appliedColumnFilters, value => {
  rowModel.setFilterModel(buildFilterSnapshot(value))
}, { immediate: true, deep: true })

watch([query, sortState, appliedColumnFilters, groupBy], () => {
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
  syncViewportHeight()
  syncVisibleRows()
  window.addEventListener("resize", scheduleViewportMeasure)
  window.addEventListener("mousedown", onGlobalMouseDown)
  window.addEventListener("mouseup", onGlobalMouseUp, true)
  window.addEventListener("pointerup", onGlobalPointerUp, true)
  window.addEventListener("pointercancel", onGlobalPointerCancel, true)
  window.addEventListener("contextmenu", onGlobalContextMenuCapture, true)
  window.addEventListener("blur", onGlobalWindowBlur)
  window.addEventListener("mousemove", onGlobalMouseMove)
})

onBeforeUnmount(() => {
  stopFillSelection(false)
  stopDragSelection()
  stopRangeMove(false)
  pointerAutoScroll.dispose()
  stopColumnResize()
  clearCopiedSelectionFlash()
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
  window.removeEventListener("resize", scheduleViewportMeasure)
  window.removeEventListener("mousedown", onGlobalMouseDown)
  window.removeEventListener("mouseup", onGlobalMouseUp, true)
  window.removeEventListener("pointerup", onGlobalPointerUp, true)
  window.removeEventListener("pointercancel", onGlobalPointerCancel, true)
  window.removeEventListener("contextmenu", onGlobalContextMenuCapture, true)
  window.removeEventListener("blur", onGlobalWindowBlur)
  window.removeEventListener("mousemove", onGlobalMouseMove)
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

function getRowCellValue(row: IncidentRow | null | undefined, columnKey: string): unknown {
  if (!row) {
    return undefined
  }
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
        <h2>Vue demo on datagrid-vue runtime</h2>
        <p>
          This playground runs on the package-level `@affino/datagrid-vue` runtime API and renders a wide virtualized
          dataset to stress horizontal and vertical behavior.
        </p>
      </div>

      <div class="datagrid-hero__chips" aria-label="Datagrid foundation">
        <span>@affino/datagrid-vue</span>
        <span>@affino/datagrid-core</span>
        <span>useDataGridRuntime</span>
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
      <label>
        <span>Group by</span>
        <AffinoSelect
          v-model="groupBy"
          class="datagrid-controls__select"
          :options="groupByOptions"
        />
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="pinStatusColumn" type="checkbox" />
        <span>Pin status column</span>
      </label>
      <button type="button" @click="randomizeRuntime">Runtime shift</button>
      <button
        type="button"
        class="ghost"
        :disabled="!canUndoHistory"
        @click="void runHistoryAction('undo', 'control')"
      >
        Undo
      </button>
      <button
        type="button"
        class="ghost"
        :disabled="!canRedoHistory"
        @click="void runHistoryAction('redo', 'control')"
      >
        Redo
      </button>
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
        role="dialog"
        :aria-labelledby="FILTER_PANEL_TITLE_ID"
      >
        <header class="datagrid-column-filter__header">
          <p>Column filter</p>
          <strong :id="FILTER_PANEL_TITLE_ID">{{ activeFilterColumnLabel }}</strong>
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
        <dt>Group by</dt>
        <dd>{{ groupBySummary }}</dd>
      </div>
      <div>
        <dt>Groups</dt>
        <dd>{{ groupCount }}</dd>
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
        <dt>Copied cells</dt>
        <dd>{{ copiedCellsCount }}</dd>
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
        :class="{ 'is-drag-selecting': isDragSelecting, 'is-fill-dragging': isFillDragging, 'is-range-moving': isRangeMoving, 'is-column-resizing': isColumnResizing }"
        tabindex="0"
        role="grid"
        aria-label="Datagrid viewport"
        :aria-colcount="orderedColumns.length"
        :aria-rowcount="gridRowCount"
        aria-multiselectable="true"
        :aria-activedescendant="activeCellDescendantId ?? undefined"
        :aria-describedby="GRID_HINT_ID"
        @scroll="onViewportScroll"
        @contextmenu="onViewportContextMenu"
        @keydown="onViewportKeyDown"
        @blur="onViewportBlur"
      >
        <div ref="headerRef" class="datagrid-stage__header" role="row" :style="{ gridTemplateColumns: templateColumns }">
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
            :id="getHeaderCellId(column.key)"
            role="columnheader"
            :aria-colindex="getColumnAriaIndex(column.key)"
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
          :class="{ 'is-selected': isRowSelected(String(row.rowId)), 'datagrid-stage__row--group-start': isGroupStartRow(row) }"
          role="row"
          :aria-rowindex="getRowAriaIndex(row)"
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
              'datagrid-stage__cell--copied': isCellInCopiedRange(row, column.key),
              'datagrid-stage__cell--fill-preview': isCellInFillPreview(row, column.key),
              'datagrid-stage__cell--move-preview': isCellInMovePreview(row, column.key),
              'datagrid-stage__cell--anchor': isAnchorCell(row, column.key),
              'datagrid-stage__cell--active': isActiveCell(row, column.key),
              'datagrid-stage__cell--sticky': isStickyColumn(column.key),
              'datagrid-stage__cell--range-end': isRangeEndCell(row, column.key),
              'datagrid-stage__cell--group-by': isGroupedByColumn(column.key),
              'datagrid-stage__cell--group-start': shouldShowGroupBadge(row, column.key),
            }"
            :data-column-key="column.key"
            :data-row-id="row.rowId"
            :style="getCellStyle(column.key)"
            :id="getGridCellId(String(row.rowId), column.key)"
            role="gridcell"
            :aria-colindex="getColumnAriaIndex(column.key)"
            :aria-selected="isCellInSelection(row, column.key) ? 'true' : 'false'"
            :aria-readonly="isEditableColumn(column.key) ? 'false' : 'true'"
            :aria-labelledby="getHeaderCellId(column.key)"
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
              <span
                v-if="shouldShowGroupBadge(row, column.key)"
                class="datagrid-stage__group-badge"
              >
                {{ resolveGroupBadgeText(row) }}
              </span>
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

            <span
              v-if="shouldShowSelectionMoveHandle(row, column.key, 'top')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--top"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="shouldShowSelectionMoveHandle(row, column.key, 'right')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--right"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="shouldShowSelectionMoveHandle(row, column.key, 'bottom')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--bottom"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="shouldShowSelectionMoveHandle(row, column.key, 'left')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--left"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
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
          v-for="segment in rangeMoveOverlaySegments"
          :key="segment.key"
          class="datagrid-stage__selection-overlay datagrid-stage__selection-overlay--move"
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
      <p :id="GRID_HINT_ID" class="datagrid-stage__hint">Visible columns: {{ visibleColumnsWindow.keys }} · Tip: drag selection border to move range.</p>
    </section>

    <div
      v-if="copyContextMenu.visible"
      ref="copyMenuRef"
      class="datagrid-copy-menu"
      :style="copyContextMenuStyle"
      data-datagrid-copy-menu
      :data-zone="copyContextMenu.zone"
      role="menu"
      :aria-label="copyContextMenu.zone === 'header' ? 'Column actions' : 'Cell actions'"
      tabindex="-1"
      @mousedown.stop
      @keydown.stop="onCopyMenuKeyDown"
    >
      <button
        v-for="action in contextMenuActions"
        :key="action.id"
        type="button"
        role="menuitem"
        :data-datagrid-menu-action="action.id"
        :data-datagrid-cut-action="action.id === 'cut' ? 'true' : null"
        :data-datagrid-paste-action="action.id === 'paste' ? 'true' : null"
        :data-datagrid-copy-action="action.id === 'copy' ? 'true' : null"
        @click="onContextMenuAction(action.id)"
      >
        {{ action.label }}
      </button>
    </div>
    <p class="datagrid-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ lastAction }}</p>
  </section>
</template>

<style scoped>
.datagrid-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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

.datagrid-stage__viewport.is-range-moving,
.datagrid-stage__viewport.is-range-moving .datagrid-stage__cell {
  cursor: move;
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

.datagrid-stage__row--group-start .datagrid-stage__cell {
  border-top: 1px solid rgba(125, 211, 252, 0.45);
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

.datagrid-stage__cell--copied {
  box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.85);
  background: rgba(56, 189, 248, 0.1);
}

.datagrid-stage__cell--fill-preview {
  background: rgba(125, 211, 252, 0.14);
}

.datagrid-stage__cell--move-preview {
  background: rgba(165, 180, 252, 0.14);
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

.datagrid-stage__cell--group-by {
  padding-top: 0.9rem;
}

.datagrid-stage__cell--group-start {
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.12), rgba(7, 10, 19, 0.92) 34%);
}

.datagrid-stage__group-badge {
  position: absolute;
  top: 2px;
  left: 8px;
  max-width: calc(100% - 16px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.58rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.95);
  pointer-events: none;
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

.datagrid-stage__selection-overlay--move {
  z-index: 13;
  border-style: dashed;
  border-color: rgba(165, 180, 252, 0.95);
  background: rgba(99, 102, 241, 0.07);
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

.datagrid-stage__move-handle-zone {
  position: absolute;
  pointer-events: auto;
  z-index: 26;
  background: transparent;
  cursor: move;
}

.datagrid-stage__move-handle-zone:hover {
  background: rgba(125, 211, 252, 0.2);
}

.datagrid-stage__move-handle-zone--top {
  top: -3px;
  left: -3px;
  right: -3px;
  height: 6px;
}

.datagrid-stage__move-handle-zone--right {
  top: -3px;
  right: -3px;
  bottom: -3px;
  width: 6px;
}

.datagrid-stage__move-handle-zone--bottom {
  left: -3px;
  right: -3px;
  bottom: -3px;
  height: 6px;
}

.datagrid-stage__move-handle-zone--left {
  top: -3px;
  left: -3px;
  bottom: -3px;
  width: 6px;
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

.datagrid-copy-menu {
  position: fixed;
  z-index: 220;
  min-width: 120px;
  border-radius: 0.6rem;
  border: 1px solid rgba(125, 211, 252, 0.35);
  background: rgba(9, 14, 26, 0.97);
  box-shadow: 0 10px 28px rgba(3, 7, 18, 0.58);
  padding: 0.3rem;
}

.datagrid-copy-menu button {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 0.45rem;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.82rem;
  line-height: 1.2;
  text-align: left;
  padding: 0.42rem 0.55rem;
  cursor: pointer;
}

.datagrid-copy-menu button:hover {
  border-color: rgba(125, 211, 252, 0.4);
  background: rgba(16, 27, 46, 0.96);
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
