---
title: Interaction orchestration
---

# Interaction orchestration

`@affino/datagrid-orchestration` connects Core to the adapter (Vue/React/etc.) and handles input, selection, clipboard, fill‑handle, and drag‑move.

## 1) Minimal setup

```ts
import { createDataGridApi } from "@affino/datagrid-core"
import { createOrchestration } from "@affino/datagrid-orchestration"

const api = createDataGridApi({ rowModel, columnModel })
await api.start()

const orchestration = createOrchestration({ api })
```

## 2) Core contracts

- `adapter`: turns DOM events into abstract input events.
- `input`: unified pointer/keyboard stream for selection/clipboard/fill.
- `viewport`: syncs measurements and scroll with Core.

## 3) Examples

### Selection

```ts
orchestration.selection.selectCell({ rowIndex: 0, colKey: "service" })
orchestration.selection.clear()
```

### Clipboard

```ts
await orchestration.clipboard.copySelection()
await orchestration.clipboard.paste()
```

### Fill‑handle (autofill)

```ts
orchestration.fill.begin({ rowIndex: 0, colKey: "service" })
orchestration.fill.update({ rowIndex: 5, colKey: "service" })
orchestration.fill.commit()
```

## 4) When to enable

Enable orchestration in the UI adapter. Core remains deterministic and testable without DOM.

Next: [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
