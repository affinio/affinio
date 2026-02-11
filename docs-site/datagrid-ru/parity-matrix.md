---
title: Parity matrix
---

# Parity matrix

Единая матрица parity для Core/Vue/Laravel.

## 1) Цель

- Общие критерии приемки.
- Release‑blocking gate при fail.

## 2) Примеры блокирующих пунктов

- Row identity + determinism
- Virtualization + pinning
- Selection + keyboard nav
- Clipboard / Fill / Move
- Perf budgets

## 3) Команда

```bash
pnpm run quality:lock:datagrid:parity
```

