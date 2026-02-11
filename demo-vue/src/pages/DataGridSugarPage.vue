<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import type {
  DataGridAdvancedFilterExpression,
  DataGridColumnDef,
  DataGridColumnPin,
  DataGridRowNode,
} from "@affino/datagrid-core"
import {
  useAffinoDataGrid,
  type AffinoDataGridEditSession,
  type AffinoDataGridFeatures,
} from "@affino/datagrid-vue"

interface SugarGridRow {
  rowId: string
  service: string
  owner: string
  team: "platform" | "payments" | "core" | "growth" | "infra"
  region: "us-east" | "us-west" | "eu-central" | "ap-south"
  environment: "prod" | "stage" | "dev"
  deployment: string
  severity: "critical" | "high" | "medium" | "low"
  status: "healthy" | "degraded" | "incident"
  latencyMs: number
  errorRatePct: number
  availabilityPct: number
  cpuPct: number
  memoryPct: number
  throughputRps: number
  mttrMin: number
  sloBurnRate: number
  incidents24h: number
  queueDepth: number
  channel: "#noc" | "#platform-alerts" | "#payments-oncall" | "#incident-bridge"
  runbook: "RB-101" | "RB-204" | "RB-305" | "RB-410" | "RB-512"
  updatedAt: string
}

const REGION_OPTIONS = ["us-east", "us-west", "eu-central", "ap-south"] as const
const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"] as const
const ENVIRONMENT_OPTIONS = ["prod", "stage", "dev"] as const
const STATUS_OPTIONS = ["healthy", "degraded", "incident"] as const
const TEAM_OPTIONS = ["platform", "payments", "core", "growth", "infra"] as const
const CHANNEL_OPTIONS = ["#noc", "#platform-alerts", "#payments-oncall", "#incident-bridge"] as const
const RUNBOOK_OPTIONS = ["RB-101", "RB-204", "RB-305", "RB-410", "RB-512"] as const
const GROUP_BY_OPTIONS = ["none", "region", "owner", "team", "severity", "status"] as const

interface HeaderFilterDraft {
  text: string
  min: string
  max: string
  setValues: string[]
}

type SugarControlPopoverKey = "severity" | "layout" | "metrics"

const createHeaderFilterDraft = (): HeaderFilterDraft => ({
  text: "",
  min: "",
  max: "",
  setValues: [],
})

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "select", label: "", width: 52, pin: "left" },
  { key: "service", label: "Service", width: 230 },
  { key: "owner", label: "Owner", width: 170 },
  { key: "team", label: "Team", width: 120 },
  { key: "region", label: "Region", width: 140 },
  { key: "environment", label: "Env", width: 110 },
  { key: "deployment", label: "Deployment", width: 170 },
  { key: "severity", label: "Severity", width: 130 },
  { key: "status", label: "Status", width: 140 },
  { key: "latencyMs", label: "Latency (ms)", width: 140 },
  { key: "errorRatePct", label: "Error rate %", width: 140 },
  { key: "availabilityPct", label: "Availability %", width: 145 },
  { key: "cpuPct", label: "CPU %", width: 110 },
  { key: "memoryPct", label: "Memory %", width: 120 },
  { key: "throughputRps", label: "Throughput rps", width: 150 },
  { key: "mttrMin", label: "MTTR min", width: 110 },
  { key: "sloBurnRate", label: "SLO burn", width: 120 },
  { key: "incidents24h", label: "Incidents 24h", width: 140 },
  { key: "queueDepth", label: "Queue depth", width: 130 },
  { key: "channel", label: "Channel", width: 170 },
  { key: "runbook", label: "Runbook", width: 120 },
  { key: "updatedAt", label: "Updated", width: 170, pin: "right" },
])

const rows = ref<SugarGridRow[]>(
  Array.from({ length: 420 }, (_, index) => {
    const severity = SEVERITY_OPTIONS[index % SEVERITY_OPTIONS.length] ?? "medium"
    const region = REGION_OPTIONS[index % REGION_OPTIONS.length] ?? "us-east"
    const env: SugarGridRow["environment"][] = ["prod", "stage", "dev"]
    const owners = ["NOC", "SRE", "Platform", "Payments", "Core", "Infra"]
    const statusCycle: SugarGridRow["status"][] = ["healthy", "degraded", "incident"]
    const team = TEAM_OPTIONS[index % TEAM_OPTIONS.length] ?? "platform"
    const latencyMs = 42 + ((index * 7) % 230)
    const errorRatePct = Number((((index * 1.7) % 16) + (severity === "critical" ? 9 : 0)).toFixed(2))
    const availabilityPct = Number((99.99 - ((index * 13) % 160) / 100).toFixed(2))
    const cpuPct = 18 + ((index * 17) % 78)
    const memoryPct = 24 + ((index * 19) % 69)
    const throughputRps = 60 + ((index * 37) % 1900)
    const mttrMin = 7 + ((index * 5) % 91)
    const sloBurnRate = Number((0.3 + ((index * 3) % 34) / 10).toFixed(2))
    const incidents24h = (index * 3) % 24
    const queueDepth = (index * 29) % 520
    const channel = CHANNEL_OPTIONS[(index + 1) % CHANNEL_OPTIONS.length] ?? "#noc"
    const runbook = RUNBOOK_OPTIONS[(index + 2) % RUNBOOK_OPTIONS.length] ?? "RB-101"
    const updatedAt = `2026-02-${String((index % 28) + 1).padStart(2, "0")} ${String((index * 7) % 24).padStart(2, "0")}:${String((index * 11) % 60).padStart(2, "0")}`
    return {
      rowId: `row-${index + 1}`,
      service: `service-${(index % 37) + 1}`,
      owner: owners[index % owners.length] ?? "NOC",
      team,
      region,
      environment: env[index % env.length] ?? "prod",
      deployment: `release-2026.${(index % 12) + 1}.${(index % 9) + 1}`,
      severity,
      status: statusCycle[(index + 1) % statusCycle.length] ?? "healthy",
      latencyMs,
      errorRatePct,
      availabilityPct,
      cpuPct,
      memoryPct,
      throughputRps,
      mttrMin,
      sloBurnRate,
      incidents24h,
      queueDepth,
      channel,
      runbook,
      updatedAt,
    }
  }),
)

const status = ref("Sugar demo ready")
const quickQuery = ref("")
const setSeverity = ref<readonly string[]>([])
const groupBy = ref<(typeof GROUP_BY_OPTIONS)[number]>("none")
const pageSize = ref(50)
const rowHeightBase = ref(36)
const rowHeightMode = ref<"fixed" | "auto">("fixed")
const headerFilterState = ref<Record<string, HeaderFilterDraft>>({})
const openHeaderFilterColumnKey = ref<string | null>(null)
const headerFilterAnchorRect = ref<DOMRect | null>(null)
const toolbarCompact = ref(false)
const headerSetSearch = ref("")
const openControlPopover = ref<SugarControlPopoverKey | null>(null)
const controlPopoverAnchorRect = ref<DOMRect | null>(null)
const activeColumnResize = ref<{
  columnKey: string
  startClientX: number
  startWidth: number
} | null>(null)
const columnResizeDraft = ref<Record<string, number>>({})
const activeRowResize = ref<{
  rowKey: string
  startClientY: number
  startHeight: number
} | null>(null)
const rowHeightOverrides = ref<Record<string, number>>({})
const isFillHandleDragging = ref(false)
const fillBaseRange = ref<{
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
} | null>(null)

const resolveRowKey = (row: SugarGridRow): string => row.rowId

function castDraftValue(previous: unknown, draft: string): unknown {
  if (typeof previous === "number") {
    const parsed = Number(draft)
    return Number.isFinite(parsed) ? parsed : previous
  }
  if (typeof previous === "string") {
    return draft
  }
  return draft
}

const onCommitEdit = async (session: AffinoDataGridEditSession): Promise<void> => {
  const rowIndex = rows.value.findIndex(row => row.rowId === session.rowKey)
  if (rowIndex < 0) {
    return
  }
  const current = rows.value[rowIndex]
  if (!current) {
    return
  }
  const nextRow: SugarGridRow = {
    ...current,
    [session.columnKey]: castDraftValue(
      (current as unknown as Record<string, unknown>)[session.columnKey],
      session.draft,
    ),
  } as SugarGridRow
  const nextRows = rows.value.slice()
  nextRows[rowIndex] = nextRow
  rows.value = nextRows
  status.value = `Updated ${session.columnKey} for ${session.rowKey}`
}

const features: AffinoDataGridFeatures<SugarGridRow> = {
  selection: {
    enabled: true,
    resolveRowKey,
  },
  clipboard: {
    enabled: true,
    useSystemClipboard: false,
    serializeRows(nextRows) {
      return JSON.stringify(nextRows, null, 2)
    },
    parseRows(text) {
      try {
        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? (parsed as readonly SugarGridRow[]) : []
      } catch {
        return []
      }
    },
  },
  editing: {
    enabled: true,
    mode: "cell",
    enum: true,
    onCommit: onCommitEdit,
  },
  filtering: {
    enabled: true,
  },
  summary: {
    enabled: true,
    columns: [
      { key: "latencyMs", aggregations: ["count", "sum", "avg", "min", "max"] },
      { key: "errorRatePct", aggregations: ["count", "sum", "avg", "min", "max"] },
    ],
  },
  visibility: {
    enabled: true,
  },
  tree: {
    enabled: true,
  },
  rowHeight: {
    enabled: true,
    mode: "fixed",
    base: 36,
  },
  keyboardNavigation: true,
}

const grid = useAffinoDataGrid<SugarGridRow>({
  rows,
  columns,
  features,
  initialSortState: [{ key: "latencyMs", direction: "desc" }],
})

const rowModelVersion = ref(0)
const unsubscribeRowModel = grid.rowModel.subscribe(() => {
  rowModelVersion.value += 1
})
onBeforeUnmount(() => {
  unsubscribeRowModel()
})

watch(pageSize, nextSize => {
  grid.pagination.setPageSize(nextSize)
}, { immediate: true })

watch(groupBy, nextGroup => {
  if (nextGroup === "none") {
    grid.features.tree.clearGroupBy()
    return
  }
  grid.features.tree.setGroupBy({
    fields: [nextGroup],
    expandedByDefault: true,
  })
})

watch(rowHeightMode, nextMode => {
  grid.features.rowHeight.setMode(nextMode)
  if (nextMode === "auto") {
    grid.features.rowHeight.measureVisible()
    grid.features.rowHeight.apply()
  }
})

watch(rowHeightBase, nextBase => {
  grid.features.rowHeight.setBase(Math.max(24, Math.min(80, Math.round(nextBase))))
})

const ensureHeaderFilterDraft = (columnKey: string): HeaderFilterDraft => {
  const existing = headerFilterState.value[columnKey]
  if (existing) {
    return existing
  }
  const next = createHeaderFilterDraft()
  headerFilterState.value = {
    ...headerFilterState.value,
    [columnKey]: next,
  }
  return next
}

const isSetFilterColumn = (columnKey: string): boolean => (
  ["severity", "status", "region", "environment", "team", "channel", "runbook"].includes(columnKey)
)

const isNumberFilterColumn = (columnKey: string): boolean => (
  [
    "latencyMs",
    "errorRatePct",
    "availabilityPct",
    "cpuPct",
    "memoryPct",
    "throughputRps",
    "mttrMin",
    "sloBurnRate",
    "incidents24h",
    "queueDepth",
  ].includes(columnKey)
)

const resolveSetFilterOptions = (columnKey: string): readonly string[] => {
  if (columnKey === "severity") {
    return [...SEVERITY_OPTIONS]
  }
  if (columnKey === "status") {
    return [...STATUS_OPTIONS]
  }
  if (columnKey === "region") {
    return [...REGION_OPTIONS]
  }
  if (columnKey === "environment") {
    return [...ENVIRONMENT_OPTIONS]
  }
  if (columnKey === "team") {
    return [...TEAM_OPTIONS]
  }
  if (columnKey === "channel") {
    return [...CHANNEL_OPTIONS]
  }
  if (columnKey === "runbook") {
    return [...RUNBOOK_OPTIONS]
  }
  return []
}

const openedHeaderFilterDraft = computed<HeaderFilterDraft | null>(() => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return null
  }
  return headerFilterState.value[key] ?? null
})

const closeHeaderFilterPopover = (): void => {
  openHeaderFilterColumnKey.value = null
  headerFilterAnchorRect.value = null
  headerSetSearch.value = ""
}

const openHeaderFilterPopover = (event: MouseEvent, columnKey: string): void => {
  const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  if (!target) {
    return
  }
  if (openHeaderFilterColumnKey.value === columnKey) {
    closeHeaderFilterPopover()
    return
  }
  closeControlPopover()
  ensureHeaderFilterDraft(columnKey)
  openHeaderFilterColumnKey.value = columnKey
  headerFilterAnchorRect.value = target.getBoundingClientRect()
  headerSetSearch.value = ""
}

const closeControlPopover = (): void => {
  openControlPopover.value = null
  controlPopoverAnchorRect.value = null
}

const openControlPopoverByKey = (event: MouseEvent, key: SugarControlPopoverKey): void => {
  const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  if (!target) {
    return
  }
  if (openControlPopover.value === key) {
    closeControlPopover()
    return
  }
  closeHeaderFilterPopover()
  openControlPopover.value = key
  controlPopoverAnchorRect.value = target.getBoundingClientRect()
}

const onGlobalPointerDown = (event: MouseEvent): void => {
  if (!openHeaderFilterColumnKey.value && !openControlPopover.value) {
    return
  }
  const target = event.target instanceof Element ? event.target : null
  if (!target) {
    closeHeaderFilterPopover()
    closeControlPopover()
    return
  }
  if (target.closest(".datagrid-sugar-filter-popover")) {
    return
  }
  if (target.closest(".datagrid-sugar-control-popover")) {
    return
  }
  if (target.closest("[data-sugar-filter-trigger]")) {
    return
  }
  if (target.closest("[data-sugar-control-trigger]")) {
    return
  }
  closeHeaderFilterPopover()
  closeControlPopover()
}

const onGlobalEscape = (event: KeyboardEvent): void => {
  if (event.key !== "Escape") {
    return
  }
  if (isFillHandleDragging.value) {
    isFillHandleDragging.value = false
    fillBaseRange.value = null
    grid.cellRange.setFillPreviewRange(null)
  }
  if (activeColumnResize.value) {
    activeColumnResize.value = null
  }
  if (activeRowResize.value) {
    activeRowResize.value = null
  }
  if (openHeaderFilterColumnKey.value) {
    closeHeaderFilterPopover()
    return
  }
  if (openControlPopover.value) {
    closeControlPopover()
  }
  if (contextMenuOpen.value) {
    grid.contextMenu.close()
  }
}

const resolveVisibleColumnIndexByKey = (columnKey: string): number => (
  visibleColumns.value.findIndex(column => column.key === columnKey)
)

const resolveVisibleLeafRowIndexByKey = (rowKey: string): number => (
  renderedRows.value.findIndex(row => row.kind === "leaf" && String(row.rowId) === rowKey)
)

const resolvePointerCellCoord = (event: MouseEvent): { rowIndex: number; columnIndex: number } | null => {
  const fromTarget = event.target instanceof Element
    ? event.target.closest(".datagrid-sugar-stage__cell[data-row-key][data-column-key]")
    : null
  const candidate = fromTarget
    ?? (typeof document !== "undefined"
      ? document.elementFromPoint(event.clientX, event.clientY)?.closest(".datagrid-sugar-stage__cell[data-row-key][data-column-key]")
      : null)
  if (!candidate) {
    return null
  }
  const rowKey = candidate.getAttribute("data-row-key") ?? ""
  const columnKey = candidate.getAttribute("data-column-key") ?? ""
  if (!rowKey || !columnKey) {
    return null
  }
  const rowIndex = resolveVisibleLeafRowIndexByKey(rowKey)
  const columnIndex = resolveVisibleColumnIndexByKey(columnKey)
  if (rowIndex < 0 || columnIndex < 0) {
    return null
  }
  return { rowIndex, columnIndex }
}

const stopFillHandleDrag = (applyPreview: boolean): void => {
  if (!isFillHandleDragging.value) {
    return
  }
  if (applyPreview) {
    void grid.cellRange.applyFillPreview()
    status.value = "Fill preview applied"
  }
  isFillHandleDragging.value = false
  fillBaseRange.value = null
  grid.cellRange.setFillPreviewRange(null)
}

const updateFillPreviewRangeFromPointer = (event: MouseEvent): void => {
  if (!isFillHandleDragging.value) {
    return
  }
  const base = fillBaseRange.value
  const coord = resolvePointerCellCoord(event)
  if (!base || !coord) {
    return
  }
  const preview = {
    startRow: Math.min(base.startRow, coord.rowIndex),
    endRow: Math.max(base.endRow, coord.rowIndex),
    startColumn: Math.min(base.startColumn, coord.columnIndex),
    endColumn: Math.max(base.endColumn, coord.columnIndex),
  }
  grid.cellRange.setFillPreviewRange(preview)
}

const onGlobalPointerMove = (event: MouseEvent): void => {
  if (activeColumnResize.value) {
    const active = activeColumnResize.value
    const nextWidth = Math.max(72, Math.min(760, Math.round(active.startWidth + (event.clientX - active.startClientX))))
    columnResizeDraft.value = {
      ...columnResizeDraft.value,
      [active.columnKey]: nextWidth,
    }
    return
  }
  if (activeRowResize.value) {
    const active = activeRowResize.value
    const nextHeight = Math.max(24, Math.min(120, Math.round(active.startHeight + (event.clientY - active.startClientY))))
    rowHeightOverrides.value = {
      ...rowHeightOverrides.value,
      [active.rowKey]: nextHeight,
    }
    return
  }
  if (isFillHandleDragging.value) {
    updateFillPreviewRangeFromPointer(event)
  }
}

const onGlobalPointerUp = (): void => {
  if (activeColumnResize.value) {
    const active = activeColumnResize.value
    const nextWidth = columnResizeDraft.value[active.columnKey]
    if (typeof nextWidth === "number" && Number.isFinite(nextWidth)) {
      grid.columnState.setWidth(active.columnKey, nextWidth)
      status.value = `Column ${active.columnKey} resized to ${nextWidth}px`
    }
    const nextDraft = { ...columnResizeDraft.value }
    delete nextDraft[active.columnKey]
    columnResizeDraft.value = nextDraft
    activeColumnResize.value = null
  }
  if (activeRowResize.value) {
    const active = activeRowResize.value
    const nextHeight = rowHeightOverrides.value[active.rowKey]
    if (typeof nextHeight === "number" && Number.isFinite(nextHeight)) {
      status.value = `Row ${active.rowKey} resized to ${nextHeight}px`
    }
    activeRowResize.value = null
  }
  if (isFillHandleDragging.value) {
    stopFillHandleDrag(true)
  }
}

onMounted(() => {
  window.addEventListener("mousedown", onGlobalPointerDown, true)
  window.addEventListener("mousemove", onGlobalPointerMove, true)
  window.addEventListener("mouseup", onGlobalPointerUp, true)
  window.addEventListener("keydown", onGlobalEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener("mousedown", onGlobalPointerDown, true)
  window.removeEventListener("mousemove", onGlobalPointerMove, true)
  window.removeEventListener("mouseup", onGlobalPointerUp, true)
  window.removeEventListener("keydown", onGlobalEscape)
})

const updateOpenedHeaderText = (value: string): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  const current = ensureHeaderFilterDraft(key)
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: {
      ...current,
      text: value,
    },
  }
}

const updateOpenedHeaderMin = (value: string): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  const current = ensureHeaderFilterDraft(key)
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: {
      ...current,
      min: value,
    },
  }
}

const updateOpenedHeaderMax = (value: string): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  const current = ensureHeaderFilterDraft(key)
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: {
      ...current,
      max: value,
    },
  }
}

const toggleOpenedHeaderSetValue = (value: string, checked: boolean): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  const current = ensureHeaderFilterDraft(key)
  const currentSet = new Set(current.setValues)
  if (checked) {
    currentSet.add(value)
  } else {
    currentSet.delete(value)
  }
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: {
      ...current,
      setValues: Array.from(currentSet),
    },
  }
}

const setOpenedHeaderSetValues = (values: readonly string[]): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  const current = ensureHeaderFilterDraft(key)
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: {
      ...current,
      setValues: Array.from(new Set(values)),
    },
  }
}

const clearOpenedHeaderFilter = (): void => {
  const key = openHeaderFilterColumnKey.value
  if (!key) {
    return
  }
  headerFilterState.value = {
    ...headerFilterState.value,
    [key]: createHeaderFilterDraft(),
  }
}

const applyFilterModel = () => {
  const expressionParts: DataGridAdvancedFilterExpression[] = []
  const query = quickQuery.value.trim().toLowerCase()
  if (query.length > 0) {
    expressionParts.push({
      kind: "group",
      operator: "or",
      children: [
        {
          kind: "condition",
          key: "service",
          type: "text",
          operator: "contains",
          value: query,
        },
        {
          kind: "condition",
          key: "owner",
          type: "text",
          operator: "contains",
          value: query,
        },
      ],
    })
  }
  if (setSeverity.value.length > 0) {
    expressionParts.push({
      kind: "condition",
      key: "severity",
      type: "set",
      operator: "in",
      value: [...setSeverity.value],
    })
  }

  for (const [columnKey, draft] of Object.entries(headerFilterState.value)) {
    if (!draft) {
      continue
    }
    if (isSetFilterColumn(columnKey) && draft.setValues.length > 0) {
      expressionParts.push({
        kind: "condition",
        key: columnKey,
        type: "set",
        operator: "in",
        value: [...draft.setValues],
      })
      continue
    }
    if (isNumberFilterColumn(columnKey)) {
      const min = draft.min.trim()
      const max = draft.max.trim()
      if (min.length > 0) {
        expressionParts.push({
          kind: "condition",
          key: columnKey,
          type: "number",
          operator: "gte",
          value: Number(min),
        })
      }
      if (max.length > 0) {
        expressionParts.push({
          kind: "condition",
          key: columnKey,
          type: "number",
          operator: "lte",
          value: Number(max),
        })
      }
      continue
    }
    const text = draft.text.trim()
    if (text.length > 0) {
      expressionParts.push({
        kind: "condition",
        key: columnKey,
        type: "text",
        operator: "contains",
        value: text.toLowerCase(),
      })
    }
  }

  if (expressionParts.length === 0) {
    grid.features.filtering.clear()
    return
  }

  const expression = expressionParts.length === 1
    ? expressionParts[0] ?? null
    : {
        kind: "group" as const,
        operator: "and" as const,
        children: expressionParts,
      }
  grid.features.filtering.setAdvancedExpression(expression)
}

const clearFilterModel = () => {
  quickQuery.value = ""
  setSeverity.value = []
  headerFilterState.value = {}
  grid.features.filtering.clear()
}

const applyHeaderFilterPopover = () => {
  applyFilterModel()
  closeHeaderFilterPopover()
}

const visibleColumns = computed(() => {
  const snapshot = grid.columnState.snapshot.value
  const byKey = new Map(snapshot.columns.map(column => [column.key, column] as const))
  const ordered = snapshot.order
    .map(key => byKey.get(key))
    .filter((column): column is NonNullable<typeof column> => Boolean(column))
    .filter(column => column.visible)
  const left = ordered.filter(column => column.pin === "left")
  const center = ordered.filter(column => column.pin === "none")
  const right = ordered.filter(column => column.pin === "right")
  return [...left, ...center, ...right]
})

const resolveColumnRenderWidth = (columnKey: string, fallbackWidth: number | null | undefined): number => {
  const draft = columnResizeDraft.value[columnKey]
  if (typeof draft === "number" && Number.isFinite(draft)) {
    return Math.max(72, Math.min(760, Math.round(draft)))
  }
  return Math.max(84, Math.round(fallbackWidth ?? 120))
}

const gridTemplateColumns = computed(() => (
  visibleColumns.value
    .map(column => `${resolveColumnRenderWidth(column.key, column.width)}px`)
    .join(" ")
))

const pinnedColumnOffsets = computed(() => {
  const leftOffsets = new Map<string, number>()
  const rightOffsets = new Map<string, number>()

  let left = 0
  for (const column of visibleColumns.value) {
    if (column.pin !== "left") {
      continue
    }
    leftOffsets.set(column.key, left)
    left += resolveColumnRenderWidth(column.key, column.width)
  }

  let right = 0
  for (let index = visibleColumns.value.length - 1; index >= 0; index -= 1) {
    const column = visibleColumns.value[index]
    if (!column || column.pin !== "right") {
      continue
    }
    rightOffsets.set(column.key, right)
    right += resolveColumnRenderWidth(column.key, column.width)
  }

  return {
    leftOffsets,
    rightOffsets,
  }
})

const renderedRows = computed(() => {
  void rowModelVersion.value
  const count = grid.rowModel.getRowCount()
  if (count <= 0) {
    return [] as readonly DataGridRowNode<SugarGridRow>[]
  }
  return grid.rowModel.getRowsInRange({
    start: 0,
    end: count - 1,
  }) as readonly DataGridRowNode<SugarGridRow>[]
})

const contextMenuActions = computed(() => grid.contextMenu.actions.value)
const contextMenuStyle = computed(() => grid.contextMenu.style.value)
const contextMenuOpen = computed(() => grid.contextMenu.state.value.visible)
const activeCell = computed(() => grid.cellSelection.activeCell.value)
const selectionRange = computed(() => grid.cellSelection.range.value)
const selectedSummary = computed(() => grid.features.summary.selected.value)

const leafRowKeys = computed(() => {
  const keys: string[] = []
  for (const node of renderedRows.value) {
    if (node.kind !== "leaf") {
      continue
    }
    keys.push(String(node.rowId))
  }
  return keys
})

const allVisibleRowsSelected = computed(() => (
  leafRowKeys.value.length > 0 &&
  leafRowKeys.value.every(rowKey => grid.features.selection.isSelectedByKey(rowKey))
))

const someVisibleRowsSelected = computed(() => (
  !allVisibleRowsSelected.value &&
  leafRowKeys.value.some(rowKey => grid.features.selection.isSelectedByKey(rowKey))
))

const rowCellStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (rowHeightMode.value === "fixed") {
    style.minHeight = `${grid.features.rowHeight.base.value}px`
  }
  return style
})

const resolveRowHeightPx = (rowKey: string): number => {
  const override = rowHeightOverrides.value[rowKey]
  if (typeof override === "number" && Number.isFinite(override)) {
    return Math.max(24, Math.min(120, Math.round(override)))
  }
  return Math.max(24, Math.min(120, Math.round(grid.features.rowHeight.base.value)))
}

const resolvePinnedCellStyle = (
  columnKey: string,
  pin: DataGridColumnPin,
  isHeader: boolean,
): Record<string, string> => {
  if (pin === "left") {
    const offset = pinnedColumnOffsets.value.leftOffsets.get(columnKey) ?? 0
    return {
      position: "sticky",
      left: `${offset}px`,
      zIndex: isHeader ? "11" : "5",
    }
  }
  if (pin === "right") {
    const offset = pinnedColumnOffsets.value.rightOffsets.get(columnKey) ?? 0
    return {
      position: "sticky",
      right: `${offset}px`,
      zIndex: isHeader ? "11" : "5",
    }
  }
  return {}
}

const resolveHeaderCellStyle = (columnKey: string, pin: DataGridColumnPin): Record<string, string> => ({
  ...resolvePinnedCellStyle(columnKey, pin, true),
})

const resolveRowCellStyle = (rowKey: string, columnKey: string, pin: DataGridColumnPin): Record<string, string> => ({
  ...rowCellStyle.value,
  minHeight: `${resolveRowHeightPx(rowKey)}px`,
  ...resolvePinnedCellStyle(columnKey, pin, false),
})

const metrics = computed(() => {
  void rowModelVersion.value
  return {
    totalRows: rows.value.length,
    visibleRows: grid.rowModel.getRowCount(),
    selectedRows: grid.features.selection.selectedCount.value,
    selectedCells: selectedSummary.value?.selectedCells ?? 0,
    groupBy: groupBy.value,
    activeColumnFilters: Object.entries(headerFilterState.value)
      .filter(([, draft]) => (
        draft.text.trim().length > 0 ||
        draft.min.trim().length > 0 ||
        draft.max.trim().length > 0 ||
        draft.setValues.length > 0
      ))
      .length,
  }
})

const metricsTickerItems = computed(() => {
  const activeCellText = activeCell.value
    ? `${activeCell.value.rowKey} · ${activeCell.value.columnKey}`
    : "none"
  const rangeText = selectionRange.value
    ? `R${selectionRange.value.startRow + 1}-R${selectionRange.value.endRow + 1} · C${selectionRange.value.startColumn + 1}-C${selectionRange.value.endColumn + 1}`
    : "none"
  return [
    { label: "Rows", value: `${metrics.value.visibleRows}/${metrics.value.totalRows}` },
    { label: "Selected", value: `${metrics.value.selectedRows}r · ${metrics.value.selectedCells}c` },
    { label: "Group", value: metrics.value.groupBy },
    { label: "Filters", value: String(metrics.value.activeColumnFilters) },
    { label: "Active", value: activeCellText },
    { label: "Range", value: rangeText },
    { label: "Latency avg", value: formatMetric(selectedSummary.value?.columns?.latencyMs?.metrics?.avg) },
  ] as const
})

const isEditableColumn = (columnKey: string): boolean => (
  !["rowId", "select"].includes(columnKey)
)

const resolveNodeKey = (node: DataGridRowNode<SugarGridRow>, fallbackIndex: number): string => {
  if (node.kind === "group") {
    return `group:${node.groupMeta?.groupKey ?? fallbackIndex}`
  }
  return String(node.rowId ?? node.rowKey ?? fallbackIndex)
}

const resolveDisplayValue = (row: SugarGridRow, columnKey: string): string => {
  const value = (row as unknown as Record<string, unknown>)[columnKey]
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

const toggleGroupNode = (node: DataGridRowNode<SugarGridRow>): void => {
  const key = node.groupMeta?.groupKey
  if (!key) {
    return
  }
  grid.features.tree.toggleGroup(key)
}

const formatMetric = (value: number | null | undefined): string => (
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "—"
)

const isColumnGrouped = (columnKey: string): boolean => (
  groupBy.value !== "none" && groupBy.value === columnKey
)

const resolveColumnSort = (columnKey: string): "none" | "ascending" | "descending" => (
  grid.bindings.headerSort(columnKey)["aria-sort"]
)

const sortPriorityMap = computed(() => {
  const map = new Map<string, number>()
  for (const [index, sortEntry] of grid.sortState.value.entries()) {
    map.set(sortEntry.key, index + 1)
  }
  return map
})

const resolveSortPriority = (columnKey: string): number | null => (
  sortPriorityMap.value.get(columnKey) ?? null
)

const isColumnFilterActive = (columnKey: string): boolean => {
  const draft = headerFilterState.value[columnKey]
  if (!draft) {
    return false
  }
  return (
    draft.text.trim().length > 0 ||
    draft.min.trim().length > 0 ||
    draft.max.trim().length > 0 ||
    draft.setValues.length > 0
  )
}

const headerFilterPopoverStyle = computed<Record<string, string>>(() => {
  const rect = headerFilterAnchorRect.value
  if (!rect) {
    return {
      left: "0px",
      top: "0px",
    }
  }
  return {
    left: `${Math.max(10, Math.round(rect.left - 190 + rect.width))}px`,
    top: `${Math.round(rect.bottom + 8)}px`,
  }
})

const controlPopoverStyle = computed<Record<string, string>>(() => {
  const rect = controlPopoverAnchorRect.value
  if (!rect) {
    return {
      left: "0px",
      top: "0px",
    }
  }
  return {
    left: `${Math.max(10, Math.round(rect.left))}px`,
    top: `${Math.round(rect.bottom + 8)}px`,
  }
})

const openedHeaderFilterKey = computed(() => openHeaderFilterColumnKey.value ?? "")

const openedHeaderSetOptions = computed<readonly string[]>(() => {
  const key = openedHeaderFilterKey.value
  if (!key || !isSetFilterColumn(key)) {
    return []
  }
  const options = resolveSetFilterOptions(key)
  const query = headerSetSearch.value.trim().toLowerCase()
  if (query.length === 0) {
    return options
  }
  return options.filter(option => option.toLowerCase().includes(query))
})

const openedHeaderSetTotalCount = computed(() => {
  const key = openedHeaderFilterKey.value
  if (!key || !isSetFilterColumn(key)) {
    return 0
  }
  return resolveSetFilterOptions(key).length
})

const openedHeaderSetSelectedCount = computed(() => (
  openedHeaderFilterDraft.value?.setValues.length ?? 0
))

const onOpenedHeaderTextInput = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  updateOpenedHeaderText(target?.value ?? "")
}

const onOpenedHeaderMinInput = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  updateOpenedHeaderMin(target?.value ?? "")
}

const onOpenedHeaderMaxInput = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  updateOpenedHeaderMax(target?.value ?? "")
}

const onOpenedHeaderSetChange = (value: string, event: Event): void => {
  const target = event.target as HTMLInputElement | null
  toggleOpenedHeaderSetValue(value, Boolean(target?.checked))
}

const onHeaderSetSearchInput = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  headerSetSearch.value = target?.value ?? ""
}

const selectAllOpenedHeaderSetValues = (): void => {
  setOpenedHeaderSetValues(openedHeaderSetOptions.value)
}

const clearAllOpenedHeaderSetValues = (): void => {
  setOpenedHeaderSetValues([])
}

const selectOnlyOpenedHeaderSetValue = (value: string): void => {
  setOpenedHeaderSetValues([value])
}

const isRowSelected = (node: DataGridRowNode<SugarGridRow>): boolean => {
  if (node.kind !== "leaf") {
    return false
  }
  return grid.features.selection.isSelectedByKey(String(node.rowId))
}

const onHeaderSelectAllChange = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  const checked = Boolean(target?.checked)
  for (const rowKey of leafRowKeys.value) {
    grid.features.selection.setSelectedByKey(rowKey, checked)
  }
}

const onRowSelectChange = (rowKey: string, event: Event): void => {
  const target = event.target as HTMLInputElement | null
  grid.features.selection.setSelectedByKey(rowKey, Boolean(target?.checked))
}

const onHeaderResizeHandleMouseDown = (columnKey: string, event: MouseEvent): void => {
  event.preventDefault()
  event.stopPropagation()
  const column = visibleColumns.value.find(entry => entry.key === columnKey)
  if (!column) {
    return
  }
  activeColumnResize.value = {
    columnKey,
    startClientX: event.clientX,
    startWidth: resolveColumnRenderWidth(columnKey, column.width),
  }
}

const onRowResizeHandleMouseDown = (rowKey: string, event: MouseEvent): void => {
  event.preventDefault()
  event.stopPropagation()
  activeRowResize.value = {
    rowKey,
    startClientY: event.clientY,
    startHeight: resolveRowHeightPx(rowKey),
  }
}

const shouldShowFillHandle = (rowIndex: number, columnIndex: number): boolean => {
  const range = selectionRange.value
  if (!range || isFillHandleDragging.value) {
    return false
  }
  const column = visibleColumns.value[columnIndex]
  if (!column || column.key === "select") {
    return false
  }
  return rowIndex === range.endRow && columnIndex === range.endColumn
}

const isCellInFillPreview = (rowIndex: number, columnIndex: number): boolean => {
  const preview = grid.cellRange.fillPreviewRange.value
  if (!preview) {
    return false
  }
  return (
    rowIndex >= preview.startRow &&
    rowIndex <= preview.endRow &&
    columnIndex >= preview.startColumn &&
    columnIndex <= preview.endColumn
  )
}

const onSelectionHandleMouseDown = (rowIndex: number, columnIndex: number, event: MouseEvent): void => {
  event.preventDefault()
  event.stopPropagation()
  const range = selectionRange.value
  if (!range) {
    return
  }
  isFillHandleDragging.value = true
  fillBaseRange.value = { ...range }
  grid.cellRange.setFillPreviewRange({
    startRow: range.startRow,
    endRow: range.endRow,
    startColumn: range.startColumn,
    endColumn: range.endColumn,
  })
  const targetRow = renderedRows.value[rowIndex]
  const targetColumn = visibleColumns.value[columnIndex]
  if (targetRow?.kind === "leaf" && targetColumn) {
    grid.cellSelection.setCellByKey(String(targetRow.rowId), targetColumn.key)
  }
}

const bindLeafCell = (
  row: SugarGridRow,
  rowIndex: number,
  columnKey: string,
): Record<string, unknown> => {
  if (columnKey === "select") {
    return {
      "data-row-key": String(row.rowId),
      "data-column-key": columnKey,
      tabindex: -1,
    }
  }
  const dataCell = grid.bindings.dataCell({
    row,
    rowIndex,
    columnKey,
    editable: isEditableColumn(columnKey),
    value: row[columnKey as keyof SugarGridRow],
  })
  const selectionCell = grid.bindings.cellSelection({
    row,
    rowIndex,
    columnKey,
  })
  const dataCellKeydown = dataCell.onKeydown
  const selectionCellKeydown = selectionCell.onKeydown
  return {
    ...dataCell,
    ...selectionCell,
    tabindex: 0,
    onFocus: () => {
      grid.cellSelection.setCellByKey(String(row.rowId), columnKey)
    },
    onKeydown: (event: KeyboardEvent) => {
      dataCellKeydown(event)
      if (!event.defaultPrevented) {
        selectionCellKeydown(event)
      }
    },
  }
}

const setColumnPin = (columnKey: string, pin: DataGridColumnPin) => {
  grid.columnState.setPin(columnKey, pin)
}

const toggleColumnVisibility = (columnKey: string) => {
  grid.features.visibility.toggleColumnVisible(columnKey)
}

</script>

<template>
  <section class="datagrid-sugar-page">
    <section class="datagrid-sugar-toolbar" :class="{ 'is-compact': toolbarCompact }">
      <div class="datagrid-sugar-toolbar__group">
        <button
          type="button"
          class="datagrid-sugar-toolbar__trigger"
          data-sugar-control-trigger
          :class="{ 'is-active': openControlPopover === 'severity' }"
          @click.stop="openControlPopoverByKey($event, 'severity')"
        >
          Quick Severity Filter
        </button>
        <button
          type="button"
          class="datagrid-sugar-toolbar__trigger"
          data-sugar-control-trigger
          :class="{ 'is-active': openControlPopover === 'layout' }"
          @click.stop="openControlPopoverByKey($event, 'layout')"
        >
          Layout
        </button>
        <button
          type="button"
          class="datagrid-sugar-toolbar__trigger"
          data-sugar-control-trigger
          :class="{ 'is-active': openControlPopover === 'metrics' }"
          @click.stop="openControlPopoverByKey($event, 'metrics')"
        >
          Metrics
        </button>
        <button type="button" @click="toolbarCompact = !toolbarCompact">
          {{ toolbarCompact ? "Comfortable" : "Compact" }}
        </button>
      </div>
    </section>

    <div class="datagrid-sugar-page__layout">
      <main class="datagrid-sugar-stage" role="grid" aria-label="Affino sugar data grid">
        <div class="datagrid-sugar-stage__viewport">
          <div class="datagrid-sugar-stage__header" :style="{ gridTemplateColumns }">
            <div
              v-for="column in visibleColumns"
              :key="`header:${column.key}`"
              class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--header"
              :class="{
                'is-select': column.key === 'select',
                'is-pinned-left': column.pin === 'left',
                'is-pinned-right': column.pin === 'right',
                'is-sorted': resolveColumnSort(column.key) !== 'none',
                'is-filtered': isColumnFilterActive(column.key),
                'is-grouped': isColumnGrouped(column.key),
              }"
              :style="resolveHeaderCellStyle(column.key, column.pin)"
              v-bind="column.key === 'select' ? {} : grid.bindings.headerCell(column.key)"
            >
              <template v-if="column.key === 'select'">
                <input
                  class="datagrid-sugar-stage__checkbox"
                  type="checkbox"
                  :checked="allVisibleRowsSelected"
                  :indeterminate.prop="someVisibleRowsSelected"
                  aria-label="Select all visible rows"
                  @mousedown.stop
                  @change.stop="onHeaderSelectAllChange"
                />
              </template>
              <template v-else>
                <span class="datagrid-sugar-stage__header-label">{{ column.column.label ?? column.key }}</span>
                <span class="datagrid-sugar-stage__header-meta">
                <span
                  v-if="isColumnGrouped(column.key)"
                  class="datagrid-sugar-stage__header-chip datagrid-sugar-stage__header-chip--group"
                  title="Grouped column"
                >G</span>
                <span
                  v-if="column.pin === 'left' || column.pin === 'right'"
                  class="datagrid-sugar-stage__header-chip"
                  :title="column.pin === 'left' ? 'Pinned left' : 'Pinned right'"
                >{{ column.pin === "left" ? "L" : "R" }}</span>
                <span
                  v-if="resolveColumnSort(column.key) !== 'none'"
                  class="datagrid-sugar-stage__header-sort"
                  :title="resolveColumnSort(column.key)"
                >{{ resolveColumnSort(column.key) === "ascending" ? "▲" : "▼" }}</span>
                <span
                  v-if="resolveSortPriority(column.key) !== null"
                  class="datagrid-sugar-stage__header-priority"
                  :title="`Sort priority ${resolveSortPriority(column.key)}`"
                >{{ resolveSortPriority(column.key) }}</span>
                <button
                  type="button"
                  class="datagrid-sugar-stage__header-filter"
                  data-sugar-filter-trigger
                  :class="{ 'is-active': isColumnFilterActive(column.key) }"
                  @click.stop="openHeaderFilterPopover($event, column.key)"
                  :title="isColumnFilterActive(column.key) ? 'Filter active' : 'Open filter'"
                >
                  ⌕
                </button>
                </span>
                <span
                  class="datagrid-sugar-stage__resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  :aria-label="`Resize ${column.column.label ?? column.key}`"
                  @mousedown.stop="onHeaderResizeHandleMouseDown(column.key, $event)"
                ></span>
              </template>
            </div>
          </div>

          <div
            v-for="(rowNode, rowIndex) in renderedRows"
            :key="resolveNodeKey(rowNode, rowIndex)"
            class="datagrid-sugar-stage__row"
            :class="{ 'is-row-selected': isRowSelected(rowNode) }"
            :style="{ gridTemplateColumns }"
          >
            <template v-if="rowNode.kind === 'group'">
              <div
                class="datagrid-sugar-stage__cell datagrid-sugar-stage__cell--group"
                :style="{ ...rowCellStyle, gridColumn: `1 / ${visibleColumns.length + 1}` }"
              >
                <button type="button" class="datagrid-sugar-stage__group-toggle" @click="toggleGroupNode(rowNode)">
                  <span aria-hidden="true">{{ rowNode.state.expanded ? "▾" : "▸" }}</span>
                  <span>{{ rowNode.groupMeta?.groupValue ?? "" }} ({{ rowNode.groupMeta?.childrenCount ?? 0 }})</span>
                </button>
              </div>
            </template>
            <template v-else>
              <div
                v-for="(column, columnIndex) in visibleColumns"
                :key="`${rowNode.rowId}:${column.key}`"
                class="datagrid-sugar-stage__cell"
                :class="{
                  'is-select': column.key === 'select',
                  'is-selected': grid.cellSelection.isCellSelected(rowIndex, columnIndex),
                  'is-fill-preview': isCellInFillPreview(rowIndex, columnIndex),
                  'is-editing': grid.bindings.isCellEditing(String(rowNode.rowId), column.key),
                  'is-pinned-left': column.pin === 'left',
                  'is-pinned-right': column.pin === 'right',
                }"
                :style="resolveRowCellStyle(String(rowNode.rowId), column.key, column.pin)"
                v-bind="bindLeafCell(rowNode.data, rowIndex, column.key)"
              >
                <template v-if="column.key === 'select'">
                  <button
                    type="button"
                    class="datagrid-sugar-stage__drag"
                    v-bind="grid.bindings.rowReorder(rowNode.data, rowIndex)"
                    aria-label="Reorder row"
                  >
                    ⋮⋮
                  </button>
                  <input
                    class="datagrid-sugar-stage__checkbox"
                    type="checkbox"
                    :checked="grid.features.selection.isSelectedByKey(String(rowNode.rowId))"
                    :aria-label="`Select ${rowNode.data.service}`"
                    @mousedown.stop
                    @change.stop="onRowSelectChange(String(rowNode.rowId), $event)"
                  />
                  <span
                    class="datagrid-sugar-stage__row-resize-handle"
                    aria-hidden="true"
                    @mousedown.stop="onRowResizeHandleMouseDown(String(rowNode.rowId), $event)"
                  ></span>
                </template>

                <input
                  v-else-if="grid.bindings.isCellEditing(String(rowNode.rowId), column.key)"
                  class="datagrid-sugar-stage__editor"
                  v-bind="grid.bindings.inlineEditor({
                    rowKey: String(rowNode.rowId),
                    columnKey: column.key,
                    commitOnBlur: true,
                  })"
                  autofocus
                />

                <span v-else>{{ resolveDisplayValue(rowNode.data, column.key) }}</span>
                <span
                  v-if="shouldShowFillHandle(rowIndex, columnIndex)"
                  class="datagrid-sugar-stage__selection-handle datagrid-sugar-stage__selection-handle--cell"
                  aria-hidden="true"
                  @mousedown.stop="onSelectionHandleMouseDown(rowIndex, columnIndex, $event)"
                ></span>
              </div>
            </template>
          </div>

          <div v-if="renderedRows.length === 0" class="datagrid-sugar-stage__empty">
            No rows matched current filters.
          </div>
        </div>

        <footer class="datagrid-sugar-stage__footer">
          <button type="button" @click="grid.pagination.goToFirstPage">First</button>
          <button type="button" @click="grid.pagination.goToPreviousPage">Prev</button>
          <span>
            Page {{ grid.pagination.snapshot.value.currentPage + 1 }} / {{ grid.pagination.snapshot.value.pageCount }}
          </span>
          <button type="button" @click="grid.pagination.goToNextPage">Next</button>
          <button type="button" @click="grid.pagination.goToLastPage">Last</button>
        </footer>
      </main>
    </div>

    <div
      v-if="openControlPopover"
      class="datagrid-sugar-control-popover"
      :style="controlPopoverStyle"
      @mousedown.stop
    >
      <template v-if="openControlPopover === 'severity'">
        <h4>Quick Severity Filter</h4>
        <label>
          <span>Quick query</span>
          <input v-model="quickQuery" type="text" placeholder="service / owner" />
        </label>
        <div class="datagrid-sugar-control-popover__chips">
          <label v-for="severity in SEVERITY_OPTIONS" :key="severity">
            <input v-model="setSeverity" type="checkbox" :value="severity" />
            <span>{{ severity }}</span>
          </label>
        </div>
        <div class="datagrid-sugar-control-popover__actions">
          <button type="button" class="is-primary" @click="applyFilterModel(); closeControlPopover()">Apply</button>
          <button type="button" class="is-ghost" @click="clearFilterModel">Clear</button>
          <button type="button" class="is-ghost" @click="closeControlPopover">Close</button>
        </div>
      </template>

      <template v-else-if="openControlPopover === 'layout'">
        <h4>Layout</h4>
        <label>
          <span>Group by</span>
          <select v-model="groupBy">
            <option v-for="option in GROUP_BY_OPTIONS" :key="option" :value="option">Group: {{ option }}</option>
          </select>
        </label>
        <label>
          <span>Page size</span>
          <select v-model.number="pageSize">
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
          </select>
        </label>
        <label>
          <span>Row height mode</span>
          <select v-model="rowHeightMode">
            <option value="fixed">fixed</option>
            <option value="auto">auto</option>
          </select>
        </label>
        <label>
          <span>Base row height: {{ rowHeightBase }}px</span>
          <input v-model.number="rowHeightBase" type="range" min="24" max="80" step="1" />
        </label>
        <div class="datagrid-sugar-control-popover__actions">
          <button type="button" class="is-ghost" @click="setColumnPin('service', 'left')">Pin service left</button>
          <button type="button" class="is-ghost" @click="setColumnPin('latencyMs', 'right')">Pin latency right</button>
          <button type="button" class="is-ghost" @click="setColumnPin('service', 'none')">Unpin service</button>
        </div>
        <div class="datagrid-sugar-control-popover__columns">
          <label
            v-for="column in grid.columnState.snapshot.value.columns"
            :key="column.key"
          >
            <input
              type="checkbox"
              :checked="column.visible"
              @change="toggleColumnVisibility(column.key)"
            />
            <span>{{ column.column.label ?? column.key }}</span>
          </label>
        </div>
        <div class="datagrid-sugar-control-popover__actions">
          <button type="button" class="is-ghost" @click="closeControlPopover">Close</button>
        </div>
      </template>

      <template v-else>
        <h4>Metrics</h4>
        <div class="datagrid-sugar-control-popover__ticker" role="status" aria-live="polite">
          <div
            v-for="item in metricsTickerItems"
            :key="item.label"
            class="datagrid-sugar-control-popover__ticker-item"
          >
            <span class="datagrid-sugar-control-popover__ticker-label">{{ item.label }}</span>
            <span class="datagrid-sugar-control-popover__ticker-value">{{ item.value }}</span>
          </div>
        </div>
        <p class="datagrid-sugar-control-popover__status">{{ status }}</p>
        <div class="datagrid-sugar-control-popover__actions">
          <button type="button" class="is-ghost" @click="closeControlPopover">Close</button>
        </div>
      </template>
    </div>

    <div
      v-if="openHeaderFilterColumnKey"
      class="datagrid-sugar-filter-popover"
      :style="headerFilterPopoverStyle"
      @mousedown.stop
    >
      <div class="datagrid-sugar-filter-popover__title">
        <h4>{{ openedHeaderFilterKey }}</h4>
        <span
          v-if="isSetFilterColumn(openedHeaderFilterKey)"
          class="datagrid-sugar-filter-popover__title-badge"
        >
          {{ openedHeaderSetSelectedCount }} / {{ openedHeaderSetTotalCount }}
        </span>
      </div>
      <p class="datagrid-sugar-filter-popover__hint">
        {{
          isSetFilterColumn(openedHeaderFilterKey)
            ? "Set filter"
            : isNumberFilterColumn(openedHeaderFilterKey)
              ? "Range filter"
              : "Text contains filter"
        }}
      </p>

      <template v-if="isSetFilterColumn(openedHeaderFilterKey)">
        <div class="datagrid-sugar-filter-popover__set-search">
          <input
            type="search"
            :value="headerSetSearch"
            placeholder="Search values..."
            @input="onHeaderSetSearchInput"
          />
          <div class="datagrid-sugar-filter-popover__set-tools">
            <button type="button" @click="selectAllOpenedHeaderSetValues">Select all</button>
            <button type="button" @click="clearAllOpenedHeaderSetValues">Clear</button>
          </div>
        </div>
        <div class="datagrid-sugar-filter-popover__set">
          <div
            v-for="value in openedHeaderSetOptions"
            :key="value"
            class="datagrid-sugar-filter-popover__set-row"
          >
            <label>
              <input
                type="checkbox"
                :checked="openedHeaderFilterDraft?.setValues.includes(value)"
                @change="onOpenedHeaderSetChange(value, $event)"
              />
              <span>{{ value }}</span>
            </label>
            <button
              type="button"
              class="datagrid-sugar-filter-popover__set-only"
              @click="selectOnlyOpenedHeaderSetValue(value)"
            >
              Only
            </button>
          </div>
          <p v-if="openedHeaderSetOptions.length === 0" class="datagrid-sugar-filter-popover__set-empty">
            No values
          </p>
        </div>
      </template>

      <template v-else-if="isNumberFilterColumn(openedHeaderFilterKey)">
        <label>
          <span>Min (>=)</span>
          <input
            type="number"
            :value="openedHeaderFilterDraft?.min ?? ''"
            @input="onOpenedHeaderMinInput"
          />
        </label>
        <label>
          <span>Max (<=)</span>
          <input
            type="number"
            :value="openedHeaderFilterDraft?.max ?? ''"
            @input="onOpenedHeaderMaxInput"
          />
        </label>
      </template>

      <template v-else>
        <label>
          <span>Contains</span>
          <input
            type="text"
            :value="openedHeaderFilterDraft?.text ?? ''"
            @input="onOpenedHeaderTextInput"
            placeholder="contains..."
          />
        </label>
      </template>

      <div class="datagrid-sugar-filter-popover__actions">
        <button type="button" class="is-primary" @click="applyHeaderFilterPopover">Apply</button>
        <button type="button" class="is-ghost" @click="clearOpenedHeaderFilter">Reset</button>
        <button type="button" class="is-ghost" @click="closeHeaderFilterPopover">Close</button>
      </div>
    </div>

    <div
      v-if="contextMenuOpen"
      :ref="(element) => grid.bindings.contextMenuRef(element as Element | null)"
      class="datagrid-sugar-context"
      :style="contextMenuStyle"
      v-bind="grid.bindings.contextMenuRoot()"
    >
      <button
        v-for="action in contextMenuActions"
        :key="action.id"
        type="button"
        class="datagrid-sugar-context__item"
        v-bind="grid.bindings.contextMenuAction(action.id)"
      >
        {{ action.label }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.datagrid-sugar-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.9rem;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.datagrid-sugar-toolbar {
  position: sticky;
  top: 0;
  z-index: 12;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.55rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.28));
  border-radius: 0.8rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(11, 18, 32, 0.82)) 92%, transparent);
  backdrop-filter: blur(8px);
  padding: 0.5rem;
}

.datagrid-sugar-toolbar__group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.datagrid-sugar-toolbar button,
.datagrid-sugar-toolbar select,
.datagrid-sugar-toolbar input {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.32));
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.32rem 0.52rem;
  font-size: 0.8rem;
}

.datagrid-sugar-toolbar input {
  min-width: 220px;
}

.datagrid-sugar-toolbar__trigger.is-active {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.55) 85%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.2) 80%, transparent);
  color: #dff6ff;
}

.datagrid-sugar-toolbar.is-compact {
  padding: 0.34rem;
  gap: 0.35rem;
}

.datagrid-sugar-toolbar.is-compact .datagrid-sugar-toolbar__group {
  gap: 0.3rem;
}

.datagrid-sugar-toolbar.is-compact button,
.datagrid-sugar-toolbar.is-compact select,
.datagrid-sugar-toolbar.is-compact input {
  padding: 0.24rem 0.4rem;
  font-size: 0.74rem;
  border-radius: 0.38rem;
}

.datagrid-sugar-toolbar.is-compact input {
  min-width: 180px;
}

.datagrid-sugar-page__layout {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  gap: 0;
  overflow: hidden;
}

.datagrid-sugar-stage {
  width: 100%;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.28));
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(11, 18, 32, 0.58)) 78%, transparent);
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.datagrid-sugar-stage__header {
  display: grid;
  border-bottom: 1px solid var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25));
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.9)) 92%, transparent);
  position: sticky;
  top: 0;
  z-index: 9;
  width: max-content;
  min-width: 100%;
}

.datagrid-sugar-stage__viewport {
  overflow: auto;
  height: 100%;
  min-height: 0;
  min-width: 0;
  position: relative;
}

.datagrid-sugar-stage__row {
  display: grid;
  border-bottom: 1px solid color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25)) 84%, transparent);
  width: max-content;
  min-width: 100%;
}

.datagrid-sugar-stage__row.is-row-selected .datagrid-sugar-stage__cell {
  background: color-mix(in srgb, var(--datagrid-selection-range-bg, rgba(56, 189, 248, 0.18)) 45%, transparent);
}

.datagrid-sugar-stage__cell {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.5rem;
  font-size: 0.85rem;
  color: var(--datagrid-text-primary, #e2e8f0);
  border-right: 1px solid color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25)) 80%, transparent);
  position: relative;
}

.datagrid-sugar-stage__cell--header {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
  color: var(--datagrid-text-soft, #94a3b8);
  user-select: none;
  cursor: pointer;
  justify-content: space-between;
  gap: 0.4rem;
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.94)) 92%, transparent);
  transition: background-color 120ms ease;
}

.datagrid-sugar-stage__cell--header.is-select {
  justify-content: center;
  align-items: center;
}

.datagrid-sugar-stage__cell--header:hover {
  background: color-mix(in srgb, var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.12)) 85%, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.94)));
}

.datagrid-sugar-stage__cell--header.is-sorted {
  box-shadow: inset 0 -1px 0 color-mix(in srgb, rgba(56, 189, 248, 0.45) 88%, transparent);
}

.datagrid-sugar-stage__cell--header.is-filtered {
  background: color-mix(in srgb, rgba(56, 189, 248, 0.16) 68%, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.94)));
}

.datagrid-sugar-stage__cell--header.is-grouped {
  box-shadow: inset 0 -1px 0 color-mix(in srgb, rgba(20, 184, 166, 0.5) 86%, transparent);
}

.datagrid-sugar-stage__cell:last-child {
  border-right: 0;
}

.datagrid-sugar-stage__header-label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.datagrid-sugar-stage__header-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.datagrid-sugar-stage__header-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.05rem;
  height: 1.05rem;
  border-radius: 999px;
  font-size: 0.63rem;
  background: color-mix(in srgb, var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.22)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-stage__header-chip--group {
  background: color-mix(in srgb, rgba(20, 184, 166, 0.34) 88%, transparent);
}

.datagrid-sugar-stage__header-sort {
  font-size: 0.66rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-stage__header-priority {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.02rem;
  height: 1.02rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #0f172a;
  background: #38bdf8;
}

.datagrid-sugar-stage__header-filter {
  border: 1px solid transparent;
  border-radius: 0.38rem;
  background: transparent;
  color: var(--datagrid-text-muted, #94a3b8);
  width: 1.2rem;
  height: 1.2rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.datagrid-sugar-stage__header-filter:hover,
.datagrid-sugar-stage__header-filter:focus-visible {
  border-color: var(--datagrid-glass-border, rgba(148, 163, 184, 0.4));
  background: color-mix(in srgb, var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.18)) 90%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  outline: none;
}

.datagrid-sugar-stage__header-filter.is-active {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.55) 85%, transparent);
  color: #38bdf8;
}

.datagrid-sugar-stage__cell.is-selected {
  background: color-mix(in srgb, var(--datagrid-selection-range-bg, rgba(56, 189, 248, 0.18)) 92%, transparent);
}

.datagrid-sugar-stage__cell.is-editing {
  background: color-mix(in srgb, var(--datagrid-selection-active-bg, rgba(56, 189, 248, 0.28)) 85%, transparent);
}

.datagrid-sugar-stage__cell.is-fill-preview {
  background: color-mix(in srgb, rgba(56, 189, 248, 0.12) 88%, transparent);
}

.datagrid-sugar-stage__cell.is-select {
  justify-content: center;
  gap: 0.3rem;
  padding: 0.2rem 0.28rem;
}

.datagrid-sugar-stage__cell--group {
  border-right: 0;
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.8)) 75%, transparent);
}

.datagrid-sugar-stage__group-toggle {
  border: 0;
  background: transparent;
  color: var(--datagrid-text-primary, #e2e8f0);
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  cursor: pointer;
  padding: 0;
}

.datagrid-sugar-stage__drag {
  border: 0;
  background: transparent;
  color: var(--datagrid-text-muted, #94a3b8);
  cursor: grab;
  padding: 0 0.2rem 0 0;
  font-size: 0.85rem;
}

.datagrid-sugar-stage__checkbox {
  width: 0.9rem;
  height: 0.9rem;
  margin: 0;
}

.datagrid-sugar-stage__editor {
  width: 100%;
  border: 1px solid var(--datagrid-editor-border, rgba(148, 163, 184, 0.5));
  border-radius: 0.4rem;
  padding: 0.28rem 0.34rem;
  background: var(--datagrid-editor-bg, rgba(8, 10, 18, 0.96));
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-stage__resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;
}

.datagrid-sugar-stage__resize-handle::after {
  content: "";
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 2px;
  width: 2px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.35)) 90%, transparent);
  opacity: 0;
  transition: opacity 120ms ease;
}

.datagrid-sugar-stage__cell--header:hover .datagrid-sugar-stage__resize-handle::after {
  opacity: 1;
}

.datagrid-sugar-stage__row-resize-handle {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: -3px;
  height: 6px;
  border-radius: 999px;
  cursor: row-resize;
  z-index: 2;
}

.datagrid-sugar-stage__selection-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  right: -4px;
  bottom: -4px;
  border-radius: 2px;
  background: #38bdf8;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.88);
  z-index: 4;
  cursor: crosshair;
}

.datagrid-sugar-stage__empty {
  padding: 0.8rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-stage__footer {
  border-top: 1px solid var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.25));
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.55rem;
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.9)) 92%, transparent);
}

.datagrid-sugar-stage__footer span {
  font-size: 0.8rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-stage__footer button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.5rem;
  cursor: pointer;
}

.datagrid-sugar-stage__cell.is-pinned-left,
.datagrid-sugar-stage__cell.is-pinned-right {
  background: color-mix(in srgb, var(--datagrid-header-row-bg, rgba(20, 24, 36, 0.88)) 82%, transparent);
}

.datagrid-sugar-stage__cell.is-pinned-left {
  box-shadow: 1px 0 0 color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.28)) 92%, transparent);
}

.datagrid-sugar-stage__cell.is-pinned-right {
  box-shadow: -1px 0 0 color-mix(in srgb, var(--datagrid-cell-border-color, rgba(148, 163, 184, 0.28)) 92%, transparent);
}

.datagrid-sugar-stage__cell--header.is-pinned-left,
.datagrid-sugar-stage__cell--header.is-pinned-right {
  z-index: 11;
}

.datagrid-sugar-context {
  position: fixed;
  z-index: 140;
  min-width: 190px;
  display: grid;
  gap: 0.2rem;
  padding: 0.35rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(15, 23, 42, 0.96)) 92%, transparent);
  box-shadow: 0 20px 44px rgba(2, 6, 23, 0.46);
}

.datagrid-sugar-control-popover {
  position: fixed;
  z-index: 146;
  min-width: 260px;
  max-width: 320px;
  display: grid;
  gap: 0.42rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.62rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(15, 23, 42, 0.96)) 90%, rgba(2, 6, 23, 0.45));
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.42);
  padding: 0.52rem;
}

.datagrid-sugar-control-popover h4 {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-control-popover label {
  display: grid;
  gap: 0.14rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-control-popover input,
.datagrid-sugar-control-popover select {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.32));
  border-radius: 0.36rem;
  background: color-mix(in srgb, var(--datagrid-editor-bg, rgba(8, 10, 18, 0.95)) 90%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.36rem;
  font-size: 0.74rem;
}

.datagrid-sugar-control-popover input:focus-visible,
.datagrid-sugar-control-popover select:focus-visible {
  outline: none;
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.6) 88%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, rgba(56, 189, 248, 0.25) 80%, transparent);
}

.datagrid-sugar-control-popover__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.datagrid-sugar-control-popover__chips label {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-control-popover__actions {
  display: flex;
  gap: 0.26rem;
  flex-wrap: wrap;
}

.datagrid-sugar-control-popover__actions button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.34rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.22rem 0.38rem;
  font-size: 0.7rem;
}

.datagrid-sugar-control-popover__actions button.is-primary {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.56) 85%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.22) 82%, transparent);
  color: #dff6ff;
}

.datagrid-sugar-control-popover__actions button.is-ghost {
  background: transparent;
}

.datagrid-sugar-control-popover__columns {
  max-height: 190px;
  overflow: auto;
  display: grid;
  gap: 0.2rem;
  padding-top: 0.2rem;
  border-top: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.32)) 65%, transparent);
}

.datagrid-sugar-control-popover__columns label {
  display: inline-flex;
  align-items: center;
  gap: 0.26rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-control-popover__ticker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.datagrid-sugar-control-popover__ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  padding: 0.16rem 0.34rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.34)) 90%, transparent);
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 86%, transparent);
}

.datagrid-sugar-control-popover__ticker-label {
  font-size: 0.63rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-control-popover__ticker-value {
  font-size: 0.67rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-control-popover__status {
  margin: 0;
  font-size: 0.72rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover {
  position: fixed;
  z-index: 145;
  min-width: 228px;
  max-width: 248px;
  display: grid;
  gap: 0.4rem;
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(15, 23, 42, 0.96)) 90%, rgba(2, 6, 23, 0.45));
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.42);
  padding: 0.48rem;
}

.datagrid-sugar-filter-popover__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.datagrid-sugar-filter-popover h4 {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover__title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.2rem;
  padding: 0.08rem 0.32rem;
  border-radius: 999px;
  font-size: 0.65rem;
  color: var(--datagrid-text-primary, #e2e8f0);
  border: 1px solid color-mix(in srgb, rgba(56, 189, 248, 0.5) 85%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.2) 88%, transparent);
}

.datagrid-sugar-filter-popover__hint {
  margin: 0;
  font-size: 0.7rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover label {
  display: grid;
  gap: 0.14rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover input {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.32));
  border-radius: 0.36rem;
  background: color-mix(in srgb, var(--datagrid-editor-bg, rgba(8, 10, 18, 0.95)) 90%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.36rem;
  font-size: 0.74rem;
}

.datagrid-sugar-filter-popover input:focus-visible {
  outline: none;
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.6) 88%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, rgba(56, 189, 248, 0.25) 80%, transparent);
}

.datagrid-sugar-filter-popover__set {
  max-height: 172px;
  overflow: auto;
  display: grid;
  gap: 0.18rem;
  padding-right: 0.08rem;
}

.datagrid-sugar-filter-popover__set-search {
  display: grid;
  gap: 0.24rem;
  padding-bottom: 0.38rem;
  border-bottom: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.32)) 65%, transparent);
}

.datagrid-sugar-filter-popover__set-tools {
  display: flex;
  justify-content: flex-end;
  gap: 0.22rem;
}

.datagrid-sugar-filter-popover__set-tools button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.34rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.18rem 0.34rem;
  font-size: 0.66rem;
}

.datagrid-sugar-filter-popover__set-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.28rem;
  padding: 0.12rem 0.16rem;
  border-radius: 0.32rem;
}

.datagrid-sugar-filter-popover__set-row:hover {
  background: color-mix(in srgb, var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.18)) 80%, transparent);
}

.datagrid-sugar-filter-popover__set-row label {
  display: flex;
  gap: 0.24rem;
  align-items: center;
  min-width: 0;
  color: var(--datagrid-text-primary, #e2e8f0);
  font-size: 0.72rem;
}

.datagrid-sugar-filter-popover__set-only {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.32rem;
  background: transparent;
  color: var(--datagrid-text-soft, #94a3b8);
  padding: 0.14rem 0.3rem;
  font-size: 0.64rem;
}

.datagrid-sugar-filter-popover__set-only:hover,
.datagrid-sugar-filter-popover__set-only:focus-visible {
  color: var(--datagrid-text-primary, #e2e8f0);
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.5) 88%, transparent);
  outline: none;
}

.datagrid-sugar-filter-popover__set-empty {
  margin: 0;
  font-size: 0.68rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-filter-popover__actions {
  display: flex;
  gap: 0.24rem;
  justify-content: flex-end;
  padding-top: 0.36rem;
  border-top: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.32)) 65%, transparent);
}

.datagrid-sugar-filter-popover__actions button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.35));
  border-radius: 0.34rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.22rem 0.38rem;
  font-size: 0.7rem;
}

.datagrid-sugar-filter-popover__actions button.is-primary {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.56) 85%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.22) 82%, transparent);
  color: #dff6ff;
}

.datagrid-sugar-filter-popover__actions button.is-ghost {
  background: transparent;
}

.datagrid-sugar-filter-popover__actions button:hover,
.datagrid-sugar-filter-popover__actions button:focus-visible,
.datagrid-sugar-filter-popover__set-tools button:hover,
.datagrid-sugar-filter-popover__set-tools button:focus-visible {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.5) 85%, transparent);
  outline: none;
}

.datagrid-sugar-context__item {
  border: 0;
  background: transparent;
  color: var(--datagrid-text-primary, #e2e8f0);
  border-radius: 0.45rem;
  padding: 0.4rem 0.55rem;
  text-align: left;
  cursor: pointer;
}

.datagrid-sugar-context__item:hover,
.datagrid-sugar-context__item:focus-visible {
  background: color-mix(in srgb, var(--datagrid-row-hover-bg, rgba(56, 189, 248, 0.2)) 90%, transparent);
  outline: none;
}

@media (max-width: 1220px) {
  .datagrid-sugar-page {
    height: 100%;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }

  .datagrid-sugar-page__layout {
    display: flex;
    overflow: hidden;
  }

  .datagrid-sugar-toolbar {
    position: sticky;
    top: 0;
  }

  .datagrid-sugar-control-popover {
    max-width: min(92vw, 340px);
  }
}
</style>
