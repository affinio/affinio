<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import {
  useAffinoDataGrid,
  type AffinoDataGridFeatures,
  type DataGridApiDiagnosticsSnapshot,
  type DataGridApiEventName,
  type DataGridApiEventPayload,
  type DataGridClientComputeMode,
  type DataGridClientRowPatch,
  type DataGridUnifiedState,
  type UseAffinoDataGridResult,
} from "@affino/datagrid-vue"
import DataGridSugarStage from "@/components/DataGridSugarStage.vue"
import {
  createWorkerOwnedDemoRows,
  workerOwnedDemoColumns,
  type WorkerOwnedDemoRow,
} from "./workerOwnedDemoModel"

type RuntimeMode = "main-thread" | "worker-owned"
type RowLike = { rowId?: string | number }

interface BenchmarkMetric {
  dispatchMs: number
  appliedMs: number
  revision: number
}

interface WorkerEventLogEntry {
  id: number
  runtime: RuntimeMode
  event: DataGridApiEventName<WorkerOwnedDemoRow>
  revision: number | null
}

function resolveEventRevision(
  payload: DataGridApiEventPayload<WorkerOwnedDemoRow>,
): number | null {
  if (!("snapshot" in payload)) {
    return null
  }
  const snapshot = payload.snapshot
  if (!snapshot || typeof snapshot !== "object" || !("revision" in snapshot)) {
    return null
  }
  const revision = (snapshot as { revision?: unknown }).revision
  return typeof revision === "number" ? revision : null
}

interface WorkerPressureScenarioInput {
  mode?: RuntimeMode
  rowCount?: number
  patchIterations?: number
  patchSize?: number
  formatterPasses?: number
  deepClonePasses?: number
  viewportSampleSize?: number
}

interface WorkerPressureScenarioReport {
  mode: RuntimeMode
  rowCount: number
  patchIterations: number
  patchSize: number
  totalElapsedMs: number
  sortApplyMs: number
  groupApplyMs: number
  aggregationApplyMs: number
  filterApplyMs: number
  patchDispatchP95Ms: number
  patchAppliedP95Ms: number
  patchAppliedP99Ms: number
  pressureChecksum: number
}

interface WorkerBenchBridge {
  runPressureScenario: (input?: WorkerPressureScenarioInput) => Promise<WorkerPressureScenarioReport>
  setRuntimeMode: (mode: RuntimeMode) => void
  getRuntimeMode: () => RuntimeMode
}

function resolveInitialRowCount(): number {
  const fallback = 12_000
  if (typeof window === "undefined") {
    return fallback
  }
  const raw = new URLSearchParams(window.location.search).get("rows")
  if (!raw) {
    return fallback
  }
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 2_000) {
    return fallback
  }
  return Math.round(parsed)
}

declare global {
  interface Window {
    __affinoWorkerBench?: WorkerBenchBridge
  }
}

const rowCount = ref(resolveInitialRowCount())
const patchSize = ref(1_200)
const generation = ref(1)
const rows = ref<WorkerOwnedDemoRow[]>(createWorkerOwnedDemoRows(rowCount.value, generation.value))
const runtimeMode = ref<RuntimeMode>("worker-owned")
const benchmarkStatus = ref("Ready")
const benchmarkRun = ref(0)
const pressureRun = ref(0)
const runningBenchmark = ref(false)

const workerSupported = typeof Worker !== "undefined"
const worker = workerSupported
  ? new Worker(new URL("../../workers/datagridWorkerOwnedHost.worker.ts", import.meta.url), { type: "module" })
  : null

if (!workerSupported) {
  runtimeMode.value = "main-thread"
  benchmarkStatus.value = "Worker API unavailable in this environment"
}

if (worker) {
  worker.addEventListener("error", (event: ErrorEvent) => {
    benchmarkStatus.value = `Worker error: ${event.message || "unknown"}`
  })
  worker.addEventListener("messageerror", () => {
    benchmarkStatus.value = "Worker message serialization error"
  })
}

const features: AffinoDataGridFeatures<WorkerOwnedDemoRow> = {
  selection: {
    enabled: true,
    resolveRowKey: row => row.rowId,
  },
  filtering: { enabled: true },
  headerFilters: { enabled: true, maxUniqueValues: 240 },
  interactions: {
    enabled: true,
    range: { enabled: true, fill: true, move: true },
  },
  feedback: { enabled: true, maxEvents: 80 },
  statusBar: { enabled: true },
  keyboardNavigation: true,
}

const mainGrid = useAffinoDataGrid<WorkerOwnedDemoRow>({
  rows,
  columns: workerOwnedDemoColumns,
  features,
  initialSortState: [{ key: "revenue", direction: "desc" }],
})

const workerGrid = useAffinoDataGrid<WorkerOwnedDemoRow>({
  rows,
  columns: workerOwnedDemoColumns,
  workerOwnedRowModelOptions: worker
    ? {
      source: worker,
      target: worker,
      requestInitialSync: true,
    }
    : undefined,
  features,
  initialSortState: [{ key: "revenue", direction: "desc" }],
})

const mainRevision = ref(0)
const workerRevision = ref(0)
const mainRowCount = ref(mainGrid.api.rows.getCount())
const workerRowCount = ref(workerGrid.api.rows.getCount())
const mainMetric = ref<BenchmarkMetric | null>(null)
const workerMetric = ref<BenchmarkMetric | null>(null)
const lastPressureReport = ref<WorkerPressureScenarioReport | null>(null)
const mainComputeMode = ref<DataGridClientComputeMode | null>(mainGrid.api.compute.getMode())
const workerComputeMode = ref<DataGridClientComputeMode | null>(workerGrid.api.compute.getMode())
const mainStateSnapshot = ref<DataGridUnifiedState<WorkerOwnedDemoRow> | null>(null)
const workerStateSnapshot = ref<DataGridUnifiedState<WorkerOwnedDemoRow> | null>(null)
const eventLog = ref<WorkerEventLogEntry[]>([])
let eventSequence = 0

const activeGrid = computed(() =>
  runtimeMode.value === "worker-owned" ? workerGrid : mainGrid,
)

const diagnosticsSnapshot = ref<DataGridApiDiagnosticsSnapshot>(activeGrid.value.api.diagnostics.getAll())

const updateCounters = (
  runtime: RuntimeMode,
  snapshot: { revision?: number; rowCount: number },
): void => {
  const revision = snapshot.revision ?? 0
  if (runtime === "worker-owned") {
    workerRevision.value = revision
    workerRowCount.value = snapshot.rowCount
    return
  }
  mainRevision.value = revision
  mainRowCount.value = snapshot.rowCount
}

const pushEventLog = (
  runtime: RuntimeMode,
  event: DataGridApiEventName<WorkerOwnedDemoRow>,
  payload: DataGridApiEventPayload<WorkerOwnedDemoRow>,
): void => {
  eventSequence += 1
  const revision = resolveEventRevision(payload)
  eventLog.value = [
    {
      id: eventSequence,
      runtime,
      event,
      revision,
    },
    ...eventLog.value,
  ].slice(0, 24)
}

const unsubscribeMainEvents = [
  mainGrid.api.events.on("rows:changed", payload => {
    updateCounters("main-thread", payload.snapshot)
    if (runtimeMode.value === "main-thread") {
      diagnosticsSnapshot.value = mainGrid.api.diagnostics.getAll()
    }
    pushEventLog("main-thread", "rows:changed", payload)
  }),
  mainGrid.api.events.on("projection:recomputed", payload => {
    updateCounters("main-thread", payload.snapshot)
    if (runtimeMode.value === "main-thread") {
      diagnosticsSnapshot.value = mainGrid.api.diagnostics.getAll()
    }
    pushEventLog("main-thread", "projection:recomputed", payload)
  }),
  mainGrid.api.events.on("viewport:changed", payload => {
    pushEventLog("main-thread", "viewport:changed", payload)
  }),
  mainGrid.api.events.on("state:imported", payload => {
    pushEventLog("main-thread", "state:imported", payload)
  }),
]

const unsubscribeWorkerEvents = [
  workerGrid.api.events.on("rows:changed", payload => {
    updateCounters("worker-owned", payload.snapshot)
    if (runtimeMode.value === "worker-owned") {
      diagnosticsSnapshot.value = workerGrid.api.diagnostics.getAll()
    }
    pushEventLog("worker-owned", "rows:changed", payload)
  }),
  workerGrid.api.events.on("projection:recomputed", payload => {
    updateCounters("worker-owned", payload.snapshot)
    if (runtimeMode.value === "worker-owned") {
      diagnosticsSnapshot.value = workerGrid.api.diagnostics.getAll()
    }
    pushEventLog("worker-owned", "projection:recomputed", payload)
  }),
  workerGrid.api.events.on("viewport:changed", payload => {
    pushEventLog("worker-owned", "viewport:changed", payload)
  }),
  workerGrid.api.events.on("state:imported", payload => {
    pushEventLog("worker-owned", "state:imported", payload)
  }),
]

updateCounters("main-thread", mainGrid.api.rows.getSnapshot())
updateCounters("worker-owned", workerGrid.api.rows.getSnapshot())

const activeGridStage = computed(() =>
  activeGrid.value as unknown as UseAffinoDataGridResult<RowLike>,
)

const activeVisibleRows = computed(() =>
  runtimeMode.value === "worker-owned"
    ? workerRowCount.value
    : mainRowCount.value,
)
const activeComputeSupported = computed(() => activeGrid.value.api.compute.hasSupport())
const activeComputeMode = computed(() =>
  runtimeMode.value === "worker-owned"
    ? workerComputeMode.value
    : mainComputeMode.value,
)
const activeProjectionStage = computed(() =>
  diagnosticsSnapshot.value.rowModel.projection
    ? `v${diagnosticsSnapshot.value.rowModel.projection.version}`
    : "none",
)
const activeStaleStages = computed(() =>
  diagnosticsSnapshot.value.rowModel.projection?.staleStages.join(", ") || "none",
)
const activeDerivedCacheSummary = computed(() => {
  const diagnostics = diagnosticsSnapshot.value.derivedCache
  if (!diagnostics) {
    return "n/a"
  }
  const totalLookups = diagnostics.filterPredicateHits
    + diagnostics.filterPredicateMisses
    + diagnostics.sortValueHits
    + diagnostics.sortValueMisses
    + diagnostics.groupValueHits
    + diagnostics.groupValueMisses
  return `${totalLookups} lookups`
})
const activeLifecycleState = computed(() => {
  void diagnosticsSnapshot.value
  return activeGrid.value.api.lifecycle.state
})
const activeLifecycleBusy = computed(() => {
  void diagnosticsSnapshot.value
  return activeGrid.value.api.lifecycle.isBusy()
})

watch(rowCount, nextCount => {
  generation.value += 1
  rows.value = createWorkerOwnedDemoRows(nextCount, generation.value)
  benchmarkStatus.value = `Dataset rebuilt (${rows.value.length} rows)`
  mainMetric.value = null
  workerMetric.value = null
})

watch(runtimeMode, mode => {
  diagnosticsSnapshot.value = (mode === "worker-owned" ? workerGrid : mainGrid).api.diagnostics.getAll()
})

const formatMs = (value: number | null): string => {
  if (value == null || !Number.isFinite(value)) {
    return "—"
  }
  return `${value.toFixed(2)}ms`
}

const quantile = (values: readonly number[], q: number): number => {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((left, right) => left - right)
  const position = Math.max(0, Math.min(1, q)) * (sorted.length - 1)
  const base = Math.floor(position)
  const rest = position - base
  const current = sorted[base] ?? 0
  const next = sorted[base + 1] ?? current
  return current + (next - current) * rest
}

const waitForRevisionIncrement = async (
  grid: UseAffinoDataGridResult<WorkerOwnedDemoRow>,
  baselineRevision: number,
  startedAt: number,
): Promise<{ appliedMs: number; revision: number }> => {
  const immediateRevision = grid.api.rows.getSnapshot().revision ?? 0
  if (immediateRevision > baselineRevision) {
    return {
      appliedMs: performance.now() - startedAt,
      revision: immediateRevision,
    }
  }

  return await new Promise<{ appliedMs: number; revision: number }>(resolve => {
    const timeout = setTimeout(() => {
      unsubscribe()
      resolve({
        appliedMs: performance.now() - startedAt,
        revision: grid.api.rows.getSnapshot().revision ?? baselineRevision,
      })
    }, 5000)

    const unsubscribe = grid.api.events.on("rows:changed", payload => {
      const revision = payload.snapshot.revision ?? 0
      if (revision <= baselineRevision) {
        return
      }
      clearTimeout(timeout)
      unsubscribe()
      resolve({
        appliedMs: performance.now() - startedAt,
        revision,
      })
    })
  })
}

const waitForIdleTick = async (frames = 2): Promise<void> => {
  for (let frame = 0; frame < frames; frame += 1) {
    await new Promise<void>(resolveFrame => requestAnimationFrame(() => resolveFrame()))
  }
}

const rebuildDataset = async (nextCount: number): Promise<void> => {
  const normalizedCount = Math.max(2_000, Math.round(nextCount))
  rowCount.value = normalizedCount
  generation.value += 1
  const nextRows = createWorkerOwnedDemoRows(normalizedCount, generation.value)
  rows.value = nextRows
  mainGrid.api.rows.setData(nextRows)
  workerGrid.api.rows.setData(nextRows)
  await nextTick()
  await waitForIdleTick(3)
}

const applyMutationAndWait = async (
  grid: UseAffinoDataGridResult<WorkerOwnedDemoRow>,
  mutate: () => void,
): Promise<number> => {
  const baselineRevision = grid.api.rows.getSnapshot().revision ?? 0
  const startedAt = performance.now()
  mutate()
  const applied = await waitForRevisionIncrement(grid, baselineRevision, startedAt)
  return applied.appliedMs
}

const runMainThreadPressure = (
  grid: UseAffinoDataGridResult<WorkerOwnedDemoRow>,
  viewportSampleSize: number,
  formatterPasses: number,
  deepClonePasses: number,
): number => {
  if (viewportSampleSize <= 0) {
    return 0
  }
  const visible = grid.api.rows.getRange({
    start: 0,
    end: Math.max(0, viewportSampleSize - 1),
  })
  let checksum = 0
  for (let pass = 0; pass < formatterPasses; pass += 1) {
    for (const node of visible) {
      const row = node.row as WorkerOwnedDemoRow
      const ratio = row.orders > 0 ? row.revenue / row.orders : row.revenue
      const label = `${row.region}-${row.team}-${row.owner}-${row.year}-${row.quarter}`.toUpperCase()
      checksum += Number((ratio * (pass + 1)).toFixed(4))
      checksum += label.length
    }
  }
  for (let pass = 0; pass < deepClonePasses; pass += 1) {
    const payload = visible.map(node => ({ ...(node.row as WorkerOwnedDemoRow) }))
    let cloned
    try {
      cloned = typeof structuredClone === "function"
        ? structuredClone(payload)
        : JSON.parse(JSON.stringify(payload))
    } catch {
      cloned = JSON.parse(JSON.stringify(payload))
    }
    checksum += Array.isArray(cloned) ? cloned.length : 0
  }
  return checksum
}

const createStressUpdates = (
  runSeed: number,
  limit: number,
): DataGridClientRowPatch<WorkerOwnedDemoRow>[] => {
  const updates: DataGridClientRowPatch<WorkerOwnedDemoRow>[] = []
  const total = rows.value.length
  if (total === 0) {
    return updates
  }
  for (let index = 0; index < limit; index += 1) {
    const row = rows.value[(index * 67 + runSeed * 17) % total]
    if (!row) {
      continue
    }
    updates.push({
      rowId: row.rowId,
      data: {
        revenue: row.revenue + ((runSeed * 31 + index * 7) % 503),
        orders: row.orders + ((runSeed + index * 3) % 11),
        latencyMs: row.latencyMs + ((runSeed * 5 + index) % 17),
      },
    })
  }
  return updates
}

const runPressureScenario = async (
  input: WorkerPressureScenarioInput = {},
): Promise<WorkerPressureScenarioReport> => {
  if (runningBenchmark.value) {
    throw new Error("Benchmark is already running")
  }
  runningBenchmark.value = true
  try {
    const mode = input.mode ?? runtimeMode.value
    const targetRows = Math.max(2_000, Math.round(input.rowCount ?? 100_000))
    const patchIterations = Math.max(1, Math.round(input.patchIterations ?? 36))
    const targetPatchSize = Math.max(1, Math.round(input.patchSize ?? 4_000))
    const formatterPasses = Math.max(0, Math.round(input.formatterPasses ?? 4))
    const deepClonePasses = Math.max(0, Math.round(input.deepClonePasses ?? 3))
    const viewportSampleSize = Math.max(1, Math.round(input.viewportSampleSize ?? 220))

    benchmarkStatus.value = `Pressure scenario (${mode}) running…`
    runtimeMode.value = mode
    await rebuildDataset(targetRows)

    const grid = mode === "worker-owned" ? workerGrid : mainGrid
    benchmarkRun.value += 1
    pressureRun.value += 1
    const pressureId = pressureRun.value
    const sortDirection = pressureId % 2 === 0 ? "asc" : "desc"
    const filterTokens = pressureId % 2 === 0
      ? ["string:AMER", "string:EMEA"]
      : ["string:EMEA", "string:APAC"]
    const groupFields = pressureId % 2 === 0
      ? ["region", "owner", "team"]
      : ["region", "team", "owner"]
    const expandedByDefault = pressureId % 2 !== 0

    const pressureResult = await grid.api.lifecycle.runExclusive(async () => {
      const startedAt = performance.now()
      const sortApplyMs = await applyMutationAndWait(grid, () => {
        grid.api.rows.setSortModel([
          { key: "revenue", direction: sortDirection },
          { key: "latencyMs", direction: "asc" },
          { key: "orders", direction: "desc" },
        ])
      })
      const groupApplyMs = await applyMutationAndWait(grid, () => {
        grid.api.rows.setGroupBy({
          fields: groupFields,
          expandedByDefault,
        })
      })
      const aggregationApplyMs = await applyMutationAndWait(grid, () => {
        grid.api.rows.setAggregationModel({
          basis: pressureId % 2 === 0 ? "source" : "filtered",
          columns: [
            { key: "revenue", op: "sum" },
            { key: "orders", op: "count" },
            { key: "latencyMs", op: "avg" },
          ],
        })
      })
      const filterApplyMs = await applyMutationAndWait(grid, () => {
        grid.api.rows.setFilterModel({
          columnFilters: {
            region: {
              kind: "valueSet",
              tokens: filterTokens,
            },
          },
          advancedFilters: {},
          advancedExpression: null,
        })
      })
      await applyMutationAndWait(grid, () => {
        grid.api.rows.expandAllGroups()
      })

      const patchDispatchDurations: number[] = []
      const patchAppliedDurations: number[] = []
      let pressureChecksum = 0

      for (let iteration = 0; iteration < patchIterations; iteration += 1) {
        const updates = createStressUpdates(iteration + 1, Math.min(targetPatchSize, rows.value.length))
        const baselineRevision = grid.api.rows.getSnapshot().revision ?? 0
        const patchStartedAt = performance.now()
        grid.api.rows.patch(updates, {
          recomputeSort: true,
          recomputeFilter: true,
          recomputeGroup: true,
          emit: true,
        })
        patchDispatchDurations.push(performance.now() - patchStartedAt)
        const applied = await waitForRevisionIncrement(grid, baselineRevision, patchStartedAt)
        patchAppliedDurations.push(applied.appliedMs)
        pressureChecksum += runMainThreadPressure(grid, viewportSampleSize, formatterPasses, deepClonePasses)
      }

      return {
        totalElapsedMs: performance.now() - startedAt,
        sortApplyMs,
        groupApplyMs,
        aggregationApplyMs,
        filterApplyMs,
        patchDispatchP95Ms: quantile(patchDispatchDurations, 0.95),
        patchAppliedP95Ms: quantile(patchAppliedDurations, 0.95),
        patchAppliedP99Ms: quantile(patchAppliedDurations, 0.99),
        pressureChecksum: Number(pressureChecksum.toFixed(3)),
      }
    })

    const report: WorkerPressureScenarioReport = {
      mode,
      rowCount: targetRows,
      patchIterations,
      patchSize: targetPatchSize,
      ...pressureResult,
    }
    benchmarkStatus.value =
      `Pressure complete (${mode}): total ${report.totalElapsedMs.toFixed(1)}ms, patch p95 ${report.patchAppliedP95Ms.toFixed(1)}ms`
    lastPressureReport.value = report
    return report
  } finally {
    runningBenchmark.value = false
  }
}

const buildPatchUpdates = (): DataGridClientRowPatch<WorkerOwnedDemoRow>[] => {
  benchmarkRun.value += 1
  const seed = benchmarkRun.value
  const limit = Math.max(1, Math.min(patchSize.value, rows.value.length))
  const updates: DataGridClientRowPatch<WorkerOwnedDemoRow>[] = []
  for (let index = 0; index < limit; index += 1) {
    const row = rows.value[index]
    if (!row) {
      continue
    }
    updates.push({
      rowId: row.rowId,
      data: {
        revenue: row.revenue + (seed * 17) + (index % 7),
        latencyMs: row.latencyMs + (seed % 9) + (index % 5),
      },
    })
  }
  return updates
}

const runPatchBenchmark = async (
  grid: UseAffinoDataGridResult<WorkerOwnedDemoRow>,
  updates: readonly DataGridClientRowPatch<WorkerOwnedDemoRow>[],
): Promise<BenchmarkMetric> => {
  return await grid.api.lifecycle.runExclusive(async () => {
    const baseline = grid.api.rows.getSnapshot().revision ?? 0
    const startedAt = performance.now()
    grid.api.rows.patch(updates, {
      recomputeSort: false,
      recomputeFilter: false,
      recomputeGroup: false,
      emit: true,
    })
    const dispatchMs = performance.now() - startedAt
    const applied = await waitForRevisionIncrement(grid, baseline, startedAt)
    return {
      dispatchMs,
      appliedMs: applied.appliedMs,
      revision: applied.revision,
    }
  })
}

const switchComputeMode = (mode: DataGridClientComputeMode): void => {
  const grid = activeGrid.value
  if (!grid.api.compute.hasSupport()) {
    benchmarkStatus.value = "Compute mode unsupported for active runtime"
    return
  }
  const changed = grid.api.compute.switchMode(mode)
  const nextMode = grid.api.compute.getMode()
  if (runtimeMode.value === "worker-owned") {
    workerComputeMode.value = nextMode
  } else {
    mainComputeMode.value = nextMode
  }
  diagnosticsSnapshot.value = grid.api.diagnostics.getAll()
  benchmarkStatus.value = changed
    ? `Compute mode switched to ${nextMode ?? mode}`
    : `Compute mode already ${nextMode ?? mode}`
}

const handleComputeModeChange = (event: Event): void => {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) {
    return
  }
  const mode = target.value === "worker" ? "worker" : "sync"
  switchComputeMode(mode)
}

const saveRuntimeState = (): void => {
  const grid = activeGrid.value
  const snapshot = grid.api.state.get()
  if (runtimeMode.value === "worker-owned") {
    workerStateSnapshot.value = snapshot
  } else {
    mainStateSnapshot.value = snapshot
  }
  benchmarkStatus.value = `State saved (${runtimeMode.value})`
}

const restoreRuntimeState = (): void => {
  const grid = activeGrid.value
  const snapshot = runtimeMode.value === "worker-owned"
    ? workerStateSnapshot.value
    : mainStateSnapshot.value
  if (!snapshot) {
    benchmarkStatus.value = `No saved state for ${runtimeMode.value}`
    return
  }
  grid.api.state.set(snapshot, {
    applyColumns: true,
    applySelection: true,
    applyViewport: true,
  })
  diagnosticsSnapshot.value = grid.api.diagnostics.getAll()
  benchmarkStatus.value = `State restored (${runtimeMode.value})`
}

const runABBenchmark = async (): Promise<void> => {
  if (runningBenchmark.value) {
    return
  }
  runningBenchmark.value = true
  benchmarkStatus.value = "Running A/B patch benchmark…"
  try {
    const updates = buildPatchUpdates()
    const main = await runPatchBenchmark(mainGrid, updates)
    const workerOwned = workerSupported
      ? await runPatchBenchmark(workerGrid, updates)
      : null
    mainMetric.value = main
    workerMetric.value = workerOwned
    benchmarkStatus.value = `A/B run complete (${updates.length} row patches)`
  } catch (error) {
    benchmarkStatus.value = error instanceof Error ? error.message : "Benchmark failed"
  } finally {
    runningBenchmark.value = false
  }
}

const runPressureFromUi = async (): Promise<void> => {
  try {
    await runPressureScenario({
      mode: runtimeMode.value,
      rowCount: rowCount.value,
      patchSize: patchSize.value,
      patchIterations: 20,
      formatterPasses: 3,
      deepClonePasses: 2,
      viewportSampleSize: 200,
    })
  } catch (error) {
    benchmarkStatus.value = error instanceof Error ? error.message : "Pressure scenario failed"
  }
}

const resetDataset = (): void => {
  generation.value += 1
  const nextRows = createWorkerOwnedDemoRows(rowCount.value, generation.value)
  rows.value = nextRows
  mainGrid.api.rows.setData(nextRows)
  workerGrid.api.rows.setData(nextRows)
  benchmarkStatus.value = "Dataset reset"
  mainMetric.value = null
  workerMetric.value = null
  lastPressureReport.value = null
}

onBeforeUnmount(() => {
  for (const unsubscribe of unsubscribeMainEvents) {
    unsubscribe()
  }
  for (const unsubscribe of unsubscribeWorkerEvents) {
    unsubscribe()
  }
  if (typeof window !== "undefined" && window.__affinoWorkerBench) {
    delete window.__affinoWorkerBench
  }
  worker?.terminate()
})

if (typeof window !== "undefined") {
  window.__affinoWorkerBench = {
    runPressureScenario,
    setRuntimeMode: (mode: RuntimeMode) => {
      runtimeMode.value = mode
    },
    getRuntimeMode: () => runtimeMode.value,
  }
}
</script>

<template>
  <section class="datagrid-worker-page">
    <header class="datagrid-worker-page__header">
      <div>
        <p class="datagrid-worker-page__eyebrow">DataGrid Demo · Worker-owned row model</p>
        <h1>Main-thread vs Worker-owned runtime</h1>
        <p>
          This route runs the same dataset through two runtimes: regular main-thread row model
          and worker-owned row model. Toggle the active runtime and run the built-in A/B patch test.
        </p>
      </div>
      <div class="datagrid-worker-page__links">
        <RouterLink to="/datagrid">Main DataGrid</RouterLink>
        <RouterLink to="/datagrid/sugar">DataGrid Sugar</RouterLink>
        <RouterLink to="/datagrid/pivot">Pivot route</RouterLink>
      </div>
    </header>

    <section class="datagrid-worker-page__workspace">
      <aside class="datagrid-worker-page__sidebar">
        <section class="datagrid-worker-page__controls">
          <label>
            <span>Rows in source dataset</span>
            <select data-bench-row-count v-model.number="rowCount">
              <option :value="2000">2,000</option>
              <option :value="12000">12,000</option>
              <option :value="32000">32,000</option>
              <option :value="100000">100,000</option>
              <option :value="200000">200,000</option>
            </select>
          </label>

          <label>
            <span>Active runtime</span>
            <select data-bench-runtime-mode v-model="runtimeMode">
              <option value="main-thread">main-thread</option>
              <option value="worker-owned" :disabled="!workerSupported">worker-owned</option>
            </select>
          </label>

          <label>
            <span>Patch size (rows)</span>
            <select data-bench-patch-size v-model.number="patchSize">
              <option :value="300">300</option>
              <option :value="1200">1200</option>
              <option :value="3000">3000</option>
              <option :value="4000">4000</option>
              <option :value="8000">8000</option>
            </select>
          </label>

          <label>
            <span>Compute mode (active runtime)</span>
            <select
              :disabled="!activeComputeSupported || runningBenchmark"
              :value="activeComputeMode ?? 'sync'"
              @change="handleComputeModeChange"
            >
              <option value="sync">sync</option>
              <option value="worker">worker</option>
            </select>
          </label>

          <div class="datagrid-worker-page__actions">
            <button data-bench-run-ab type="button" :disabled="runningBenchmark" @click="runABBenchmark">
              {{ runningBenchmark ? "Benchmark running…" : "Run A/B patch benchmark" }}
            </button>
            <button data-bench-run-pressure type="button" :disabled="runningBenchmark" @click="runPressureFromUi">
              {{ runningBenchmark ? "Benchmark running…" : "Run pressure scenario" }}
            </button>
            <button type="button" :disabled="runningBenchmark" @click="saveRuntimeState">Save state</button>
            <button type="button" :disabled="runningBenchmark" @click="restoreRuntimeState">Restore state</button>
            <button data-bench-reset type="button" @click="resetDataset">Reset dataset</button>
          </div>

          <dl class="datagrid-worker-page__metrics">
            <div>
              <dt>Visible rows</dt>
              <dd data-bench-visible-rows>{{ activeVisibleRows }}</dd>
            </div>
            <div>
              <dt>Main revision</dt>
              <dd>{{ mainRevision }}</dd>
            </div>
            <div>
              <dt>Worker revision</dt>
              <dd>{{ workerRevision }}</dd>
            </div>
            <div>
              <dt>Projection stage</dt>
              <dd>{{ activeProjectionStage }}</dd>
            </div>
            <div>
              <dt>Stale stages</dt>
              <dd>{{ activeStaleStages }}</dd>
            </div>
            <div class="datagrid-worker-page__metrics-status">
              <dt>Status</dt>
              <dd>{{ benchmarkStatus }}</dd>
            </div>
          </dl>
        </section>

        <div class="datagrid-worker-page__insights">

        <section class="datagrid-worker-page__benchmark">
          <h2>Last A/B benchmark</h2>
          <p class="datagrid-worker-page__benchmark-note">
            Dispatch = synchronous `patchRows(...)` call cost. Applied = time until runtime snapshot revision moves.
          </p>
          <table>
            <thead>
              <tr>
                <th>Runtime</th>
                <th>Dispatch</th>
                <th>Applied</th>
                <th>Revision</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>main-thread</td>
                <td>{{ formatMs(mainMetric?.dispatchMs ?? null) }}</td>
                <td>{{ formatMs(mainMetric?.appliedMs ?? null) }}</td>
                <td>{{ mainMetric?.revision ?? "—" }}</td>
              </tr>
              <tr>
                <td>worker-owned</td>
                <td>{{ formatMs(workerMetric?.dispatchMs ?? null) }}</td>
                <td>{{ formatMs(workerMetric?.appliedMs ?? null) }}</td>
                <td>{{ workerMetric?.revision ?? "—" }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="datagrid-worker-page__benchmark">
          <h2>Last pressure scenario</h2>
          <table>
            <tbody>
              <tr>
                <th>Runtime</th>
                <td>{{ lastPressureReport?.mode ?? "—" }}</td>
              </tr>
              <tr>
                <th>Rows</th>
                <td>{{ lastPressureReport?.rowCount?.toLocaleString?.() ?? "—" }}</td>
              </tr>
              <tr>
                <th>Total elapsed</th>
                <td>{{ formatMs(lastPressureReport?.totalElapsedMs ?? null) }}</td>
              </tr>
              <tr>
                <th>Sort / Group / Agg / Filter</th>
                <td>
                  {{ formatMs(lastPressureReport?.sortApplyMs ?? null) }} /
                  {{ formatMs(lastPressureReport?.groupApplyMs ?? null) }} /
                  {{ formatMs(lastPressureReport?.aggregationApplyMs ?? null) }} /
                  {{ formatMs(lastPressureReport?.filterApplyMs ?? null) }}
                </td>
              </tr>
              <tr>
                <th>Patch p95 / p99</th>
                <td>
                  {{ formatMs(lastPressureReport?.patchAppliedP95Ms ?? null) }} /
                  {{ formatMs(lastPressureReport?.patchAppliedP99Ms ?? null) }}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="datagrid-worker-page__benchmark">
          <h2>Diagnostics (active runtime)</h2>
          <table>
            <tbody>
              <tr>
                <th>Row model</th>
                <td>{{ diagnosticsSnapshot.rowModel.kind }}</td>
              </tr>
              <tr>
                <th>Revision / Rows</th>
                <td>{{ diagnosticsSnapshot.rowModel.revision ?? "—" }} / {{ diagnosticsSnapshot.rowModel.rowCount }}</td>
              </tr>
              <tr>
                <th>Loading / Warming</th>
                <td>{{ diagnosticsSnapshot.rowModel.loading ? "yes" : "no" }} / {{ diagnosticsSnapshot.rowModel.warming ? "yes" : "no" }}</td>
              </tr>
              <tr>
                <th>Compute</th>
                <td>
                  {{
                    diagnosticsSnapshot.compute
                      ? `${diagnosticsSnapshot.compute.effectiveMode} (${diagnosticsSnapshot.compute.transportKind})`
                      : "unsupported"
                  }}
                </td>
              </tr>
              <tr>
                <th>Lifecycle state / busy</th>
                <td>{{ activeLifecycleState }} / {{ activeLifecycleBusy ? "yes" : "no" }}</td>
              </tr>
              <tr>
                <th>Derived cache</th>
                <td>{{ activeDerivedCacheSummary }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="datagrid-worker-page__benchmark">
          <h2>Event stream</h2>
          <table>
            <thead>
              <tr>
                <th>Runtime</th>
                <th>Event</th>
                <th>Revision</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="eventLog.length === 0">
                <td colspan="3">No events yet</td>
              </tr>
              <tr v-for="entry in eventLog.slice(0, 10)" :key="entry.id">
                <td>{{ entry.runtime }}</td>
                <td>{{ entry.event }}</td>
                <td>{{ entry.revision ?? "—" }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        </div>
      </aside>

      <div class="datagrid-worker-page__stage">
        <DataGridSugarStage :grid="activeGridStage" :showPagination="false" />
      </div>
    </section>
  </section>
</template>

<style scoped>
.datagrid-worker-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
}

.datagrid-worker-page__workspace {
  display: grid;
  grid-template-columns: minmax(19rem, 25rem) minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
}

.datagrid-worker-page__sidebar {
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
}

.datagrid-worker-page__insights {
  display: grid;
  gap: 0.75rem;
  min-height: 0;
  overflow-y: auto;
}

.datagrid-worker-page__header h1 {
  margin: 0.2rem 0 0.35rem;
}

.datagrid-worker-page__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-worker-page__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-worker-page__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.65rem;
}

.datagrid-worker-page__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.65rem;
  display: grid;
  gap: 0.55rem;
  min-height: 0;
  overflow-y: auto;
}

.datagrid-worker-page__controls label {
  display: grid;
  gap: 0.22rem;
  font-size: 0.74rem;
  color: var(--text-soft);
}

.datagrid-worker-page__controls select {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.48rem;
  font-size: 0.8rem;
}

.datagrid-worker-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
}

.datagrid-worker-page__actions button {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.52rem;
  cursor: pointer;
}

.datagrid-worker-page__actions button:disabled {
  opacity: 0.66;
  cursor: progress;
}

.datagrid-worker-page__metrics {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
}

.datagrid-worker-page__metrics div {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  padding: 0.38rem 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
}

.datagrid-worker-page__metrics dt {
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-worker-page__metrics dd {
  margin: 0.14rem 0 0;
  font-size: 0.82rem;
  color: var(--text-primary);
}

.datagrid-worker-page__metrics-status {
  grid-column: 1 / -1;
}

.datagrid-worker-page__benchmark {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.6rem 0.7rem;
}

.datagrid-worker-page__benchmark h2 {
  margin: 0 0 0.45rem;
  font-size: 0.9rem;
}

.datagrid-worker-page__benchmark-note {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  color: var(--text-soft);
}

.datagrid-worker-page__benchmark table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.77rem;
}

.datagrid-worker-page__benchmark th,
.datagrid-worker-page__benchmark td {
  border-top: 1px solid var(--glass-border);
  padding: 0.32rem 0.24rem;
  text-align: left;
}

.datagrid-worker-page__benchmark thead th {
  border-top: 0;
  color: var(--text-muted);
  font-weight: 600;
}

.datagrid-worker-page__stage {
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

@media (max-width: 1200px) {
  .datagrid-worker-page__workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
