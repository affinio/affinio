import {
  createDataGridApi as createCoreDataGridApi,
  type CreateDataGridApiOptions,
  type DataGridApi,
} from "@affino/datagrid-core"
import {
  createDataGridVueRuntime,
  type CreateDataGridVueRuntimeOptions,
  type DataGridVueRuntime,
} from "@affino/datagrid-vue"
import {
  createCommunityApiFacade,
  DATAGRID_PRO_FEATURE_REQUIRED_CODE,
  DataGridProFeatureRequiredError,
  DATAGRID_COMMUNITY_BLOCKED_FEATURES,
} from "./communityApiFacade"
import {
  clearDataGridCommercialTelemetry,
  getDataGridCommercialTelemetryHooks,
  registerDataGridCommercialTelemetry,
  type DataGridCommercialTelemetryEvent,
  type DataGridCommercialTelemetryHooks,
} from "./commercialTelemetry"
import {
  clearProLicense,
  DataGridProLicenseValidationError,
  getProLicenseState,
  hasProLicense,
  normalizeDataGridLicenseKey,
  registerProLicense,
  validateDataGridLicenseKey,
  type DataGridProLicenseFormat,
  type DataGridProLicenseState,
  type DataGridProLicenseStatus,
  type DataGridProLicenseValidationCode,
  type DataGridProLicenseValidationResult,
} from "./license"

export {
  DataGrid,
  AffinoDataGridSimple,
  useAffinoDataGridMinimal,
} from "@affino/datagrid-vue"

export {
  createClientRowModel,
  createDataGridColumnModel,
  createDataGridCore,
  createDataGridSelectionSummary,
} from "@affino/datagrid-core"

export type {
  CreateClientRowModelOptions,
  CreateDataGridColumnModelOptions,
  CreateDataGridCoreOptions,
  DataGridApi,
  DataGridColumnDef,
  DataGridRowModelKind,
  DataGridRowNode,
  DataGridRowNodeInput,
  DataGridSelectionSummarySnapshot,
  DataGridSortState,
  DataGridFilterSnapshot,
  DataGridClientRowPatch,
} from "@affino/datagrid-core"

export type DataGridCommercialTier = "community" | "pro"

export type CreateDataGridApiCommercialOptions<TRow = unknown> = CreateDataGridApiOptions<TRow> & {
  licenseKey?: string | null
}

export interface CreateDataGridRuntimeOptions<TRow = unknown>
  extends CreateDataGridVueRuntimeOptions<TRow> {
  licenseKey?: string | null
}

export interface DataGridRuntime<TRow = unknown> extends DataGridVueRuntime<TRow> {}

function resolveCoreApiOptions<TRow = unknown>(
  options: CreateDataGridApiCommercialOptions<TRow>,
): CreateDataGridApiOptions<TRow> {
  const { licenseKey: _licenseKey, ...coreOptions } = options
  return coreOptions as CreateDataGridApiOptions<TRow>
}

export function resolveDataGridTier(
  input: {
    licenseKey?: string | null
  } = {},
): DataGridCommercialTier {
  return hasProLicense(input) ? "pro" : "community"
}

function resolveLicenseInput(licenseKey: string | null | undefined): string | null {
  if (typeof licenseKey !== "string") {
    return null
  }
  const normalized = licenseKey.trim()
  if (normalized.length === 0) {
    return null
  }
  return registerProLicense(normalized, "inline").licenseKey
}

export function createDataGridApi<TRow = unknown>(
  options: CreateDataGridApiCommercialOptions<TRow>,
): DataGridApi<TRow> {
  const inlineLicense = resolveLicenseInput(options.licenseKey ?? null)
  const coreOptions = resolveCoreApiOptions(options)
  const api = createCoreDataGridApi<TRow>(coreOptions)
  if (inlineLicense || resolveDataGridTier() === "pro") {
    return api
  }
  return createCommunityApiFacade(api)
}

export function createDataGridRuntime<TRow = unknown>(
  options: CreateDataGridRuntimeOptions<TRow>,
): DataGridRuntime<TRow> {
  const { licenseKey, ...runtimeOptions } = options
  const inlineLicense = resolveLicenseInput(licenseKey ?? null)
  const runtime = createDataGridVueRuntime(runtimeOptions)
  if (inlineLicense || resolveDataGridTier() === "pro") {
    return runtime
  }
  runtime.api = createCommunityApiFacade(runtime.api)
  return runtime
}

export {
  DATAGRID_PRO_FEATURE_REQUIRED_CODE,
  DataGridProFeatureRequiredError,
  DataGridProLicenseValidationError,
  DATAGRID_COMMUNITY_BLOCKED_FEATURES,
  normalizeDataGridLicenseKey,
  validateDataGridLicenseKey,
  registerProLicense,
  clearProLicense,
  hasProLicense,
  getProLicenseState,
  registerDataGridCommercialTelemetry,
  clearDataGridCommercialTelemetry,
  getDataGridCommercialTelemetryHooks,
}

export type {
  DataGridCommercialTelemetryEvent,
  DataGridCommercialTelemetryHooks,
  DataGridProLicenseFormat,
  DataGridProLicenseState,
  DataGridProLicenseStatus,
  DataGridProLicenseValidationCode,
  DataGridProLicenseValidationResult,
}
