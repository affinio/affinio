import type {
  DataGridCommunityBlockedFeature,
} from "./communityApiFacade"
import type {
  DataGridProLicenseFormat,
  DataGridProLicenseStatus,
  DataGridProLicenseValidationCode,
} from "./license"

export type DataGridCommercialTelemetryEvent =
  | {
    type: "license.activated"
    timestamp: string
    source: string
    format: DataGridProLicenseFormat
    status: DataGridProLicenseStatus
    expiresAt: string | null
    graceUntil: string | null
  }
  | {
    type: "license.validation-failed"
    timestamp: string
    source: string
    code: DataGridProLicenseValidationCode
  }
  | {
    type: "feature.blocked"
    timestamp: string
    tier: "community"
    feature: DataGridCommunityBlockedFeature
  }

export interface DataGridCommercialTelemetryHooks {
  onEvent?: (event: DataGridCommercialTelemetryEvent) => void
  sampleRate?: number
}

const DATAGRID_COMMERCIAL_TELEMETRY_SYMBOL = Symbol.for("affino.datagrid.commercial-telemetry")

function clampSampleRate(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1
  }
  if (value <= 0) {
    return 0
  }
  if (value >= 1) {
    return 1
  }
  return value
}

function readTelemetryHooks(): DataGridCommercialTelemetryHooks | null {
  const scope = globalThis as Record<PropertyKey, unknown>
  const raw = scope[DATAGRID_COMMERCIAL_TELEMETRY_SYMBOL]
  if (!raw || typeof raw !== "object") {
    return null
  }
  const candidate = raw as Partial<DataGridCommercialTelemetryHooks>
  if (candidate.onEvent && typeof candidate.onEvent !== "function") {
    return null
  }
  return {
    onEvent: candidate.onEvent,
    sampleRate: clampSampleRate(candidate.sampleRate),
  }
}

export function registerDataGridCommercialTelemetry(
  hooks: DataGridCommercialTelemetryHooks,
): void {
  const scope = globalThis as Record<PropertyKey, unknown>
  scope[DATAGRID_COMMERCIAL_TELEMETRY_SYMBOL] = Object.freeze({
    onEvent: typeof hooks?.onEvent === "function" ? hooks.onEvent : undefined,
    sampleRate: clampSampleRate(hooks?.sampleRate),
  } satisfies DataGridCommercialTelemetryHooks)
}

export function clearDataGridCommercialTelemetry(): void {
  const scope = globalThis as Record<PropertyKey, unknown>
  delete scope[DATAGRID_COMMERCIAL_TELEMETRY_SYMBOL]
}

export function getDataGridCommercialTelemetryHooks(): DataGridCommercialTelemetryHooks | null {
  return readTelemetryHooks()
}

export function emitDataGridCommercialTelemetryEvent(event: DataGridCommercialTelemetryEvent): void {
  const hooks = readTelemetryHooks()
  if (!hooks?.onEvent) {
    return
  }
  const sampleRate = clampSampleRate(hooks.sampleRate)
  if (sampleRate <= 0) {
    return
  }
  if (sampleRate < 1 && Math.random() > sampleRate) {
    return
  }
  try {
    hooks.onEvent(event)
  } catch {
    // Telemetry failures must never break runtime behavior.
  }
}
