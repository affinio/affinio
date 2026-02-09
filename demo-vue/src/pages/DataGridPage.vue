<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import AffinoSelect from "@/components/AffinoSelect.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import {
  applyGridTheme,
  defaultThemeTokens,
  industrialNeutralTheme,
  resolveGridThemeTokens,
  type DataGridColumnDef,
  type DataGridColumnSnapshot,
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
  useDataGridCellRangeHelpers,
  useDataGridEditableValuePolicy,
  useDataGridMoveMutationPolicy,
  useDataGridCellPointerDownRouter,
  useDataGridCellPointerHoverRouter,
  useDataGridColumnFilterOrchestration,
  useDataGridGroupMetaOrchestration,
  useDataGridGroupingSortOrchestration,
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
  useDataGridInlineEditorSchema,
  useDataGridInlineEditOrchestration,
  useDataGridHeaderResizeOrchestration,
  useDataGridHeaderSortOrchestration,
  useDataGridInlineEditorTargetNavigation,
  useDataGridInlineEditorKeyRouter,
  useDataGridIntentHistory,
  useDataGridKeyboardCommandRouter,
  useDataGridPointerAutoScroll,
  useDataGridAxisAutoScrollDelta,
  useDataGridCellVisibilityScroller,
  useDataGridPointerCellCoordResolver,
  useDataGridPointerPreviewRouter,
  useDataGridTabTargetResolver,
  useDataGridColumnLayoutOrchestration,
  useDataGridSelectionOverlayOrchestration,
  useDataGridRowsProjection,
  useDataGridRowSelectionOrchestration,
  useDataGridVirtualRangeMetrics,
  useDataGridViewportMeasureScheduler,
  useDataGridVisibleRowsSyncScheduler,
  useDataGridViewportBlurHandler,
  useDataGridViewportContextMenuRouter,
  type DataGridInlineEditorMode,
  type DataGridColumnFilterKind,
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

const INLINE_EDITOR_ENUM_OPTIONS = {
  severity: ["critical", "high", "medium", "low"],
  status: ["stable", "watch", "degraded"],
  environment: ["prod", "staging", "dev"],
  region: ["us-east", "us-west", "eu-central", "ap-south"],
} as const

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
const themeRootRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const scrollLeft = ref(0)
const viewportHeight = ref(420)
const viewportWidth = ref(960)
const headerHeight = ref(ROW_HEIGHT)
const cellAnchor = ref<CellCoord | null>(null)
const cellFocus = ref<CellCoord | null>(null)
const activeCell = ref<CellCoord | null>(null)
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

let lastDragCoord: CellCoord | null = null

const cellRangeHelpers = useDataGridCellRangeHelpers<
  DataGridRowNode<IncidentRow>,
  CellCoord,
  CellSelectionRange
>({
  resolveRowsLength() {
    return filteredAndSortedRows.value.length
  },
  resolveFirstNavigableColumnIndex: getFirstNavigableColumnIndex,
  resolveCandidateCurrentCell() {
    return activeCell.value ?? cellFocus.value ?? cellAnchor.value
  },
  resolveColumnIndex,
  resolveNearestNavigableColumnIndex,
  clampRowIndex,
  resolveRowIndex,
  isColumnSelectable(columnKey) {
    return columnKey !== "select"
  },
})
const {
  resolveCellCoord,
  normalizeCellCoord,
  normalizeSelectionRange,
  buildExtendedRange,
  isCellWithinRange,
  resolveCurrentCellCoord,
} = cellRangeHelpers

const sourceRows = ref<IncidentRow[]>(buildRows(rowCount.value, seed.value))
const inlineEditorSchema = useDataGridInlineEditorSchema({
  enumOptionsByColumn: INLINE_EDITOR_ENUM_OPTIONS,
})
const {
  getEditorOptions,
  isEnumColumn,
  hasEditorOption,
} = inlineEditorSchema
const editableValuePolicy = useDataGridEditableValuePolicy<IncidentRow, EditableColumnKey>({
  strategies: {
    owner: {
      kind: "text",
      apply(row, draft) {
        row.owner = draft || row.owner
      },
    },
    deployment: {
      kind: "text",
      apply(row, draft) {
        row.deployment = draft || row.deployment
      },
    },
    channel: {
      kind: "text",
      apply(row, draft) {
        row.channel = draft || row.channel
      },
    },
    runbook: {
      kind: "text",
      apply(row, draft) {
        row.runbook = draft || row.runbook
      },
    },
    region: {
      kind: "enum",
      isAllowed: draft => hasEditorOption("region", draft),
      apply(row, draft) {
        row.region = draft as IncidentRow["region"]
      },
      clearable: false,
    },
    environment: {
      kind: "enum",
      isAllowed: draft => hasEditorOption("environment", draft),
      apply(row, draft) {
        row.environment = draft as IncidentRow["environment"]
      },
      clearable: false,
    },
    severity: {
      kind: "enum",
      isAllowed: draft => hasEditorOption("severity", draft),
      apply(row, draft) {
        row.severity = draft as Severity
      },
      clearable: false,
    },
    status: {
      kind: "enum",
      isAllowed: draft => hasEditorOption("status", draft),
      apply(row, draft) {
        row.status = draft as Status
      },
      clearable: false,
    },
    latencyMs: {
      kind: "number",
      apply(row, value) {
        row.latencyMs = Math.max(1, Math.round(value))
      },
    },
    errorRate: {
      kind: "number",
      apply(row, value) {
        row.errorRate = Math.max(0, Math.round(value))
      },
    },
    availabilityPct: {
      kind: "number",
      apply(row, value) {
        row.availabilityPct = Math.min(100, Math.max(0, value))
      },
    },
    mttrMin: {
      kind: "number",
      apply(row, value) {
        row.mttrMin = Math.max(0, Math.round(value))
      },
    },
    cpuPct: {
      kind: "number",
      apply(row, value) {
        row.cpuPct = Math.min(100, Math.max(0, Math.round(value)))
      },
    },
    memoryPct: {
      kind: "number",
      apply(row, value) {
        row.memoryPct = Math.min(100, Math.max(0, Math.round(value)))
      },
    },
    queueDepth: {
      kind: "number",
      apply(row, value) {
        row.queueDepth = Math.max(0, Math.round(value))
      },
    },
    throughputRps: {
      kind: "number",
      apply(row, value) {
        row.throughputRps = Math.max(0, Math.round(value))
      },
    },
    sloBurnRate: {
      kind: "number",
      apply(row, value) {
        row.sloBurnRate = Math.max(0, Number(value.toFixed(2)))
      },
    },
    incidents24h: {
      kind: "number",
      apply(row, value) {
        row.incidents24h = Math.max(0, Math.round(value))
      },
    },
  },
})
const {
  hasEditablePolicy,
  applyEditedValue,
  canApplyPastedValue,
  clearEditedValue,
} = editableValuePolicy
const moveMutationPolicy = useDataGridMoveMutationPolicy<IncidentRow, EditableColumnKey>({
  isEditableColumn,
  applyEditedValue,
  clearEditedValue,
  isBlockedColumn(columnKey) {
    return columnKey === "select"
  },
})
const {
  applyValueForMove,
  clearValueForMove,
} = moveMutationPolicy
const columnFilterOrchestration = useDataGridColumnFilterOrchestration<IncidentRow>({
  resolveColumnFilterKind,
  resolveEnumFilterOptions,
  resolveColumnLabel(columnKey) {
    const column = DATA_GRID_COLUMNS.find(entry => entry.key === columnKey)
    return column?.label ? String(column.label) : columnKey
  },
  resolveCellValue(row, columnKey) {
    return getRowCellValue(row, columnKey)
  },
  isFilterableColumn(columnKey) {
    return columnKey !== "select"
  },
  setLastAction(message) {
    lastAction.value = message
  },
})
const {
  activeFilterColumnKey,
  columnFilterDraft,
  appliedColumnFilters,
  activeColumnFilterCount,
  hasColumnFilters,
  activeFilterColumnLabel,
  columnFilterOperatorOptions,
  activeColumnFilterEnumOptions,
  canApplyActiveColumnFilter,
  isColumnFilterActive,
  openColumnFilter,
  onHeaderFilterTriggerClick,
  closeColumnFilterPanel,
  onFilterOperatorChange,
  onFilterEnumValueChange,
  onFilterValueInput,
  onFilterSecondValueInput,
  doesOperatorNeedSecondValue,
  applyActiveColumnFilter,
  resetActiveColumnFilter,
  clearAllColumnFilters,
  buildFilterSnapshot,
  rowMatchesColumnFilters,
} = columnFilterOrchestration
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

const inlineEditOrchestration = useDataGridInlineEditOrchestration<
  IncidentRow,
  EditableColumnKey,
  CellSelectionRange,
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
  resolveCellValue(row, columnKey) {
    return getRowCellValue(row, columnKey)
  },
  isEditableColumn,
  isSelectColumn(columnKey) {
    return isEnumColumn(columnKey)
  },
  resolveRowLabel(row) {
    return row.service
  },
  applyEditedValue,
  finalizeEditedRow(row, columnKey) {
    if (columnKey === "latencyMs" || columnKey === "errorRate") {
      row.status = resolveStatus(row.latencyMs, row.errorRate)
    }
  },
  focusInlineEditor(rowId, columnKey, mode, openPicker) {
    return focusInlineEditorElement(rowId, columnKey, mode, openPicker)
  },
  setLastAction(message) {
    lastAction.value = message
  },
  captureBeforeSnapshot: captureGridMutationSnapshot,
  resolveAffectedRange(target) {
    return toSingleCellRange(resolveCellCoordFromDataset(target.rowId, target.columnKey))
  },
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
const {
  inlineEditor,
  isEditingCell,
  isSelectEditorCell,
  beginInlineEdit,
  cancelInlineEdit,
  commitInlineEdit,
  updateEditorDraft,
  onEditorInput,
  onEditorSelectChange: onEditorAffinoSelectChange,
} = inlineEditOrchestration

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
  clearValueForCut: clearEditedValue,
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
const inlineEditorTargetNavigation = useDataGridInlineEditorTargetNavigation<IncidentRow, EditableColumnKey>({
  resolveRows() {
    return filteredAndSortedRows.value
  },
  resolveOrderedColumns() {
    return orderedColumns.value
  },
  resolveRowId(row) {
    return row.rowId
  },
  resolveColumnIndex,
  isEditableColumn,
  isSelectColumn(columnKey) {
    return isEnumColumn(columnKey)
  },
  applyCellSelection,
  beginInlineEdit,
})
const inlineEditorKeyRouter = useDataGridInlineEditorKeyRouter({
  isEditableColumn,
  cancelInlineEdit,
  commitInlineEdit,
  resolveNextEditableTarget: inlineEditorTargetNavigation.resolveNextEditableTarget,
  focusInlineEditorTarget: inlineEditorTargetNavigation.focusInlineEditorTarget,
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
  setRows: setRuntimeRows,
  syncRowsInRange: syncRuntimeRowsInRange,
} = useDataGridRuntime<IncidentRow>({
  columns: DATA_GRID_COLUMNS,
  services: {
    transaction: history.transactionService,
  },
})
const visibleRows = ref<readonly DataGridRowNode<IncidentRow>[]>([])
const viewportMeasureScheduler = useDataGridViewportMeasureScheduler({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveHeaderElement() {
    return headerRef.value
  },
  resolveCurrentState() {
    return {
      viewportHeight: viewportHeight.value,
      viewportWidth: viewportWidth.value,
      headerHeight: headerHeight.value,
    }
  },
  applyMeasuredState(next) {
    viewportHeight.value = next.viewportHeight
    viewportWidth.value = next.viewportWidth
    headerHeight.value = next.headerHeight
  },
  rowHeight: ROW_HEIGHT,
  minViewportBodyHeight: 200,
})
const {
  syncViewportHeight,
  scheduleViewportMeasure,
  dispose: disposeViewportMeasureScheduler,
} = viewportMeasureScheduler

const searchableColumnKeys = computed(() =>
  columnSnapshot.value.visibleColumns
    .map(column => column.key)
    .filter(key => key !== "select"),
)
const groupingSortOrchestration = useDataGridGroupingSortOrchestration<GroupByColumnKey>({
  sortState,
  groupBy,
})
const {
  effectiveSortModel,
  sortSummary,
} = groupingSortOrchestration

const rowsProjection = useDataGridRowsProjection({
  rows: sourceRows,
  query,
  searchableColumnKeys,
  hasColumnFilters,
  appliedColumnFilters,
  sortModel: effectiveSortModel,
  resolveCellValue(row, columnKey) {
    return getRowCellValue(row, columnKey)
  },
  rowMatchesColumnFilters,
  fallbackQueryColumnKeys: [
    "service",
    "owner",
    "region",
    "environment",
    "deployment",
    "severity",
    "status",
    "channel",
    "runbook",
  ],
})
const {
  normalizedQuickFilter,
  filteredAndSortedRows,
} = rowsProjection
const rowSelectionOrchestration = useDataGridRowSelectionOrchestration({
  allRows: sourceRows,
  visibleRows: filteredAndSortedRows,
  resolveRowId(row) {
    return row.rowId
  },
})
const {
  selectedRowIds,
  selectedCount,
  allVisibleSelected: allFilteredSelected,
  someVisibleSelected: someFilteredSelected,
  isRowSelected,
  toggleRowSelection,
  toggleSelectAllVisible: toggleSelectAllFiltered,
  clearRowSelection,
  reconcileSelection: reconcileRowSelection,
} = rowSelectionOrchestration

function resolveGroupValueLabel(row: IncidentRow, columnKey: GroupByColumnKey): string {
  if (columnKey === "none") {
    return ""
  }
  const raw = getRowCellValue(row, columnKey)
  const normalized = String(raw ?? "").trim()
  return normalized.length > 0 ? normalized : "(empty)"
}

const groupMetaOrchestration = useDataGridGroupMetaOrchestration<IncidentRow, GroupByColumnKey>({
  rows: filteredAndSortedRows,
  groupBy,
  resolveRowId(row) {
    return row.rowId
  },
  resolveGroupValue(row, groupKey) {
    return resolveGroupValueLabel(row, groupKey)
  },
})
const {
  groupCount,
  groupBySummary,
  isGroupStartRow: isGroupStartRowId,
  resolveGroupBadgeText: resolveGroupBadgeTextByRowId,
} = groupMetaOrchestration
const columnLayoutOrchestration = useDataGridColumnLayoutOrchestration({
  columns: computed(() => columnSnapshot.value.visibleColumns),
  resolveColumnWidth,
  viewportWidth,
  scrollLeft,
})
const {
  orderedColumns,
  orderedColumnMetrics,
  templateColumns,
  visibleColumnsWindow,
  getCellStyle,
  isStickyColumn,
} = columnLayoutOrchestration
const navigableColumnIndexes = computed(() =>
  orderedColumns.value
    .map((column, index) => ({ column, index }))
    .filter(entry => entry.column.key !== "select")
    .map(entry => entry.index),
)
const virtualRangeMetrics = useDataGridVirtualRangeMetrics({
  totalRows: computed(() => filteredAndSortedRows.value.length),
  scrollTop,
  viewportHeight,
  rowHeight: ROW_HEIGHT,
  overscan: OVERSCAN,
})
const {
  virtualRange,
  spacerTopHeight,
  spacerBottomHeight,
  rangeLabel,
} = virtualRangeMetrics
const visibleRowsSyncScheduler = useDataGridVisibleRowsSyncScheduler<IncidentRow, DataGridRowNode<IncidentRow>>({
  resolveRows() {
    return filteredAndSortedRows.value
  },
  resolveRange() {
    return virtualRange.value
  },
  setRows(rows) {
    setRuntimeRows(rows)
  },
  syncRowsInRange(range) {
    return syncRuntimeRowsInRange({
      start: range.start,
      end: range.end,
    })
  },
  applyVisibleRows(rows) {
    visibleRows.value = rows
  },
})
const {
  syncVisibleRows,
  scheduleVisibleRowsSync,
  resetVisibleRowsSyncCache,
  dispose: disposeVisibleRowsSyncScheduler,
} = visibleRowsSyncScheduler

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
const selectionOverlayOrchestration = useDataGridSelectionOverlayOrchestration({
  headerHeight,
  rowHeight: ROW_HEIGHT,
  orderedColumns,
  orderedColumnMetrics,
  cellSelectionRange,
  fillPreviewRange,
  fillBaseRange,
  rangeMovePreviewRange,
  rangeMoveBaseRange,
  isRangeMoving,
})
const {
  cellSelectionOverlaySegments,
  fillPreviewOverlaySegments,
  rangeMoveOverlaySegments,
} = selectionOverlayOrchestration

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

function resolveColumnFilterKind(columnKey: string): DataGridColumnFilterKind {
  if (isEnumColumn(columnKey)) {
    return "enum"
  }
  if (NUMERIC_COLUMN_KEYS.has(columnKey)) {
    return "number"
  }
  return "text"
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

function resolveColumnWidth(column: DataGridColumnSnapshot): number {
  if (column.key === "select") {
    return Math.max(48, column.width ?? 58)
  }
  return Math.max(110, column.width ?? 160)
}

function isEditableColumn(columnKey: string): columnKey is EditableColumnKey {
  return hasEditablePolicy(columnKey)
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

async function focusInlineEditorElement(
  rowId: string,
  columnKey: EditableColumnKey,
  mode: DataGridInlineEditorMode,
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

function onEditorKeyDown(event: KeyboardEvent, rowId: string, columnKey: string) {
  inlineEditorKeyRouter.dispatchEditorKeyDown(event, rowId, columnKey)
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

function positiveModulo(value: number, divisor: number): number {
  if (divisor <= 0) {
    return 0
  }
  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
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
  return isGroupStartRowId(String(row.rowId))
}

function shouldShowGroupBadge(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (!isGroupedByColumn(columnKey)) {
    return false
  }
  return isGroupStartRow(row)
}

function resolveGroupBadgeText(row: DataGridRowNode<IncidentRow>): string {
  return resolveGroupBadgeTextByRowId(String(row.rowId))
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
  clearRowSelection()
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
  clearRowSelection()
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
  rowModel.setSortModel(effectiveSortModel.value)
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
  rowModel.setSortModel(effectiveSortModel.value)
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

watch(sourceRows, () => {
  reconcileRowSelection()
})

watch(
  [filteredAndSortedRows, virtualRange],
  () => {
    scheduleVisibleRowsSync()
  },
  { immediate: true },
)

let themeObserver: MutationObserver | null = null

function resolveDemoThemeTokens(): ReturnType<typeof resolveGridThemeTokens> {
  const mode = typeof document === "undefined" ? "dark" : document.documentElement.dataset.theme
  if (mode === "light") {
    return resolveGridThemeTokens(industrialNeutralTheme, { document })
  }
  return defaultThemeTokens
}

function applyDemoTheme() {
  if (!themeRootRef.value) {
    return
  }
  applyGridTheme(themeRootRef.value, resolveDemoThemeTokens())
}

onMounted(() => {
  applyDemoTheme()
  if (typeof document !== "undefined") {
    themeObserver = new MutationObserver(() => {
      applyDemoTheme()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })
  }
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
  themeObserver?.disconnect()
  themeObserver = null
  stopFillSelection(false)
  stopDragSelection()
  stopRangeMove(false)
  pointerAutoScroll.dispose()
  stopColumnResize()
  clearCopiedSelectionFlash()
  disposeVisibleRowsSyncScheduler()
  disposeViewportMeasureScheduler()
  window.removeEventListener("resize", scheduleViewportMeasure)
  window.removeEventListener("mousedown", onGlobalMouseDown)
  window.removeEventListener("mouseup", onGlobalMouseUp, true)
  window.removeEventListener("pointerup", onGlobalPointerUp, true)
  window.removeEventListener("pointercancel", onGlobalPointerCancel, true)
  window.removeEventListener("contextmenu", onGlobalContextMenuCapture, true)
  window.removeEventListener("blur", onGlobalWindowBlur)
  window.removeEventListener("mousemove", onGlobalMouseMove)
})

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
  <section class="datagrid-page" ref="themeRootRef">
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
      <ThemeToggle variant="compact" @theme-change="applyDemoTheme" />
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
