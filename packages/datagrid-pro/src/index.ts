import {
  clearProLicense,
  DataGridProLicenseValidationError,
  getProLicenseState,
  hasProLicense,
  registerProLicense,
  type DataGridProLicenseValidationCode,
  type DataGridProLicenseState,
} from "@affino/datagrid"

export interface EnableProFeaturesOptions {
  licenseKey: string
  source?: string
}

export type DataGridProLicenseErrorCode =
  | "DG_PRO_INVALID_OPTIONS"
  | "DG_PRO_NOT_ENABLED"
  | DataGridProLicenseValidationCode

export class DataGridProLicenseError extends Error {
  readonly code: DataGridProLicenseErrorCode

  constructor(message: string, code: DataGridProLicenseErrorCode) {
    super(message)
    this.name = "DataGridProLicenseError"
    this.code = code
  }
}

export function enableProFeatures(
  options: EnableProFeaturesOptions,
): DataGridProLicenseState {
  if (!options || typeof options !== "object") {
    throw new DataGridProLicenseError(
      "[DataGrid Pro] enableProFeatures(options) expects an object with licenseKey.",
      "DG_PRO_INVALID_OPTIONS",
    )
  }
  const source = typeof options.source === "string" && options.source.trim().length > 0
    ? options.source.trim()
    : "datagrid-pro"
  try {
    return registerProLicense(options.licenseKey, source)
  } catch (error) {
    if (error instanceof DataGridProLicenseValidationError) {
      throw new DataGridProLicenseError(error.message, error.code)
    }
    if (error instanceof Error) {
      throw new DataGridProLicenseError(error.message, "DG_PRO_INVALID_OPTIONS")
    }
    throw error
  }
}

export function disableProFeatures(): void {
  clearProLicense()
}

export function isProFeaturesEnabled(): boolean {
  return hasProLicense()
}

export function assertProFeaturesEnabled(): void {
  if (isProFeaturesEnabled()) {
    return
  }
  throw new DataGridProLicenseError(
    "[DataGrid Pro] Pro features are not enabled. Call enableProFeatures({ licenseKey }) first.",
    "DG_PRO_NOT_ENABLED",
  )
}

export {
  getProLicenseState,
}
