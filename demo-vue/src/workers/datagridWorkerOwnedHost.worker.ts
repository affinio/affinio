/// <reference lib="webworker" />

import { createDataGridWorkerOwnedRowModelHost } from "@affino/datagrid-worker"
import { createWorkerOwnedDemoRows, workerOwnedDemoColumns } from "../pages/datagrid/workerOwnedDemoModel"

const workerScope = self as unknown as DedicatedWorkerGlobalScope

createDataGridWorkerOwnedRowModelHost({
  source: workerScope,
  target: workerScope,
  rows: createWorkerOwnedDemoRows(12_000, 1),
  columns: workerOwnedDemoColumns,
  rowIdKey: "rowId",
})
