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

function createSignedLicenseToken(exp: number): string {
  const payloadSegment = encodeBase64UrlUtf8(JSON.stringify({ plan: "pro", exp, graceSec: 3600 }))
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

describe("commercial facade contract", () => {
  beforeEach(() => {
    clearProLicense()
    coreMock.createDataGridApi.mockReset()
    vueMock.createDataGridVueRuntime.mockReset()
  })

  it("wraps core API in community mode without license", () => {
    const apiStub = createApiStub()
    coreMock.createDataGridApi.mockReturnValue(apiStub)

    const api = createDataGridApi({} as never)

    expect(api).not.toBe(apiStub)
    expect(() => api.rows.setGroupBy(["team"])).toThrow(/grouping/)
  })

  it("returns raw core API with inline license", () => {
    const apiStub = createApiStub()
    coreMock.createDataGridApi.mockReturnValue(apiStub)
    const licenseKey = createSignedLicenseToken(Math.trunc(Date.now() / 1000) + 3600)

    const api = createDataGridApi({ licenseKey } as never)

    expect(api).toBe(apiStub)
  })

  it("throws typed error for invalid inline license token", () => {
    coreMock.createDataGridApi.mockReturnValue(createApiStub())
    expect(() => createDataGridApi({ licenseKey: "invalid-key" } as never)).toThrow(DataGridProLicenseValidationError)
  })

  it("wraps runtime API in community mode and keeps raw runtime API in pro mode", () => {
    const rawCommunityApi = createApiStub()
    const communityRuntime = { api: rawCommunityApi }
    vueMock.createDataGridVueRuntime.mockReturnValueOnce(communityRuntime)

    const community = createDataGridRuntime({} as never)
    expect(community.api).not.toBe(rawCommunityApi)
    expect(() => community.api.pivot.setModel(null)).toThrow(/pivot/)

    const proRuntime = { api: createApiStub() }
    vueMock.createDataGridVueRuntime.mockReturnValueOnce(proRuntime)
    const licenseKey = createSignedLicenseToken(Math.trunc(Date.now() / 1000) + 3600)
    const pro = createDataGridRuntime({ licenseKey } as never)
    expect(pro.api).toBe(proRuntime.api)
  })
})
