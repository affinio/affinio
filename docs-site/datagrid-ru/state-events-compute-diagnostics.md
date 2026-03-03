---
title: State, events, compute, diagnostics
---

# State, events, compute, diagnostics

Это stable reference для нового platform surface.

## 1) Unified state (`api.state`)

### Экспорт

```ts
const state = api.state.get()
```

### Импорт

```ts
api.state.set(state, {
  applyColumns: true,
  applySelection: true,
  applyViewport: true,
  strict: false,
})
```

`api.state` нужен для:

- workspace save/restore
- deterministic test checkpoints
- cross-runtime handoff сценариев

### V1 shape payload

- `rows.snapshot` (состояние sort/filter/group/pivot/pagination/viewport/revision)
- `rows.aggregationModel`
- `columns` (`order/visibility/widths/pins`)
- `selection`
- `transaction`

Важно:

- В V1 это model-centric transport формат.
- `policy` и `compute` в unified state пока не сериализуются.
- Восстановление `transaction` через `api.state.set(...)` сейчас не поддерживается.

## 2) Typed public events (`api.events`)

```ts
const off = api.events.on("rows:changed", payload => {
  console.log(payload.snapshot.revision)
})
```

Stable events:

- `rows:changed`
- `columns:changed`
- `projection:recomputed`
- `selection:changed`
- `pivot:changed`
- `transaction:changed`
- `viewport:changed`
- `state:imported`

Гарантии порядка:

- в одном row-model tick события идут так:
  1. `rows:changed`
  2. `projection:recomputed` (если изменилась recompute version)
  3. `pivot:changed` (если изменилась pivot signature)
  4. `viewport:changed` (если изменился viewport range)
- `columns:changed` идёт из column-model subscription.
- `selection:changed` эмитится через selection facade-операции и при `state.set(...)`, если применяется selection.
- `transaction:changed` эмитится через transaction facade-операции.
- `state:imported` эмитится в конце успешного `api.state.set(...)`.

Не гарантируется:

- `api.state.set(...)` не является atomic single-event операцией; во время применения могут прийти несколько row/column событий.

## 3) Compute control (`api.compute`)

```ts
if (api.compute.hasSupport()) {
  const switched = api.compute.switchMode("worker")
  const mode = api.compute.getMode()
  const diagnostics = api.compute.getDiagnostics()
}
```

Семантика переключения:

- вызов синхронный, возвращает `boolean`.
- автоматический recompute не запускается.
- revision row-model сам по себе не меняется.
- активные transaction batches автоматически не координируются (переключение лучше делать в safe lifecycle точках).

## 4) Aggregated diagnostics (`api.diagnostics`)

```ts
const d = api.diagnostics.getAll()
```

Доменная структура snapshot:

- `rowModel` (revision/rowCount/loading/warming/projection/treeData)
- `compute` (mode/transport/dispatch/fallback counters)
- `derivedCache` (cache-метрики, если поддерживаются)
- `backpressure` (давление data-source, если поддерживается)

Контракт стоимости:

- read-only path.
- recompute не триггерится.
- подходит для event-driven diagnostics UI (лучше избегать лишнего hot-loop polling).

## 5) Recommended wiring pattern

```ts
const stop = api.events.on("rows:changed", () => {
  panel.update({
    state: api.state.get(),
    diagnostics: api.diagnostics.getAll(),
  })
})
```

Это даёт детерминированный event-driven integration loop.

## 6) Policy integration (`api.policy`)

Projection policy:

- `mutable`
- `immutable`
- `excel-like`

```ts
api.policy.setProjectionMode("excel-like")
```

Фактическая семантика:

- `mutable`: auto-reapply включён.
- `immutable`: auto-reapply выключен.
- `excel-like`: сейчас эквивалентен `immutable` в patch/reapply сценарии.

## 7) Plugins и этот surface

- `api.plugins` может слушать stable events через `onEvent`.
- lifecycle hooks: `onRegister` / `onDispose`.
- plugins пока не участвуют в unified state serialization.
