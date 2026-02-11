---
title: Runtime events
---

# Runtime events

Runtime events are typed events emitted by Core during computations (refresh, sorting, filtering, model transitions).

## 1) When to use

- observe which updates the grid performs,
- collect diagnostics and metrics,
- integrate custom effects in the UI adapter.

## 2) Wiring

```ts
import { createDataGridApi } from "@affino/datagrid-core"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()

const unsubscribe = api.onRuntimeEvent(event => {
  if (event.kind === "rows-refresh") {
    // diagnostics
  }
})

// later
unsubscribe()
```

## 3) Recommendations

- Do not block the handler; keep it fast.
- Keep diagnostics/logging in a separate layer.

Next: [/datagrid/custom-renderer](/datagrid/custom-renderer)
