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

```ts
const migrated = api.state.migrate(externalState, { strict: true })
if (migrated) {
  api.state.set(migrated)
}
```

`api.state` нужен для:

- workspace save/restore
- deterministic test checkpoints
- cross-runtime handoff сценариев

### Snapshot isolation контракт

- Публичные read-операции дают revision-consistent снимок в рамках одного синхронного call stack.
- Если между вызовами выполняются только чтения (`rows.getSnapshot/getCount/getRange`, `state.get`, `meta.getRuntimeInfo`), они видят одну логическую revision.
- Revision меняется только на границе мутации/пересчета (например `rows.patch`, `rows.setSortModel`, `state.set`, `view.reapply`).

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
- `state:import:begin`
- `state:import:end`
- `state:imported`
- `error`

Гарантии порядка:

- в одном row-model tick события идут так:
  1. `rows:changed`
  2. `projection:recomputed` (если изменилась recompute version)
  3. `pivot:changed` (если изменилась pivot signature)
  4. `viewport:changed` (если изменился viewport range)
- `columns:changed` идёт из column-model subscription.
- `selection:changed` эмитится через selection facade-операции и при `state.set(...)`, если применяется selection.
- `transaction:changed` эмитится через transaction facade-операции.
- `state.set(...)` эмитит явные границы restore:
  1. `state:import:begin`
  2. row/column/selection события во время применения restore
  3. `state:imported` при успешном применении
  4. `state:import:end`
- Reentrant эмиссии ставятся в FIFO-очередь внутри одного runtime tick (детерминированный порядок при nested мутациях из listener).

Не гарантируется:

- `api.state.set(...)` — это логическая begin/end граница, а не single-event atomic payload.
- row/column события могут приходить внутри этой границы во время применения restore.

Error surface:

- `error` эмитится при guarded facade-сбоях (например, конфликт lifecycle exclusivity).
- payload содержит `code`, `operation`, `recoverable`, `error`.

### Error handling philosophy

- Recoverable runtime-конфликты отдаются через typed `error` events.
- Guarded операции по-прежнему throw/reject, чтобы вызывающий код контролировал flow.
- Event stream используйте как observability-канал, exception/rejection — как control-flow канал.
- Для abort-first сценариев проверяйте `code === "aborted"` и/или `error.name === "AbortError"`.

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

### Mutation abort semantics

- `api.rows.patch(...)` и `api.rows.applyEdits(...)` принимают `options.signal`.
- `api.transaction.apply(...)` принимает `options.signal`.
- Если операция отменена до dispatch, facade возвращает `AbortError`.

## 3.1) Lifecycle concurrency helpers (`api.lifecycle`)

```ts
if (api.lifecycle.isBusy()) {
  await api.lifecycle.whenIdle()
}

await api.lifecycle.runExclusive(async () => {
  api.state.set(savedState)
})
```

Используйте для сериализации high-impact операций (import state, switch mode, burst edits).

### Concurrency model guarantees

- `runExclusive(...)` создаёт exclusive mutation window для guarded-операций.
- `whenIdle()` резолвится после полного дренажа exclusive lifecycle queue.
- `isBusy()` отражает активную или ожидающую exclusive lifecycle работу.

Non-guarantee:

- Негардированные row/query мутации не прогоняются автоматически через `runExclusive(...)`.

## 3.2) Metadata/version introspection (`api.meta`)

```ts
const modelKind = api.meta.getRowModelKind()
const apiVersion = api.meta.getApiVersion()
const protocolVersion = api.meta.getProtocolVersion()
```

Используйте это для compatibility checks между worker/server/runtime границами.

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

### Backpressure and memory guarantees (current surface)

Guaranteed:

- Состояние backpressure доступно в diagnostics snapshot (`backpressure` domain, если поддерживается).
- Чтение diagnostics наблюдательное и не мутирует runtime state.
- Abort-first semantics доступны у guarded mutation entrypoints (`signal`).
- Для поддерживаемых моделей доступен публичный control-layer: `api.data.pause()/resume()/flush()`.
- `api.rows.batch(...)` коалесцирует facade events в один детерминированный event-cycle.

Non-guaranteed на текущем stable facade:

- Нет объявленного hard memory ceiling контракта для всех реализаций моделей.
- Нет фасадного глобального guarantee уровня “never duplicate inflight pull”.

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
- `immutable` enforcement: facade блокирует data-mutation вызовы.

## 7) Plugins и этот surface

- `api.plugins` может слушать stable events через `onEvent`.
- lifecycle hooks: `onRegister` / `onDispose`.
- Ошибки plugin event handlers изолируются от core event pipeline.
- plugins пока не участвуют в unified state serialization.
