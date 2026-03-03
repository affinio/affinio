import { describe, expect, it } from "vitest"
import type { DataGridApi } from "@affino/datagrid-core"
import {
  assertCommunityRowModelSupported,
  createCommunityApiFacade,
  DATAGRID_PRO_FEATURE_REQUIRED_CODE,
  DataGridProFeatureRequiredError,
} from "../communityApiFacade"

function createApiStub(rowModelKind: "client" | "server" = "client"): DataGridApi<any> {
  const api = {
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
      patch: () => false,
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
      getRowModelKind: () => rowModelKind,
    },
  }

  return api as unknown as DataGridApi<any>
}

describe("communityApiFacade contract", () => {
  it("rejects non-client row models in community tier", () => {
    const serverApi = createApiStub("server")
    expect(() => assertCommunityRowModelSupported(serverApi)).toThrow(DataGridProFeatureRequiredError)
    expect(() => assertCommunityRowModelSupported(serverApi)).toThrow(/server-row-model/)
  })

  it("exposes downgraded capability flags in community tier", () => {
    const facade = createCommunityApiFacade(createApiStub("client"))
    expect(facade.capabilities.compute).toBe(false)
    expect(facade.capabilities.backpressureControl).toBe(false)
    expect(facade.capabilities.patch).toBe(true)
  })

  it("throws pro-required errors for blocked domains", async () => {
    const facade = createCommunityApiFacade(createApiStub("client"))

    expect(() => facade.rows.setGroupBy(["team"])).toThrow(/grouping/)
    try {
      facade.rows.setGroupBy(["team"])
    } catch (error) {
      expect(error).toBeInstanceOf(DataGridProFeatureRequiredError)
      const typed = error as DataGridProFeatureRequiredError
      expect(typed.code).toBe(DATAGRID_PRO_FEATURE_REQUIRED_CODE)
      expect(typed.feature).toBe("grouping")
      expect(typed.tier).toBe("community")
    }
    expect(() => facade.rows.setAggregationModel([{ field: "value", agg: "sum" }])).toThrow(/aggregation/)
    expect(() => facade.pivot.setModel({ rows: ["team"], columns: ["year"], values: [{ field: "revenue", agg: "sum" }] })).toThrow(/pivot/)
    expect(() => facade.compute.switchMode("worker")).toThrow(/worker-compute/)
    await expect(facade.data.flush()).rejects.toThrow(/backpressure-control/)
  })
})
