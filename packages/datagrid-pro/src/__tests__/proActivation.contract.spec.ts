import { beforeEach, describe, expect, it, vi } from "vitest"

const SIGNED_TEST_LICENSE = "AFFINO-PRO-V1.eyJwbGFuIjoicHJvIiwiZXhwIjo0MTAyNDQ0ODAwLCJncmFjZVNlYyI6MzYwMH0.04e6fb34c3231222"

const datagridMock = vi.hoisted(() => {
  let enabled = false
  return {
    registerProLicense: vi.fn((licenseKey: string, source?: string) => {
      enabled = true
      return {
        licenseKey,
        source: source ?? "runtime",
        activatedAt: "2026-03-03T00:00:00.000Z",
        format: "signed-v1",
        status: "active",
        expiresAt: "2099-12-31T00:00:00.000Z",
        graceUntil: "2100-01-07T00:00:00.000Z",
      }
    }),
    clearProLicense: vi.fn(() => {
      enabled = false
    }),
    hasProLicense: vi.fn(() => enabled),
    getProLicenseState: vi.fn(() => (
      enabled
        ? {
            licenseKey: SIGNED_TEST_LICENSE,
            source: "test",
            activatedAt: "2026-03-03T00:00:00.000Z",
            format: "signed-v1",
            status: "active",
            expiresAt: "2099-12-31T00:00:00.000Z",
            graceUntil: "2100-01-07T00:00:00.000Z",
          }
        : null
    )),
    DataGridProLicenseValidationError: class DataGridProLicenseValidationError extends Error {
      readonly code = "DG_LICENSE_INVALID_FORMAT" as const
    },
  }
})

vi.mock("@affino/datagrid", () => datagridMock)

import {
  assertProFeaturesEnabled,
  DataGridProLicenseError,
  disableProFeatures,
  enableProFeatures,
  getProLicenseState,
  isProFeaturesEnabled,
} from "../index"

describe("datagrid-pro activation contract", () => {
  beforeEach(() => {
    datagridMock.clearProLicense.mockClear()
    datagridMock.registerProLicense.mockClear()
    datagridMock.hasProLicense.mockClear()
    datagridMock.getProLicenseState.mockClear()
    disableProFeatures()
  })

  it("enables pro features through registerProLicense", () => {
    const state = enableProFeatures({ licenseKey: SIGNED_TEST_LICENSE, source: "spec" })
    expect(datagridMock.registerProLicense).toHaveBeenCalledWith(SIGNED_TEST_LICENSE, "spec")
    expect(state.licenseKey).toBe(SIGNED_TEST_LICENSE)
    expect(isProFeaturesEnabled()).toBe(true)
    expect(getProLicenseState()).not.toBeNull()
  })

  it("throws domain-specific error for invalid input", () => {
    expect(() => enableProFeatures(undefined as never)).toThrow(DataGridProLicenseError)
    expect(() => enableProFeatures(undefined as never)).toThrow(/expects an object with licenseKey/)
    try {
      enableProFeatures(undefined as never)
    } catch (error) {
      const typed = error as DataGridProLicenseError
      expect(typed.code).toBe("DG_PRO_INVALID_OPTIONS")
    }
  })

  it("throws when asserting pro mode while disabled", () => {
    disableProFeatures()
    expect(() => assertProFeaturesEnabled()).toThrow(DataGridProLicenseError)
    expect(() => assertProFeaturesEnabled()).toThrow(/Pro features are not enabled/)
    try {
      assertProFeaturesEnabled()
    } catch (error) {
      const typed = error as DataGridProLicenseError
      expect(typed.code).toBe("DG_PRO_NOT_ENABLED")
    }
  })
})
