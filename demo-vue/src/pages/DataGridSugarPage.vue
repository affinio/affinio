<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type {
  DataGridAdvancedFilterExpression,
  DataGridColumnDef,
  DataGridColumnPin,
} from "@affino/datagrid-core"
import {
  useAffinoDataGrid,
  type AffinoDataGridEditSession,
  type AffinoDataGridFeatures,
} from "@affino/datagrid-vue"
import DataGridSugarStage from "../components/DataGridSugarStage.vue"

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

const GROUP_BY_OPTIONS = ["none", "region", "owner", "team", "severity", "status"] as const
const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"] as const

const columns = ref<readonly DataGridColumnDef[]>([
  { key: "select", label: "", width: 54, pin: "left" },
  { key: "service", label: "Service", width: 230, pin: "left" },
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
  Array.from({ length: 520 }, (_, index) => {
    const severity = SEVERITY_OPTIONS[index % SEVERITY_OPTIONS.length] ?? "medium"
    const regions: SugarGridRow["region"][] = ["us-east", "us-west", "eu-central", "ap-south"]
    const envs: SugarGridRow["environment"][] = ["prod", "stage", "dev"]
    const owners = ["NOC", "SRE", "Platform", "Payments", "Core", "Infra"]
    const teams: SugarGridRow["team"][] = ["platform", "payments", "core", "growth", "infra"]
    const statusCycle: SugarGridRow["status"][] = ["healthy", "degraded", "incident"]
    const channels: SugarGridRow["channel"][] = ["#noc", "#platform-alerts", "#payments-oncall", "#incident-bridge"]
    const runbooks: SugarGridRow["runbook"][] = ["RB-101", "RB-204", "RB-305", "RB-410", "RB-512"]

    return {
      rowId: `row-${index + 1}`,
      service: `service-${(index % 37) + 1}`,
      owner: owners[index % owners.length] ?? "NOC",
      team: teams[index % teams.length] ?? "platform",
      region: regions[index % regions.length] ?? "us-east",
      environment: envs[index % envs.length] ?? "prod",
      deployment: `release-2026.${(index % 12) + 1}.${(index % 9) + 1}`,
      severity,
      status: statusCycle[(index + 1) % statusCycle.length] ?? "healthy",
      latencyMs: 40 + ((index * 7) % 260),
      errorRatePct: Number((((index * 1.8) % 18) + (severity === "critical" ? 7 : 0)).toFixed(2)),
      availabilityPct: Number((99.99 - ((index * 13) % 160) / 100).toFixed(2)),
      cpuPct: 18 + ((index * 17) % 78),
      memoryPct: 24 + ((index * 19) % 69),
      throughputRps: 60 + ((index * 37) % 1900),
      mttrMin: 7 + ((index * 5) % 91),
      sloBurnRate: Number((0.3 + ((index * 3) % 34) / 10).toFixed(2)),
      incidents24h: (index * 3) % 24,
      queueDepth: (index * 29) % 520,
      channel: channels[index % channels.length] ?? "#noc",
      runbook: runbooks[index % runbooks.length] ?? "RB-101",
      updatedAt: `2026-02-${String((index % 28) + 1).padStart(2, "0")} ${String((index * 7) % 24).padStart(2, "0")}:${String((index * 11) % 60).padStart(2, "0")}`,
    }
  }),
)

const resolveRowKey = (row: SugarGridRow): string => row.rowId

function castDraftValue(previous: unknown, draft: string): unknown {
  if (typeof previous === "number") {
    const parsed = Number(draft)
    return Number.isFinite(parsed) ? parsed : previous
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
  const nextRows = rows.value.slice()
  nextRows[rowIndex] = {
    ...current,
    [session.columnKey]: castDraftValue(
      (current as unknown as Record<string, unknown>)[session.columnKey],
      session.draft,
    ),
  } as SugarGridRow
  rows.value = nextRows
}

const features: AffinoDataGridFeatures<SugarGridRow> = {
  selection: {
    enabled: true,
    resolveRowKey,
  },
  clipboard: {
    enabled: true,
    useSystemClipboard: false,
  },
  editing: {
    enabled: true,
    mode: "cell",
    enum: true,
    enumEditor: {
      enabled: true,
      primitive: "affino-listbox",
      resolveOptions({ columnKey }) {
        if (columnKey === "severity") {
          return SEVERITY_OPTIONS.map(value => ({ label: value.toUpperCase(), value }))
        }
        if (columnKey === "status") {
          return ["healthy", "degraded", "incident"].map(value => ({ label: value, value }))
        }
        if (columnKey === "environment") {
          return ["prod", "stage", "dev"].map(value => ({ label: value, value }))
        }
        if (columnKey === "region") {
          return ["us-east", "us-west", "eu-central", "ap-south"].map(value => ({ label: value, value }))
        }
        return []
      },
    },
    onCommit: onCommitEdit,
  },
  filtering: { enabled: true },
  summary: {
    enabled: true,
    columns: [
      { key: "latencyMs", aggregations: ["count", "sum", "avg", "min", "max"] },
      { key: "errorRatePct", aggregations: ["count", "sum", "avg", "min", "max"] },
    ],
  },
  visibility: { enabled: true },
  tree: { enabled: true },
  rowHeight: {
    enabled: true,
    mode: "fixed",
    base: 36,
  },
  interactions: {
    enabled: true,
    range: {
      enabled: true,
      fill: true,
      move: true,
    },
  },
  headerFilters: {
    enabled: true,
    maxUniqueValues: 280,
  },
  feedback: {
    enabled: true,
    maxEvents: 120,
  },
  statusBar: {
    enabled: true,
  },
  keyboardNavigation: true,
}

const grid = useAffinoDataGrid<SugarGridRow>({
  rows,
  columns,
  features,
  initialSortState: [{ key: "latencyMs", direction: "desc" }],
})

const quickQuery = ref("")
const quickSeverity = ref<readonly string[]>([])
const groupBy = ref<(typeof GROUP_BY_OPTIONS)[number]>("none")
const pageSize = ref(50)
const rowHeightMode = ref<"fixed" | "auto">("fixed")
const rowHeightBase = ref(36)
const layoutName = ref("Incident triage")
const selectedLayoutId = ref("")

watch(pageSize, next => {
  grid.pagination.setPageSize(next)
}, { immediate: true })

watch(groupBy, next => {
  if (next === "none") {
    grid.features.tree.clearGroupBy()
    return
  }
  grid.features.tree.setGroupBy({ fields: [next], expandedByDefault: true })
})

watch(rowHeightMode, next => {
  grid.features.rowHeight.setMode(next)
  if (next === "auto") {
    grid.features.rowHeight.measureVisible()
    grid.features.rowHeight.apply()
  }
})

watch(rowHeightBase, next => {
  grid.features.rowHeight.setBase(Math.max(24, Math.min(80, Math.round(next))))
})

const applyQuickFilter = (): void => {
  const helpers = grid.features.filtering.helpers
  let expression: DataGridAdvancedFilterExpression | null = null

  const query = quickQuery.value.trim().toLowerCase()
  if (query.length > 0) {
    expression = helpers.or(
      helpers.condition({ key: "service", type: "text", operator: "contains", value: query }),
      helpers.condition({ key: "owner", type: "text", operator: "contains", value: query }),
      helpers.condition({ key: "team", type: "text", operator: "contains", value: query }),
    )
  }

  if (quickSeverity.value.length > 0) {
    const severityExpr = helpers.condition({
      key: "severity",
      type: "set",
      operator: "in",
      value: [...quickSeverity.value],
    })
    expression = expression ? helpers.and(expression, severityExpr) : severityExpr
  }

  helpers.apply(expression, { mergeMode: "replace" })
}

const clearQuickFilter = (): void => {
  quickQuery.value = ""
  quickSeverity.value = []
  grid.features.filtering.clear()
}

const captureLayout = (): void => {
  const profile = grid.layoutProfiles?.capture(layoutName.value || "Layout")
  if (profile) {
    selectedLayoutId.value = profile.id
  }
}

const applySelectedLayout = (): void => {
  if (!selectedLayoutId.value) {
    return
  }
  grid.layoutProfiles?.apply(selectedLayoutId.value)
}

const removeSelectedLayout = (): void => {
  if (!selectedLayoutId.value) {
    return
  }
  grid.layoutProfiles?.remove(selectedLayoutId.value)
  if (!grid.layoutProfiles?.profiles.value.some(entry => entry.id === selectedLayoutId.value)) {
    selectedLayoutId.value = ""
  }
}

const statusMetrics = computed(() => grid.statusBar?.metrics.value ?? null)
const feedbackLastAction = computed(() => grid.feedback?.lastAction.value ?? "Ready")

const setColumnPin = (columnKey: string, pin: DataGridColumnPin): void => {
  grid.columnState.setPin(columnKey, pin)
}
</script>

<template>
  <section class="datagrid-sugar-page">
    <header class="datagrid-sugar-toolbar">
      <details class="datagrid-sugar-panel" open>
        <summary>Quick Severity Filter</summary>
        <div class="datagrid-sugar-panel__body">
          <label>
            <span>Quick query</span>
            <input v-model="quickQuery" type="text" placeholder="service / owner / team" />
          </label>
          <div class="datagrid-sugar-chip-list">
            <label v-for="severity in SEVERITY_OPTIONS" :key="severity" class="datagrid-sugar-chip">
              <input v-model="quickSeverity" type="checkbox" :value="severity" />
              <span>{{ severity }}</span>
            </label>
          </div>
          <div class="datagrid-sugar-panel__actions">
            <button type="button" class="is-primary" @click="applyQuickFilter">Apply</button>
            <button type="button" class="is-ghost" @click="clearQuickFilter">Clear</button>
          </div>
        </div>
      </details>

      <details class="datagrid-sugar-panel">
        <summary>Layout</summary>
        <div class="datagrid-sugar-panel__body">
          <label>
            <span>Group by</span>
            <select v-model="groupBy">
              <option v-for="option in GROUP_BY_OPTIONS" :key="option" :value="option">{{ option }}</option>
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
            <span>Row height: {{ rowHeightBase }}px</span>
            <input v-model.number="rowHeightBase" type="range" min="24" max="80" step="1" />
          </label>
          <div class="datagrid-sugar-panel__actions">
            <button type="button" class="is-ghost" @click="setColumnPin('service', 'left')">Pin service left</button>
            <button type="button" class="is-ghost" @click="setColumnPin('updatedAt', 'right')">Pin updated right</button>
            <button type="button" class="is-ghost" @click="setColumnPin('service', 'none')">Unpin service</button>
          </div>
          <label>
            <span>Layout profile</span>
            <input v-model="layoutName" type="text" placeholder="Layout name" />
          </label>
          <label>
            <span>Saved profiles</span>
            <select v-model="selectedLayoutId">
              <option value="">Select profile...</option>
              <option v-for="profile in grid.layoutProfiles?.profiles.value ?? []" :key="profile.id" :value="profile.id">
                {{ profile.name }}
              </option>
            </select>
          </label>
          <div class="datagrid-sugar-panel__actions">
            <button type="button" class="is-primary" @click="captureLayout">Save</button>
            <button type="button" class="is-ghost" @click="applySelectedLayout">Apply</button>
            <button type="button" class="is-ghost" @click="removeSelectedLayout">Remove</button>
          </div>
        </div>
      </details>

      <details class="datagrid-sugar-panel">
        <summary>Metrics</summary>
        <div class="datagrid-sugar-panel__body datagrid-sugar-metrics">
          <div>
            <dt>Total rows</dt>
            <dd>{{ statusMetrics?.rowsTotal ?? 0 }}</dd>
          </div>
          <div>
            <dt>Filtered</dt>
            <dd>{{ statusMetrics?.rowsFiltered ?? 0 }}</dd>
          </div>
          <div>
            <dt>Visible columns</dt>
            <dd>{{ statusMetrics?.columnsVisible ?? 0 }}</dd>
          </div>
          <div>
            <dt>Selected cells</dt>
            <dd>{{ statusMetrics?.selectedCells ?? 0 }}</dd>
          </div>
          <div>
            <dt>Latency avg</dt>
            <dd>{{ statusMetrics?.getAggregate('latencyMs', 'avg') ?? '—' }}</dd>
          </div>
          <div>
            <dt>Error max</dt>
            <dd>{{ statusMetrics?.getAggregate('errorRatePct', 'max') ?? '—' }}</dd>
          </div>
          <div class="datagrid-sugar-metrics__status">
            <dt>Last action</dt>
            <dd>{{ feedbackLastAction }}</dd>
          </div>
        </div>
      </details>
    </header>

    <DataGridSugarStage :grid="grid" />
  </section>
</template>

<style scoped>
.datagrid-sugar-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.datagrid-sugar-toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 0.55rem;
  min-width: 0;
}

.datagrid-sugar-panel {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.28));
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--datagrid-controls-bg, rgba(11, 18, 32, 0.82)) 92%, transparent);
  min-width: 0;
}

.datagrid-sugar-panel > summary {
  list-style: none;
  cursor: pointer;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--datagrid-text-soft, #94a3b8);
  padding: 0.48rem 0.62rem;
  border-bottom: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.24)) 70%, transparent);
}

.datagrid-sugar-panel > summary::-webkit-details-marker {
  display: none;
}

.datagrid-sugar-panel__body {
  display: grid;
  gap: 0.42rem;
  padding: 0.5rem 0.62rem;
}

.datagrid-sugar-panel__body label {
  display: grid;
  gap: 0.2rem;
  font-size: 0.72rem;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-panel__body input,
.datagrid-sugar-panel__body select {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.28rem 0.38rem;
  font-size: 0.76rem;
}

.datagrid-sugar-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.datagrid-sugar-panel__actions button {
  border: 1px solid var(--datagrid-glass-border, rgba(148, 163, 184, 0.3));
  border-radius: 0.38rem;
  background: color-mix(in srgb, var(--datagrid-controls-input-bg, rgba(15, 23, 42, 0.45)) 88%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
  padding: 0.24rem 0.42rem;
  font-size: 0.72rem;
}

.datagrid-sugar-panel__actions button.is-primary {
  border-color: color-mix(in srgb, rgba(56, 189, 248, 0.55) 84%, transparent);
  background: color-mix(in srgb, rgba(56, 189, 248, 0.2) 82%, transparent);
  color: #dff6ff;
}

.datagrid-sugar-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.datagrid-sugar-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  padding: 0.18rem 0.34rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.28)) 85%, transparent);
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-metrics {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.datagrid-sugar-metrics > div {
  border: 1px solid color-mix(in srgb, var(--datagrid-glass-border, rgba(148, 163, 184, 0.26)) 70%, transparent);
  border-radius: 0.42rem;
  padding: 0.3rem 0.42rem;
}

.datagrid-sugar-metrics dt {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--datagrid-text-soft, #94a3b8);
}

.datagrid-sugar-metrics dd {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: var(--datagrid-text-primary, #e2e8f0);
}

.datagrid-sugar-metrics__status {
  grid-column: 1 / -1;
}

@media (max-width: 1280px) {
  .datagrid-sugar-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .datagrid-sugar-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
