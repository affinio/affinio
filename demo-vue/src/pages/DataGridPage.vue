<script setup lang="ts">
import { computed, effectScope, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from "vue"
import AffinoSelect from "@/components/AffinoSelect.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import { useFloatingPopover, usePopoverController } from "@affino/popover-vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"
import {
  createInMemoryDataGridSettingsAdapter,
  createDataGridSelectionSummary,
  evaluateDataGridAdvancedFilterExpression,
  type DataGridAggregationModel,
  type DataGridColumnDef,
  type DataGridColumnModelSnapshot,
  type DataGridColumnStateSnapshot,
  type DataGridAdvancedFilterExpression,
  type DataGridPaginationSnapshot,
  type DataGridProjectionDiagnostics,
  type DataGridRowNode,
  type DataGridSortState,
} from "@affino/datagrid-core"
import {
  applyGridTheme,
  defaultThemeTokens,
  industrialNeutralTheme,
  resolveGridThemeTokens,
} from "@affino/datagrid-theme"
import {
  DATA_GRID_DATA_ATTRS,
  DATA_GRID_SELECTORS,
  type OpenDataGridContextMenuInput,
  useDataGridContextMenu,
  useDataGridRuntime,
} from "@affino/datagrid-vue"
import { useDataGridManagedWheelScroll } from "@affino/datagrid-vue/advanced"
import {
  useDataGridCellNavigation,
  useDataGridClipboardValuePolicy,
  useDataGridCopyRangeHelpers,
  useDataGridCellDatasetResolver,
  useDataGridCellRangeHelpers,
  useDataGridNavigationPrimitives,
  useDataGridMutationSnapshot,
  useDataGridCellVisualStatePredicates,
  useDataGridRangeMutationEngine,
  useDataGridA11yCellIds,
  useDataGridColumnUiPolicy,
  useDataGridEditableValuePolicy,
  useDataGridMoveMutationPolicy,
  useDataGridCellPointerDownRouter,
  useDataGridCellPointerHoverRouter,
  useDataGridColumnFilterOrchestration,
  useDataGridEnumTrigger,
  useDataGridGroupValueLabelResolver,
  useDataGridGroupMetaOrchestration,
  useDataGridGroupBadge,
  useDataGridGroupingSortOrchestration,
  resolveDataGridHeaderLayerViewportGeometry,
  resolveDataGridHeaderScrollSyncLeft,
  useDataGridDragPointerSelection,
  useDataGridClipboardBridge,
  useDataGridClipboardMutations,
  useDataGridContextMenuAnchor,
  useDataGridContextMenuActionRouter,
  useDataGridClearSelectionLifecycle,
  useDataGridDragSelectionLifecycle,
  useDataGridFillSelectionLifecycle,
  useDataGridFillHandleStart,
  useDataGridRangeMoveLifecycle,
  useDataGridRangeMoveStart,
  useDataGridSelectionMoveHandle,
  useDataGridGlobalMouseDownContextMenuCloser,
  useDataGridGlobalPointerLifecycle,
  useDataGridHeaderContextActions,
  useDataGridInlineEditorSchema,
  useDataGridInlineEditOrchestration,
  useDataGridHeaderResizeOrchestration,
  useDataGridHeaderInteractionRouter,
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
  useDataGridRowSelectionInputHandlers,
  useDataGridSelectionComparators,
  useDataGridPointerModifierPolicy,
  useDataGridRowSelectionOrchestration,
  useDataGridVirtualRangeMetrics,
  useDataGridViewportMeasureScheduler,
  useDataGridVisibleRowsSyncScheduler,
  useDataGridScrollIdleGate,
  useDataGridScrollPerfTelemetry,
  useDataGridQuickFilterActions,
  useDataGridCellCoordNormalizer,
  useDataGridHistoryActionRunner,
  useDataGridInlineEditorFocus,
  useDataGridViewportBlurHandler,
  useDataGridViewportScrollLifecycle,
  useDataGridViewportContextMenuRouter,
} from "@affino/datagrid-vue/internal"

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

type ColumnVisibilityPreset =
  | "all"
  | "incident-core"
  | "reliability-ops"

type AdvancedFilterPreset =
  | "none"
  | "risk-hotspots"
  | "production-critical"

type SetFilterApplyMode = "replace" | "add"

const DEFAULT_ROW_HEIGHT = 38
const DRAG_AUTO_SCROLL_EDGE_PX = 36
const DRAG_AUTO_SCROLL_MAX_STEP_PX = 28
const AUTO_SIZE_SAMPLE_LIMIT = 260
const AUTO_SIZE_CHAR_WIDTH = 7.2
const AUTO_SIZE_HORIZONTAL_PADDING = 28
const AUTO_SIZE_MAX_WIDTH = 640
const GRID_HINT_ID = "datagrid-a11y-hint"
const FILTER_PANEL_TITLE_ID = "datagrid-filter-panel-title"
const COLUMN_STATE_TABLE_ID = "datagrid-internal-demo-main"

const rowCount = ref(2400)
const columnCount = ref(20)
const seed = ref(1)
const query = ref("")
const sortPreset = ref("latency-desc")
const groupBy = ref<GroupByColumnKey>("none")
const columnVisibilityPreset = ref<ColumnVisibilityPreset>("all")
const advancedFilterPreset = ref<AdvancedFilterPreset>("none")
const sortState = ref<readonly DataGridSortState[]>([
  { key: "latencyMs", direction: "desc" },
])
const pinStatusColumn = ref(false)
const pinUpdatedAtRight = ref(false)
const rowHeightMode = ref<"fixed" | "auto">("fixed")
const baseRowHeight = ref(DEFAULT_ROW_HEIGHT)
const paginationPageSize = ref(0)
const paginationTargetPage = ref(1)
const lastAction = ref("Ready")
const freezeProjectionView = ref(false)
const frozenProjectionRows = ref<readonly IncidentRow[]>([])
const rowCountOptions = [2400, 6400, 10000] as const
const columnCountOptions = [10, 20, 50] as const
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
const columnVisibilityPresetOptions = [
  { value: "all", label: "All columns" },
  { value: "incident-core", label: "Incident core" },
  { value: "reliability-ops", label: "Reliability ops" },
] as const
const advancedFilterPresetOptions = [
  { value: "none", label: "None" },
  { value: "risk-hotspots", label: "Risk hotspots" },
  { value: "production-critical", label: "Production critical" },
] as const
const paginationPageSizeOptions = [
  { value: 0, label: "Disabled" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
] as const
const columnSetFilterSearch = ref("")
const columnSetFilterApplyMode = ref<SetFilterApplyMode>("replace")
const columnSetFilterSelectedValues = ref<string[]>([])
const columnStateAdapter = createInMemoryDataGridSettingsAdapter()
const savedColumnState = ref<DataGridColumnStateSnapshot | null>(null)

const activeGroupByOption = computed(() => (
  groupByOptions.find(option => option.value === groupBy.value) ?? groupByOptions[0]
))
const activeAdvancedFilterPresetOption = computed(() => (
  advancedFilterPresetOptions.find(option => option.value === advancedFilterPreset.value)
  ?? advancedFilterPresetOptions[0]
))
const hasSavedColumnState = computed(() => Boolean(savedColumnState.value))
const columnStateSummary = computed(() => (
  hasSavedColumnState.value ? "Saved snapshot available" : "No saved snapshot"
))
const savedColumnStateJson = computed(() =>
  savedColumnState.value ? JSON.stringify(savedColumnState.value, null, 2) : "No snapshot saved",
)
const columnStateMenuColumns = computed(() =>
  columnSnapshot.value.columns
    .filter(column => column.key !== "select")
    .map(column => ({
      key: column.key,
      label: column.column.label ?? column.key,
      visible: column.visible,
      pin: column.pin,
    })),
)

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

const GROUP_AGGREGATION_MODEL: DataGridAggregationModel<IncidentRow> = {
  basis: "filtered",
  columns: [
    { key: "rows", field: "rowId", op: "count" },
    { key: "latencySum", field: "latencyMs", op: "sum" },
    { key: "latencyAvg", field: "latencyMs", op: "avg" },
    { key: "errorAvg", field: "errorRate", op: "avg" },
  ],
}

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

const MAX_COLUMN_COUNT = 50
const BASE_DATA_GRID_COLUMNS: readonly DataGridColumnDef[] = [
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

const COLUMN_VISIBILITY_PRESETS: Record<ColumnVisibilityPreset, readonly string[]> = {
  all: BASE_DATA_GRID_COLUMNS.map(column => column.key),
  "incident-core": [
    "select",
    "service",
    "owner",
    "region",
    "environment",
    "deployment",
    "severity",
    "status",
    "updatedAt",
  ],
  "reliability-ops": [
    "select",
    "service",
    "owner",
    "region",
    "environment",
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
    "status",
  ],
}

const DATA_GRID_COLUMNS: readonly DataGridColumnDef[] = [
  ...BASE_DATA_GRID_COLUMNS,
  ...Array.from({ length: Math.max(0, MAX_COLUMN_COUNT - BASE_DATA_GRID_COLUMNS.length) }, (_, index) => {
    const id = index + 1
    return {
      key: `extra_${id}`,
      label: `Extra ${id}`,
      width: 140,
    } satisfies DataGridColumnDef
  }),
]

const viewportRef = ref<HTMLDivElement | null>(null)
const headerViewportRef = ref<HTMLDivElement | null>(null)
const headerRef = ref<HTMLDivElement | null>(null)
const themeRootRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const scrollLeft = ref(0)
const viewportHeight = ref(420)
const viewportWidth = ref(960)
const rowHeightPx = computed(() => Math.max(24, Math.round(baseRowHeight.value)))
const headerHeight = ref(rowHeightPx.value)
const bodyViewportHeaderOffset = computed(() => 0)
const viewportLayerGeometry = computed(() => resolveDataGridHeaderLayerViewportGeometry({
  headerViewportHeight: 0,
  bodyViewportWidth: viewportWidth.value,
  bodyViewportHeight: viewportHeight.value,
}))
const overlayContentWidth = computed(() => {
  const metrics = orderedColumnMetrics.value
  if (!metrics.length) {
    return 0
  }
  return metrics[metrics.length - 1]?.end ?? 0
})
const overlayContentHeight = computed(() => (
  Math.max(0, displayRowOffsets.value[displayRowOffsets.value.length - 1] ?? 0)
))
const overlayLayerStyle = computed(() => ({
  top: "0px",
  left: "0px",
  width: `${Math.max(0, overlayContentWidth.value)}px`,
  height: `${Math.max(0, overlayContentHeight.value)}px`,
}))
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
const shouldClearSourceOnRangeMove = ref(true)
const rowHeightOverrides = ref<Record<string, number>>({})
const activeRowResize = ref<{ rowId: string; startClientY: number; startHeight: number } | null>(null)
const rowHeightOverrideCount = computed(() => Object.keys(rowHeightOverrides.value).length)
const rowReorderDragSourceId = ref<string | null>(null)
const rowReorderDropTargetId = ref<string | null>(null)
const columnReorderDragSourceKey = ref<string | null>(null)
const columnReorderDropTargetKey = ref<string | null>(null)

let lastDragCoord: CellCoord | null = null
let ensureCellVisibleByCoord: ((coord: CellCoord) => void) | null = null
let resolveDisplayRowCount: () => number = () => 0
let resolveDisplayRowOffsetByIndex: (rowIndex: number) => number = () => 0
let resolveDisplayRowHeightByIndex: (rowIndex: number) => number = () => rowHeightPx.value
let resolveDisplayRowIndexFromOffset: (offset: number) => number = () => 0
let resolveVirtualWindowColumnTotal: () => number = () => 0
let resolveCanonicalVirtualWindow: () => {
  rowStart: number
  rowEnd: number
  rowTotal: number
  colStart: number
  colEnd: number
  colTotal: number
  overscan: {
    top: number
    bottom: number
    left: number
    right: number
  }
} | null = () => null
let resolveDisplayNodeAtIndex: (rowIndex: number) => DataGridRowNode<IncidentRow> | undefined = () => undefined
let resolveDisplayLeafRowAtIndex: (rowIndex: number) => IncidentRow | undefined = () => undefined
let materializeDisplayRows: () => readonly DataGridRowNode<IncidentRow>[] = () => []
const resolveSharedVirtualWindow = () => (
  resolveCanonicalVirtualWindow() ?? {
    rowStart: 0,
    rowEnd: 0,
    rowTotal: resolveDisplayRowCount(),
    colStart: 0,
    colEnd: 0,
    colTotal: resolveVirtualWindowColumnTotal(),
    overscan: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  }
)
const cellCoordNormalizer = useDataGridCellCoordNormalizer<CellCoord>({
  resolveVirtualWindow() {
    return resolveSharedVirtualWindow()
  },
})
const {
  normalizeCellCoordBase,
} = cellCoordNormalizer

const navigationPrimitives = useDataGridNavigationPrimitives<CellCoord, CellSelectionRange>({
  resolveColumns() {
    return orderedColumns.value
  },
  resolveRowsLength() {
    return resolveDisplayRowCount()
  },
  resolveNavigableColumnIndexes() {
    return navigableColumnIndexes.value
  },
  normalizeCellCoord: normalizeCellCoordBase,
  resolveCellAnchor() {
    return cellAnchor.value
  },
  resolveCellFocus() {
    return cellFocus.value
  },
  resolveActiveCell() {
    return activeCell.value
  },
  setCellAnchor(coord) {
    cellAnchor.value = coord
  },
  setCellFocus(coord) {
    cellFocus.value = coord
  },
  setActiveCell(coord) {
    activeCell.value = coord
  },
  ensureCellVisible(coord) {
    ensureCellVisibleByCoord?.(coord)
  },
  coordsEqual(left, right) {
    if (!left || !right) {
      return false
    }
    return left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex
  },
})
const {
  resolveRowIndex,
  resolveColumnIndex,
  clampRowIndex,
  getFirstNavigableColumnIndex,
  getLastNavigableColumnIndex,
  resolveNearestNavigableColumnIndex,
  getAdjacentNavigableColumnIndex,
  applyCellSelection,
  isCoordInsideRange,
} = navigationPrimitives

const cellRangeHelpers = useDataGridCellRangeHelpers<
  DataGridRowNode<IncidentRow>,
  CellCoord,
  CellSelectionRange
>({
  resolveRowsLength() {
    return resolveDisplayRowCount()
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
const copyRangeHelpers = useDataGridCopyRangeHelpers<CellCoord, CellSelectionRange>({
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  resolveCurrentCellCoord,
})
const {
  isMultiCellSelection,
  resolveCopyRange,
} = copyRangeHelpers
const cellDatasetResolver = useDataGridCellDatasetResolver<DataGridRowNode<IncidentRow>, CellCoord>({
  resolveRows() {
    return materializeDisplayRows()
  },
  resolveRowId(row) {
    return String(row.rowId ?? row.rowKey)
  },
  resolveColumnIndex,
  normalizeCellCoord,
})
const {
  resolveCellCoordFromDataset,
} = cellDatasetResolver
const { normalizeClipboardValue } = useDataGridClipboardValuePolicy()

const sourceRows = ref<IncidentRow[]>(buildRows(rowCount.value, seed.value))
const inlineEditorSchema = useDataGridInlineEditorSchema({
  enumOptionsByColumn: INLINE_EDITOR_ENUM_OPTIONS,
})
const {
  getEditorOptions,
  isEnumColumn,
  hasEditorOption,
} = inlineEditorSchema
const columnUiPolicy = useDataGridColumnUiPolicy<IncidentRow, GroupByColumnKey>({
  resolveCurrentGroupBy() {
    return groupBy.value
  },
  isEnumColumn,
  resolveEnumEditorOptions: getEditorOptions,
  resolveRows() {
    return sourceRows.value
  },
  resolveCellValue: getRowCellValue,
  numericColumnKeys: NUMERIC_COLUMN_KEYS,
})
const {
  isGroupedByColumn,
  isSortableColumn,
  isColumnResizable,
  resolveColumnFilterKind,
  resolveEnumFilterOptions,
  resolveColumnWidth,
} = columnUiPolicy
const a11yCellIds = useDataGridA11yCellIds<IncidentRow>({
  resolveColumnIndex,
  resolveRowIndex,
})
const {
  getGridCellId,
  getHeaderCellId,
  getColumnAriaIndex,
  getRowAriaIndex,
} = a11yCellIds
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
  isColumnFilterActive,
  openColumnFilter,
  closeColumnFilterPanel,
  onFilterOperatorChange,
  onFilterEnumValueChange,
  onFilterValueInput,
  onFilterSecondValueInput,
  doesOperatorNeedSecondValue,
  applyActiveColumnFilter,
  resetActiveColumnFilter,
  clearAllColumnFilters,
  rowMatchesColumnFilters,
} = columnFilterOrchestration

function parseFilterValueList(raw: string | null | undefined): string[] {
  const normalized = String(raw ?? "").trim()
  if (!normalized) {
    return []
  }
  try {
    const parsed = JSON.parse(normalized)
    if (!Array.isArray(parsed)) {
      return [normalized]
    }
    return parsed
      .map(item => String(item ?? "").trim())
      .filter(Boolean)
  } catch {
    return [normalized]
  }
}

function serializeFilterValueList(values: readonly string[]): string {
  return JSON.stringify(
    values
      .map(value => String(value ?? "").trim())
      .filter(Boolean),
  )
}

function createSortStateSignature(entries: readonly DataGridSortState[]): string {
  if (!entries.length) {
    return ""
  }
  return entries
    .map(entry => `${entry.key}:${entry.direction}`)
    .join("|")
}

function createAppliedColumnFiltersSignature(
  filters: Record<string, { kind: string; operator: string; value: string; value2?: string }>,
): string {
  const keys = Object.keys(filters)
  if (!keys.length) {
    return ""
  }
  keys.sort((left, right) => left.localeCompare(right))
  return keys
    .map((key) => {
      const filter = filters[key]
      return `${key}:${filter?.kind ?? ""}:${filter?.operator ?? ""}:${filter?.value ?? ""}:${filter?.value2 ?? ""}`
    })
    .join("|")
}

function resolveInitialSetFilterValues(): string[] {
  const draft = columnFilterDraft.value
  if (!draft || draft.kind === "number") {
    return []
  }
  if (draft.operator === "in-list" || draft.operator === "not-in-list") {
    return parseFilterValueList(draft.value)
  }
  const normalizedValue = draft.value.trim()
  if (!normalizedValue) {
    return []
  }
  if (draft.kind === "enum" || draft.operator === "equals") {
    return [normalizedValue]
  }
  return []
}

function initializeSetFilterState(): void {
  columnSetFilterSearch.value = ""
  columnSetFilterApplyMode.value = "replace"
  columnSetFilterSelectedValues.value = resolveInitialSetFilterValues()
}

watch(
  () => [
    columnFilterDraft.value?.columnKey ?? "",
    columnFilterDraft.value?.operator ?? "",
    columnFilterDraft.value?.value ?? "",
  ],
  () => {
    initializeSetFilterState()
  },
  { immediate: true },
)

const isSetFilterEnabled = computed(() => {
  const draft = columnFilterDraft.value
  return Boolean(draft && draft.kind !== "number")
})

const setFilterUniqueOptions = computed(() => {
  const draft = columnFilterDraft.value
  if (!draft || draft.kind === "number") {
    return [] as string[]
  }
  const values = new Set<string>()
  for (const row of sourceRows.value) {
    const value = String(getRowCellValue(row, draft.columnKey) ?? "").trim()
    if (value) {
      values.add(value)
    }
  }
  return [...values].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }),
  )
})

const normalizedSetFilterSearch = computed(() => columnSetFilterSearch.value.trim().toLowerCase())

const setFilterVisibleOptions = computed(() => {
  const search = normalizedSetFilterSearch.value
  if (!search) {
    return setFilterUniqueOptions.value
  }
  return setFilterUniqueOptions.value.filter(option => option.toLowerCase().includes(search))
})

const setFilterSelectedValueSet = computed(() => new Set(columnSetFilterSelectedValues.value))
const selectedSetFilterValueCount = computed(() => columnSetFilterSelectedValues.value.length)
const sortStateSignature = computed(() => createSortStateSignature(sortState.value))
const appliedColumnFiltersSignature = computed(() => (
  createAppliedColumnFiltersSignature(appliedColumnFilters.value)
))

function isSetFilterValueSelected(value: string): boolean {
  return setFilterSelectedValueSet.value.has(value)
}

function toggleSetFilterValue(value: string, checked: boolean): void {
  const next = new Set(columnSetFilterSelectedValues.value)
  if (checked) {
    next.add(value)
  } else {
    next.delete(value)
  }
  columnSetFilterSelectedValues.value = setFilterUniqueOptions.value.filter(option => next.has(option))
}

function onSetFilterValueChange(value: string, event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }
  toggleSetFilterValue(value, target.checked)
}

function selectAllVisibleSetFilterValues(): void {
  const next = new Set(columnSetFilterSelectedValues.value)
  for (const value of setFilterVisibleOptions.value) {
    next.add(value)
  }
  columnSetFilterSelectedValues.value = setFilterUniqueOptions.value.filter(option => next.has(option))
}

function clearSetFilterSelection(): void {
  columnSetFilterSelectedValues.value = []
}

function applySetFilterSelection(): void {
  const draft = columnFilterDraft.value
  if (!draft || draft.kind === "number") {
    return
  }

  const next = new Set<string>()
  if (columnSetFilterApplyMode.value === "add") {
    for (const value of resolveInitialSetFilterValues()) {
      next.add(value)
    }
  }
  for (const value of columnSetFilterSelectedValues.value) {
    next.add(value)
  }

  const values = setFilterUniqueOptions.value.filter(option => next.has(option))
  if (!values.length) {
    onFilterValueInput("")
    applyActiveColumnFilter()
    return
  }
  onFilterOperatorChange("in-list")
  onFilterValueInput(serializeFilterValueList(values))
  applyActiveColumnFilter()
}

type HeaderFilterPopover = {
  controller: ReturnType<typeof usePopoverController>
  floating: ReturnType<typeof useFloatingPopover>
  scope: ReturnType<typeof effectScope>
}

const headerFilterPopovers = new Map<string, HeaderFilterPopover>()

function createHeaderFilterPopover(columnKey: string): HeaderFilterPopover {
  const scope = effectScope()
  let controller!: ReturnType<typeof usePopoverController>
  let floating!: ReturnType<typeof useFloatingPopover>

  scope.run(() => {
    controller = usePopoverController({
      id: `datagrid-filter-${columnKey}`,
      role: "dialog",
      modal: false,
      closeOnEscape: true,
      closeOnInteractOutside: true,
      overlayKind: "popover",
      overlayEntryTraits: {
        ownerId: "datagrid-filter",
        priority: 80,
        returnFocus: false,
        data: { columnKey },
      },
    })

    floating = useFloatingPopover(controller, {
      placement: "bottom",
      align: "start",
      gutter: 8,
      lockScroll: false,
      returnFocus: false,
    })

    watch(
      () => controller.state.value.open,
      (open) => {
        if (open) {
          if (activeFilterColumnKey.value !== columnKey) {
            openColumnFilter(columnKey)
          }
          nextTick(() => {
            floating.updatePosition()
          })
          return
        }
        if (activeFilterColumnKey.value === columnKey) {
          closeColumnFilterPanel()
        }
      },
    )
  })

  return { controller, floating, scope }
}

function getHeaderFilterPopover(columnKey: string): HeaderFilterPopover {
  const existing = headerFilterPopovers.get(columnKey)
  if (existing) {
    return existing
  }
  const created = createHeaderFilterPopover(columnKey)
  headerFilterPopovers.set(columnKey, created)
  return created
}

function getHeaderFilterContentStyle(columnKey: string): Record<string, string> {
  return unref(getHeaderFilterPopover(columnKey).floating.contentStyle)
}

function getHeaderFilterTeleportTarget(columnKey: string): string | HTMLElement | null {
  return unref(getHeaderFilterPopover(columnKey).floating.teleportTarget)
}

function setHeaderFilterTriggerRef(columnKey: string, value: unknown): void {
  const element = value instanceof HTMLElement
    ? value
    : (value && typeof value === "object" && "$el" in (value as Record<string, unknown>)
        ? (value as { $el?: unknown }).$el
        : null)
  getHeaderFilterPopover(columnKey).floating.triggerRef.value = element instanceof HTMLElement ? element : null
}

function setHeaderFilterContentRef(columnKey: string, value: unknown): void {
  const element = value instanceof HTMLElement
    ? value
    : (value && typeof value === "object" && "$el" in (value as Record<string, unknown>)
        ? (value as { $el?: unknown }).$el
        : null)
  getHeaderFilterPopover(columnKey).floating.contentRef.value = element instanceof HTMLElement ? element : null
}

function openHeaderFilterPopover(
  columnKey: string,
  reason: "pointer" | "keyboard" | "programmatic" = "pointer",
): void {
  const popover = getHeaderFilterPopover(columnKey)
  if (activeFilterColumnKey.value !== columnKey) {
    openColumnFilter(columnKey)
  }
  popover.controller.open(reason)
  nextTick(() => {
    popover.floating.updatePosition()
  })
}

function closeHeaderFilterPopover(
  columnKey: string,
  reason: "pointer" | "keyboard" | "programmatic" = "programmatic",
): void {
  headerFilterPopovers.get(columnKey)?.controller.close(reason)
}

function openHeaderFilterMenuFromContextMenu(columnKey: string): void {
  openHeaderFilterPopover(columnKey, "programmatic")
}

function closeColumnFilterPopover(): void {
  const key = activeFilterColumnKey.value
  closeColumnFilterPanel()
  if (key) {
    closeHeaderFilterPopover(key, "programmatic")
  }
}

const {
  contextMenu: copyContextMenu,
  contextMenuRef: copyMenuRef,
  contextMenuStyle: copyContextMenuStyle,
  contextMenuActions,
  closeContextMenu: closeCopyContextMenu,
  openContextMenu: openCopyContextMenuBase,
  onContextMenuKeyDown,
} = useDataGridContextMenu({
  isColumnResizable,
  onBeforeOpen: closeColumnFilterPopover,
})
const contextMenuScrollCloseCooldownUntil = ref(0)
const openCopyContextMenu = (clientX: number, clientY: number, context: OpenDataGridContextMenuInput) => {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now()
  contextMenuScrollCloseCooldownUntil.value = now + 200
  openCopyContextMenuBase(clientX, clientY, context)
}

const selectionComparators = useDataGridSelectionComparators<CellCoord, CellSelectionRange>()
const {
  rangesEqual,
  cellCoordsEqual,
} = selectionComparators
const pointerModifierPolicy = useDataGridPointerModifierPolicy()
const {
  isRangeMoveModifierActive,
} = pointerModifierPolicy
const inlineEditorFocus = useDataGridInlineEditorFocus({
  resolveViewportElement() {
    return viewportRef.value
  },
  beforeFocus() {
    return nextTick()
  },
})
const {
  focusInlineEditorElement,
} = inlineEditorFocus
const mutationSnapshot = useDataGridMutationSnapshot<IncidentRow, CellCoord, CellSelectionRange>({
  resolveRows() {
    return sourceRows.value
  },
  setRows(rows) {
    freezeProjectionForEditMutation()
    sourceRows.value = rows
  },
  resolveCellAnchor() {
    return cellAnchor.value
  },
  setCellAnchor(coord) {
    cellAnchor.value = coord
  },
  resolveCellFocus() {
    return cellFocus.value
  },
  setCellFocus(coord) {
    cellFocus.value = coord
  },
  resolveActiveCell() {
    return activeCell.value
  },
  setActiveCell(coord) {
    activeCell.value = coord
  },
  resolveCopiedSelectionRange() {
    return copiedSelectionRange.value
  },
  setCopiedSelectionRange(range) {
    copiedSelectionRange.value = range
  },
  cloneRow(row) {
    return { ...row }
  },
  cloneCoord(coord) {
    return { ...coord }
  },
  cloneRange(range) {
    return { ...range }
  },
})
const {
  captureGridMutationSnapshot,
  applyGridMutationSnapshot,
  toTransactionRange,
  toSingleCellRange,
} = mutationSnapshot

const history = useDataGridIntentHistory<GridMutationSnapshot>({
  maxHistoryDepth: 120,
  captureSnapshot: captureGridMutationSnapshot,
  applySnapshot: applyGridMutationSnapshot,
  logger: console,
})
const clipboard = useDataGridClipboardBridge<DataGridRowNode<IncidentRow>, CellSelectionRange>({
  copiedSelectionRange,
  lastCopiedPayload,
  resolveCopyRange,
  getRowAtIndex(rowIndex) {
    return resolveDisplayNodeAtIndex(rowIndex)
  },
  getColumnKeyAtIndex(columnIndex) {
    return orderedColumns.value[columnIndex]?.key ?? null
  },
  getCellValue(row, columnKey) {
    if (row.kind === "group") {
      return ""
    }
    return getRowCellValue(row.data, columnKey)
  },
  setLastAction(message) {
    lastAction.value = message
  },
  closeContextMenu: closeCopyContextMenu,
})
const copySelection = (trigger: "keyboard" | "context-menu") => clipboard.copySelection(trigger)

const recordIntentTransaction = async (
  descriptor: IntentTransactionDescriptor,
  beforeSnapshot: GridMutationSnapshot,
): Promise<void> => {
  await history.recordIntentTransaction(
    {
      intent: descriptor.intent,
      label: descriptor.label,
      affectedRange: toTransactionRange(descriptor.affectedRange),
    },
    beforeSnapshot,
  )
}
const rangeMutationEngine = useDataGridRangeMutationEngine<
  IncidentRow,
  DataGridRowNode<IncidentRow>,
  GridMutationSnapshot,
  CellSelectionRange
>({
  resolveRangeMoveBaseRange() {
    return rangeMoveBaseRange.value
  },
  resolveRangeMovePreviewRange() {
    return rangeMovePreviewRange.value
  },
  resolveFillBaseRange() {
    return fillBaseRange.value
  },
  resolveFillPreviewRange() {
    return fillPreviewRange.value
  },
  areRangesEqual: rangesEqual,
  captureBeforeSnapshot: captureGridMutationSnapshot,
  resolveSourceRows() {
    return sourceRows.value
  },
  resolveSourceRowId(row) {
    return row.rowId
  },
  applySourceRows(rows) {
    freezeProjectionForEditMutation()
    sourceRows.value = [...rows]
  },
  resolveDisplayedRows() {
    return materializeDisplayRows()
  },
  resolveDisplayedRowId(row) {
    return String(row.rowId ?? row.rowKey)
  },
  resolveColumnKeyAtIndex(columnIndex) {
    return orderedColumns.value[columnIndex]?.key ?? null
  },
  resolveDisplayedCellValue(row, columnKey) {
    if (row.kind === "group") {
      return ""
    }
    return getRowCellValue(row.data, columnKey)
  },
  resolveSourceCellValue(row, columnKey) {
    return getRowCellValue(row, columnKey)
  },
  normalizeClipboardValue,
  isEditableColumn,
  applyValueForMove,
  clearValueForMove(row, columnKey) {
    if (!shouldClearSourceOnRangeMove.value) {
      return true
    }
    return clearValueForMove(row, columnKey)
  },
  applyEditedValue(row, columnKey, draft) {
    if (!isEditableColumn(columnKey)) {
      return
    }
    applyEditedValue(row, columnKey, draft)
  },
  shouldRecomputeDerivedForColumn(columnKey) {
    return columnKey === "latencyMs" || columnKey === "errorRate"
  },
  recomputeDerived(row) {
    row.status = resolveStatus(row.latencyMs, row.errorRate)
  },
  isCellWithinRange,
  setSelectionFromRange(range, activePosition) {
    cellAnchor.value = { rowIndex: range.startRow, columnIndex: range.startColumn }
    cellFocus.value = { rowIndex: range.endRow, columnIndex: range.endColumn }
    activeCell.value = activePosition === "start"
      ? { rowIndex: range.startRow, columnIndex: range.startColumn }
      : { rowIndex: range.endRow, columnIndex: range.endColumn }
  },
  recordIntent(descriptor, beforeSnapshot) {
    return recordIntentTransaction(
      {
        intent: descriptor.intent,
        label: descriptor.label,
        affectedRange: descriptor.affectedRange,
      },
      beforeSnapshot,
    )
  },
  setLastAction(message) {
    lastAction.value = message
  },
})
const {
  applyRangeMove,
  applyFillPreview,
} = rangeMutationEngine

const inlineEditOrchestration = useDataGridInlineEditOrchestration<
  IncidentRow,
  EditableColumnKey,
  CellSelectionRange,
  GridMutationSnapshot
>({
  sourceRows,
  setSourceRows(rows) {
    freezeProjectionForEditMutation()
    sourceRows.value = rows.map(row => ({ ...row }))
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
  commitInlineEdit: commitInlineEditCore,
  updateEditorDraft,
  onEditorInput,
  onEditorSelectChange: onEditorAffinoSelectChange,
} = inlineEditOrchestration
const commitInlineEdit = () => {
  const currentEditor = inlineEditor.value
  const beforeCommitProjectionRows = filteredAndSortedRows.value.slice()
  if (currentEditor && viewportRef.value) {
    const selector = `[${DATA_GRID_DATA_ATTRS.inlineEditorRowId}="${currentEditor.rowId}"][${DATA_GRID_DATA_ATTRS.inlineEditorColumnKey}="${currentEditor.columnKey}"]`
    const host = viewportRef.value.querySelector(selector)
    const input = host && (host.matches("input,textarea,select") ? host : host.querySelector("input,textarea,select"))
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
      updateEditorDraft(input.value)
    }
  }
  const committed = commitInlineEditCore()
  if (committed) {
    if (currentEditor) {
      const updatedRow = sourceRows.value.find(row => row.rowId === currentEditor.rowId)
      if (updatedRow) {
        const patch: Partial<IncidentRow> = {
          [currentEditor.columnKey]: getRowCellValue(updatedRow, currentEditor.columnKey),
        } as Partial<IncidentRow>
        if (currentEditor.columnKey === "latencyMs" || currentEditor.columnKey === "errorRate") {
          patch.status = updatedRow.status
        }
        applyRuntimeEdits([{ rowId: currentEditor.rowId, data: patch }])
      }
    }
    if (!runtimeAutoReapply.value) {
      freezeProjectionView.value = true
      frozenProjectionRows.value = remapRowsByCurrentSource(beforeCommitProjectionRows)
    } else if (freezeProjectionView.value) {
      freezeProjectionView.value = false
    }
    syncRuntimeProjectionDiagnostics()
    resetVisibleRowsSyncCache()
    syncVisibleRows()
    if (currentEditor) {
      const updatedRow = sourceRows.value.find(row => row.rowId === currentEditor.rowId)
      if (updatedRow) {
        visibleRows.value = visibleRows.value.map(node =>
          node.rowId === currentEditor.rowId
            ? { ...node, data: updatedRow, row: updatedRow }
            : node,
        )
      }
    }
  }
  return committed
}
const enumTrigger = useDataGridEnumTrigger<DataGridRowNode<IncidentRow>, CellCoord, IncidentRow>({
  isEnumColumn,
  isInlineEditorOpen() {
    return Boolean(inlineEditor.value)
  },
  isDragSelecting() {
    return isDragSelecting.value
  },
  isFillDragging() {
    return isFillDragging.value
  },
  isActiveCell(row, columnKey) {
    if (!activeCell.value) {
      return false
    }
    const coord = resolveCellCoord(row, columnKey)
    if (!coord) {
      return false
    }
    return coord.rowIndex === activeCell.value.rowIndex && coord.columnIndex === activeCell.value.columnIndex
  },
  resolveCellCoord,
  applyCellSelection,
  resolveRowData(row) {
    return row.data
  },
  beginInlineEdit,
})
const {
  shouldShowEnumTrigger,
  onEnumTriggerMouseDown,
} = enumTrigger

const clipboardMutations = useDataGridClipboardMutations<
  IncidentRow,
  EditableColumnKey,
  CellSelectionRange,
  CellCoord,
  GridMutationSnapshot
>({
  sourceRows,
  setSourceRows(rows) {
    freezeProjectionForEditMutation()
    sourceRows.value = rows.map(row => ({ ...row }))
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
    return resolveDisplayLeafRowAtIndex(rowIndex)
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
const headerInteractionRouter = useDataGridHeaderInteractionRouter({
  isSortableColumn,
  applySortFromHeader,
  openHeaderContextMenu(x, y, columnKey) {
    openCopyContextMenu(x, y, { zone: "header", columnKey })
  },
})
const {
  onHeaderCellClick,
  onHeaderCellKeyDown,
} = headerInteractionRouter
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
  resizeApplyMode: "raf",
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
  openColumnFilter: openHeaderFilterMenuFromContextMenu,
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
    return resolveDisplayNodeAtIndex(rowIndex)
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
const openContextMenuFromCurrentCell = contextMenuAnchor.openContextMenuFromCurrentCell
const clearCopiedSelectionFlash = clipboard.clearCopiedSelectionFlash
const pasteSelection = clipboardMutations.pasteSelection
const clearCurrentSelection = clipboardMutations.clearCurrentSelection
const cutSelection = clipboardMutations.cutSelection
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
const onContextMenuAction = contextMenuActionRouter.runContextMenuAction
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
const onViewportContextMenu = viewportContextMenuRouter.dispatchViewportContextMenu
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
const onViewportBlur = viewportBlurHandler.handleViewportBlur
const cellPointerDownRouter = useDataGridCellPointerDownRouter<DataGridRowNode<IncidentRow>, CellCoord, CellSelectionRange>({
  isSelectionColumn(columnKey) {
    return columnKey === "select"
  },
  isRangeMoveModifierActive,
  isEditorInteractionTarget(target) {
    return !!target?.closest(DATA_GRID_SELECTORS.inlineEditor) || !!target?.closest(DATA_GRID_SELECTORS.enumTrigger)
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
  startRangeMove(coord, pointer) {
    shouldClearSourceOnRangeMove.value = false
    return rangeMoveStart.startRangeMove(coord, pointer)
  },
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
const onDataCellMouseDown = (row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) => {
  if (row.kind === "group") {
    if (columnKey !== "select" && isTreeGroupToggleCell(row, columnKey)) {
      const eventTarget = event.target as Element | null
      if (eventTarget?.closest(`[${DATA_GRID_DATA_ATTRS.treeToggle}="true"]`)) {
        return false
      }
    }
    if (event.button === 0 && isTreeGroupToggleCell(row, columnKey)) {
      event.preventDefault()
      event.stopPropagation()
      toggleRuntimeGroup(row)
      return true
    }
    return false
  }
  if (
    event.detail >= 2 &&
    columnKey !== "select" &&
    !event.shiftKey &&
    !isRangeMoveModifierActive(event)
  ) {
    event.preventDefault()
    event.stopPropagation()
    stopDragSelection()
    stopFillSelection(false)
    stopRangeMove(false)
    beginInlineEdit(row.data, columnKey)
    return true
  }
  if (!event.shiftKey && !isRangeMoveModifierActive(event) && copiedSelectionRange.value) {
    copiedSelectionRange.value = null
  }
  return cellPointerDownRouter.dispatchCellPointerDown(row, columnKey, event)
}
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
const onDataCellMouseEnter = (row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) =>
  cellPointerHoverRouter.dispatchCellPointerEnter(row, columnKey, event)
const onDataCellDoubleClick = (row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) => {
  if (row.kind === "group") {
    if (columnKey !== "select" && isTreeGroupToggleCell(row, columnKey)) {
      const eventTarget = event.target as Element | null
      if (eventTarget?.closest(`[${DATA_GRID_DATA_ATTRS.treeToggle}="true"]`)) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      toggleRuntimeGroup(row)
    }
    return
  }
  if (columnKey === "select") {
    return
  }
  if (event.shiftKey || isRangeMoveModifierActive(event)) {
    return
  }
  // Dblclick should always enter edit mode even if a stale pointer interaction
  // flag remained set from the preceding click sequence.
  event.preventDefault()
  event.stopPropagation()
  stopDragSelection()
  stopFillSelection(false)
  stopRangeMove(false)
  beginInlineEdit(row.data, columnKey)
}
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
const dragSelectionLifecycle = useDataGridDragSelectionLifecycle({
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
})
const onDataCellContextMenu = (row: DataGridRowNode<IncidentRow>, columnKey: string, event: MouseEvent) => {
  if (columnKey === "select") {
    return false
  }
  const coord = resolveCellCoord(row, columnKey)
  if (!coord) {
    return false
  }
  const currentRange = cellSelectionRange.value
  if (!currentRange || !isCoordInsideRange(coord, currentRange)) {
    applyCellSelection(coord, false, coord, false)
  } else if (!cellCoordsEqual(activeCell.value, coord)) {
    activeCell.value = coord
  }
  const nextRange = cellSelectionRange.value
  const zone = isMultiCellSelection(nextRange) && !!nextRange && isCoordInsideRange(coord, nextRange)
    ? "range"
    : "cell"
  event.preventDefault()
  openCopyContextMenu(event.clientX, event.clientY, { zone, columnKey, rowId: String(row.rowId) })
  return true
}
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
const selectionMoveHandle = useDataGridSelectionMoveHandle<
  DataGridRowNode<IncidentRow>,
  CellCoord,
  CellSelectionRange
>({
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  resolveRowIndex,
  resolveColumnIndex,
  isCellWithinRange,
  resolveCellCoord,
  startRangeMove(coord, pointer) {
    shouldClearSourceOnRangeMove.value = true
    return rangeMoveStart.startRangeMove(coord, pointer)
  },
  isRangeMoving() {
    return isRangeMoving.value
  },
  isFillDragging() {
    return isFillDragging.value
  },
  isInlineEditorOpen() {
    return Boolean(inlineEditor.value)
  },
})
const {
  shouldShowSelectionMoveHandle,
  onSelectionMoveHandleMouseDown,
} = selectionMoveHandle
const pointerCellCoordResolver = useDataGridPointerCellCoordResolver<CellCoord>({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveColumnMetrics() {
    return orderedColumnMetrics.value
  },
  resolveColumns() {
    return orderedColumns.value
  },
  resolveVirtualWindow() {
    return resolveSharedVirtualWindow()
  },
  resolveHeaderHeight() {
    return bodyViewportHeaderOffset.value
  },
  resolveRowHeight() {
    return rowHeightPx.value
  },
  resolveRowIndexAtOffset(offset) {
    return resolveDisplayRowIndexFromOffset(offset)
  },
  resolveNearestNavigableColumnIndex,
  normalizeCellCoord,
})
const axisAutoScrollDelta = useDataGridAxisAutoScrollDelta({
  edgePx: DRAG_AUTO_SCROLL_EDGE_PX,
  maxStepPx: DRAG_AUTO_SCROLL_MAX_STEP_PX,
})
function setSynchronizedScrollLeft(nextLeft: number) {
  const resolvedLeft = resolveDataGridHeaderScrollSyncLeft(scrollLeft.value, nextLeft)
  if (resolvedLeft === scrollLeft.value) {
    return
  }
  scrollLeft.value = resolvedLeft
}
function syncHeaderViewportScroll() {
  const headerViewport = headerViewportRef.value
  if (!headerViewport) {
    return
  }
  const nextLeft = resolveDataGridHeaderScrollSyncLeft(headerViewport.scrollLeft, scrollLeft.value)
  if (headerViewport.scrollLeft !== nextLeft) {
    headerViewport.scrollLeft = nextLeft
  }
}
const cellVisibilityScroller = useDataGridCellVisibilityScroller<CellCoord>({
  resolveViewportElement() {
    return viewportRef.value
  },
  resolveColumnMetric(columnIndex) {
    return orderedColumnMetrics.value[columnIndex] ?? null
  },
  resolveVirtualWindow() {
    return resolveSharedVirtualWindow()
  },
  resolveHeaderHeight() {
    return bodyViewportHeaderOffset.value
  },
  resolveRowHeight() {
    return rowHeightPx.value
  },
  resolveRowOffset(rowIndex) {
    return resolveDisplayRowOffsetByIndex(rowIndex)
  },
  resolveRowHeightAtIndex(rowIndex) {
    return resolveDisplayRowHeightByIndex(rowIndex)
  },
  setScrollPosition(position) {
    scrollTop.value = position.top
    setSynchronizedScrollLeft(position.left)
  },
})
ensureCellVisibleByCoord = cellVisibilityScroller.ensureCellVisible
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
    return bodyViewportHeaderOffset.value
  },
  resolveAxisAutoScrollDelta,
  setScrollPosition(next) {
    scrollTop.value = next.top
    setSynchronizedScrollLeft(next.left)
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
  pointerPreviewApplyMode: "raf",
})
const onGlobalMouseMove = (event: MouseEvent) => {
  if (applyRowResizeByClientY(event.clientY)) {
    return
  }
  globalPointerLifecycle.dispatchGlobalMouseMove(event)
}
const onGlobalMouseUp = (event: MouseEvent) => {
  if (stopRowResize(true)) {
    return
  }
  globalPointerLifecycle.dispatchGlobalMouseUp(event)
}
const onGlobalPointerUp = (event: PointerEvent) => {
  if (stopRowResize(true)) {
    return
  }
  globalPointerLifecycle.dispatchGlobalPointerUp(event)
}
const onGlobalPointerCancel = () => {
  if (stopRowResize(false)) {
    return
  }
  globalPointerLifecycle.dispatchGlobalPointerCancel()
}
const onGlobalContextMenuCapture = globalPointerLifecycle.dispatchGlobalContextMenuCapture
const onGlobalWindowBlur = () => {
  stopRowResize(false)
  globalPointerLifecycle.dispatchGlobalWindowBlur()
}
const disposeGlobalPointerLifecycle = globalPointerLifecycle.dispose
const globalMouseDownContextMenuCloser = useDataGridGlobalMouseDownContextMenuCloser({
  isContextMenuVisible() {
    return copyContextMenu.value.visible
  },
  resolveContextMenuElement() {
    return copyMenuRef.value
  },
  closeContextMenu: closeCopyContextMenu,
})
const onGlobalMouseDown = globalMouseDownContextMenuCloser.dispatchGlobalMouseDown
const canUndoHistory = history.canUndo
const canRedoHistory = history.canRedo
const historyActionRunner = useDataGridHistoryActionRunner({
  hasInlineEditor() {
    return Boolean(inlineEditor.value)
  },
  commitInlineEdit,
  closeContextMenu: closeCopyContextMenu,
  canUndo() {
    return canUndoHistory.value
  },
  canRedo() {
    return canRedoHistory.value
  },
  runHistoryAction(direction) {
    return history.runHistoryAction(direction)
  },
  setLastAction(message) {
    lastAction.value = message
  },
  onError(direction, error) {
    console.error(`[DataGrid] ${direction} failed`, error)
  },
})
const {
  runHistoryAction,
} = historyActionRunner
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
const onEditorKeyDown = (event: KeyboardEvent, rowId: string, columnKey: string) => {
  if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
    updateEditorDraft(event.target.value)
    event.preventDefault()
    commitInlineEdit()
    return true
  }
  if (event.key === "Tab" && event.target instanceof HTMLInputElement) {
    updateEditorDraft(event.target.value)
  }
  return inlineEditorKeyRouter.dispatchEditorKeyDown(event, rowId, columnKey)
}
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
    return Math.max(0, resolveDisplayRowCount() - 1)
  },
  resolveStepRows() {
    return Math.max(1, Math.floor(viewportLayerGeometry.value.overlayHeight / rowHeightPx.value))
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
  core,
  columnSnapshot,
  virtualWindow: runtimeVirtualWindow,
  applyEdits: applyRuntimeEdits,
  reapplyView: reapplyRuntimeView,
  autoReapply: runtimeAutoReapply,
  setRows: setRuntimeRows,
  syncRowsInRange: syncRuntimeRowsInRange,
} = useDataGridRuntime<IncidentRow>({
  columns: DATA_GRID_COLUMNS,
  services: {
    transaction: history.transactionService,
  },
})
const unsubscribeCellsRefresh = api.onCellsRefresh(batch => {
  const reason = batch.reason ? ` · reason: ${batch.reason}` : ""
  lastAction.value = `Cell refresh batch: ${batch.cells.length} cells${reason}`
})
const runtimeProjection = ref<DataGridProjectionDiagnostics | null>(rowModel.getSnapshot().projection ?? null)
const unsubscribeRuntimeProjection = rowModel.subscribe(snapshot => {
  runtimeProjection.value = snapshot.projection ?? null
})
const paginationSnapshot = ref<DataGridPaginationSnapshot | null>(null)
const runtimeStaleStagesSummary = computed(() => {
  const stages = runtimeProjection.value?.staleStages ?? []
  return stages.length > 0 ? stages.join(", ") : "none"
})
const runtimeCycleVersion = computed(() => (
  runtimeProjection.value?.cycleVersion
  ?? runtimeProjection.value?.version
  ?? 0
))
const runtimeRecomputeVersion = computed(() => (
  runtimeProjection.value?.recomputeVersion ?? 0
))

function syncRuntimeProjectionDiagnostics(): void {
  runtimeProjection.value = rowModel.getSnapshot().projection ?? null
}

function runReapplyView(): void {
  freezeProjectionView.value = false
  reapplyRuntimeView()
  syncRuntimeProjectionDiagnostics()
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  syncPaginationState()
  lastAction.value = "Reapplied runtime projection"
}

const paginationSummary = computed(() => {
  const snapshot = paginationSnapshot.value
  if (!snapshot || !snapshot.enabled) {
    return "Disabled"
  }
  return `Page ${snapshot.currentPage + 1}/${Math.max(1, snapshot.pageCount)} · size ${snapshot.pageSize}`
})

const paginationSliceSummary = computed(() => {
  const snapshot = paginationSnapshot.value
  if (!snapshot || !snapshot.enabled || snapshot.startIndex < 0 || snapshot.endIndex < snapshot.startIndex) {
    return "-"
  }
  return `${snapshot.startIndex + 1}-${snapshot.endIndex + 1}`
})

function syncPaginationState(): void {
  const next = api.getPaginationSnapshot()
  paginationSnapshot.value = next
  paginationPageSize.value = next.enabled ? next.pageSize : 0
  paginationTargetPage.value = next.currentPage + 1
}

function setPaginationPageSize(nextPageSize: number): void {
  const normalizedPageSize = Number.isFinite(nextPageSize) && nextPageSize > 0
    ? Math.max(1, Math.trunc(nextPageSize))
    : 0
  const snapshot = paginationSnapshot.value ?? api.getPaginationSnapshot()
  const activePageSize = snapshot.enabled ? snapshot.pageSize : 0
  if (normalizedPageSize === activePageSize) {
    return
  }
  api.setPageSize(normalizedPageSize > 0 ? normalizedPageSize : null)
  api.setCurrentPage(0)
  resetViewportScrollPosition()
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  clearCellSelection()
  syncPaginationState()
  lastAction.value = normalizedPageSize > 0
    ? `Pagination enabled (${normalizedPageSize}/page)`
    : "Pagination disabled"
}

function applyPaginationTargetPage(nextPage: number): void {
  const snapshot = paginationSnapshot.value ?? api.getPaginationSnapshot()
  if (!snapshot.enabled) {
    return
  }
  const pageCount = Math.max(1, snapshot.pageCount)
  const normalizedPage = Number.isFinite(nextPage)
    ? Math.max(1, Math.min(pageCount, Math.trunc(nextPage)))
    : 1
  if (normalizedPage === snapshot.currentPage + 1) {
    return
  }
  api.setCurrentPage(normalizedPage - 1)
  resetViewportScrollPosition()
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  clearCellSelection()
  syncPaginationState()
  lastAction.value = `Pagination page ${normalizedPage}/${pageCount}`
}

function goPaginationPrev(): void {
  const snapshot = paginationSnapshot.value
  if (!snapshot || !snapshot.enabled || snapshot.currentPage <= 0) {
    return
  }
  applyPaginationTargetPage(snapshot.currentPage)
}

function goPaginationNext(): void {
  const snapshot = paginationSnapshot.value
  if (!snapshot || !snapshot.enabled || snapshot.currentPage >= snapshot.pageCount - 1) {
    return
  }
  applyPaginationTargetPage(snapshot.currentPage + 2)
}

function applyPaginationRoundtrip(): void {
  const snapshot = paginationSnapshot.value ?? api.getPaginationSnapshot()
  if (!snapshot.enabled) {
    lastAction.value = "Pagination is disabled"
    return
  }
  api.setPagination({
    pageSize: snapshot.pageSize,
    currentPage: snapshot.currentPage,
  })
  api.refresh()
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  syncPaginationState()
  lastAction.value = "Pagination snapshot roundtrip applied"
}

resolveCanonicalVirtualWindow = () => {
  const snapshot = runtimeVirtualWindow.value
  if (!snapshot) {
    return null
  }
  return {
    rowStart: snapshot.rowStart,
    rowEnd: snapshot.rowEnd,
    rowTotal: snapshot.rowTotal,
    colStart: snapshot.colStart,
    colEnd: snapshot.colEnd,
    colTotal: snapshot.colTotal > 0 ? snapshot.colTotal : resolveVirtualWindowColumnTotal(),
    overscan: {
      top: snapshot.overscan.top,
      bottom: snapshot.overscan.bottom,
      left: snapshot.overscan.left,
      right: snapshot.overscan.right,
    },
  }
}

interface ViewportRuntimeService {
  setRowHeightMode?: (mode: "fixed" | "auto") => void
  setBaseRowHeight?: (height: number) => void
  measureRowHeight?: () => void
  refresh?: (force?: boolean) => void
}

function resolveViewportRuntimeService(): ViewportRuntimeService | null {
  try {
    return core.getService("viewport") as ViewportRuntimeService
  } catch {
    return null
  }
}

function applyRuntimeRowHeightSettings(): void {
  const viewportService = resolveViewportRuntimeService()
  if (!viewportService) {
    return
  }
  viewportService.setRowHeightMode?.(rowHeightMode.value)
  viewportService.setBaseRowHeight?.(rowHeightPx.value)
  viewportService.refresh?.(true)
}

function applyColumnVisibilityPreset(preset: ColumnVisibilityPreset): void {
  const maxColumns = Math.max(1, Math.min(columnCount.value, DATA_GRID_COLUMNS.length))
  const allowedKeys = new Set(DATA_GRID_COLUMNS.slice(0, maxColumns).map(column => column.key))
  if (pinStatusColumn.value) {
    allowedKeys.add("status")
  }
  if (pinUpdatedAtRight.value) {
    allowedKeys.add("updatedAt")
  }
  const presetKeys = new Set(COLUMN_VISIBILITY_PRESETS[preset] ?? COLUMN_VISIBILITY_PRESETS.all)
  const showAll = preset === "all"
  for (const column of DATA_GRID_COLUMNS) {
    const isAllowed = allowedKeys.has(column.key)
    const shouldBeVisible = isAllowed && (column.key === "select" || showAll || presetKeys.has(column.key))
    api.setColumnVisibility(column.key, shouldBeVisible)
  }
}

function captureColumnState(snapshot: DataGridColumnModelSnapshot): DataGridColumnStateSnapshot {
  const visibility: Record<string, boolean> = {}
  const widths: Record<string, number> = {}
  const pinning: Record<string, "left" | "right" | "none"> = {}
  for (const column of snapshot.columns) {
    visibility[column.key] = column.visible
    if (typeof column.width === "number") {
      widths[column.key] = column.width
    }
    pinning[column.key] = column.pin
  }
  return {
    order: [...snapshot.order],
    visibility,
    widths,
    pinning,
  }
}

function applyCapturedColumnState(state: DataGridColumnStateSnapshot): void {
  api.setColumnOrder(state.order)
  for (const [key, visible] of Object.entries(state.visibility)) {
    api.setColumnVisibility(key, visible)
  }
  for (const [key, width] of Object.entries(state.widths)) {
    api.setColumnWidth(key, width)
  }
  for (const [key, pin] of Object.entries(state.pinning)) {
    api.setColumnPin(key, pin)
  }
}

function mutateColumnStateDemo(): void {
  const reordered = [
    "select",
    "owner",
    "service",
    "status",
    "region",
    "environment",
    "deployment",
    "severity",
    "latencyMs",
    "errorRate",
    "availabilityPct",
    "updatedAt",
  ]
  api.setColumnOrder(reordered)
  api.setColumnVisibility("runbook", false)
  api.setColumnVisibility("channel", false)
  api.setColumnWidth("service", 300)
  api.setColumnWidth("owner", 210)
  api.setColumnPin("owner", "left")
  api.setColumnPin("status", "right")
  pinStatusColumn.value = false
  pinUpdatedAtRight.value = false
  lastAction.value = "Mutated column state (order/visibility/width/pin)"
}

function saveCurrentColumnState(): void {
  const state = captureColumnState(api.getColumnModelSnapshot())
  columnStateAdapter.setColumnState(COLUMN_STATE_TABLE_ID, state)
  savedColumnState.value = columnStateAdapter.getColumnState(COLUMN_STATE_TABLE_ID)
  lastAction.value = "Saved column state snapshot"
}

function restoreSavedColumnState(): void {
  const state = columnStateAdapter.getColumnState(COLUMN_STATE_TABLE_ID)
  if (!state) {
    lastAction.value = "No saved column state snapshot"
    return
  }
  applyCapturedColumnState(state)
  savedColumnState.value = state
  lastAction.value = "Restored column state snapshot"
}

function clearSavedColumnState(): void {
  columnStateAdapter.setColumnState(COLUMN_STATE_TABLE_ID, null)
  savedColumnState.value = null
  lastAction.value = "Cleared saved column state snapshot"
}

function setColumnVisibilityFromMenu(columnKey: string, visible: boolean): void {
  api.setColumnVisibility(columnKey, visible)
  lastAction.value = visible
    ? `Column ${columnKey} shown`
    : `Column ${columnKey} hidden`
}

function onColumnStateVisibilityChange(columnKey: string, event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }
  setColumnVisibilityFromMenu(columnKey, target.checked)
}

function setColumnPinFromMenu(columnKey: string, pin: "left" | "right" | "none"): void {
  api.setColumnPin(columnKey, pin)
  lastAction.value = pin === "none"
    ? `Column ${columnKey} unpinned`
    : `Column ${columnKey} pinned ${pin}`
}

function showAllColumnsFromMenu(): void {
  for (const column of columnStateMenuColumns.value) {
    api.setColumnVisibility(column.key, true)
  }
  lastAction.value = "All columns visible"
}

function setRowHeightMode(nextMode: "fixed" | "auto"): void {
  if (rowHeightMode.value === nextMode) {
    return
  }
  rowHeightMode.value = nextMode
}

function measureVisibleRowHeight(): void {
  const viewportService = resolveViewportRuntimeService()
  if (!viewportService?.measureRowHeight) {
    lastAction.value = "Row height measurement is unavailable"
    return
  }
  viewportService.measureRowHeight()
  viewportService.refresh?.(true)
  scheduleViewportMeasure()
  syncVisibleRows()
  lastAction.value = "Measured visible rows for auto height cache"
}

function resetCustomRowHeights(): void {
  if (rowHeightOverrideCount.value === 0) {
    lastAction.value = "No custom row heights to reset"
    return
  }
  rowHeightOverrides.value = {}
  measureVisibleRowHeight()
  lastAction.value = "Reset custom row heights"
}

function applyRuntimeGroupBy(nextGroupBy: GroupByColumnKey): void {
  if (nextGroupBy === "none") {
    api.setGroupBy(null)
    return
  }
  api.setGroupBy({
    fields: [nextGroupBy],
    expandedByDefault: true,
  })
}

function applyRuntimeAggregationModel(nextGroupBy: GroupByColumnKey): void {
  if (nextGroupBy === "none") {
    api.setAggregationModel(null)
    return
  }
  api.setAggregationModel({
    basis: GROUP_AGGREGATION_MODEL.basis,
    columns: GROUP_AGGREGATION_MODEL.columns.map(column => ({ ...column })),
  })
}

function toggleRuntimeGroup(row: DataGridRowNode<IncidentRow>): void {
  if (row.kind !== "group") {
    return
  }
  const groupKey = row.groupMeta?.groupKey ?? String(row.rowId ?? row.rowKey)
  api.toggleGroup(groupKey)
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  const label = resolveTreeGroupLabel(row)
  const nextState = row.state.expanded ? "collapsed" : "expanded"
  lastAction.value = `${nextState}: ${label}`
}

function isColumnReorderEnabled(columnKey: string): boolean {
  return columnKey !== "select"
}

function resetColumnReorderDragState(): void {
  columnReorderDragSourceKey.value = null
  columnReorderDropTargetKey.value = null
}

function reorderVisibleColumnsByKey(sourceKey: string, targetKey: string): boolean {
  if (!sourceKey || !targetKey || sourceKey === targetKey) {
    return false
  }
  if (!isColumnReorderEnabled(sourceKey) || !isColumnReorderEnabled(targetKey)) {
    return false
  }

  const snapshot = api.getColumnModelSnapshot()
  const visibleOrder = snapshot.columns
    .filter(column => column.visible)
    .map(column => column.key)

  if (!visibleOrder.includes(sourceKey) || !visibleOrder.includes(targetKey)) {
    return false
  }

  const nextOrder = visibleOrder.filter(key => key !== sourceKey)
  const targetIndex = nextOrder.indexOf(targetKey)
  if (targetIndex < 0) {
    return false
  }
  nextOrder.splice(targetIndex, 0, sourceKey)
  api.setColumnOrder(nextOrder)
  return true
}

function onColumnReorderDragStart(columnKey: string, event: DragEvent): void {
  if (!isColumnReorderEnabled(columnKey)) {
    return
  }
  columnReorderDragSourceKey.value = columnKey
  columnReorderDropTargetKey.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/x-affino-column-key", columnKey)
    event.dataTransfer.dropEffect = "move"
  }
}

function onColumnReorderDragOver(columnKey: string, event: DragEvent): void {
  if (!isColumnReorderEnabled(columnKey) || !columnReorderDragSourceKey.value) {
    return
  }
  event.preventDefault()
  columnReorderDropTargetKey.value = columnKey
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }
}

function onColumnReorderDrop(columnKey: string, event: DragEvent): void {
  if (!isColumnReorderEnabled(columnKey)) {
    resetColumnReorderDragState()
    return
  }
  event.preventDefault()
  const sourceKey = columnReorderDragSourceKey.value
    ?? event.dataTransfer?.getData("text/x-affino-column-key")
    ?? null
  if (!sourceKey) {
    resetColumnReorderDragState()
    return
  }

  const reordered = reorderVisibleColumnsByKey(sourceKey, columnKey)
  lastAction.value = reordered
    ? `Column moved: ${sourceKey} -> ${columnKey}`
    : "Column reorder skipped"
  resetColumnReorderDragState()
}

function onColumnReorderDragEnd(): void {
  resetColumnReorderDragState()
}

function isColumnReorderDropTarget(columnKey: string): boolean {
  return columnReorderDropTargetKey.value === columnKey
}

function reorderSourceRowsById(sourceRowId: string, targetRowId: string): boolean {
  if (!sourceRowId || !targetRowId || sourceRowId === targetRowId) {
    return false
  }
  const sourceIndex = sourceRows.value.findIndex(row => row.rowId === sourceRowId)
  const targetIndex = sourceRows.value.findIndex(row => row.rowId === targetRowId)
  if (sourceIndex < 0 || targetIndex < 0) {
    return false
  }
  const nextRows = sourceRows.value.slice()
  const [moved] = nextRows.splice(sourceIndex, 1)
  if (!moved) {
    return false
  }
  const insertAt = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  nextRows.splice(Math.max(0, insertAt), 0, moved)
  sourceRows.value = nextRows
  return true
}

function resetRowReorderDragState(): void {
  rowReorderDragSourceId.value = null
  rowReorderDropTargetId.value = null
}

function onRowReorderDragStart(row: DataGridRowNode<IncidentRow>, event: DragEvent): void {
  if (row.kind !== "leaf") {
    return
  }
  rowReorderDragSourceId.value = row.data.rowId
  rowReorderDropTargetId.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", row.data.rowId)
  }
}

function onRowReorderDragOver(row: DataGridRowNode<IncidentRow>, event: DragEvent): void {
  if (row.kind !== "leaf" || !rowReorderDragSourceId.value) {
    return
  }
  event.preventDefault()
  rowReorderDropTargetId.value = row.data.rowId
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }
}

function onRowReorderDrop(row: DataGridRowNode<IncidentRow>, event: DragEvent): void {
  if (row.kind !== "leaf") {
    resetRowReorderDragState()
    return
  }
  event.preventDefault()
  const sourceRowId = rowReorderDragSourceId.value
    ?? event.dataTransfer?.getData("text/plain")
    ?? null
  if (!sourceRowId) {
    resetRowReorderDragState()
    return
  }
  const moved = reorderSourceRowsById(sourceRowId, row.data.rowId)
  lastAction.value = moved
    ? `Row moved: ${sourceRowId} -> ${row.data.rowId}`
    : "Row reorder skipped"
  resetRowReorderDragState()
}

function onRowReorderDragEnd(): void {
  resetRowReorderDragState()
}

function isRowReorderDropTarget(row: DataGridRowNode<IncidentRow>): boolean {
  return row.kind === "leaf" && rowReorderDropTargetId.value === row.data.rowId
}

function isRowResizeEnabledForRow(row: DataGridRowNode<IncidentRow>): boolean {
  return row.kind === "leaf" && rowHeightMode.value === "auto"
}

function resolveRowHeightForRowId(rowId: IncidentRow["rowId"]): number {
  const override = rowHeightOverrides.value[rowId]
  if (typeof override !== "number" || !Number.isFinite(override)) {
    return rowHeightPx.value
  }
  return Math.max(24, Math.min(120, Math.round(override)))
}

function resolveRowHeightForNode(row: DataGridRowNode<IncidentRow>): number {
  if (row.kind !== "leaf") {
    return rowHeightPx.value
  }
  return resolveRowHeightForRowId(row.data.rowId)
}

function resolveRowHeightForRow(row: IncidentRow): number {
  return resolveRowHeightForRowId(row.rowId)
}

function resolveRowInlineStyle(row: DataGridRowNode<IncidentRow>): Record<string, string> {
  return {
    gridTemplateColumns: layerTrackTemplate.value,
    "--datagrid-row-height": `${resolveRowHeightForNode(row)}px`,
  }
}

function applyRowResizeByClientY(clientY: number): boolean {
  const active = activeRowResize.value
  if (!active || !Number.isFinite(clientY)) {
    return false
  }
  const nextHeight = Math.max(24, Math.min(120, Math.round(active.startHeight + (clientY - active.startClientY))))
  rowHeightOverrides.value = {
    ...rowHeightOverrides.value,
    [active.rowId]: nextHeight,
  }
  return true
}

function stopRowResize(commit: boolean): boolean {
  const active = activeRowResize.value
  if (!active) {
    return false
  }
  activeRowResize.value = null
  if (commit) {
    measureVisibleRowHeight()
    const nextHeight = rowHeightOverrides.value[active.rowId]
    lastAction.value = typeof nextHeight === "number"
      ? `Row ${active.rowId} height ${nextHeight}px`
      : `Row ${active.rowId} height reset`
  } else {
    lastAction.value = "Row resize cancelled"
  }
  return true
}

function onRowResizeHandleMouseDown(row: DataGridRowNode<IncidentRow>, event: MouseEvent): void {
  if (row.kind !== "leaf" || rowHeightMode.value !== "auto") {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  closeCopyContextMenu()
  activeRowResize.value = {
    rowId: row.data.rowId,
    startClientY: event.clientY,
    startHeight: resolveRowHeightForNode(row),
  }
}

resolveDisplayRowCount = () => Math.max(0, rowModel.getRowCount())
resolveDisplayNodeAtIndex = (rowIndex: number) => {
  if (!Number.isFinite(rowIndex)) {
    return undefined
  }
  const normalized = Math.trunc(rowIndex)
  const count = resolveDisplayRowCount()
  if (normalized < 0 || normalized >= count) {
    return undefined
  }
  return rowModel.getRow(normalized) as DataGridRowNode<IncidentRow> | undefined
}
resolveDisplayLeafRowAtIndex = (rowIndex: number) => {
  const node = resolveDisplayNodeAtIndex(rowIndex)
  if (!node || node.kind === "group") {
    return undefined
  }
  return node.data
}
materializeDisplayRows = () => {
  const count = resolveDisplayRowCount()
  if (count <= 0) {
    return []
  }
  return rowModel.getRowsInRange({
    start: 0,
    end: count - 1,
  }) as readonly DataGridRowNode<IncidentRow>[]
}
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
  rowHeight: rowHeightPx.value,
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
  filteredAndSortedRows: baseFilteredAndSortedRows,
} = rowsProjection
const advancedFilterExpression = computed<DataGridAdvancedFilterExpression | null>(() => {
  if (advancedFilterPreset.value === "none") {
    return null
  }
  if (advancedFilterPreset.value === "risk-hotspots") {
    return {
      kind: "group",
      operator: "and",
      children: [
        {
          kind: "condition",
          key: "status",
          type: "text",
          operator: "in",
          value: ["degraded", "watch"],
        },
        {
          kind: "group",
          operator: "or",
          children: [
            {
              kind: "condition",
              key: "latencyMs",
              type: "number",
              operator: "gt",
              value: 320,
            },
            {
              kind: "condition",
              key: "errorRate",
              type: "number",
              operator: "gt",
              value: 8,
            },
            {
              kind: "condition",
              key: "sloBurnRate",
              type: "number",
              operator: "gt",
              value: 2,
            },
          ],
        },
      ],
    }
  }
  return {
    kind: "group",
    operator: "and",
    children: [
      {
        kind: "condition",
        key: "environment",
        type: "text",
        operator: "equals",
        value: "prod",
      },
      {
        kind: "condition",
        key: "severity",
        type: "text",
        operator: "in",
        value: ["critical", "high"],
      },
    ],
  }
})
const isAdvancedFilterActive = computed(() => advancedFilterExpression.value != null)

function remapRowsByCurrentSource(orderedRows: readonly IncidentRow[]): readonly IncidentRow[] {
  if (!Array.isArray(orderedRows) || orderedRows.length === 0) {
    return []
  }
  const sourceById = new Map(sourceRows.value.map(row => [row.rowId, row]))
  const nextRows: IncidentRow[] = []
  for (const row of orderedRows) {
    const mappedRow = sourceById.get(row.rowId)
    if (mappedRow) {
      nextRows.push(mappedRow)
    }
  }
  return nextRows
}

function freezeProjectionForEditMutation(): void {
  if (runtimeAutoReapply.value) {
    return
  }
  if (!freezeProjectionView.value) {
    freezeProjectionView.value = true
    frozenProjectionRows.value = remapRowsByCurrentSource(filteredAndSortedRows.value)
    return
  }
  frozenProjectionRows.value = remapRowsByCurrentSource(frozenProjectionRows.value)
}

const liveFilteredAndSortedRows = computed(() => {
  const expression = advancedFilterExpression.value
  if (!expression) {
    return baseFilteredAndSortedRows.value
  }
  return baseFilteredAndSortedRows.value.filter(row =>
    evaluateDataGridAdvancedFilterExpression(expression, condition =>
      getRowCellValue(row, condition.key),
    ),
  )
})
const filteredAndSortedRows = computed(() => (
  freezeProjectionView.value ? frozenProjectionRows.value : liveFilteredAndSortedRows.value
))
watch(liveFilteredAndSortedRows, rows => {
  if (freezeProjectionView.value) {
    return
  }
  frozenProjectionRows.value = rows
}, { immediate: true })
const advancedFilterSummary = computed(() => {
  if (advancedFilterPreset.value === "none") {
    return "none"
  }
  if (advancedFilterPreset.value === "risk-hotspots") {
    return "risk hotspots"
  }
  return "production critical"
})
const rowSelectionOrchestration = useDataGridRowSelectionOrchestration({
  allRows: sourceRows,
  visibleRows: filteredAndSortedRows,
  resolveRowId(row) {
    return row.rowId
  },
})
const {
  selectedCount,
  allVisibleSelected: allFilteredSelected,
  someVisibleSelected: someFilteredSelected,
  isRowSelected,
  toggleRowSelection,
  toggleSelectAllVisible: toggleSelectAllFiltered,
  clearRowSelection,
  reconcileSelection: reconcileRowSelection,
} = rowSelectionOrchestration
const rowSelectionInputHandlers = useDataGridRowSelectionInputHandlers({
  toggleSelectAllVisible: toggleSelectAllFiltered,
  toggleRowSelection,
})
const {
  onSelectAllChange,
  onRowSelectChange,
} = rowSelectionInputHandlers
const { resolveGroupValueLabel } = useDataGridGroupValueLabelResolver<IncidentRow, GroupByColumnKey>({
  resolveCellValue(row, groupKey) {
    return getRowCellValue(row, groupKey)
  },
  disabledGroupKeys: ["none"],
  emptyLabel: "(empty)",
})

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
const groupBadge = useDataGridGroupBadge<DataGridRowNode<IncidentRow>>({
  resolveRowId(row) {
    return String(row.rowId)
  },
  isGroupedByColumn,
  isGroupStartRowId,
  resolveGroupBadgeTextByRowId,
})
const {
  isGroupStartRow: isLegacyGroupStartRow,
  shouldShowGroupBadge: shouldShowLegacyGroupBadgeRaw,
  resolveGroupBadgeText: resolveLegacyGroupBadgeText,
} = groupBadge
const isTreeGroupingEnabled = computed(() => groupBy.value !== "none")
const visibleGroupRowsCount = computed(() => (
  visibleRows.value.reduce((count, row) => count + (row.kind === "group" ? 1 : 0), 0)
))
const groupsMetricLabel = computed(() => {
  if (!isTreeGroupingEnabled.value) {
    return String(groupCount.value)
  }
  return `${visibleGroupRowsCount.value} visible / ${groupCount.value} total`
})

function resolveTreeGroupColumnKey(row: DataGridRowNode<IncidentRow>): string | null {
  if (row.kind !== "group") {
    return null
  }
  const fromMeta = typeof row.groupMeta?.groupField === "string" ? row.groupMeta.groupField.trim() : ""
  if (fromMeta.length > 0) {
    return fromMeta
  }
  return groupBy.value === "none" ? null : groupBy.value
}

function isTreeGroupToggleCell(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  return row.kind === "group" && columnKey === resolveTreeGroupColumnKey(row)
}

function resolveTreeGroupIndentStyle(row: DataGridRowNode<IncidentRow>): { paddingInlineStart: string } {
  const level = row.kind === "group" && Number.isFinite(row.groupMeta?.level)
    ? Math.max(0, Math.trunc(row.groupMeta?.level as number))
    : 0
  return {
    paddingInlineStart: `${level * 14}px`,
  }
}

function resolveTreeGroupLabel(row: DataGridRowNode<IncidentRow>): string {
  if (row.kind !== "group") {
    return ""
  }
  const value = typeof row.groupMeta?.groupValue === "string" ? row.groupMeta.groupValue : ""
  return value.length > 0 ? value : "Group"
}

function resolveTreeGroupChildrenCount(row: DataGridRowNode<IncidentRow>): number {
  if (row.kind !== "group" || !Number.isFinite(row.groupMeta?.childrenCount)) {
    return 0
  }
  return Math.max(0, Math.trunc(row.groupMeta?.childrenCount as number))
}

function formatGroupAggregateNumber(value: unknown, fractionDigits = 0): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null
  }
  if (fractionDigits > 0) {
    return value.toFixed(fractionDigits)
  }
  return String(Math.round(value))
}

function resolveTreeGroupAggregateSummary(row: DataGridRowNode<IncidentRow>): string {
  if (row.kind !== "group") {
    return ""
  }
  const aggregates = row.groupMeta?.aggregates
  if (!aggregates) {
    return ""
  }
  const parts: string[] = []
  const rows = formatGroupAggregateNumber(aggregates.rows, 0)
  if (rows) {
    parts.push(`rows ${rows}`)
  }
  const latencySum = formatGroupAggregateNumber(aggregates.latencySum, 0)
  if (latencySum) {
    parts.push(`lat Σ ${latencySum}`)
  }
  const latencyAvg = formatGroupAggregateNumber(aggregates.latencyAvg, 1)
  if (latencyAvg) {
    parts.push(`lat μ ${latencyAvg}`)
  }
  const errorAvg = formatGroupAggregateNumber(aggregates.errorAvg, 1)
  if (errorAvg) {
    parts.push(`err μ ${errorAvg}`)
  }
  return parts.join(" · ")
}

function isRuntimeGroupStartRow(row: DataGridRowNode<IncidentRow>): boolean {
  return row.kind === "group" || isLegacyGroupStartRow(row)
}

function shouldShowGroupBadge(row: DataGridRowNode<IncidentRow>, columnKey: string): boolean {
  if (row.kind !== "leaf" || isTreeGroupingEnabled.value) {
    return false
  }
  return shouldShowLegacyGroupBadgeRaw(row, columnKey)
}

function resolveGroupBadgeText(row: DataGridRowNode<IncidentRow>): string {
  if (row.kind !== "leaf") {
    return ""
  }
  return resolveLegacyGroupBadgeText(row)
}
const columnLayoutOrchestration = useDataGridColumnLayoutOrchestration({
  columns: computed(() => columnSnapshot.value.visibleColumns),
  resolveColumnWidth,
  virtualWindow: computed(() => runtimeVirtualWindow.value),
})
const {
  orderedColumns,
  orderedColumnMetrics,
  columnLayers,
  layerTrackTemplate,
  visibleColumnsWindow,
} = columnLayoutOrchestration
resolveVirtualWindowColumnTotal = () => orderedColumns.value.length
const navigableColumnIndexes = computed(() =>
  orderedColumns.value
    .map((column, index) => ({ column, index }))
    .filter(entry => entry.column.key !== "select")
    .map(entry => entry.index),
)
const virtualRangeMetrics = useDataGridVirtualRangeMetrics({
  virtualWindow: computed(() => runtimeVirtualWindow.value),
  rowHeight: rowHeightPx.value,
})
const { rangeLabel } = virtualRangeMetrics
const displayRowHeights = computed(() => (
  filteredAndSortedRows.value.map(row => resolveRowHeightForRow(row))
))
const displayRowOffsets = computed(() => {
  const heights = displayRowHeights.value
  const offsets = new Array(heights.length + 1)
  offsets[0] = 0
  for (let index = 0; index < heights.length; index += 1) {
    offsets[index + 1] = offsets[index] + heights[index]
  }
  return offsets
})
const resolveDisplayRowOffset = (rowIndex: number): number => {
  const offsets = displayRowOffsets.value
  const totalRows = Math.max(0, offsets.length - 1)
  if (totalRows <= 0) {
    return 0
  }
  const normalized = Math.max(0, Math.min(totalRows, Math.trunc(rowIndex)))
  return offsets[normalized] ?? 0
}
const resolveDisplayRowHeightAtIndex = (rowIndex: number): number => {
  const heights = displayRowHeights.value
  const totalRows = heights.length
  if (totalRows <= 0) {
    return rowHeightPx.value
  }
  const normalized = Math.max(0, Math.min(totalRows - 1, Math.trunc(rowIndex)))
  return heights[normalized] ?? rowHeightPx.value
}
const resolveRowIndexAtOffset = (offset: number): number => {
  const offsets = displayRowOffsets.value
  const totalRows = Math.max(0, offsets.length - 1)
  if (totalRows <= 0) {
    return 0
  }
  const totalHeight = offsets[totalRows] ?? 0
  const clampedOffset = Math.max(0, Math.min(offset, totalHeight))
  let low = 0
  let high = totalRows - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    const rowStart = offsets[mid] ?? 0
    const rowEnd = offsets[mid + 1] ?? rowStart
    if (clampedOffset < rowStart) {
      high = mid - 1
      continue
    }
    if (clampedOffset >= rowEnd) {
      low = mid + 1
      continue
    }
    return mid
  }
  return Math.max(0, Math.min(totalRows - 1, low))
}
const renderRange = computed(() => {
  const total = Math.max(0, filteredAndSortedRows.value.length)
  if (total <= 0) {
    return { start: 0, end: -1 }
  }
  const range = resolveViewportRange()
  return {
    start: Math.max(0, Math.min(total - 1, range.start)),
    end: Math.max(0, Math.min(total - 1, range.end)),
  }
})
const renderSpacerTopHeight = computed(() => (
  Math.max(0, resolveDisplayRowOffset(renderRange.value.start))
))
const renderSpacerBottomHeight = computed(() => {
  const offsets = displayRowOffsets.value
  const total = Math.max(0, offsets.length - 1)
  if (total === 0 || renderRange.value.end < renderRange.value.start || offsets.length === 0) {
    return 0
  }
  const totalHeight = offsets[total] ?? 0
  const nextIndex = Math.max(0, Math.min(total, renderRange.value.end + 1))
  const renderedBottom = offsets[nextIndex] ?? totalHeight
  return Math.max(0, totalHeight - renderedBottom)
})
const resolveOverlayRowOffset = (rowIndex: number): number => {
  return resolveDisplayRowOffset(rowIndex)
}
const resolveOverlayRowHeight = (rowIndex: number): number => {
  return resolveDisplayRowHeightAtIndex(rowIndex)
}
const resolveViewportRange = () => {
  const heights = displayRowHeights.value
  const total = Math.max(0, heights.length)
  if (total <= 0) {
    return { start: 0, end: 0 }
  }
  const viewport = viewportRef.value
  const viewportBodyHeight = Math.max(1, viewport ? viewport.clientHeight : viewportHeight.value)
  const offsets = displayRowOffsets.value
  const totalHeight = offsets[total] ?? 0
  const maxScrollTop = Math.max(0, totalHeight - viewportBodyHeight)
  const clampedScrollTop = Math.max(0, Math.min(scrollTop.value, maxScrollTop))
  const start = resolveRowIndexAtOffset(clampedScrollTop)
  const viewportBottom = clampedScrollTop + viewportBodyHeight
  let end = start
  while (end < total - 1 && (offsets[end + 1] ?? 0) < viewportBottom) {
    end += 1
  }
  const overscanTop = Math.max(6, runtimeVirtualWindow.value?.overscan.top ?? 0)
  const overscanBottom = Math.max(6, runtimeVirtualWindow.value?.overscan.bottom ?? 0)
  const startWithOverscan = Math.max(0, start - overscanTop)
  const endWithOverscan = Math.max(startWithOverscan, Math.min(total - 1, end + overscanBottom))
  return { start: startWithOverscan, end: endWithOverscan }
}
resolveDisplayRowOffsetByIndex = resolveDisplayRowOffset
resolveDisplayRowHeightByIndex = resolveDisplayRowHeightAtIndex
resolveDisplayRowIndexFromOffset = resolveRowIndexAtOffset
const visibleRowsSyncScheduler = useDataGridVisibleRowsSyncScheduler<IncidentRow, DataGridRowNode<IncidentRow>>({
  resolveRows() {
    return filteredAndSortedRows.value
  },
  resolveRange() {
    return renderRange.value
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
const scrollIdleGate = useDataGridScrollIdleGate({
  resolveIdleDelayMs: () => 80,
})
const scrollPerfTelemetry = useDataGridScrollPerfTelemetry({
  resolveIdleDelayMs: () => 120,
  onSnapshotChange(next) {
    scrollPerfSnapshot.value = next
  },
})
const scrollPerfSnapshot = ref(scrollPerfTelemetry.getSnapshot())
let hasDeferredVisibleRowsSync = false

const scrollPerfChipText = computed(() => {
  const snapshot = scrollPerfSnapshot.value
  const quality = snapshot.quality === "unknown" ? "warming" : snapshot.quality
  const fps = snapshot.fps > 0 ? Math.round(snapshot.fps) : 0
  return `perf: ${quality} · ${fps}fps · drop ${snapshot.droppedFrames}`
})

function markViewportScrollActivity() {
  scrollIdleGate.markScrollActivity()
  scrollPerfTelemetry.markScrollActivity()
}

function syncVisibleRowsWithScrollPriority() {
  if (!scrollIdleGate.isScrollActive()) {
    syncVisibleRows()
    syncPaginationState()
    return
  }
  if (hasDeferredVisibleRowsSync) {
    return
  }
  hasDeferredVisibleRowsSync = true
  scrollIdleGate.runWhenScrollIdle(() => {
    hasDeferredVisibleRowsSync = false
    syncVisibleRows()
    syncPaginationState()
  })
}

const cellSelectionRange = computed<CellSelectionRange | null>(() => {
  if (!cellAnchor.value || !cellFocus.value) {
    return null
  }
  const rowMax = resolveDisplayRowCount() - 1
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
const selectionSummary = computed(() => {
  const range = cellSelectionRange.value
  if (!range) {
    return null
  }

  const rowCount = resolveDisplayRowCount()
  if (rowCount <= 0) {
    return null
  }

  const startRowNode = resolveDisplayNodeAtIndex(range.startRow)
  const endRowNode = resolveDisplayNodeAtIndex(range.endRow)
  if (!startRowNode || !endRowNode) {
    return null
  }

  return createDataGridSelectionSummary<IncidentRow>({
    selection: {
      ranges: [
        {
          startRow: range.startRow,
          endRow: range.endRow,
          startCol: range.startColumn,
          endCol: range.endColumn,
          startRowId: startRowNode.rowId,
          endRowId: endRowNode.rowId,
          anchor: {
            rowIndex: range.startRow,
            colIndex: range.startColumn,
            rowId: startRowNode.rowId,
          },
          focus: {
            rowIndex: range.endRow,
            colIndex: range.endColumn,
            rowId: endRowNode.rowId,
          },
        },
      ],
      activeRangeIndex: 0,
      activeCell: activeCell.value
        ? {
            rowIndex: activeCell.value.rowIndex,
            colIndex: activeCell.value.columnIndex,
            rowId: resolveDisplayNodeAtIndex(activeCell.value.rowIndex)?.rowId ?? null,
          }
        : null,
    },
    rowCount,
    getRow(rowIndex) {
      return resolveDisplayNodeAtIndex(rowIndex)
    },
    getColumnKeyByIndex(columnIndex) {
      return orderedColumns.value[columnIndex]?.key ?? null
    },
    columns: [
      { key: "latencyMs", aggregations: ["count", "sum", "avg", "min", "max"] },
      { key: "errorRate", aggregations: ["avg", "max"] },
      { key: "owner", aggregations: ["countDistinct"] },
    ],
  })
})
const selectedLatencyMin = computed(() => {
  return selectionSummary.value?.columns.latencyMs?.metrics.min ?? null
})
const selectedLatencySum = computed(() => {
  return selectionSummary.value?.columns.latencyMs?.metrics.sum ?? null
})
const selectedLatencyAvg = computed(() => {
  return selectionSummary.value?.columns.latencyMs?.metrics.avg ?? null
})
const selectedLatencyMax = computed(() => {
  return selectionSummary.value?.columns.latencyMs?.metrics.max ?? null
})
const selectedOwnersDistinct = computed(() => {
  return selectionSummary.value?.columns.owner?.metrics.countDistinct ?? null
})
const isSelectionBadgeVisible = computed(() => selectedCellsCount.value > 0)
const selectionNumericSummary = computed(() => {
  const range = cellSelectionRange.value
  if (!range) {
    return null
  }

  const rowCount = resolveDisplayRowCount()
  if (rowCount <= 0) {
    return null
  }

  const columns = orderedColumns.value
  if (!columns.length) {
    return null
  }

  let numericCount = 0
  let numericSum = 0
  let numericMin = Number.POSITIVE_INFINITY
  let numericMax = Number.NEGATIVE_INFINITY

  for (let rowIndex = range.startRow; rowIndex <= range.endRow; rowIndex += 1) {
    const rowNode = resolveDisplayNodeAtIndex(rowIndex)
    if (!rowNode || rowNode.kind !== "leaf") {
      continue
    }
    for (let columnIndex = range.startColumn; columnIndex <= range.endColumn; columnIndex += 1) {
      const column = columns[columnIndex]
      if (!column) {
        continue
      }
      const rawValue = getRowCellValue(rowNode.data, column.key)
      const numeric = typeof rawValue === "number" ? rawValue : Number(rawValue)
      if (!Number.isFinite(numeric)) {
        continue
      }
      numericCount += 1
      numericSum += numeric
      if (numeric < numericMin) {
        numericMin = numeric
      }
      if (numeric > numericMax) {
        numericMax = numeric
      }
    }
  }

  if (numericCount === 0) {
    return {
      count: 0,
      sum: null,
      avg: null,
      min: null,
      max: null,
    }
  }

  return {
    count: numericCount,
    sum: numericSum,
    avg: numericSum / numericCount,
    min: numericMin,
    max: numericMax,
  }
})
const selectionBadgeLine = computed(() => {
  const summary = selectionNumericSummary.value
  if (!summary || summary.count === 0) {
    return "No numeric cells"
  }
  return `Count ${summary.count} · Min ${Math.round(summary.min ?? 0)} · Avg ${Math.round(summary.avg ?? 0)} · Max ${Math.round(summary.max ?? 0)} · Sum ${Math.round(summary.sum ?? 0)}`
})
const copiedCellsCount = computed(() => {
  const range = copiedSelectionRange.value
  if (!range) {
    return 0
  }
  return (range.endRow - range.startRow + 1) * (range.endColumn - range.startColumn + 1)
})
const cellVisualStatePredicates = useDataGridCellVisualStatePredicates<IncidentRow, CellCoord, CellSelectionRange>({
  resolveRowIndex,
  resolveColumnIndex,
  isCellWithinRange,
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  resolveCopiedRange() {
    return copiedSelectionRange.value
  },
  resolveAnchorCoord() {
    return cellAnchor.value
  },
  resolveActiveCoord() {
    return activeCell.value
  },
  isFillDragging() {
    return isFillDragging.value
  },
  isRangeMoving() {
    return isRangeMoving.value
  },
  resolveFillPreviewRange() {
    return fillPreviewRange.value
  },
  resolveFillBaseRange() {
    return fillBaseRange.value
  },
  resolveMovePreviewRange() {
    return rangeMovePreviewRange.value
  },
  resolveMoveBaseRange() {
    return rangeMoveBaseRange.value
  },
  isInlineEditorOpen() {
    return Boolean(inlineEditor.value)
  },
})
const {
  isCellInSelection,
  isCellInCopiedRange,
  isAnchorCell,
  isActiveCell,
  isRangeEndCell,
  isCellInFillPreview,
  isCellInMovePreview,
  shouldShowFillHandle,
} = cellVisualStatePredicates
const shouldRenderFillHandle = (row: DataGridRowNode<IncidentRow>, columnKey: string): boolean => (
  isFillDragging.value ? isRangeEndCell(row, columnKey) : shouldShowFillHandle(row, columnKey)
)

const isQuickFilterActive = computed(() => normalizedQuickFilter.value.length > 0)
const quickFilterStatus = computed(() => {
  if (!isQuickFilterActive.value) {
    return "Quick filter: all rows"
  }
  const displayQuery = query.value.trim()
  return `Quick filter: "${displayQuery}" · ${filteredAndSortedRows.value.length}/${sourceRows.value.length}`
})
const quickFilterActions = useDataGridQuickFilterActions({
  resolveQuery() {
    return query.value
  },
  setQuery(value) {
    query.value = value
  },
  setLastAction(message) {
    lastAction.value = message
  },
})
const {
  clearQuickFilter,
} = quickFilterActions
const gridRowCount = computed(() => resolveDisplayRowCount() + 1)
const activeCellDescendantId = computed(() => {
  const active = activeCell.value
  if (!active) {
    return null
  }
  const row = resolveDisplayNodeAtIndex(active.rowIndex)
  const column = orderedColumns.value[active.columnIndex]
  if (!row || !column) {
    return null
  }
  return getGridCellId(String(row.rowId ?? row.rowKey), column.key)
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

const selectionOverlayOrchestration = useDataGridSelectionOverlayOrchestration({
  headerHeight: bodyViewportHeaderOffset,
  rowHeight: rowHeightPx.value,
  resolveRowHeight: resolveOverlayRowHeight,
  resolveRowOffset: resolveOverlayRowOffset,
  orderedColumns,
  orderedColumnMetrics,
  cellSelectionRange,
  fillPreviewRange,
  fillBaseRange,
  rangeMovePreviewRange,
  rangeMoveBaseRange,
  isRangeMoving,
  virtualWindow: computed(() => resolveSharedVirtualWindow()),
})
const {
  cellSelectionOverlaySegments,
  fillPreviewOverlaySegments,
  rangeMoveOverlaySegments,
} = selectionOverlayOrchestration

function isEditableColumn(columnKey: string): columnKey is EditableColumnKey {
  return hasEditablePolicy(columnKey)
}

function clearCellSelection() {
  clearSelectionLifecycle.clearCellSelection()
}

function onCopyMenuKeyDown(event: KeyboardEvent) {
  onContextMenuKeyDown(event, {
    onEscape() {
      viewportRef.value?.focus()
    },
  })
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
  fillHandleStart.onSelectionHandleMouseDown(event)
}

function stopFillSelection(applyPreview: boolean) {
  fillSelectionLifecycle.stopFillSelection(applyPreview)
}

function stopRangeMove(applyPreview: boolean) {
  rangeMoveLifecycle.stopRangeMove(applyPreview)
  shouldClearSourceOnRangeMove.value = true
}

function stopDragSelection() {
  dragSelectionLifecycle.stopDragSelection()
}

function onViewportKeyDown(event: KeyboardEvent) {
  if (inlineEditor.value) {
    return
  }
  if (event.key === "Enter" || event.key === " ") {
    const active = activeCell.value
    const activeRow = active ? resolveDisplayNodeAtIndex(active.rowIndex) : null
    const activeColumnKey = active ? orderedColumns.value[active.columnIndex]?.key : null
    if (activeRow && activeColumnKey && isTreeGroupToggleCell(activeRow, activeColumnKey)) {
      event.preventDefault()
      toggleRuntimeGroup(activeRow)
      return
    }
  }
  if (keyboardCommandRouter.dispatchKeyboardCommands(event)) {
    return
  }
  cellNavigation.dispatchNavigation(event)
}

const clearSelectionLifecycle = useDataGridClearSelectionLifecycle<CellCoord, CellSelectionRange>({
  setCellAnchor(coord) {
    cellAnchor.value = coord
  },
  setCellFocus(coord) {
    cellFocus.value = coord
  },
  setActiveCell(coord) {
    activeCell.value = coord
  },
  setDragSelecting(value) {
    isDragSelecting.value = value
  },
  setFillDragging(value) {
    isFillDragging.value = value
  },
  setDragPointer(pointer) {
    dragPointer.value = pointer
  },
  setFillPointer(pointer) {
    fillPointer.value = pointer
  },
  setFillBaseRange(range) {
    fillBaseRange.value = range
  },
  setFillPreviewRange(range) {
    fillPreviewRange.value = range
  },
  clearLastDragCoord() {
    lastDragCoord = null
  },
  closeContextMenu: closeCopyContextMenu,
  stopRangeMove,
  stopColumnResize,
  stopAutoScrollFrameIfIdle,
})
const fillHandleStart = useDataGridFillHandleStart<CellSelectionRange>({
  resolveSelectionRange() {
    return cellSelectionRange.value
  },
  focusViewport() {
    viewportRef.value?.focus()
  },
  stopRangeMove,
  setDragSelecting(value) {
    isDragSelecting.value = value
  },
  setDragPointer(pointer) {
    dragPointer.value = pointer
  },
  setFillDragging(value) {
    isFillDragging.value = value
  },
  setFillBaseRange(range) {
    fillBaseRange.value = range
  },
  setFillPreviewRange(range) {
    fillPreviewRange.value = range
  },
  setFillPointer(pointer) {
    fillPointer.value = pointer
  },
  startInteractionAutoScroll,
  setLastAction(message) {
    lastAction.value = message
  },
})
const viewportScrollLifecycle = useDataGridViewportScrollLifecycle({
  isContextMenuVisible() {
    return copyContextMenu.value.visible
  },
  shouldCloseContextMenuOnScroll() {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now()
    return now >= contextMenuScrollCloseCooldownUntil.value
  },
  closeContextMenu: closeCopyContextMenu,
  resolveScrollTop() {
    return scrollTop.value
  },
  resolveScrollLeft() {
    return scrollLeft.value
  },
  setScrollTop(value) {
    if (value === scrollTop.value) {
      return
    }
    scrollTop.value = value
  },
  setScrollLeft(value) {
    setSynchronizedScrollLeft(value)
  },
  hasInlineEditor() {
    return Boolean(inlineEditor.value)
  },
  commitInlineEdit,
  scrollUpdateMode: "raf",
})
let headerViewportSyncFrame: number | null = null
function scheduleHeaderViewportScrollSync() {
  if (headerViewportSyncFrame !== null) {
    return
  }
  headerViewportSyncFrame = requestAnimationFrame(() => {
    headerViewportSyncFrame = null
    syncHeaderViewportScroll()
  })
}
const managedWheelScroll = useDataGridManagedWheelScroll({
  resolveWheelMode: () => "managed",
  resolveWheelAxisLockMode: () => "dominant",
  resolvePreventDefaultWhenHandled: () => true,
  resolveWheelPropagationMode: () => "release-at-boundary-when-unconsumed",
  resolveMinDeltaToApply: () => 0,
  resolveBodyViewport() {
    return viewportRef.value
  },
  resolveMainViewport() {
    const viewport = viewportRef.value
    if (!viewport) {
      return null
    }
    return {
      scrollLeft: viewport.scrollLeft,
      scrollWidth: viewport.scrollWidth,
      clientWidth: viewport.clientWidth,
    }
  },
  setHandledScrollTop(value) {
    const viewport = viewportRef.value
    if (viewport && viewport.scrollTop !== value) {
      viewport.scrollTop = value
    }
    scrollTop.value = value
  },
  setHandledScrollLeft(value: number) {
    const viewport = viewportRef.value
    if (viewport && viewport.scrollLeft !== value) {
      viewport.scrollLeft = value
    }
    setSynchronizedScrollLeft(value)
    scheduleHeaderViewportScrollSync()
  },
  onWheelConsumed() {
    scheduleHeaderViewportScrollSync()
  },
})
let isViewportBootstrapping = true
const onViewportWheel = (event: WheelEvent) => {
  markViewportScrollActivity()
  managedWheelScroll.onBodyViewportWheel(event)
}
const onViewportScroll = (event: Event) => {
  markViewportScrollActivity()
  if (isViewportBootstrapping) {
    isViewportBootstrapping = false
  }
  viewportScrollLifecycle.onViewportScroll(event)
  scheduleHeaderViewportScrollSync()
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

function runCellRefreshProbe() {
  const firstVisibleLeaf = visibleRows.value.find(row => row.kind === "leaf")
  if (!firstVisibleLeaf || !firstVisibleLeaf.data) {
    lastAction.value = "Cell refresh probe: no visible leaf rows"
    return
  }

  const row = firstVisibleLeaf.data
  const nextLatency = Math.max(20, row.latencyMs + 11)
  const nextErrors = Math.max(0, row.errorRate + 1)
  const nextStatus = resolveStatus(nextLatency, nextErrors)
  const nextUpdatedAt = new Date().toISOString().slice(0, 16).replace("T", " ")

  sourceRows.value = sourceRows.value.map(candidate => {
    if (candidate.rowId !== row.rowId) {
      return candidate
    }
    return {
      ...candidate,
      latencyMs: nextLatency,
      errorRate: nextErrors,
      status: nextStatus,
      updatedAt: nextUpdatedAt,
    }
  })

  api.refreshCellsByRowKeys(
    [row.rowId],
    ["latencyMs", "errorRate", "status", "updatedAt"],
    {
      immediate: true,
      reason: "demo-probe",
    },
  )
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

watch(scrollLeft, () => {
  scheduleHeaderViewportScrollSync()
})

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
  applyColumnVisibilityPreset(columnVisibilityPreset.value)
  api.setColumnPin("status", value ? "left" : "none")
  lastAction.value = value ? "Pinned status column" : "Unpinned status column"
})
watch(pinUpdatedAtRight, value => {
  applyColumnVisibilityPreset(columnVisibilityPreset.value)
  api.setColumnPin("updatedAt", value ? "right" : "none")
  lastAction.value = value ? "Pinned updatedAt right" : "Unpinned updatedAt"
})

watch(rowHeightMode, mode => {
  applyRuntimeRowHeightSettings()
  scheduleViewportMeasure()
  syncVisibleRows()
  lastAction.value = mode === "auto"
    ? `Row height mode: auto (${rowHeightPx.value}px base)`
    : `Row height mode: fixed (${rowHeightPx.value}px)`
}, { immediate: true })

watch(rowHeightPx, value => {
  applyRuntimeRowHeightSettings()
  scheduleViewportMeasure()
  syncVisibleRows()
  lastAction.value = `Row height: ${value}px`
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

watch(sortStateSignature, () => {
  const value = sortState.value
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
}, { immediate: true })

watch(groupBy, value => {
  applyRuntimeGroupBy(value)
  applyRuntimeAggregationModel(value)
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  lastAction.value = value === "none" ? "Grouping disabled" : `Grouped by ${value}`
}, { immediate: true })

watch(runtimeAutoReapply, value => {
  if (value && freezeProjectionView.value) {
    freezeProjectionView.value = false
    resetVisibleRowsSyncCache()
    syncVisibleRows()
  }
  lastAction.value = value
    ? "Runtime auto reapply: enabled"
    : "Runtime auto reapply: disabled (freeze mode)"
})

watch(columnVisibilityPreset, value => {
  applyColumnVisibilityPreset(value)
  const visibleCount = COLUMN_VISIBILITY_PRESETS[value]?.length ?? COLUMN_VISIBILITY_PRESETS.all.length
  lastAction.value = `Column preset: ${value} (${visibleCount} visible)`
}, { immediate: true })

watch(columnCount, value => {
  applyColumnVisibilityPreset(columnVisibilityPreset.value)
  lastAction.value = `Column count: ${value}`
}, { immediate: true })

watch(advancedFilterPreset, value => {
  lastAction.value = value === "none" ? "Advanced filter disabled" : `Advanced filter: ${advancedFilterSummary.value}`
})

watch([query, sortStateSignature, appliedColumnFiltersSignature, groupBy, advancedFilterPreset], () => {
  if (freezeProjectionView.value) {
    freezeProjectionView.value = false
  }
  resetVisibleRowsSyncCache()
  if (inlineEditor.value) {
    commitInlineEdit()
  }
  clearCellSelection()
})

watch(sourceRows, () => {
  if (freezeProjectionView.value) {
    frozenProjectionRows.value = remapRowsByCurrentSource(frozenProjectionRows.value)
  }
  reconcileRowSelection()
  resetVisibleRowsSyncCache()
  syncVisibleRowsWithScrollPriority()
})

watch(filteredAndSortedRows, () => {
  syncVisibleRowsWithScrollPriority()
}, { immediate: true, flush: "sync" })

watch(renderRange, () => {
  scheduleVisibleRowsSync()
}, { flush: "sync" })

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

function resetViewportScrollPosition() {
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    viewportRef.value.scrollLeft = 0
  }
  if (headerViewportRef.value) {
    headerViewportRef.value.scrollLeft = 0
  }
  scrollTop.value = 0
  scrollLeft.value = 0
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
  resetViewportScrollPosition()
  syncHeaderViewportScroll()
  syncRuntimeProjectionDiagnostics()
  syncVisibleRows()
  void nextTick(() => {
    syncHeaderViewportScroll()
    syncVisibleRows()
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        syncHeaderViewportScroll()
        syncVisibleRows()
        isViewportBootstrapping = false
      })
      return
    }
    isViewportBootstrapping = false
  })
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
  headerFilterPopovers.forEach(popover => {
    popover.scope.stop()
  })
  headerFilterPopovers.clear()
  stopFillSelection(false)
  stopDragSelection()
  stopRangeMove(false)
  stopRowResize(false)
  pointerAutoScroll.dispose()
  viewportScrollLifecycle.dispose()
  managedWheelScroll.reset()
  if (headerViewportSyncFrame !== null) {
    cancelAnimationFrame(headerViewportSyncFrame)
    headerViewportSyncFrame = null
  }
  disposeGlobalPointerLifecycle()
  stopColumnResize()
  clearCopiedSelectionFlash()
  disposeVisibleRowsSyncScheduler()
  scrollIdleGate.dispose()
  scrollPerfTelemetry.dispose()
  disposeViewportMeasureScheduler()
  unsubscribeCellsRefresh()
  unsubscribeRuntimeProjection()
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
  <section class="datagrid-page" ref="themeRootRef" :style="{ '--datagrid-row-height': `${rowHeightPx}px` }">
    <header class="datagrid-hero">
      <p class="datagrid-hero__eyebrow">Internal Demo · DataGrid</p>
      <h2>Excel-style interaction surface</h2>
      <div class="datagrid-hero__chips" aria-label="Datagrid foundation">
        <span>@affino/datagrid-vue</span>
        <span>@affino/datagrid-core</span>
        <span>{{ scrollPerfChipText }}</span>
        <span>status: {{ lastAction }}</span>
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
        <span>Columns</span>
        <AffinoSelect
          v-model="columnCount"
          class="datagrid-controls__select"
          :options="columnCountOptions"
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
      <label class="datagrid-controls__menu-field">
        <span>Group by</span>
        <UiMenu>
          <UiMenuTrigger as-child>
            <button type="button" class="datagrid-controls__menu-trigger">
              {{ activeGroupByOption?.label ?? "None" }}
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="ui-menu-content datagrid-controls__menu-content" side-offset="8">
            <UiMenuLabel>Group rows</UiMenuLabel>
            <UiMenuSeparator />
            <UiMenuItem
              v-for="option in groupByOptions"
              :key="`group-by-${option.value}`"
              @select="groupBy = option.value as GroupByColumnKey"
            >
              <span class="datagrid-controls__menu-check">{{ groupBy === option.value ? "✓" : "" }}</span>
              <span>{{ option.label }}</span>
            </UiMenuItem>
          </UiMenuContent>
        </UiMenu>
      </label>
      <label>
        <span>Visibility</span>
        <AffinoSelect
          v-model="columnVisibilityPreset"
          class="datagrid-controls__select"
          :options="columnVisibilityPresetOptions"
        />
      </label>
      <label class="datagrid-controls__menu-field">
        <span>Column state</span>
        <UiMenu>
          <UiMenuTrigger as-child>
            <button type="button" class="datagrid-controls__menu-trigger">
              {{ hasSavedColumnState ? "Saved" : "Unsaved" }}
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="ui-menu-content datagrid-controls__menu-content" side-offset="8">
            <UiMenuLabel>Column state roundtrip</UiMenuLabel>
            <UiMenuSeparator />
            <UiMenuItem @select="mutateColumnStateDemo">Mutate state</UiMenuItem>
            <UiMenuItem @select="saveCurrentColumnState">Save snapshot</UiMenuItem>
            <UiMenuItem @select="restoreSavedColumnState">Restore snapshot</UiMenuItem>
            <UiMenuItem @select="clearSavedColumnState">Clear snapshot</UiMenuItem>
            <UiMenuSeparator />
            <div class="datagrid-controls__column-state-panel" @mousedown.stop @click.stop>
              <div class="datagrid-controls__column-state-panel-header">
                <span>Columns</span>
                <button type="button" class="ghost" @click="showAllColumnsFromMenu">Show all</button>
              </div>
              <div class="datagrid-controls__column-state-list">
                <div
                  v-for="column in columnStateMenuColumns"
                  :key="`column-state-menu-${column.key}`"
                  class="datagrid-controls__column-state-item"
                >
                  <label class="datagrid-controls__column-state-visibility">
                    <input
                      type="checkbox"
                      :checked="column.visible"
                      @change="onColumnStateVisibilityChange(column.key, $event)"
                    />
                    <span>{{ column.label }}</span>
                  </label>
                  <div class="datagrid-controls__column-state-pin">
                    <button
                      type="button"
                      :data-active="column.pin === 'left' ? 'true' : 'false'"
                      @click="setColumnPinFromMenu(column.key, 'left')"
                    >
                      L
                    </button>
                    <button
                      type="button"
                      :data-active="column.pin === 'none' ? 'true' : 'false'"
                      @click="setColumnPinFromMenu(column.key, 'none')"
                    >
                      —
                    </button>
                    <button
                      type="button"
                      :data-active="column.pin === 'right' ? 'true' : 'false'"
                      @click="setColumnPinFromMenu(column.key, 'right')"
                    >
                      R
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <UiMenuSeparator />
            <pre class="datagrid-controls__column-state-preview" @mousedown.stop @click.stop>{{ savedColumnStateJson }}</pre>
          </UiMenuContent>
        </UiMenu>
      </label>
      <label class="datagrid-controls__menu-field">
        <span>Advanced filter</span>
        <UiMenu>
          <UiMenuTrigger as-child>
            <button type="button" class="datagrid-controls__menu-trigger">
              {{ activeAdvancedFilterPresetOption?.label ?? "None" }}
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="ui-menu-content datagrid-controls__menu-content" side-offset="8">
            <UiMenuLabel>Advanced presets</UiMenuLabel>
            <UiMenuSeparator />
            <UiMenuItem
              v-for="option in advancedFilterPresetOptions"
              :key="`advanced-filter-${option.value}`"
              @select="advancedFilterPreset = option.value as AdvancedFilterPreset"
            >
              <span class="datagrid-controls__menu-check">{{ advancedFilterPreset === option.value ? "✓" : "" }}</span>
              <span>{{ option.label }}</span>
            </UiMenuItem>
          </UiMenuContent>
        </UiMenu>
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="pinStatusColumn" type="checkbox" />
        <span>Pin status column</span>
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="pinUpdatedAtRight" type="checkbox" />
        <span>Pin updatedAt right</span>
      </label>
      <label class="datagrid-controls__toggle">
        <input v-model="runtimeAutoReapply" type="checkbox" />
        <span>Auto reapply view</span>
      </label>
      <label class="datagrid-controls__menu-field">
        <span>Row height</span>
        <UiMenu>
          <UiMenuTrigger as-child>
            <button type="button" class="datagrid-controls__menu-trigger">
              {{ rowHeightMode === "auto" ? "Auto" : "Fixed" }} · {{ rowHeightPx }}px
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="ui-menu-content datagrid-controls__menu-content" side-offset="8">
            <UiMenuLabel>Row height</UiMenuLabel>
            <UiMenuSeparator />
            <UiMenuItem @select="setRowHeightMode('fixed')">
              <span class="datagrid-controls__menu-check">{{ rowHeightMode === "fixed" ? "✓" : "" }}</span>
              <span>Fixed mode</span>
            </UiMenuItem>
            <UiMenuItem @select="setRowHeightMode('auto')">
              <span class="datagrid-controls__menu-check">{{ rowHeightMode === "auto" ? "✓" : "" }}</span>
              <span>Auto mode</span>
            </UiMenuItem>
            <UiMenuSeparator />
            <div class="datagrid-controls__row-height-slider" @mousedown.stop @click.stop>
              <label>
                <span>Base</span>
                <input v-model.number="baseRowHeight" type="range" min="24" max="72" step="1" />
              </label>
              <div class="datagrid-controls__row-height-presets">
                <button type="button" @click="baseRowHeight = 32">32</button>
                <button type="button" @click="baseRowHeight = 38">38</button>
                <button type="button" @click="baseRowHeight = 44">44</button>
                <button type="button" @click="baseRowHeight = 52">52</button>
              </div>
              <button
                type="button"
                class="datagrid-controls__row-height-action"
                :disabled="rowHeightMode !== 'auto'"
                @click="measureVisibleRowHeight"
              >
                Measure visible rows
              </button>
              <button
                type="button"
                class="datagrid-controls__row-height-action ghost"
                :disabled="rowHeightMode !== 'auto' || rowHeightOverrideCount === 0"
                @click="resetCustomRowHeights"
              >
                Reset custom row heights ({{ rowHeightOverrideCount }})
              </button>
            </div>
          </UiMenuContent>
        </UiMenu>
      </label>
      <label class="datagrid-controls__menu-field">
        <span>Pagination</span>
        <UiMenu>
          <UiMenuTrigger as-child>
            <button type="button" class="datagrid-controls__menu-trigger">
              {{ paginationSummary }}
            </button>
          </UiMenuTrigger>
          <UiMenuContent class="ui-menu-content datagrid-controls__menu-content" side-offset="8">
            <UiMenuLabel>Pagination</UiMenuLabel>
            <UiMenuSeparator />
            <div class="datagrid-controls__pagination-panel" @mousedown.stop @click.stop>
              <label>
                <span>Page size</span>
                <AffinoSelect
                  :model-value="paginationPageSize"
                  class="datagrid-controls__select datagrid-controls__pagination-select"
                  :options="paginationPageSizeOptions"
                  @update:model-value="setPaginationPageSize(Number($event))"
                />
              </label>
              <label>
                <span>Page</span>
                <div class="datagrid-controls__pagination-row">
                  <button
                    type="button"
                    :disabled="!paginationSnapshot?.enabled || (paginationSnapshot?.currentPage ?? 0) <= 0"
                    @click="goPaginationPrev"
                  >
                    Prev
                  </button>
                  <input
                    v-model.number="paginationTargetPage"
                    type="number"
                    min="1"
                    :max="Math.max(1, paginationSnapshot?.pageCount ?? 1)"
                    @keydown.enter.prevent="applyPaginationTargetPage(paginationTargetPage)"
                  />
                  <button
                    type="button"
                    :disabled="!paginationSnapshot?.enabled || (paginationSnapshot?.currentPage ?? 0) >= Math.max((paginationSnapshot?.pageCount ?? 1) - 1, 0)"
                    @click="goPaginationNext"
                  >
                    Next
                  </button>
                </div>
              </label>
              <button type="button" class="datagrid-controls__pagination-roundtrip" @click="applyPaginationRoundtrip">
                Snapshot roundtrip
              </button>
              <p class="datagrid-controls__pagination-meta">
                Slice {{ paginationSliceSummary }} · Total {{ paginationSnapshot?.totalRowCount ?? 0 }}
              </p>
            </div>
          </UiMenuContent>
        </UiMenu>
      </label>
      <ThemeToggle variant="compact" @theme-change="applyDemoTheme" />
      <button type="button" class="ghost" @click="runReapplyView">Reapply view</button>
      <button type="button" @click="randomizeRuntime">Runtime shift</button>
      <button type="button" class="ghost" @click="runCellRefreshProbe">Cell refresh probe</button>
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
      <p class="datagrid-controls__filter-indicator" :data-active="isAdvancedFilterActive ? 'true' : 'false'">
        Advanced filter: {{ advancedFilterSummary }}
      </p>
      <p class="datagrid-controls__filter-indicator" :data-active="hasSavedColumnState ? 'true' : 'false'">
        Column state: {{ columnStateSummary }}
      </p>
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
        <dt>Page</dt>
        <dd>{{ paginationSummary }}</dd>
      </div>
      <div>
        <dt>Page slice</dt>
        <dd>{{ paginationSliceSummary }}</dd>
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
        <dt>Projection stale</dt>
        <dd>{{ runtimeStaleStagesSummary }}</dd>
      </div>
      <div>
        <dt>Projection cycle</dt>
        <dd>{{ runtimeCycleVersion }}</dd>
      </div>
      <div>
        <dt>Projection recompute</dt>
        <dd>{{ runtimeRecomputeVersion }}</dd>
      </div>
      <div>
        <dt>Advanced filter</dt>
        <dd>{{ advancedFilterSummary }}</dd>
      </div>
      <div>
        <dt>Groups</dt>
        <dd>{{ groupsMetricLabel }}</dd>
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
        <dt>Selected latency min</dt>
        <dd>{{ selectedLatencyMin == null ? "—" : Math.round(selectedLatencyMin) }}</dd>
      </div>
      <div>
        <dt>Selected latency Σ</dt>
        <dd>{{ selectedLatencySum == null ? "—" : Math.round(selectedLatencySum) }}</dd>
      </div>
      <div>
        <dt>Selected latency avg</dt>
        <dd>{{ selectedLatencyAvg == null ? "—" : Math.round(selectedLatencyAvg) }}</dd>
      </div>
      <div>
        <dt>Selected latency max</dt>
        <dd>{{ selectedLatencyMax == null ? "—" : Math.round(selectedLatencyMax) }}</dd>
      </div>
      <div>
        <dt>Selected owners</dt>
        <dd>{{ selectedOwnersDistinct == null ? "—" : selectedOwnersDistinct }}</dd>
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
      <div>
        <dt>Row height</dt>
        <dd>{{ rowHeightMode }} · {{ rowHeightPx }}px</dd>
      </div>
      <div>
        <dt>Column state</dt>
        <dd>{{ hasSavedColumnState ? "saved" : "none" }}</dd>
      </div>
    </section>

    <section class="datagrid-stage">
      <div ref="headerViewportRef" class="datagrid-stage__header-viewport" @contextmenu="onViewportContextMenu">
        <div ref="headerRef" class="datagrid-stage__header" role="row" :style="{ gridTemplateColumns: layerTrackTemplate }">
          <div
            v-for="layer in columnLayers"
            :key="`header-layer-${layer.key}`"
            class="datagrid-stage__layer datagrid-stage__layer--header"
            :class="`datagrid-stage__layer--${layer.key}`"
            :style="{ gridTemplateColumns: layer.templateColumns, width: `${layer.width}px` }"
          >
            <div
              v-for="column in layer.columns"
              :key="`header-${layer.key}-${column.key}`"
              class="datagrid-stage__cell datagrid-stage__cell--header"
              :class="{
                'datagrid-stage__cell--sticky': layer.key !== 'scroll',
                'datagrid-stage__cell--select': column.key === 'select',
                'datagrid-stage__cell--sortable': isSortableColumn(column.key),
                'datagrid-stage__cell--filtered': isColumnFilterActive(column.key),
                'datagrid-stage__cell--filter-open': activeFilterColumnKey === column.key,
                'datagrid-stage__cell--column-drop-target': isColumnReorderDropTarget(column.key),
              }"
              :data-column-key="column.key"
              :id="getHeaderCellId(column.key)"
              role="columnheader"
              :aria-colindex="getColumnAriaIndex(column.key)"
              :tabindex="isSortableColumn(column.key) ? 0 : -1"
              :aria-sort="getHeaderAriaSort(column.key)"
              @click="onHeaderCellClick(column.key, $event)"
              @keydown="onHeaderCellKeyDown(column.key, $event)"
              @dragover="onColumnReorderDragOver(column.key, $event)"
              @drop="onColumnReorderDrop(column.key, $event)"
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
              <button
                v-if="isColumnReorderEnabled(column.key)"
                type="button"
                class="datagrid-stage__column-drag-handle"
                aria-label="Drag to reorder column"
                draggable="true"
                @click.stop
                @mousedown.stop
                @dragstart.stop="onColumnReorderDragStart(column.key, $event)"
                @dragend.stop="onColumnReorderDragEnd"
              >
                ⋮⋮
              </button>
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
                :ref="(el) => setHeaderFilterTriggerRef(column.key, el)"
                v-bind="getHeaderFilterPopover(column.key).controller.getTriggerProps()"
                type="button"
                class="datagrid-stage__filter-trigger"
                :class="{ 'is-active': isColumnFilterActive(column.key) }"
                :data-column-key="column.key"
                data-datagrid-filter-trigger
                :aria-label="`Filter ${column.column.label ?? column.key}`"
                :aria-expanded="activeFilterColumnKey === column.key ? 'true' : 'false'"
                @click.stop="openHeaderFilterPopover(column.key, 'pointer')"
                @keydown.stop
              >
                F
              </button>
              <Teleport :to="getHeaderFilterTeleportTarget(column.key)">
                <div
                  v-if="getHeaderFilterPopover(column.key).controller.state.value.open"
                  :ref="(el) => setHeaderFilterContentRef(column.key, el)"
                  v-bind="getHeaderFilterPopover(column.key).controller.getContentProps({ role: 'dialog', tabIndex: -1 })"
                  :style="getHeaderFilterContentStyle(column.key)"
                  class="ui-menu-content datagrid-column-filter datagrid-column-filter--menu"
                  :data-datagrid-filter-panel="activeFilterColumnKey === column.key ? 'true' : null"
                  :data-column-key="activeFilterColumnKey === column.key ? column.key : null"
                  :aria-labelledby="FILTER_PANEL_TITLE_ID"
                  @pointerdown.stop
                  @mousedown.stop
                  @click.stop
                >
                  <template v-if="columnFilterDraft && activeFilterColumnKey === column.key">
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
                    <section
                      v-if="isSetFilterEnabled"
                      class="datagrid-column-filter__set"
                      data-datagrid-filter-set
                    >
                      <header class="datagrid-column-filter__set-header">
                        <p>Excel set filter</p>
                        <strong>{{ selectedSetFilterValueCount }} selected</strong>
                      </header>
                      <label class="datagrid-column-filter__set-search">
                        <span>Search values</span>
                        <input
                          v-model.trim="columnSetFilterSearch"
                          data-datagrid-filter-set-search
                          type="text"
                          placeholder="Search unique values"
                        />
                      </label>
                      <div class="datagrid-column-filter__set-mode">
                        <button
                          type="button"
                          class="ghost"
                          :class="{ 'is-active': columnSetFilterApplyMode === 'replace' }"
                          :aria-pressed="columnSetFilterApplyMode === 'replace'"
                          @click="columnSetFilterApplyMode = 'replace'"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          class="ghost"
                          :class="{ 'is-active': columnSetFilterApplyMode === 'add' }"
                          :aria-pressed="columnSetFilterApplyMode === 'add'"
                          @click="columnSetFilterApplyMode = 'add'"
                        >
                          Add to selected
                        </button>
                      </div>
                      <div class="datagrid-column-filter__set-actions">
                        <button type="button" class="ghost" @click="selectAllVisibleSetFilterValues">Select visible</button>
                        <button type="button" class="ghost" @click="clearSetFilterSelection">Clear selected</button>
                        <button
                          type="button"
                          data-datagrid-filter-apply-set
                          :disabled="selectedSetFilterValueCount === 0 && columnSetFilterApplyMode === 'replace'"
                          @click="applySetFilterSelection"
                        >
                          Apply set
                        </button>
                      </div>
                      <div class="datagrid-column-filter__set-list" data-datagrid-filter-set-options>
                        <label
                          v-for="option in setFilterVisibleOptions"
                          :key="`set-filter-option-${option}`"
                          class="datagrid-column-filter__set-option"
                        >
                          <input
                            type="checkbox"
                            :checked="isSetFilterValueSelected(option)"
                            @change="onSetFilterValueChange(option, $event)"
                          />
                          <span>{{ option }}</span>
                        </label>
                        <p v-if="setFilterVisibleOptions.length === 0" class="datagrid-column-filter__set-empty">
                          No values matched search.
                        </p>
                      </div>
                    </section>
                    <div class="datagrid-column-filter__actions">
                      <button
                        type="button"
                        data-datagrid-filter-apply
                        @click.stop.prevent="applyActiveColumnFilter"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        class="ghost"
                        data-datagrid-filter-reset
                        @click.stop.prevent="resetActiveColumnFilter"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        class="ghost"
                        data-datagrid-filter-clear-all
                        :disabled="!hasColumnFilters"
                        @click.stop.prevent="clearAllColumnFilters"
                      >
                        Clear all
                      </button>
                      <button
                        type="button"
                        class="ghost"
                        data-datagrid-filter-close
                        @click.stop.prevent="closeColumnFilterPopover"
                      >
                        Close
                      </button>
                    </div>
                  </template>
                </div>
              </Teleport>
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
        </div>
      </div>

      <div class="datagrid-stage__body">
      <div
        ref="viewportRef"
        class="datagrid-stage__viewport"
        :class="{
          'is-drag-selecting': isDragSelecting,
          'is-fill-dragging': isFillDragging,
          'is-range-moving': isRangeMoving,
          'is-column-resizing': isColumnResizing,
          'is-row-resizing': activeRowResize !== null,
        }"
        tabindex="0"
        role="grid"
        aria-label="Datagrid viewport"
        :aria-colcount="orderedColumns.length"
        :aria-rowcount="gridRowCount"
        aria-multiselectable="true"
        :aria-activedescendant="activeCellDescendantId ?? undefined"
        :aria-describedby="GRID_HINT_ID"
        @wheel="onViewportWheel"
        @scroll.passive="onViewportScroll"
        @contextmenu="onViewportContextMenu"
        @keydown="onViewportKeyDown"
        @blur="onViewportBlur"
      >
        <div class="datagrid-stage__overlay-layer" :style="overlayLayerStyle" aria-hidden="true">
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
            class="datagrid-stage__selection-overlay datagrid-stage__selection-overlay--main"
            :style="segment.style"
          ></div>
        </div>
        <div data-datagrid-spacer-top :style="{ height: `${renderSpacerTopHeight}px` }"></div>

        <div
          v-for="row in visibleRows"
          :key="row.rowId"
          class="datagrid-stage__row"
          :class="{
            'is-selected': row.kind === 'leaf' && isRowSelected(String(row.rowId)),
            'datagrid-stage__row--group-start': isRuntimeGroupStartRow(row),
            'datagrid-stage__row--drop-target': isRowReorderDropTarget(row),
          }"
          role="row"
          :aria-rowindex="getRowAriaIndex(row)"
          :style="resolveRowInlineStyle(row)"
          @dragover="onRowReorderDragOver(row, $event)"
          @drop="onRowReorderDrop(row, $event)"
        >
          <div
            v-for="layer in columnLayers"
            :key="`${row.rowId}-${layer.key}`"
            class="datagrid-stage__layer datagrid-stage__layer--row"
            :class="`datagrid-stage__layer--${layer.key}`"
            :style="{ gridTemplateColumns: layer.templateColumns, width: `${layer.width}px` }"
          >
          <div
            v-for="column in layer.columns"
            :key="`${row.rowId}-${layer.key}-${column.key}`"
            class="datagrid-stage__cell"
            :class="{
              'datagrid-stage__cell--numeric': ['latencyMs', 'errorRate', 'availabilityPct', 'mttrMin', 'cpuPct', 'memoryPct', 'queueDepth', 'throughputRps', 'sloBurnRate', 'incidents24h'].includes(column.key),
              'datagrid-stage__cell--status': column.key === 'status',
              'datagrid-stage__cell--editable': isEditableColumn(column.key),
              'datagrid-stage__cell--editing': row.kind === 'leaf' && isEditingCell(row.data.rowId, column.key),
              'datagrid-stage__cell--enum': isEnumColumn(column.key),
              'datagrid-stage__cell--tree-group': row.kind === 'group',
              'datagrid-stage__cell--select': column.key === 'select',
              'datagrid-stage__cell--range': isCellInSelection(row, column.key),
              'datagrid-stage__cell--copied': isCellInCopiedRange(row, column.key),
              'datagrid-stage__cell--fill-preview': isCellInFillPreview(row, column.key),
              'datagrid-stage__cell--move-preview': isCellInMovePreview(row, column.key),
              'datagrid-stage__cell--anchor': isAnchorCell(row, column.key),
              'datagrid-stage__cell--active': isActiveCell(row, column.key),
              'datagrid-stage__cell--sticky': layer.key !== 'scroll',
              'datagrid-stage__cell--range-end': isRangeEndCell(row, column.key),
              'datagrid-stage__cell--group-by': isGroupedByColumn(column.key),
              'datagrid-stage__cell--group-start': shouldShowGroupBadge(row, column.key),
            }"
            :data-column-key="column.key"
            :data-row-id="row.rowId"
            :data-row-index="resolveRowIndex(row)"
            :data-column-index="resolveColumnIndex(column.key)"
            :id="getGridCellId(String(row.rowId), column.key)"
            role="gridcell"
            :aria-colindex="getColumnAriaIndex(column.key)"
            :aria-selected="isCellInSelection(row, column.key) ? 'true' : 'false'"
            :aria-readonly="row.kind === 'group' ? 'true' : (isEditableColumn(column.key) ? 'false' : 'true')"
            :aria-labelledby="getHeaderCellId(column.key)"
            @mousedown="onDataCellMouseDown(row, column.key, $event)"
            @mouseenter="onDataCellMouseEnter(row, column.key, $event)"
            @dblclick="onDataCellDoubleClick(row, column.key, $event)"
            @contextmenu.stop="onDataCellContextMenu(row, column.key, $event)"
          >
            <template v-if="column.key === 'select'">
              <div v-if="row.kind === 'leaf'" class="datagrid-stage__select-tools">
                <button
                  type="button"
                  class="datagrid-stage__row-drag-handle"
                  draggable="true"
                  aria-label="Drag to reorder row"
                  @mousedown.stop
                  @dragstart="onRowReorderDragStart(row, $event)"
                  @dragend="onRowReorderDragEnd"
                >
                  ⋮⋮
                </button>
                <input
                  type="checkbox"
                  class="datagrid-stage__checkbox"
                  :checked="isRowSelected(String(row.rowId))"
                  @change="onRowSelectChange(String(row.rowId), $event)"
                  :aria-label="`Select ${row.data.service}`"
                />
                <span
                  v-if="isRowResizeEnabledForRow(row)"
                  class="datagrid-stage__row-resize-handle"
                  aria-hidden="true"
                  @mousedown.stop.prevent="onRowResizeHandleMouseDown(row, $event)"
                ></span>
              </div>
              <span v-else aria-hidden="true"></span>
            </template>

            <template v-else-if="row.kind === 'leaf' && isSelectEditorCell(row.data.rowId, column.key) && getEditorOptions(column.key)">
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

            <template v-else-if="row.kind === 'leaf' && isEditingCell(row.data.rowId, column.key)">
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
              <button
                v-if="isTreeGroupToggleCell(row, column.key)"
                type="button"
                data-datagrid-tree-toggle="true"
                class="datagrid-stage__tree-toggle"
                style="display:inline-flex; align-items:center; gap:0.45rem; width:100%; border:0; background:transparent; color:inherit; padding:0; cursor:pointer; font:inherit; text-align:left;"
                :style="resolveTreeGroupIndentStyle(row)"
                :aria-expanded="row.state.expanded ? 'true' : 'false'"
                @click.stop="toggleRuntimeGroup(row)"
              >
                <span class="datagrid-stage__tree-chevron" aria-hidden="true">{{ row.state.expanded ? '▾' : '▸' }}</span>
                <span class="datagrid-stage__tree-label">{{ resolveTreeGroupLabel(row) }}</span>
                <span class="datagrid-stage__tree-count">{{ resolveTreeGroupChildrenCount(row) }}</span>
                <span
                  v-if="resolveTreeGroupAggregateSummary(row)"
                  class="datagrid-stage__tree-aggregates"
                  style="opacity:0.8; font-size:0.82em;"
                >
                  {{ resolveTreeGroupAggregateSummary(row) }}
                </span>
              </button>
              <span
                v-else-if="shouldShowGroupBadge(row, column.key)"
                class="datagrid-stage__group-badge"
              >
                {{ resolveGroupBadgeText(row) }}
              </span>
              <span v-else-if="row.kind === 'leaf'">
                {{ formatCellValue(column.key, getRowCellValue(row.data, column.key)) }}
              </span>
            </template>

            <button
              v-if="row.kind === 'leaf' && shouldShowEnumTrigger(row, column.key)"
              type="button"
              class="datagrid-stage__enum-trigger"
              :aria-label="`Open options for ${column.key}`"
              @mousedown="onEnumTriggerMouseDown(row, column.key, $event)"
            >
              ▾
            </button>

            <span
              v-if="row.kind === 'leaf' && shouldRenderFillHandle(row, column.key)"
              class="datagrid-stage__selection-handle datagrid-stage__selection-handle--cell"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionHandleMouseDown"
            ></span>

            <span
              v-if="row.kind === 'leaf' && shouldShowSelectionMoveHandle(row, column.key, 'top')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--top"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="row.kind === 'leaf' && shouldShowSelectionMoveHandle(row, column.key, 'right')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--right"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="row.kind === 'leaf' && shouldShowSelectionMoveHandle(row, column.key, 'bottom')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--bottom"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
            <span
              v-if="row.kind === 'leaf' && shouldShowSelectionMoveHandle(row, column.key, 'left')"
              class="datagrid-stage__move-handle-zone datagrid-stage__move-handle-zone--left"
              aria-hidden="true"
              @mousedown.stop.prevent="onSelectionMoveHandleMouseDown(row, column.key, $event)"
            ></span>
          </div>
          </div>
        </div>

        <div v-if="visibleRows.length === 0" class="datagrid-stage__empty">No rows matched current filters.</div>
        <div data-datagrid-spacer-bottom :style="{ height: `${renderSpacerBottomHeight}px` }"></div>
      </div>
      <div
        v-if="isSelectionBadgeVisible"
        class="datagrid-selection-badge"
        role="status"
        aria-live="polite"
      >
        <div class="datagrid-selection-badge__title">Selection summary</div>
        <div class="datagrid-selection-badge__line">{{ selectionBadgeLine }}</div>
      </div>
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
