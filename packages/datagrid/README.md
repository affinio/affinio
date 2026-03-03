# @affino/datagrid

Community entrypoint for Affino DataGrid.

## Install

```bash
npm install @affino/datagrid
```

## Usage

```ts
import { createDataGridRuntime } from "@affino/datagrid"

const runtime = createDataGridRuntime({
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
  ],
  rows: [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
  ],
})
```

Community tier blocks pro-only domains by default (pivot, grouping/tree, worker compute, server/data-source row models, backpressure controls).

## Unlocking pro

You can unlock pro either:

- by activating `@affino/datagrid-pro` via `enableProFeatures(...)`
- or by passing `licenseKey` directly to `createDataGridApi(...)` / `createDataGridRuntime(...)`

## License format and enforcement

`licenseKey` accepts:

- signed token v1: `AFFINO-PRO-V1.<payload>.<signature>`

Signed tokens are validated for:

- payload integrity (plan + expiry claims)
- signature match
- `exp`/`nbf` time window
- offline grace window (`graceSec` / `graceDays`, default 7 days)

Community gating errors expose stable codes for programmatic handling:

- `DG_PRO_FEATURE_REQUIRED` (feature blocked in community tier)
- `DG_LICENSE_INVALID_FORMAT`
- `DG_LICENSE_INVALID_PAYLOAD`
- `DG_LICENSE_INVALID_SIGNATURE`
- `DG_LICENSE_NOT_YET_ACTIVE`
- `DG_LICENSE_EXPIRED`

## Telemetry hooks (opt-in)

You can register runtime commercial telemetry for support/debug pipelines:

```ts
import { registerDataGridCommercialTelemetry } from "@affino/datagrid"

registerDataGridCommercialTelemetry({
  sampleRate: 1,
  onEvent(event) {
    // license.activated / license.validation-failed / feature.blocked
    console.log(event)
  },
})
```

Use `clearDataGridCommercialTelemetry()` to disable hooks.
