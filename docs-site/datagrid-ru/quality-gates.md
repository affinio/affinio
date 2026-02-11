---
title: Quality gates
---

# Quality gates

Ключевые проверки качества для datagrid.

## 1) Архитектурные ворота

- `pnpm run quality:architecture:datagrid`
- отчёт: `artifacts/quality/datagrid-architecture-acceptance-report.json`

## 2) Perf‑контракты

- `pnpm run quality:perf:datagrid`
- отчёт: `artifacts/quality/datagrid-perf-contracts-report.json`

## 3) Тестовая матрица

- `test:matrix:unit`
- `test:matrix:integration`
- `test:matrix:interaction`
- `test:matrix:visual`

## 4) Coverage

- `pnpm run test:datagrid:coverage`
- пороги: lines/functions/statements $\ge 80\%$, branches $\ge 70\%$

## 5) Critical‑path

- `pnpm run quality:gates:datagrid`
- `pnpm run quality:lock:datagrid`

