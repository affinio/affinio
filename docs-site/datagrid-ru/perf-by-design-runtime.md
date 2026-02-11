---
title: Perf-by-design runtime
---

# Perf‑by‑design runtime

Контракты, которые защищают hot‑paths в viewport/virtualization.

## 1) Hot‑path инварианты

- переиспользование row pool
- bounded buffers для видимых строк
- стабильные сигнатуры callbacks (без лишних аллокаций)

## 2) Контрактные тесты

- `perfHotPath.contract.spec.ts`
- gate: `pnpm run quality:perf:datagrid`

## 3) Бюджеты

Row‑models и interaction‑benchmarks должны проходить p95/p99 бюджеты.

Дальше: [/datagrid/performance-gates](/datagrid/performance-gates)
