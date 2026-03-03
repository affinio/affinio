# @affino/datagrid-pro

Pro licensing activation package for Affino DataGrid.

## Install

```bash
npm install @affino/datagrid @affino/datagrid-pro
```

## Usage

```ts
import { createDataGridRuntime } from "@affino/datagrid"
import { enableProFeatures } from "@affino/datagrid-pro"

enableProFeatures({
  licenseKey: process.env.DATAGRID_LICENSE!,
})

const runtime = createDataGridRuntime({
  columns,
  rows,
})
```

You can also pass `licenseKey` inline to `createDataGridApi(...)` or `createDataGridRuntime(...)`.

License key format: `AFFINO-PRO-V1.<payload>.<signature>`.

## License validation behavior

`enableProFeatures({ licenseKey })` forwards validation to `@affino/datagrid` and throws `DataGridProLicenseError` with stable `code` values:

- `DG_PRO_INVALID_OPTIONS`
- `DG_PRO_NOT_ENABLED`
- `DG_LICENSE_INVALID_FORMAT`
- `DG_LICENSE_INVALID_PAYLOAD`
- `DG_LICENSE_INVALID_SIGNATURE`
- `DG_LICENSE_NOT_YET_ACTIVE`
- `DG_LICENSE_EXPIRED`
