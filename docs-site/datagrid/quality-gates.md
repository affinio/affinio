---
title: Quality gates
---

# Quality gates

Key quality checks for datagrid.

## 1) Architecture gate

- `pnpm run quality:architecture:datagrid`
- report: `artifacts/quality/datagrid-architecture-acceptance-report.json`

## 2) Perf contracts

- `pnpm run quality:perf:datagrid`
- report: `artifacts/quality/datagrid-perf-contracts-report.json`

## 3) Test matrix

- `test:matrix:unit`
- `test:matrix:integration`
- `test:matrix:interaction`
- `test:matrix:visual`

## 4) Coverage

- `pnpm run test:datagrid:coverage`
- thresholds: lines/functions/statements $\ge 80\%$, branches $\ge 70\%$

## 5) Critical path

- `pnpm run quality:gates:datagrid`
- `pnpm run quality:lock:datagrid`

