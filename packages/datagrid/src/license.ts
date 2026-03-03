import { emitDataGridCommercialTelemetryEvent } from "./commercialTelemetry"

export type DataGridProLicenseFormat = "signed-v1"

export type DataGridProLicenseStatus = "active" | "grace"

export type DataGridProLicenseValidationCode =
  | "DG_LICENSE_INVALID_FORMAT"
  | "DG_LICENSE_INVALID_PAYLOAD"
  | "DG_LICENSE_INVALID_SIGNATURE"
  | "DG_LICENSE_NOT_YET_ACTIVE"
  | "DG_LICENSE_EXPIRED"

export interface DataGridProLicenseState {
  licenseKey: string
  source: string
  activatedAt: string
  format: DataGridProLicenseFormat
  status: DataGridProLicenseStatus
  expiresAt: string | null
  graceUntil: string | null
}

export interface DataGridProLicenseValidationSuccess {
  readonly valid: true
  readonly normalizedKey: string
  readonly format: DataGridProLicenseFormat
  readonly status: DataGridProLicenseStatus
  readonly expiresAt: string | null
  readonly graceUntil: string | null
}

export interface DataGridProLicenseValidationFailure {
  readonly valid: false
  readonly code: DataGridProLicenseValidationCode
  readonly message: string
}

export type DataGridProLicenseValidationResult =
  | DataGridProLicenseValidationSuccess
  | DataGridProLicenseValidationFailure

export class DataGridProLicenseValidationError extends Error {
  readonly code: DataGridProLicenseValidationCode

  constructor(code: DataGridProLicenseValidationCode, message: string) {
    super(message)
    this.name = "DataGridProLicenseValidationError"
    this.code = code
  }
}

const DATAGRID_PRO_LICENSE_SYMBOL = Symbol.for("affino.datagrid.pro-license")

const SIGNED_LICENSE_PATTERN = /^AFFINO-PRO-V1\.([A-Za-z0-9_-]+)\.([A-Fa-f0-9]{16})$/
const SIGNATURE_SALT = "affino.datagrid.license.v1"
const DEFAULT_SIGNED_TOKEN_GRACE_SEC = 7 * 24 * 60 * 60

interface SignedLicenseClaims {
  readonly plan: "pro"
  readonly exp: number
  readonly nbf: number | null
  readonly graceSec: number
}

function normalizeSource(source: string): string {
  const normalized = source.trim()
  return normalized.length > 0 ? normalized : "runtime"
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

function toUnixSeconds(value: unknown): number | null {
  const numeric = toFiniteNumber(value)
  if (numeric == null) {
    return null
  }
  const normalized = Math.trunc(numeric)
  return normalized > 0 ? normalized : null
}

function decodeBase64UrlUtf8(input: string): string | null {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const remainder = base64.length % 4
  const padded = remainder === 0 ? base64 : `${base64}${"=".repeat(4 - remainder)}`

  try {
    if (typeof atob === "function") {
      const binary = atob(padded)
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }
    const scope = globalThis as Record<string, unknown>
    const bufferCtor = scope.Buffer as
      | { from: (value: string, encoding: string) => { toString: (encoding: string) => string } }
      | undefined
    if (bufferCtor?.from) {
      return bufferCtor.from(padded, "base64").toString("utf8")
    }
  } catch {
    return null
  }

  return null
}

function hash32(input: string, seed: number): number {
  let hash = seed >>> 0
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

function computeSignedPayloadSignature(payloadSegment: string): string {
  const forward = hash32(`${SIGNATURE_SALT}:${payloadSegment}`, 0x811c9dc5)
  const reverse = hash32(`${payloadSegment}:${SIGNATURE_SALT}`, 0x9e3779b1)
  const forwardHex = forward.toString(16).padStart(8, "0")
  const reverseHex = reverse.toString(16).padStart(8, "0")
  return `${forwardHex}${reverseHex}`
}

function parseSignedLicenseClaims(payloadSegment: string): SignedLicenseClaims | null {
  const decoded = decodeBase64UrlUtf8(payloadSegment)
  if (!decoded) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(decoded)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== "object") {
    return null
  }

  const payload = parsed as Record<string, unknown>
  if (payload.plan !== "pro") {
    return null
  }

  const exp = toUnixSeconds(payload.exp)
  if (exp == null) {
    return null
  }

  const nbfRaw = payload.nbf == null ? null : toUnixSeconds(payload.nbf)
  if (payload.nbf != null && nbfRaw == null) {
    return null
  }

  const graceSecRaw = payload.graceSec == null ? null : toFiniteNumber(payload.graceSec)
  const graceDaysRaw = payload.graceDays == null ? null : toFiniteNumber(payload.graceDays)

  let graceSec = DEFAULT_SIGNED_TOKEN_GRACE_SEC
  if (graceSecRaw != null) {
    graceSec = Math.max(0, Math.trunc(graceSecRaw))
  } else if (graceDaysRaw != null) {
    graceSec = Math.max(0, Math.trunc(graceDaysRaw * 24 * 60 * 60))
  }

  return {
    plan: "pro",
    exp,
    nbf: nbfRaw,
    graceSec,
  }
}

function isoOrNull(timestampMs: number | null): string | null {
  if (timestampMs == null || !Number.isFinite(timestampMs)) {
    return null
  }
  return new Date(timestampMs).toISOString()
}

function validateNormalizedSignedLicenseKey(
  normalized: string,
  nowMs: number,
): DataGridProLicenseValidationResult {
  const match = SIGNED_LICENSE_PATTERN.exec(normalized)
  if (!match) {
    return {
      valid: false,
      code: "DG_LICENSE_INVALID_FORMAT",
      message: "[DataGrid] Pro license key format is invalid.",
    }
  }

  const payloadSegment = match[1]
  const signatureSegment = match[2].toLowerCase()

  const claims = parseSignedLicenseClaims(payloadSegment)
  if (!claims) {
    return {
      valid: false,
      code: "DG_LICENSE_INVALID_PAYLOAD",
      message: "[DataGrid] Pro license token payload is invalid.",
    }
  }

  const expectedSignature = computeSignedPayloadSignature(payloadSegment)
  if (signatureSegment !== expectedSignature) {
    return {
      valid: false,
      code: "DG_LICENSE_INVALID_SIGNATURE",
      message: "[DataGrid] Pro license token signature is invalid.",
    }
  }

  const nowSec = Math.trunc(nowMs / 1000)
  if (claims.nbf != null && nowSec < claims.nbf) {
    return {
      valid: false,
      code: "DG_LICENSE_NOT_YET_ACTIVE",
      message: "[DataGrid] Pro license token is not active yet.",
    }
  }

  const expiresAtMs = claims.exp * 1000
  const graceUntilMs = claims.graceSec > 0 ? (claims.exp + claims.graceSec) * 1000 : claims.exp * 1000
  if (nowSec <= claims.exp) {
    return {
      valid: true,
      normalizedKey: normalized,
      format: "signed-v1",
      status: "active",
      expiresAt: isoOrNull(expiresAtMs),
      graceUntil: claims.graceSec > 0 ? isoOrNull(graceUntilMs) : null,
    }
  }

  if (claims.graceSec > 0 && nowMs <= graceUntilMs) {
    return {
      valid: true,
      normalizedKey: normalized,
      format: "signed-v1",
      status: "grace",
      expiresAt: isoOrNull(expiresAtMs),
      graceUntil: isoOrNull(graceUntilMs),
    }
  }

  return {
    valid: false,
    code: "DG_LICENSE_EXPIRED",
    message: "[DataGrid] Pro license token is expired.",
  }
}

function validateNormalizedLicenseKey(
  normalized: string,
  nowMs: number,
): DataGridProLicenseValidationResult {
  if (SIGNED_LICENSE_PATTERN.test(normalized)) {
    return validateNormalizedSignedLicenseKey(normalized, nowMs)
  }
  return {
    valid: false,
    code: "DG_LICENSE_INVALID_FORMAT",
    message: "[DataGrid] Pro license key format is invalid.",
  }
}

function normalizeStoredActivatedAt(value: unknown, fallbackMs: number): string {
  if (typeof value !== "string") {
    return new Date(fallbackMs).toISOString()
  }
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) {
    return new Date(fallbackMs).toISOString()
  }
  return new Date(parsed).toISOString()
}

function readGlobalLicenseState(nowMs = Date.now()): DataGridProLicenseState | null {
  const scope = globalThis as Record<PropertyKey, unknown>
  const raw = scope[DATAGRID_PRO_LICENSE_SYMBOL]
  if (!raw || typeof raw !== "object") {
    return null
  }
  const candidate = raw as Partial<DataGridProLicenseState>
  if (typeof candidate.licenseKey !== "string") {
    return null
  }

  const validation = validateDataGridLicenseKey(candidate.licenseKey, { nowMs })
  if (!validation.valid) {
    return null
  }

  const source = typeof candidate.source === "string" ? normalizeSource(candidate.source) : "runtime"
  return Object.freeze({
    licenseKey: validation.normalizedKey,
    source,
    activatedAt: normalizeStoredActivatedAt(candidate.activatedAt, nowMs),
    format: validation.format,
    status: validation.status,
    expiresAt: validation.expiresAt,
    graceUntil: validation.graceUntil,
  })
}

export function normalizeDataGridLicenseKey(licenseKey: string | null | undefined): string | null {
  if (typeof licenseKey !== "string") {
    return null
  }
  const normalized = licenseKey.trim()
  if (normalized.length === 0) {
    return null
  }

  const signedMatch = SIGNED_LICENSE_PATTERN.exec(normalized)
  if (signedMatch) {
    return `AFFINO-PRO-V1.${signedMatch[1]}.${signedMatch[2].toLowerCase()}`
  }

  return null
}

export function validateDataGridLicenseKey(
  licenseKey: string | null | undefined,
  options: {
    nowMs?: number
  } = {},
): DataGridProLicenseValidationResult {
  const normalized = normalizeDataGridLicenseKey(licenseKey)
  if (!normalized) {
    return {
      valid: false,
      code: "DG_LICENSE_INVALID_FORMAT",
      message: "[DataGrid] Pro license key format is invalid.",
    }
  }
  return validateNormalizedLicenseKey(normalized, options.nowMs ?? Date.now())
}

export function registerProLicense(
  licenseKey: string,
  source = "runtime",
): DataGridProLicenseState {
  const validation = validateDataGridLicenseKey(licenseKey)
  if (!validation.valid) {
    emitDataGridCommercialTelemetryEvent({
      type: "license.validation-failed",
      timestamp: new Date().toISOString(),
      source: normalizeSource(source),
      code: validation.code,
    })
    throw new DataGridProLicenseValidationError(validation.code, validation.message)
  }

  const nextState: DataGridProLicenseState = Object.freeze({
    licenseKey: validation.normalizedKey,
    source: normalizeSource(source),
    activatedAt: new Date().toISOString(),
    format: validation.format,
    status: validation.status,
    expiresAt: validation.expiresAt,
    graceUntil: validation.graceUntil,
  })
  const scope = globalThis as Record<PropertyKey, unknown>
  scope[DATAGRID_PRO_LICENSE_SYMBOL] = nextState
  emitDataGridCommercialTelemetryEvent({
    type: "license.activated",
    timestamp: new Date().toISOString(),
    source: nextState.source,
    format: nextState.format,
    status: nextState.status,
    expiresAt: nextState.expiresAt,
    graceUntil: nextState.graceUntil,
  })
  return nextState
}

export function clearProLicense(): void {
  const scope = globalThis as Record<PropertyKey, unknown>
  delete scope[DATAGRID_PRO_LICENSE_SYMBOL]
}

export function getProLicenseState(): DataGridProLicenseState | null {
  const state = readGlobalLicenseState(Date.now())
  if (!state) {
    clearProLicense()
    return null
  }
  return state
}

export function hasProLicense(
  input: {
    licenseKey?: string | null
  } = {},
): boolean {
  if (input.licenseKey != null) {
    const validation = validateDataGridLicenseKey(input.licenseKey)
    if (validation.valid) {
      return true
    }
  }
  return getProLicenseState() !== null
}
