# DataGrid Typed Runtime Events

Updated: `2026-02-08`

Import path:
- `@affino/datagrid-core/advanced`

Runtime events in `@affino/datagrid-core` are now split into three explicit domains:

## Host Events

Host events are component-facing callbacks (`UiTableEventHandlers`) and remain source of truth for external integrations.

- Canonical map: `DataGridHostEventMap`
- Name union: `DataGridHostEventName`
- Name mapping for Vue emit: `HOST_EVENT_NAME_MAP`

## Plugin Events

Plugin bus is now typed and supports strict payloads.

- Base lifecycle events:
  - `runtime:initialized`
  - `runtime:disposing`
- Combined map contract:
  - `DataGridRuntimePluginEventMap<TCustomPluginEvents>`
  - includes host event bridge + runtime plugin lifecycle + custom plugin events

`TableRuntime` now exposes:

- `emitPlugin(event, ...args)`
- `onPlugin(event, handler)`

## Internal Runtime Events

Internal service/runtime signals are isolated from host/plugin domains:

- `lifecycle:init`
- `lifecycle:dispose`
- `host:dispatched`
- `plugin:host-unknown`
- `plugin:capability-denied`

Contract:

- `DataGridRuntimeInternalEventMap`
- `onInternalEvent(name, args)` in runtime options

Legacy compatibility:

- `onUnknownPluginEvent` kept as deprecated fallback bridge.

## Why this is prerequisite for GridApi

`GridApi` can now rely on:

- deterministic host dispatch ordering,
- strict plugin payload typing,
- explicit internal lifecycle signals.

This removes stringly-typed ambiguity before introducing semver-stable unified API facades.
