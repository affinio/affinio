/// <reference lib="webworker" />

import { createDataGridWorkerOwnedRowModelHost } from "@affino/datagrid-vue"

const workerScope = self as unknown as DedicatedWorkerGlobalScope

createDataGridWorkerOwnedRowModelHost({
  source: workerScope,
  target: workerScope,
})
