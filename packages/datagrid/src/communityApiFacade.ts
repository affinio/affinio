import type {
  DataGridAggregationModel,
  DataGridApi,
  DataGridApiCapabilities,
  DataGridClientComputeMode,
  DataGridPivotLayoutImportOptions,
  DataGridPivotLayoutSnapshot,
  DataGridPivotSpec,
  DataGridRowModelKind,
} from "@affino/datagrid-core"
import { emitDataGridCommercialTelemetryEvent } from "./commercialTelemetry"

export type DataGridCommunityBlockedFeature =
  | "grouping"
  | "aggregation"
  | "tree"
  | "pivot"
  | "worker-compute"
  | "server-row-model"
  | "backpressure-control"

export const DATAGRID_COMMUNITY_BLOCKED_FEATURES: readonly DataGridCommunityBlockedFeature[] = Object.freeze([
  "grouping",
  "aggregation",
  "tree",
  "pivot",
  "worker-compute",
  "server-row-model",
  "backpressure-control",
])

export const DATAGRID_PRO_FEATURE_REQUIRED_CODE = "DG_PRO_FEATURE_REQUIRED" as const

export class DataGridProFeatureRequiredError extends Error {
  readonly feature: DataGridCommunityBlockedFeature
  readonly code = DATAGRID_PRO_FEATURE_REQUIRED_CODE
  readonly tier = "community" as const

  constructor(feature: DataGridCommunityBlockedFeature) {
    super(`[DataGrid] Feature "${feature}" requires @affino/datagrid-pro license.`)
    this.name = "DataGridProFeatureRequiredError"
    this.feature = feature
  }
}

function failFeature(feature: DataGridCommunityBlockedFeature): never {
  emitDataGridCommercialTelemetryEvent({
    type: "feature.blocked",
    timestamp: new Date().toISOString(),
    tier: "community",
    feature,
  })
  throw new DataGridProFeatureRequiredError(feature)
}

export function assertCommunityRowModelSupported<TRow>(
  api: DataGridApi<TRow>,
): void {
  const kind: DataGridRowModelKind = api.meta.getRowModelKind()
  if (kind === "client") {
    return
  }
  failFeature("server-row-model")
}

export function createCommunityApiFacade<TRow>(
  api: DataGridApi<TRow>,
): DataGridApi<TRow> {
  assertCommunityRowModelSupported(api)

  const capabilities: DataGridApiCapabilities = Object.freeze({
    patch: api.capabilities.patch,
    dataMutation: api.capabilities.dataMutation,
    backpressureControl: false,
    compute: false,
    selection: api.capabilities.selection,
    transaction: api.capabilities.transaction,
    histogram: api.capabilities.histogram,
    sortFilterBatch: api.capabilities.sortFilterBatch,
  })

  return {
    ...api,
    capabilities,
    rows: {
      ...api.rows,
      setGroupBy: () => failFeature("grouping"),
      setAggregationModel: (_model: DataGridAggregationModel<TRow> | null) => failFeature("aggregation"),
      getAggregationModel: () => failFeature("aggregation"),
      setGroupExpansion: () => failFeature("tree"),
      toggleGroup: () => failFeature("tree"),
      expandGroup: () => failFeature("tree"),
      collapseGroup: () => failFeature("tree"),
      expandAllGroups: () => failFeature("tree"),
      collapseAllGroups: () => failFeature("tree"),
    },
    view: {
      ...api.view,
      expandAllGroups: () => failFeature("tree"),
      collapseAllGroups: () => failFeature("tree"),
    },
    pivot: {
      ...api.pivot,
      setModel: (_pivotModel: DataGridPivotSpec | null) => failFeature("pivot"),
      getModel: () => failFeature("pivot"),
      getCellDrilldown: () => failFeature("pivot"),
      exportLayout: () => failFeature("pivot"),
      exportInterop: () => failFeature("pivot"),
      importLayout: (
        _layout: DataGridPivotLayoutSnapshot<TRow>,
        _options?: DataGridPivotLayoutImportOptions,
      ) => failFeature("pivot"),
    },
    data: {
      ...api.data,
      hasBackpressureControlSupport: () => false,
      pause: () => failFeature("backpressure-control"),
      resume: () => failFeature("backpressure-control"),
      flush: async () => failFeature("backpressure-control"),
    },
    compute: {
      ...api.compute,
      hasSupport: () => false,
      getMode: () => api.compute.getMode(),
      switchMode: (_mode: DataGridClientComputeMode) => failFeature("worker-compute"),
      getDiagnostics: () => null,
    },
  }
}
