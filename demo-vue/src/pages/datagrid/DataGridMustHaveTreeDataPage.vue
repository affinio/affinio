<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import { RouterLink } from "vue-router"
import type { DataGridColumnDef } from "@affino/datagrid-core"
import { createClientRowModel } from "@affino/datagrid-core"
import {
  useAffinoDataGrid,
  type AffinoDataGridEditSession,
  type UseAffinoDataGridResult,
} from "@affino/datagrid-vue"
import DataGridSugarStage from "../../components/DataGridSugarStage.vue"

interface TreeDataRow {
  rowId: string
  path: readonly string[]
  service: string
  owner: string
  region: string
  environment: "prod" | "stage"
  severity: "critical" | "high" | "medium" | "low"
  latencyMs: number
  errorRatePct: number
}

type RowLike = {
  rowId?: string | number
}

const columns: readonly DataGridColumnDef[] = [
  { key: "service", label: "Service", width: 220, pin: "left" },
  { key: "owner", label: "Owner", width: 170 },
  { key: "region", label: "Region", width: 140 },
  { key: "environment", label: "Env", width: 110 },
  { key: "severity", label: "Severity", width: 120 },
  { key: "latencyMs", label: "Latency (ms)", width: 150 },
  { key: "errorRatePct", label: "Error rate %", width: 150 },
]

const regions = ["us-east", "us-west", "eu-central", "ap-south"] as const
const services = [
  { domain: "payments", service: "payments-api" },
  { domain: "payments", service: "billing-worker" },
  { domain: "platform", service: "edge-gateway" },
  { domain: "platform", service: "identity-service" },
  { domain: "core", service: "incident-timeline" },
  { domain: "core", service: "notification-hub" },
] as const
const owners = ["NOC", "SRE", "Platform", "Payments", "Core"] as const
const severities = ["critical", "high", "medium", "low"] as const
const environments = ["prod", "stage"] as const

const buildRows = (): TreeDataRow[] => {
  const rows: TreeDataRow[] = []
  let index = 0
  for (const region of regions) {
    for (const serviceEntry of services) {
      for (const environment of environments) {
        index += 1
        rows.push({
          rowId: `tree-row-${index}`,
          path: [region, serviceEntry.domain, serviceEntry.service, environment],
          service: serviceEntry.service,
          owner: owners[index % owners.length] ?? "NOC",
          region,
          environment,
          severity: severities[index % severities.length] ?? "medium",
          latencyMs: 48 + ((index * 11) % 260),
          errorRatePct: Number((((index * 1.7) % 12) + 0.2).toFixed(2)),
        })
      }
    }
  }
  return rows
}

const rows = ref<TreeDataRow[]>(buildRows())
const treeRowModel = createClientRowModel<TreeDataRow>({
  rows: rows.value,
  initialTreeData: {
    mode: "path",
    getDataPath(row) {
      return row.path
    },
    expandedByDefault: true,
    filterMode: "include-parents",
  },
})

const castDraftValue = (previous: unknown, draft: string): unknown => {
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
      (current as Record<string, unknown>)[session.columnKey],
      session.draft,
    ),
  } as TreeDataRow
  rows.value = nextRows
}

const grid = useAffinoDataGrid<TreeDataRow>({
  rows,
  columns,
  rowModel: treeRowModel,
  initialSortState: [{ key: "latencyMs", direction: "desc" }],
  features: {
    selection: {
      enabled: true,
      resolveRowKey: row => row.rowId,
    },
    clipboard: { enabled: true, useSystemClipboard: false },
    editing: {
      enabled: true,
      mode: "cell",
      enum: true,
      enumEditor: {
        enabled: true,
        primitive: "affino-listbox",
        resolveOptions({ columnKey }) {
          if (columnKey === "severity") {
            return severities.map(value => ({ label: value.toUpperCase(), value }))
          }
          if (columnKey === "environment") {
            return environments.map(value => ({ label: value, value }))
          }
          return []
        },
      },
      onCommit: onCommitEdit,
    },
    filtering: { enabled: true },
    tree: {
      enabled: true,
      groupSelectsChildren: true,
    },
    interactions: {
      enabled: true,
      range: { enabled: true, fill: true, move: true },
    },
    headerFilters: { enabled: true, maxUniqueValues: 200 },
    keyboardNavigation: true,
    feedback: { enabled: true, maxEvents: 80 },
    statusBar: { enabled: true },
  },
})

const gridStage = computed(() => grid as unknown as UseAffinoDataGridResult<RowLike>)
const quickQuery = ref("")
const status = ref("Tree mode ready")
const sortPreset = ref("latency-desc")

const rowModelRevision = ref(0)
const unsubscribeRowModel = grid.rowModel.subscribe(snapshot => {
  rowModelRevision.value = snapshot.revision ?? rowModelRevision.value + 1
})
onBeforeUnmount(() => {
  unsubscribeRowModel()
})

const visibleRows = computed(() => {
  void rowModelRevision.value
  return grid.rowModel.getRowCount()
})
const groupRows = computed(() => {
  void rowModelRevision.value
  const total = grid.api.getRowCount()
  if (total <= 0) {
    return 0
  }
  return grid.api.getRowsInRange({ start: 0, end: total - 1 }).filter(row => row.kind === "group").length
})

const sortStateText = computed(() => {
  if (grid.sortState.value.length === 0) {
    return "none"
  }
  return grid.sortState.value
    .map((entry, index) => `${index + 1}:${entry.key}:${entry.direction}`)
    .join(" | ")
})

const applyQuickFilter = (): void => {
  const query = quickQuery.value.trim().toLowerCase()
  const helpers = grid.features.filtering.helpers
  if (query.length === 0) {
    grid.features.filtering.clear()
    status.value = "Filter cleared"
    return
  }
  const expression = helpers.or(
    helpers.condition({ key: "service", type: "text", operator: "contains", value: query }),
    helpers.condition({ key: "owner", type: "text", operator: "contains", value: query }),
    helpers.condition({ key: "region", type: "text", operator: "contains", value: query }),
  )
  if (!expression) {
    grid.features.filtering.clear()
    status.value = "Filter cleared"
    return
  }
  helpers.apply(expression, { mergeMode: "replace" })
  status.value = `Filter applied: ${query}`
}

const clearQuickFilter = (): void => {
  quickQuery.value = ""
  grid.features.filtering.clear()
  status.value = "Filter cleared"
}

const applySortPreset = (value: string): void => {
  sortPreset.value = value
  if (value === "none") {
    grid.setSortState([])
    status.value = "Sort: none"
    return
  }
  if (value === "owner-asc") {
    grid.setSortState([{ key: "owner", direction: "asc" }])
    status.value = "Sort: owner asc"
    return
  }
  if (value === "latency-asc") {
    grid.setSortState([{ key: "latencyMs", direction: "asc" }])
    status.value = "Sort: latency asc"
    return
  }
  grid.setSortState([{ key: "latencyMs", direction: "desc" }])
  status.value = "Sort: latency desc"
}

const onSortSelectChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement | null
  applySortPreset(target?.value ?? "latency-desc")
}

const collapseAll = (): void => {
  const affected = grid.features.tree.collapseAll()
  status.value = `Collapsed groups: ${affected}`
}

const expandAll = (): void => {
  const affected = grid.features.tree.expandAll()
  status.value = `Expanded groups: ${affected}`
}
</script>

<template>
  <section class="datagrid-musthave-tree">
    <header class="datagrid-musthave-tree__header">
      <div>
        <p class="datagrid-musthave-tree__eyebrow">DataGrid Must-Have · Scenario 06</p>
        <h1>TreeData (Path Mode) Internal Validation</h1>
        <p>
          Core `treeData` projection (`path`) with expand/collapse, sorting, filtering, selection,
          keyboard and context-menu behavior.
        </p>
      </div>
      <div class="datagrid-musthave-tree__links">
        <RouterLink to="/datagrid/must-have/pagination">Pagination</RouterLink>
        <RouterLink to="/datagrid/must-have/filtering">Filtering</RouterLink>
        <RouterLink to="/datagrid/must-have/column-state">Column state</RouterLink>
        <RouterLink to="/datagrid/must-have/reorder">Reorder</RouterLink>
        <RouterLink to="/datagrid/must-have/row-height">Row-height</RouterLink>
      </div>
    </header>

    <section class="datagrid-musthave-tree__controls">
      <label>
        <span>Quick filter</span>
        <input
          v-model="quickQuery"
          data-tree-quick-filter
          type="text"
          placeholder="service / owner / region"
          @keydown.enter.prevent="applyQuickFilter"
        />
      </label>
      <div class="datagrid-musthave-tree__actions">
        <button type="button" data-tree-apply-filter @click="applyQuickFilter">Apply filter</button>
        <button type="button" data-tree-clear-filter @click="clearQuickFilter">Clear filter</button>
      </div>

      <label>
        <span>Sort preset</span>
        <select data-tree-sort-select :value="sortPreset" @change="onSortSelectChange">
          <option value="latency-desc">Latency desc</option>
          <option value="latency-asc">Latency asc</option>
          <option value="owner-asc">Owner asc</option>
          <option value="none">None</option>
        </select>
      </label>

      <div class="datagrid-musthave-tree__actions">
        <button type="button" data-tree-collapse-all @click="collapseAll">Collapse all</button>
        <button type="button" data-tree-expand-all @click="expandAll">Expand all</button>
      </div>

      <dl class="datagrid-musthave-tree__metrics">
        <div>
          <dt>Visible rows</dt>
          <dd data-tree-visible-rows>{{ visibleRows }}</dd>
        </div>
        <div>
          <dt>Visible groups</dt>
          <dd data-tree-group-rows>{{ groupRows }}</dd>
        </div>
        <div>
          <dt>Sort state</dt>
          <dd data-tree-sort-state>{{ sortStateText }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd data-tree-status>{{ status }}</dd>
        </div>
      </dl>
    </section>

    <div class="datagrid-musthave-tree__stage">
      <DataGridSugarStage
        :grid="gridStage"
        :showPagination="false"
        tree-tabular
        tree-primary-column-key="service"
        tree-subtitle-column-key="owner"
      />
    </div>
  </section>
</template>

<style scoped>
.datagrid-musthave-tree {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 0;
  height: 100%;
}

.datagrid-musthave-tree__header h1 {
  margin: 0.2rem 0 0.35rem;
}

.datagrid-musthave-tree__header p {
  margin: 0;
  color: var(--text-soft);
}

.datagrid-musthave-tree__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-tree__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.65rem;
}

.datagrid-musthave-tree__controls {
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  background: var(--glass-bg);
  padding: 0.65rem;
  display: grid;
  grid-template-columns: minmax(260px, 2fr) auto minmax(200px, 1fr) auto 1.7fr;
  align-items: end;
  gap: 0.55rem;
}

.datagrid-musthave-tree__controls label {
  display: grid;
  gap: 0.22rem;
  font-size: 0.74rem;
  color: var(--text-soft);
}

.datagrid-musthave-tree__controls input,
.datagrid-musthave-tree__controls select {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 84%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.48rem;
  font-size: 0.8rem;
}

.datagrid-musthave-tree__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
}

.datagrid-musthave-tree__actions button {
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
  color: var(--text-primary);
  padding: 0.4rem 0.52rem;
  cursor: pointer;
}

.datagrid-musthave-tree__metrics {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
}

.datagrid-musthave-tree__metrics div {
  border: 1px solid var(--glass-border);
  border-radius: 0.55rem;
  padding: 0.38rem 0.5rem;
  background: color-mix(in srgb, var(--surface-bg, #0b1220) 82%, transparent);
}

.datagrid-musthave-tree__metrics dt {
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.datagrid-musthave-tree__metrics dd {
  margin: 0.14rem 0 0;
  font-size: 0.82rem;
  color: var(--text-primary);
}

.datagrid-musthave-tree__stage {
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

:deep(.datagrid-sugar-stage.is-tree-variant) {
  border-color: color-mix(in srgb, var(--glass-border) 85%, #7ca8ff 15%);
  background: linear-gradient(180deg, #0d1a2b 0%, #0b1624 100%);
  box-shadow: 0 16px 38px rgba(1, 4, 12, 0.46);
}

:deep(.datagrid-sugar-stage.is-tree-variant .datagrid-sugar-stage__header) {
  background: linear-gradient(180deg, rgba(18, 34, 53, 0.97) 0%, rgba(13, 26, 43, 0.97) 100%);
}

:deep(.datagrid-sugar-stage.is-tree-variant .datagrid-sugar-stage__cell--header) {
  letter-spacing: 0.11em;
  font-size: 0.66rem;
  color: rgba(210, 225, 246, 0.92);
}

:deep(.datagrid-sugar-stage.is-tree-variant .datagrid-sugar-stage__row:nth-child(odd)) {
  background: rgba(18, 31, 47, 0.82);
}

:deep(.datagrid-sugar-stage.is-tree-variant .datagrid-sugar-stage__row:nth-child(even)) {
  background: rgba(14, 26, 40, 0.84);
}

@media (max-width: 1280px) {
  .datagrid-musthave-tree__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
