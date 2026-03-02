import { createDataGridRuntime } from "@affino/datagrid-laravel"

const teardownByRoot = new WeakMap()

const TEAMS = ["core", "payments", "platform", "growth"]
const OWNERS = ["NOC", "SRE", "Payments", "Platform"]
const REGIONS = ["AMER", "EMEA", "APAC"]
const YEARS = ["2024", "2025", "2026"]
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

const SOURCE_COLUMNS = [
  { key: "region", label: "Region", width: 130, pin: "left" },
  { key: "team", label: "Team", width: 130, pin: "left" },
  { key: "owner", label: "Owner", width: 130 },
  { key: "year", label: "Year", width: 110 },
  { key: "quarter", label: "Quarter", width: 110 },
  { key: "orders", label: "Orders", width: 130 },
  { key: "revenue", label: "Revenue", width: 150 },
  { key: "latencyMs", label: "Latency ms", width: 130 },
]

const VALUE_PRESETS = {
  "revenue:sum": { field: "revenue", agg: "sum", label: "revenue:sum" },
  "orders:sum": { field: "orders", agg: "sum", label: "orders:sum" },
  "latencyMs:avg": { field: "latencyMs", agg: "avg", label: "latencyMs:avg" },
}

function toNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function formatValue(value) {
  if (value == null) {
    return "—"
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "—"
    }
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  return String(value)
}

function buildRows(count, generation = 1) {
  const normalized = Math.max(60, Math.round(count))
  const rows = []
  for (let index = 0; index < normalized; index += 1) {
    const seed = index + generation * 17
    const region = REGIONS[index % REGIONS.length] ?? "AMER"
    const year = YEARS[Math.floor(index / REGIONS.length) % YEARS.length] ?? "2024"
    const quarter = QUARTERS[Math.floor(index / (REGIONS.length * YEARS.length)) % QUARTERS.length] ?? "Q1"
    const team = TEAMS[(Math.floor(index / (REGIONS.length * YEARS.length * QUARTERS.length)) + generation) % TEAMS.length] ?? "core"
    const owner = OWNERS[(seed + Math.floor(index / REGIONS.length)) % OWNERS.length] ?? "NOC"
    rows.push({
      rowId: `pivot-row-${generation}-${index + 1}`,
      region,
      team,
      owner,
      year,
      quarter,
      orders: 12 + ((seed * 11) % 260),
      revenue: 1800 + ((seed * 37) % 19000),
      latencyMs: 22 + ((seed * 17) % 340),
    })
  }
  return rows
}

function resolvePivotModel(root) {
  const enabledSelect = root.querySelector("[data-pivot-enabled]")
  const rowFieldSelect = root.querySelector("[data-pivot-row-field]")
  const columnFieldSelect = root.querySelector("[data-pivot-column-field]")
  const valuePresetSelect = root.querySelector("[data-pivot-value-preset]")

  const enabled = String(enabledSelect?.value ?? "on") === "on"
  if (!enabled) {
    return null
  }
  const rowField = String(rowFieldSelect?.value ?? "region").trim()
  const columnField = String(columnFieldSelect?.value ?? "year").trim()
  const valuePresetKey = String(valuePresetSelect?.value ?? "revenue:sum").trim()
  const valuePreset = VALUE_PRESETS[valuePresetKey] ?? VALUE_PRESETS["revenue:sum"]

  if (rowField === "none" || columnField === "none") {
    return null
  }

  return {
    rows: [rowField],
    columns: [columnField],
    values: [{ field: valuePreset.field, agg: valuePreset.agg }],
  }
}

function mountPivotDemo(root) {
  if (!(root instanceof HTMLElement)) {
    return null
  }

  const sizeSelect = root.querySelector("[data-pivot-size]")
  const enabledSelect = root.querySelector("[data-pivot-enabled]")
  const rowFieldSelect = root.querySelector("[data-pivot-row-field]")
  const columnFieldSelect = root.querySelector("[data-pivot-column-field]")
  const valuePresetSelect = root.querySelector("[data-pivot-value-preset]")
  const randomizeButton = root.querySelector("[data-pivot-randomize]")
  const resetButton = root.querySelector("[data-pivot-reset]")
  const headerHost = root.querySelector("[data-pivot-header]")
  const bodyHost = root.querySelector("[data-pivot-body]")
  const totalNode = root.querySelector("[data-pivot-total]")
  const pivotColumnsNode = root.querySelector("[data-pivot-pivot-columns]")
  const modelNode = root.querySelector("[data-pivot-model]")
  const statusNode = root.querySelector("[data-pivot-status]")
  const previewNode = root.querySelector("[data-pivot-column-preview]")

  if (
    !(sizeSelect instanceof HTMLSelectElement) ||
    !(enabledSelect instanceof HTMLSelectElement) ||
    !(rowFieldSelect instanceof HTMLSelectElement) ||
    !(columnFieldSelect instanceof HTMLSelectElement) ||
    !(valuePresetSelect instanceof HTMLSelectElement) ||
    !(randomizeButton instanceof HTMLButtonElement) ||
    !(resetButton instanceof HTMLButtonElement) ||
    !(headerHost instanceof HTMLElement) ||
    !(bodyHost instanceof HTMLElement)
  ) {
    return null
  }

  let generation = 1
  let rows = buildRows(toNumber(root.dataset.pivotInitialRows, 480), generation)
  const runtime = createDataGridRuntime({
    rows,
    columns: SOURCE_COLUMNS,
  })
  const { api, rowModel } = runtime
  void api.start()

  const syncStatus = (message) => {
    if (statusNode instanceof HTMLElement) {
      statusNode.textContent = message
    }
  }

  const render = () => {
    const snapshot = rowModel.getSnapshot()
    const pivotModel = snapshot.pivotModel ?? null
    const pivotColumns = snapshot.pivotColumns ?? []
    const rowCount = api.getRowCount()
    const rowsInRange = rowCount > 0 ? api.getRowsInRange({ start: 0, end: rowCount - 1 }) : []

    const displayColumns = []
    if (pivotModel && pivotModel.rows.length > 0) {
      for (const rowField of pivotModel.rows) {
        displayColumns.push({
          key: rowField,
          label: rowField,
        })
      }
      for (const pivotColumn of pivotColumns) {
        displayColumns.push({
          key: pivotColumn.id,
          label: pivotColumn.label,
        })
      }
    } else {
      for (const column of SOURCE_COLUMNS) {
        displayColumns.push({
          key: column.key,
          label: column.label ?? column.key,
        })
      }
    }

    headerHost.innerHTML = ""
    const headerRow = document.createElement("tr")
    for (const column of displayColumns) {
      const th = document.createElement("th")
      th.textContent = column.label
      headerRow.appendChild(th)
    }
    headerHost.appendChild(headerRow)

    bodyHost.innerHTML = ""
    for (const rowNode of rowsInRange) {
      const tr = document.createElement("tr")
      tr.dataset.kind = rowNode.kind
      for (const column of displayColumns) {
        const td = document.createElement("td")
        const value = rowNode.data?.[column.key]
        td.textContent = formatValue(value)
        tr.appendChild(td)
      }
      bodyHost.appendChild(tr)
    }

    if (totalNode instanceof HTMLElement) {
      totalNode.textContent = String(rowCount)
    }
    if (pivotColumnsNode instanceof HTMLElement) {
      pivotColumnsNode.textContent = String(pivotColumns.length)
    }
    if (modelNode instanceof HTMLElement) {
      if (!pivotModel) {
        modelNode.textContent = "disabled"
      } else {
        const value = pivotModel.values[0]
        modelNode.textContent = `rows=${pivotModel.rows.join(",")} columns=${pivotModel.columns.join(",")} value=${value?.field}:${value?.agg}`
      }
    }
    if (previewNode instanceof HTMLElement) {
      previewNode.innerHTML = ""
      if (pivotColumns.length === 0) {
        const empty = document.createElement("li")
        empty.textContent = "No pivot columns"
        previewNode.appendChild(empty)
      } else {
        for (const column of pivotColumns.slice(0, 8)) {
          const li = document.createElement("li")
          li.textContent = column.label
          previewNode.appendChild(li)
        }
      }
    }
  }

  const applyPivotModel = () => {
    if (enabledSelect.value === "on" && rowFieldSelect.value === columnFieldSelect.value && rowFieldSelect.value !== "none") {
      columnFieldSelect.value = columnFieldSelect.value === "year" ? "quarter" : "year"
    }
    const model = resolvePivotModel(root)
    api.setPivotModel(model)
    if (!model) {
      syncStatus("Pivot disabled")
    } else {
      syncStatus(`Pivot applied: ${model.rows.join(",")} × ${model.columns.join(",")}`)
    }
    render()
  }

  const rebuildRows = (nextCount) => {
    generation += 1
    rows = buildRows(nextCount, generation)
    rowModel.setRows(rows)
    applyPivotModel()
  }

  const randomizeRows = () => {
    generation += 1
    rows = rows.map((row, index) => ({
      ...row,
      revenue: 1700 + (((index + generation) * 53) % 21000),
      orders: 10 + (((index + generation) * 9) % 280),
      latencyMs: 20 + (((index + generation) * 15) % 360),
    }))
    rowModel.setRows(rows)
    syncStatus("Values randomized")
    render()
  }

  const onControlsChange = () => applyPivotModel()
  const onSizeChange = () => rebuildRows(toNumber(sizeSelect.value, 480))
  const onRandomize = () => randomizeRows()
  const onReset = () => {
    enabledSelect.value = "on"
    rowFieldSelect.value = "region"
    columnFieldSelect.value = "year"
    valuePresetSelect.value = "revenue:sum"
    applyPivotModel()
  }

  sizeSelect.addEventListener("change", onSizeChange)
  enabledSelect.addEventListener("change", onControlsChange)
  rowFieldSelect.addEventListener("change", onControlsChange)
  columnFieldSelect.addEventListener("change", onControlsChange)
  valuePresetSelect.addEventListener("change", onControlsChange)
  randomizeButton.addEventListener("click", onRandomize)
  resetButton.addEventListener("click", onReset)

  const unsubscribe = rowModel.subscribe(() => {
    render()
  })

  applyPivotModel()

  return () => {
    unsubscribe()
    sizeSelect.removeEventListener("change", onSizeChange)
    enabledSelect.removeEventListener("change", onControlsChange)
    rowFieldSelect.removeEventListener("change", onControlsChange)
    columnFieldSelect.removeEventListener("change", onControlsChange)
    valuePresetSelect.removeEventListener("change", onControlsChange)
    randomizeButton.removeEventListener("click", onRandomize)
    resetButton.removeEventListener("click", onReset)
    try {
      api.stop()
      api.dispose()
    } catch {
      // no-op
    }
  }
}

export function bootstrapAffinoDatagridPivotDemos(root = document) {
  if (!(root instanceof Document || root instanceof DocumentFragment || root instanceof HTMLElement)) {
    return
  }

  const roots = []
  if (root instanceof HTMLElement && root.matches("[data-affino-datagrid-pivot-demo]")) {
    roots.push(root)
  }
  root.querySelectorAll?.("[data-affino-datagrid-pivot-demo]").forEach(element => roots.push(element))

  roots.forEach(element => {
    if (!(element instanceof HTMLElement)) {
      return
    }
    const previous = teardownByRoot.get(element)
    if (typeof previous === "function") {
      previous()
      teardownByRoot.delete(element)
    }
    const teardown = mountPivotDemo(element)
    if (typeof teardown === "function") {
      teardownByRoot.set(element, teardown)
    }
  })
}
