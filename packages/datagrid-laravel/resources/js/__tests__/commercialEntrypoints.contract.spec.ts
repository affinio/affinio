import { describe, expect, it } from "vitest"
import * as stable from "../index"
import * as pro from "../pro"

describe("datagrid-laravel commercial entrypoints contract", () => {
  it("keeps stable entrypoint free from pro-only factories", () => {
    expect("createServerBackedRowModel" in stable).toBe(false)
    expect("createDataSourceBackedRowModel" in stable).toBe(false)
    expect("createServerRowModel" in stable).toBe(false)
    expect("createDataGridServerPivotRowId" in stable).toBe(false)
  })

  it("exposes pro-only factories from pro entrypoint", () => {
    expect(typeof pro.createServerBackedRowModel).toBe("function")
    expect(typeof pro.createDataSourceBackedRowModel).toBe("function")
    expect(typeof pro.createServerRowModel).toBe("function")
    expect(typeof pro.createDataGridServerPivotRowId).toBe("function")
  })
})
