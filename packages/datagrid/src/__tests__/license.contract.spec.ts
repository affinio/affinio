import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearProLicense,
  DataGridProLicenseValidationError,
  getProLicenseState,
  hasProLicense,
  normalizeDataGridLicenseKey,
  registerProLicense,
  validateDataGridLicenseKey,
} from "../license"

function encodeBase64UrlUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
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
  const salt = "affino.datagrid.license.v1"
  const forward = hash32(`${salt}:${payloadSegment}`, 0x811c9dc5)
  const reverse = hash32(`${payloadSegment}:${salt}`, 0x9e3779b1)
  return `${forward.toString(16).padStart(8, "0")}${reverse.toString(16).padStart(8, "0")}`
}

function createSignedLicenseToken(claims: {
  exp: number
  graceSec?: number
  nbf?: number
}): string {
  const payload = {
    plan: "pro",
    exp: claims.exp,
    graceSec: claims.graceSec,
    nbf: claims.nbf,
  }
  const payloadSegment = encodeBase64UrlUtf8(JSON.stringify(payload))
  const signature = computeSignedPayloadSignature(payloadSegment)
  return `AFFINO-PRO-V1.${payloadSegment}.${signature}`
}

describe("license contract", () => {
  beforeEach(() => {
    clearProLicense()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("normalizes and validates inline license keys", () => {
    const nowSec = Math.trunc(Date.now() / 1000)
    const signed = createSignedLicenseToken({ exp: nowSec + 3600, graceSec: 60 })
    expect(normalizeDataGridLicenseKey(null)).toBeNull()
    expect(normalizeDataGridLicenseKey("short")).toBeNull()
    expect(normalizeDataGridLicenseKey("   AFFINO-PRO-123456   ")).toBeNull()
    expect(normalizeDataGridLicenseKey(signed)).toBe(signed)
  })

  it("registers and clears global pro state for signed keys", () => {
    vi.useFakeTimers()
    const now = new Date("2026-03-03T10:00:00.000Z")
    vi.setSystemTime(now)
    const token = createSignedLicenseToken({
      exp: Math.trunc(now.getTime() / 1000) + 3600,
      graceSec: 120,
    })

    expect(getProLicenseState()).toBeNull()
    const state = registerProLicense(token, "unit-test")
    expect(state.licenseKey).toBe(token)
    expect(state.source).toBe("unit-test")
    expect(state.format).toBe("signed-v1")
    expect(state.status).toBe("active")
    expect(typeof state.expiresAt).toBe("string")
    expect(hasProLicense()).toBe(true)

    clearProLicense()
    expect(getProLicenseState()).toBeNull()
    expect(hasProLicense()).toBe(false)
  })

  it("supports signed tokens with active and grace status", () => {
    vi.useFakeTimers()
    const now = new Date("2026-03-03T10:00:00.000Z")
    vi.setSystemTime(now)
    const nowSec = Math.trunc(now.getTime() / 1000)

    const token = createSignedLicenseToken({
      exp: nowSec + 60,
      graceSec: 120,
    })
    const validation = validateDataGridLicenseKey(token)
    expect(validation.valid).toBe(true)
    if (!validation.valid) {
      return
    }
    expect(validation.format).toBe("signed-v1")
    expect(validation.status).toBe("active")

    registerProLicense(token, "signed-spec")
    expect(getProLicenseState()?.status).toBe("active")

    vi.setSystemTime(new Date((nowSec + 90) * 1000))
    expect(hasProLicense()).toBe(true)
    expect(getProLicenseState()?.status).toBe("grace")

    vi.setSystemTime(new Date((nowSec + 250) * 1000))
    expect(hasProLicense()).toBe(false)
    expect(getProLicenseState()).toBeNull()
  })

  it("throws typed validation error for invalid signed token signature", () => {
    const invalidSigned = "AFFINO-PRO-V1.eyJwbGFuIjoicHJvIiwiZXhwIjoyMDAwMDAwMDAwfQ.aaaaaaaaaaaaaaaa"
    expect(() => registerProLicense(invalidSigned, "invalid-signature")).toThrow(DataGridProLicenseValidationError)
    try {
      registerProLicense(invalidSigned, "invalid-signature")
    } catch (error) {
      expect(error).toBeInstanceOf(DataGridProLicenseValidationError)
      const typed = error as DataGridProLicenseValidationError
      expect(typed.code).toBe("DG_LICENSE_INVALID_SIGNATURE")
    }
  })

  it("treats inline key as pro even without global activation", () => {
    const nowSec = Math.trunc(Date.now() / 1000)
    const token = createSignedLicenseToken({ exp: nowSec + 120, graceSec: 60 })
    expect(hasProLicense({ licenseKey: token })).toBe(true)
    expect(hasProLicense({ licenseKey: " short " })).toBe(false)
  })
})
