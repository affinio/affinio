---
title: Data source protocol
---

# Data source protocol

Этот документ описывает контракт `DataGridDataSource` (advanced‑entrypoint).

## 1) Зачем

- единый pull + push канал
- abort‑first при churn viewport
- частичная invalidation без полного сброса

## 2) API

`DataGridDataSource<T>`:

- `pull(request)` — обязательный demand API
- `subscribe(listener)` — опциональный push‑stream
- `invalidate(invalidation)` — опциональная invalidation‑hook

`DataGridDataSourcePullRequest`:

- `range`, `priority`, `reason`, `signal`
- `sortModel`, `filterModel`, `groupBy`, `groupExpansion`

## 3) Интеграция с row model

`createDataSourceBackedRowModel` обеспечивает:

- range‑driven demand (`setViewportRange`)
- abort‑first cancellation
- invalidate range/all
- diagnostics через `getBackpressureDiagnostics()`

