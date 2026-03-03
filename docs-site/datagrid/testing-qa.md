---
title: Testing and QA gates
---

# Testing and QA gates

This section outlines testing strategy and minimal QA gates.

## 1) Unit tests

- Validate row/column models in isolation.
- Snapshot via `api.rows.getSnapshot()`.

## 2) Integration tests

- Validate sort/filter/grouping.
- Check refresh cycles `api.view.reapply()`.

## 3) Minimal E2E set

- Selection (single + range)
- Clipboard (copy/paste)
- Editing commit/cancel
- Fill‑handle and drag‑move (if enabled)

## 4) Performance gates

- Large datasets.
- Stress scenarios for resize/scroll.

