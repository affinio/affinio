import { beforeEach, describe, expect, it, vi } from "vitest"
import type { DataGridApi } from "@affino/datagrid-core"

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

function createSignedLicenseToken(claims: { exp: number, graceSec?: number }): string {
  const payloadSegment = encodeBase64UrlUtf8(JSON.stringify({
    plan: "pro",
    exp: claims.exp,
    graceSec: claims.graceSec ?? 0,
  }))
  const salt = "affino.datagrid.license.v1"
  const forward = hash32(`${salt}:${payloadSegment}`, 0x811c9dc5)
  const reverse = hash32(`${payloadSegment}:${salt}`, 0x9e3779b1)
  const signature = `${forward.toString(16).padStart(8, "0")}${reverse.toString(16).padStart(8, "0")}`
  return `AFFINO-PRO-V1.${payloadSegment}.${signature}`
}

function createApiStub(): DataGridApi<any> {
  return {
    capabilities: {
      patch: true,
      dataMutation: true,
      backpressureControl: true,
      compute: true,
      selection: true,
      transaction: true,
      histogram: true,
      sortFilterBatch: true,
    },
    rows: {
      setGroupBy: () => undefined,
      setAggregationModel: () => undefined,
      getAggregationModel: () => null,
      setGroupExpansion: () => undefined,
      toggleGroup: () => undefined,
      expandGroup: () => undefined,
      collapseGroup: () => undefined,
      expandAllGroups: () => undefined,
      collapseAllGroups: () => undefined,
    },
    view: {
      expandAllGroups: () => undefined,
      collapseAllGroups: () => undefined,
    },
    pivot: {
      setModel: () => undefined,
      getModel: () => null,
      getCellDrilldown: () => null,
      exportLayout: () => null,
      exportInterop: () => null,
      importLayout: () => false,
    },
    data: {
      hasBackpressureControlSupport: () => true,
      pause: () => undefined,
      resume: () => undefined,
      flush: async () => undefined,
    },
    compute: {
      hasSupport: () => true,
      getMode: () => "sync",
      switchMode: () => false,
      getDiagnostics: () => null,
    },
    meta: {
      getRowModelKind: () => "client",
    },
  } as unknown as DataGridApi<any>
}

const coreMock = vi.hoisted(() => ({
  createDataGridApi: vi.fn(),
}))

const vueMock = vi.hoisted(() => ({
  createDataGridVueRuntime: vi.fn(),
}))

vi.mock("@affino/datagrid-core", () => ({
  createDataGridApi: coreMock.createDataGridApi,
  createClientRowModel: vi.fn(),
  createDataGridColumnModel: vi.fn(),
  createDataGridCore: vi.fn(),
  createDataGridSelectionSummary: vi.fn(),
}))

vi.mock("@affino/datagrid-vue", () => ({
  createDataGridVueRuntime: vueMock.createDataGridVueRuntime,
  DataGrid: {},
  AffinoDataGridSimple: {},
  useAffinoDataGridMinimal: vi.fn(),
}))

import {
  clearProLicense,
  createDataGridApi,
  createDataGridRuntime,
  DataGridProLicenseValidationError,
} from "../index"

describe("license e2e matrix contract", () => {
  beforeEach(() => {
    clearProLicense()
    vi.useRealTimers()
    coreMock.createDataGridApi.mockReset()
    vueMock.createDataGridVueRuntime.mockReset()
  })

  it("active token keeps raw API/runtime", () => {
    const nowSec = Math.trunc(Date.now() / 1000)
    const token = createSignedLicenseToken({ exp: nowSec + 600, graceSec: 300 })

    const coreApi = createApiStub()
    coreMock.createDataGridApi.mockReturnValue(coreApi)
    const runtimeApi = createApiStub()
    vueMock.createDataGridVueRuntime.mockReturnValue({ api: runtimeApi })

    const api = createDataGridApi({ licenseKey: token } as never)
    const runtime = createDataGridRuntime({ licenseKey: token } as never)

    expect(api).toBe(coreApi)
    expect(runtime.api).toBe(runtimeApi)
  })

  it("grace token keeps raw API/runtime", () => {
    vi.useFakeTimers()
    const now = new Date("2026-03-03T12:00:00.000Z")
    vi.setSystemTime(now)
    const nowSec = Math.trunc(now.getTime() / 1000)
    const token = createSignedLicenseToken({ exp: nowSec - 20, graceSec: 120 })

    const coreApi = createApiStub()
    coreMock.createDataGridApi.mockReturnValue(coreApi)
    const runtimeApi = createApiStub()
    vueMock.createDataGridVueRuntime.mockReturnValue({ api: runtimeApi })

    const api = createDataGridApi({ licenseKey: token } as never)
    const runtime = createDataGridRuntime({ licenseKey: token } as never)

    expect(api).toBe(coreApi)
    expect(runtime.api).toBe(runtimeApi)
  })

  it("expired token degrades both API/runtime to community facade", () => {
    vi.useFakeTimers()
    const now = new Date("2026-03-03T12:00:00.000Z")
    vi.setSystemTime(now)
    const nowSec = Math.trunc(now.getTime() / 1000)
    const token = createSignedLicenseToken({ exp: nowSec - 120, graceSec: 60 })

    const coreApi = createApiStub()
    coreMock.createDataGridApi.mockReturnValue(coreApi)
    const runtimeApi = createApiStub()
    vueMock.createDataGridVueRuntime.mockReturnValue({ api: runtimeApi })

    const api = createDataGridApi({} as never)
    expect(api).not.toBe(coreApi)
    expect(() => api.pivot.setModel(null)).toThrow(/pivot/)

    const runtime = createDataGridRuntime({} as never)
    expect(runtime.api).not.toBe(runtimeApi)
    expect(() => runtime.api.pivot.setModel(null)).toThrow(/pivot/)

    expect(() => createDataGridApi({ licenseKey: token } as never)).toThrow(DataGridProLicenseValidationError)
    expect(() => createDataGridRuntime({ licenseKey: token } as never)).toThrow(DataGridProLicenseValidationError)
  })

  it("invalid signature throws typed validation error for API/runtime", () => {
    const invalid = "AFFINO-PRO-V1.eyJwbGFuIjoicHJvIiwiZXhwIjoyMDAwMDAwMDAwfQ.aaaaaaaaaaaaaaaa"
    expect(() => createDataGridApi({ licenseKey: invalid } as never)).toThrow(DataGridProLicenseValidationError)
    expect(() => createDataGridRuntime({ licenseKey: invalid } as never)).toThrow(DataGridProLicenseValidationError)
  })
})
