---
title: Performance и diagnostics
---

# Performance и diagnostics

Страница описывает stable diagnostics API и практичную perf-инструментацию.

## 1) Stable diagnostics surface

Используйте:

- `api.diagnostics.getAll()` для aggregated runtime diagnostics
- `api.compute.getDiagnostics()` для compute transport деталей
- `api.events.on(...)` для event-driven обновлений

```ts
const d = api.diagnostics.getAll()

// d.rowModel -> revision/rowCount/loading/warming/projection/treeData
// d.compute -> configured/effective mode, transport kind, dispatch/fallback counters
// d.derivedCache -> cache stats (если поддерживается client row model)
// d.backpressure -> diagnostics давления pull/push (data source backed)
```

## 2) Projection health checks

Отслеживайте projection lifecycle через:

- `d.rowModel.projection?.lastStage`
- `d.rowModel.projection?.staleStages`
- `d.rowModel.projection?.cycleVersion`
- `d.rowModel.projection?.recomputeVersion`

Для live-панелей используйте `projection:recomputed` события, а не polling.

## 3) Compute mode checks

```ts
if (api.compute.hasSupport()) {
  const before = api.compute.getMode()
  api.compute.switchMode("worker")
  const after = api.compute.getMode()
  const cd = api.compute.getDiagnostics()
}
```

Интерпретация:

- высокий `dispatchCount` + низкий `fallbackCount` => transport работает штатно
- рост `fallbackCount` => transport нестабильно обрабатывает compute-запросы

## 4) Event-driven diagnostics loop

```ts
const off = api.events.on("rows:changed", () => {
  diagnosticsPanel.set(api.diagnostics.getAll())
})
```

Это preferred pattern для адаптеров и демо.

## 5) Практические рекомендации

- Держите event handlers лёгкими; тяжёлую работу выносите в отложенные/background шаги.
- Для edit storm сочетайте `applyEdits` policy и явный `view.reapply()`.
- Переходите на worker-owned, когда bottleneck — синхронный dispatch на main thread.
- Переходите на server-side row model, когда backend должен владеть query/data shaping.

## 6) Performance gates

В CI проверяйте:

- latency percentiles (p95/p99)
- variance gates (CV/drift)
- memory/heap deltas
- mode-specific regressions (main-thread vs worker-owned)
