---
title: treeview-core
description: Core reference for @affino/treeview-core.
---

# @affino/treeview-core

> Stability: **Stable**

Headless treeview engine for focus, selection, and expansion logic.

## Overview

Use `treeview-core` when adapters need deterministic node navigation/selection behavior across nested hierarchies.

## Installation

```bash
npm install @affino/treeview-core
```

## Quick start

```ts
import { TreeviewCore } from "@affino/treeview-core"

const tree = new TreeviewCore<string>({
  nodes: [
    { value: "root", parent: null },
    { value: "child", parent: "root" },
  ],
  defaultExpanded: ["root"],
  defaultActive: "root",
})

tree.requestFocus("child")
tree.requestSelect("child")
```

## Request API

Deterministic methods with explicit result contract:

- `requestFocus(value)`
- `requestSelect(value)`
- `requestExpand(value)`
- `requestCollapse(value)`
- `requestToggle(value)`
- `requestFocusFirst()`
- `requestFocusLast()`
- `requestFocusNext()`
- `requestFocusPrevious()`

```ts
type TreeviewActionResult =
  | { ok: true; changed: boolean }
  | { ok: false; changed: false; reason: "missing-node" | "disabled-node" | "leaf-node" | "no-focusable-node" | "boundary" }
```

## Compatibility wrappers

Legacy methods are preserved:

- `focus`, `select`, `expand`, `collapse`, `toggle`
- `focusFirst`, `focusLast`, `focusNext`, `focusPrevious`

## Core API

- `registerNodes(nodes, options?)`
- `expandPath(value)`
- `clearSelection()`
- `getVisibleValues()`
- `getChildren(value)` / `getParent(value)`
- `isExpanded(value)` / `isSelected(value)` / `isActive(value)`
- `getSnapshot()`
- `subscribe(listener)`
- `destroy()`

## Snapshot guarantees

- `getSnapshot()` returns a frozen immutable object.
- `expanded` in snapshot is frozen as well.
- Snapshot reference remains stable for no-op/failure requests.

## Guardrails

- Keep node ids stable across updates.
- Handle invalid intents via request-failure reasons instead of silent fallbacks.
- Use one canonical source of tree snapshot state in adapters.
- Treat snapshots as immutable outputs.
