---
title: Data source protocol
---

# Data source protocol

This document describes the `DataGridDataSource` contract (advanced entrypoint).

## 1) Why it exists

- unified pull + push channel
- abort‑first under viewport churn
- partial invalidation without full resets

## 2) API

`DataGridDataSource<T>`:

- `pull(request)` — required demand API
- `subscribe(listener)` — optional push stream
- `invalidate(invalidation)` — optional invalidation hook

`DataGridDataSourcePullRequest`:

- `range`, `priority`, `reason`, `signal`
- `sortModel`, `filterModel`, `groupBy`, `groupExpansion`

## 3) Row model integration

`createDataSourceBackedRowModel` provides:

- range‑driven demand (`setViewportRange`)
- abort‑first cancellation
- invalidate range/all
- diagnostics via `getBackpressureDiagnostics()`

