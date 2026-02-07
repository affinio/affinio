# DataGrid GridCore Service Registry

Updated: `2026-02-07`

`GridCore` is the canonical service container for datagrid engine services:

- `event`
- `rowModel`
- `columnModel`
- `selection`
- `viewport`

## Lifecycle Contract

Each service can implement:

- `init(context)`
- `start(context)`
- `stop(context)`
- `dispose(context)`

Core lifecycle:

- `core.init()` -> runs `init` in deterministic startup order
- `core.start()` -> ensures init, then runs `start` in startup order
- `core.stop()` -> runs `stop` in reverse startup order
- `core.dispose()` -> runs `stop` (if needed), then `dispose` in reverse startup order

## Startup Order

Canonical order:

1. `event`
2. `rowModel`
3. `columnModel`
4. `selection`
5. `viewport`

Custom `startupOrder` can prioritize a subset; missing services are appended deterministically according to canonical order.
