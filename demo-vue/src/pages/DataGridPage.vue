<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import AffinoSelect from "@/components/AffinoSelect.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"
import {
  createDataGridSelectionSummary,
  evaluateDataGridAdvancedFilterExpression,
  type DataGridColumnDef,
  type DataGridAdvancedFilterExpression,
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
  useDataGridContextMenu,
  useDataGridRuntime,
} from "@affino/datagrid-vue"
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

const rowCount = ref(10000)
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
const lastAction = ref("Ready")
const rowCountOptions = [10000, 50000, 100000] as const
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
const columnSetFilterSearch = ref("")
const columnSetFilterApplyMode = ref<SetFilterApplyMode>("replace")
const columnSetFilterSelectedValues = ref<string[]>([])

const activeGroupByOption = computed(() => (
  groupByOptions.find(option => option.value === groupBy.value) ?? groupByOptions[0]
))
const activeAdvancedFilterPresetOption = computed(() => (
  advancedFilterPresetOptions.find(option => option.value === advancedFilterPreset.value)
  ?? advancedFilterPresetOptions[0]
))

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
const headerHeight = ref(ROW_HEIGHT)
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
const overlayContentHeight = computed(() => Math.max(0, resolveDisplayRowCount()) * ROW_HEIGHT)
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

let lastDragCoord: CellCoord | null = null
let ensureCellVisibleByCoord: ((coord: CellCoord) => void) | null = null
let resolveDisplayRowCount: () => number = () => 0
let resolveDisplayNodeAtIndex: (rowIndex: number) => DataGridRowNode<IncidentRow> | undefined = () => undefined
let resolveDisplayLeafRowAtIndex: (rowIndex: number) => IncidentRow | undefined = () => undefined
let materializeDisplayRows: () => readonly DataGridRowNode<IncidentRow>[] = () => []
const cellCoordNormalizer = useDataGridCellCoordNormalizer<CellCoord>({
  resolveRowCount() {
    return resolveDisplayRowCount()
  },
  resolveColumnCount() {
    return orderedColumns.value.length
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
  canApplyActiveColumnFilter,
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

function openHeaderFilterMenu(columnKey: string): void {
  openColumnFilter(columnKey)
}

function onHeaderFilterMenuClose(columnKey: string): void {
  if (activeFilterColumnKey.value !== columnKey) {
    return
  }
  closeColumnFilterPanel()
}

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
    sourceRows.value = rows
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
  if (currentEditor && viewportRef.value) {
    const selector = `[data-inline-editor-row-id="${currentEditor.rowId}"][data-inline-editor-column-key="${currentEditor.columnKey}"]`
    const host = viewportRef.value.querySelector(selector)
    const input = host && (host.matches("input,textarea,select") ? host : host.querySelector("input,textarea,select"))
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
      updateEditorDraft(input.value)
    }
  }
  const committed = commitInlineEditCore()
  if (committed) {
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
      if (eventTarget?.closest('[data-datagrid-tree-toggle="true"]')) {
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
      if (eventTarget?.closest('[data-datagrid-tree-toggle="true"]')) {
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
  resolveRowCount() {
    return resolveDisplayRowCount()
  },
  resolveColumnMetrics() {
    return orderedColumnMetrics.value
  },
  resolveColumns() {
    return orderedColumns.value
  },
  resolveHeaderHeight() {
    return bodyViewportHeaderOffset.value
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
function setSynchronizedScrollLeft(nextLeft: number) {
  scrollLeft.value = resolveDataGridHeaderScrollSyncLeft(scrollLeft.value, nextLeft)
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
  resolveHeaderHeight() {
    return bodyViewportHeaderOffset.value
  },
  resolveRowHeight() {
    return ROW_HEIGHT
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
})
const onGlobalMouseMove = globalPointerLifecycle.dispatchGlobalMouseMove
const onGlobalMouseUp = globalPointerLifecycle.dispatchGlobalMouseUp
const onGlobalPointerUp = globalPointerLifecycle.dispatchGlobalPointerUp
const onGlobalPointerCancel = globalPointerLifecycle.dispatchGlobalPointerCancel
const onGlobalContextMenuCapture = globalPointerLifecycle.dispatchGlobalContextMenuCapture
const onGlobalWindowBlur = globalPointerLifecycle.dispatchGlobalWindowBlur
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
    return Math.max(1, Math.floor(viewportLayerGeometry.value.overlayHeight / ROW_HEIGHT))
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

function applyColumnVisibilityPreset(preset: ColumnVisibilityPreset): void {
  const maxColumns = Math.max(1, Math.min(columnCount.value, DATA_GRID_COLUMNS.length))
  const allowedKeys = new Set(DATA_GRID_COLUMNS.slice(0, maxColumns).map(column => column.key))
  const presetKeys = new Set(COLUMN_VISIBILITY_PRESETS[preset] ?? COLUMN_VISIBILITY_PRESETS.all)
  const showAll = preset === "all"
  for (const column of DATA_GRID_COLUMNS) {
    const isAllowed = allowedKeys.has(column.key)
    const shouldBeVisible = isAllowed && (column.key === "select" || showAll || presetKeys.has(column.key))
    api.setColumnVisibility(column.key, shouldBeVisible)
  }
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
const filteredAndSortedRows = computed(() => {
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
  viewportWidth,
  scrollLeft,
})
const {
  orderedColumns,
  orderedColumnMetrics,
  columnLayers,
  layerTrackTemplate,
  visibleColumnsWindow,
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
      { key: "latencyMs", aggregations: ["sum", "avg", "min", "max"] },
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
  closeContextMenu: closeCopyContextMenu,
  resolveScrollTop() {
    return scrollTop.value
  },
  resolveScrollLeft() {
    return scrollLeft.value
  },
  setScrollTop(value) {
    scrollTop.value = value
  },
  setScrollLeft(value) {
    setSynchronizedScrollLeft(value)
  },
  hasInlineEditor() {
    return Boolean(inlineEditor.value)
  },
  commitInlineEdit,
})
let isViewportBootstrapping = true
const onViewportScroll = (event: Event) => {
  if (isViewportBootstrapping) {
    resetViewportScrollPosition()
    return
  }
  viewportScrollLifecycle.onViewportScroll(event)
  syncHeaderViewportScroll()
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
  syncHeaderViewportScroll()
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
  api.setColumnPin("status", value ? "left" : "none")
  lastAction.value = value ? "Pinned status column" : "Unpinned status column"
})
watch(pinUpdatedAtRight, value => {
  api.setColumnPin("updatedAt", value ? "right" : "none")
  lastAction.value = value ? "Pinned updatedAt right" : "Unpinned updatedAt"
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
  resetVisibleRowsSyncCache()
  syncVisibleRows()
  lastAction.value = value === "none" ? "Grouping disabled" : `Grouped by ${value}`
}, { immediate: true })

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
  resetVisibleRowsSyncCache()
  if (inlineEditor.value) {
    commitInlineEdit()
  }
  clearCellSelection()
})

watch(sourceRows, () => {
  reconcileRowSelection()
  resetVisibleRowsSyncCache()
  syncVisibleRows()
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
  syncVisibleRows()
  void nextTick(() => {
    resetViewportScrollPosition()
    syncHeaderViewportScroll()
    syncVisibleRows()
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        resetViewportScrollPosition()
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
      <p class="datagrid-controls__filter-indicator" :data-active="isAdvancedFilterActive ? 'true' : 'false'">
        Advanced filter: {{ advancedFilterSummary }}
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
    </section>

    <section class="datagrid-stage">
      <div ref="headerViewportRef" class="datagrid-stage__header-viewport">
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
              }"
              :data-column-key="column.key"
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
              <UiMenu :callbacks="{ onClose: () => onHeaderFilterMenuClose(column.key) }">
                <UiMenuTrigger as-child>
                  <button
                    type="button"
                    class="datagrid-stage__filter-trigger"
                    :class="{ 'is-active': isColumnFilterActive(column.key) }"
                    :data-column-key="column.key"
                    data-datagrid-filter-trigger
                    :aria-label="`Filter ${column.column.label ?? column.key}`"
                    :aria-expanded="activeFilterColumnKey === column.key ? 'true' : 'false'"
                    @click.stop="openHeaderFilterMenu(column.key)"
                    @keydown.stop
                  >
                    F
                  </button>
                </UiMenuTrigger>
                <UiMenuContent
                  class="ui-menu-content datagrid-column-filter datagrid-column-filter--menu"
                  side-offset="6"
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
                      <UiMenuItem
                        data-datagrid-filter-apply
                        :disabled="!canApplyActiveColumnFilter"
                        @select="applyActiveColumnFilter"
                      >
                        Apply
                      </UiMenuItem>
                      <UiMenuItem
                        class="ghost"
                        data-datagrid-filter-reset
                        @select="resetActiveColumnFilter"
                      >
                        Reset
                      </UiMenuItem>
                      <UiMenuItem
                        class="ghost"
                        data-datagrid-filter-clear-all
                        :disabled="!hasColumnFilters"
                        @select="clearAllColumnFilters"
                      >
                        Clear all
                      </UiMenuItem>
                      <UiMenuItem
                        class="ghost"
                        data-datagrid-filter-close
                        @select="closeColumnFilterPanel"
                      >
                        Close
                      </UiMenuItem>
                    </div>
                  </template>
                </UiMenuContent>
              </UiMenu>
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
        <div :style="{ height: `${spacerTopHeight}px` }"></div>

        <div
          v-for="row in visibleRows"
          :key="row.rowId"
          class="datagrid-stage__row"
          :class="{
            'is-selected': row.kind === 'leaf' && isRowSelected(String(row.rowId)),
            'datagrid-stage__row--group-start': isRuntimeGroupStartRow(row),
          }"
          role="row"
          :aria-rowindex="getRowAriaIndex(row)"
          :style="{ gridTemplateColumns: layerTrackTemplate }"
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
            :id="getGridCellId(String(row.rowId), column.key)"
            role="gridcell"
            :aria-colindex="getColumnAriaIndex(column.key)"
            :aria-selected="isCellInSelection(row, column.key) ? 'true' : 'false'"
            :aria-readonly="row.kind === 'group' ? 'true' : (isEditableColumn(column.key) ? 'false' : 'true')"
            :aria-labelledby="getHeaderCellId(column.key)"
            @mousedown="onDataCellMouseDown(row, column.key, $event)"
            @mouseenter="onDataCellMouseEnter(row, column.key, $event)"
            @dblclick="onDataCellDoubleClick(row, column.key, $event)"
          >
            <template v-if="column.key === 'select'">
              <input
                v-if="row.kind === 'leaf'"
                type="checkbox"
                class="datagrid-stage__checkbox"
                :checked="isRowSelected(String(row.rowId))"
                @change="onRowSelectChange(String(row.rowId), $event)"
                :aria-label="`Select ${row.data.service}`"
              />
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
              v-if="row.kind === 'leaf' && shouldShowFillHandle(row, column.key)"
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
        <div :style="{ height: `${spacerBottomHeight}px` }"></div>
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
