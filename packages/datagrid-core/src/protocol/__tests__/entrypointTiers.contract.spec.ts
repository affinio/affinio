import { describe, expect, it } from "vitest"
import * as stable from "../../public"
import * as pro from "../../pro"
import * as advanced from "../../advanced"
import * as internal from "../../internal"

describe("entrypoint tier contract", () => {
  it("keeps stable root surface free from advanced and internal helpers", () => {
    expect(typeof stable.createDataGridApi).toBe("function")
    expect(typeof stable.createDataGridCore).toBe("function")
    expect(typeof stable.createClientRowModel).toBe("function")
    expect("createServerBackedRowModel" in stable).toBe(false)
    expect("createDataSourceBackedRowModel" in stable).toBe(false)
    expect("createServerRowModel" in stable).toBe(false)

    expect("createDataGridViewportController" in stable).toBe(false)
    expect("createDataGridA11yStateMachine" in stable).toBe(false)
    expect("createDataGridTransactionService" in stable).toBe(false)
    expect("normalizeRowNode" in stable).toBe(false)
    expect(typeof stable.createDataGridEventEnvelope).toBe("function")
    expect(typeof stable.isDataGridEventTier).toBe("function")
  })

  it("exposes server/data-source helpers via pro entrypoint", () => {
    expect(typeof pro.createServerBackedRowModel).toBe("function")
    expect(typeof pro.createDataSourceBackedRowModel).toBe("function")
    expect(typeof pro.createServerRowModel).toBe("function")
    expect(typeof pro.createDataGridServerPivotRowId).toBe("function")
  })

  it("exposes advanced power-user APIs via advanced entrypoint", () => {
    expect(typeof advanced.createDataGridViewportController).toBe("function")
    expect(typeof advanced.createDataGridA11yStateMachine).toBe("function")
    expect(typeof advanced.createDataGridTransactionService).toBe("function")
    expect(typeof advanced.createDataGridAdapterRuntime).toBe("function")
    expect("createDataSourceBackedRowModel" in advanced).toBe(false)
    expect(typeof advanced.createDataGridEventEnvelope).toBe("function")
  })

  it("exposes unsafe helpers via internal entrypoint only", () => {
    expect(typeof internal.normalizeRowNode).toBe("function")
    expect(typeof internal.normalizeViewportRange).toBe("function")
    expect(typeof internal.withResolvedRowIdentity).toBe("function")
  })
})
