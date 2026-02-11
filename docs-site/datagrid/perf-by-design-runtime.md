---
title: Perf-by-design runtime
---

# Perf‑by‑design runtime

Contracts that protect hot paths in viewport/virtualization.

## 1) Hot‑path invariants

- row pool reuse
- bounded buffers for visible rows
- stable callback signatures (no extra allocations)

## 2) Contract tests

- `perfHotPath.contract.spec.ts`
- gate: `pnpm run quality:perf:datagrid`

## 3) Budgets

Row models and interaction benchmarks must pass p95/p99 budgets.

