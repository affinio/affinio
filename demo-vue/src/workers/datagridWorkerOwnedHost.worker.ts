/// <reference lib="webworker" />

import { createDataGridWorkerOwnedRowModelHost } from "@affino/datagrid-vue/pro"

const workerScope = self as unknown as DedicatedWorkerGlobalScope

createDataGridWorkerOwnedRowModelHost({
  source: workerScope,
  target: workerScope,
})
