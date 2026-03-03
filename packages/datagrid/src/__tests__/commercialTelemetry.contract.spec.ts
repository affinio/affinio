import { beforeEach, describe, expect, it } from "vitest"
import type { DataGridApi } from "@affino/datagrid-core"
import {
  clearDataGridCommercialTelemetry,
  clearProLicense,
  registerDataGridCommercialTelemetry,
  registerProLicense,
  type DataGridCommercialTelemetryEvent,
} from "../index"
import { createCommunityApiFacade } from "../communityApiFacade"

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

describe("commercial telemetry contract", () => {
  beforeEach(() => {
    clearProLicense()
    clearDataGridCommercialTelemetry()
  })

  it("emits license activation and validation failure telemetry", () => {
    const events: DataGridCommercialTelemetryEvent[] = []
    registerDataGridCommercialTelemetry({
      sampleRate: 1,
      onEvent: event => {
        events.push(event)
      },
    })

    const valid = createSignedLicenseToken(Math.trunc(Date.now() / 1000) + 3600)
    registerProLicense(valid, "telemetry-contract")
    expect(() => registerProLicense("invalid-license", "telemetry-contract")).toThrow()

    expect(events.some(event => event.type === "license.activated")).toBe(true)
    expect(events.some(event => event.type === "license.validation-failed")).toBe(true)
  })

  it("emits feature blocked telemetry from community facade", () => {
    const events: DataGridCommercialTelemetryEvent[] = []
    registerDataGridCommercialTelemetry({
      sampleRate: 1,
      onEvent: event => {
        events.push(event)
      },
    })

    const communityApi = createCommunityApiFacade(createApiStub())
    expect(() => communityApi.rows.setGroupBy(["team"])).toThrow()

    const blocked = events.find(event => event.type === "feature.blocked")
    expect(blocked).toBeDefined()
    expect(blocked?.type).toBe("feature.blocked")
  })
})
