---
title: Performance gates
---

# Performance gates

SLA targets and CI budgets for perf regressions.

## 1) Targets (SLA)

- p95 scroll latency $\le 16\,ms$
- selection drag $\ge 55\,FPS$
- overlay open/close $\le 2\,ms$
- heap delta $\le 80\,MB$

## 2) Harness

- `pnpm run bench:datagrid:harness`
- `pnpm run bench:regression`

Artifacts:
- `artifacts/performance/datagrid-benchmark-report.json`
- `artifacts/quality/datagrid-benchmark-gates-report.json`

## 3) Fail‑fast

`pnpm run quality:perf:datagrid` validates budgets and reports.

