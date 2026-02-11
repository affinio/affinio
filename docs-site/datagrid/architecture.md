---
title: Architecture and package boundaries
---

# Architecture and package boundaries

Goal: keep Core deterministic and framework‑agnostic, and keep the Vue layer a thin adapter.

## 1) Responsibility boundaries

| Package | Owns | Must not own |
| --- | --- | --- |
| `@affino/datagrid-core` | модели, runtime‑signals, viewport/virtualization, selection geometry | Vue refs, SFC‑рендер, adapter‑lifecycle |
| `@affino/datagrid-vue` | composables, UI‑адаптер, lifecycle, интеграция | дублирование геометрии/virtualization |

## 2) Dependency direction

- `datagrid-core` does not depend on Vue.
- `datagrid-vue` depends on `datagrid-core`.

## 3) Canonical runtime pipeline

1. Input events reach the adapter.
2. The adapter normalizes into core contracts.
3. Core computes viewport/virtualization.
4. Core emits deterministic geometry.
5. The Vue layer renders only.

## 4) Invariants

- Single owner for scroll sync.
- Canonical `pin = left | right | none`.
- One coordinate system (world/viewport/client).

