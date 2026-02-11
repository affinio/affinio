---
title: Performance and diagnostics
---

# Performance and diagnostics

This section covers performance principles, diagnostics, and profiling for DataGrid.

## 1) Performance contours

- **Row projection** — recompute only the required range.
- **Column projection** — avoid unnecessary column array recreation.
- **Row height cache** — stabilize height calculations.

## 2) Metrics and diagnostics

Use runtime events and snapshots:

```ts
const snapshot = api.getRowSnapshot()
const count = api.getRowCount()
```

## 3) Recommendations

- Avoid heavy synchronous logic in handlers.
- Split bulk changes into deterministic steps.
- In UI adapters, throttle resize/scroll.

## 4) Test gates

Validate performance gates on large datasets and fixed profiles.

Next: [/datagrid](/datagrid/)
