---
title: Range move (drag‑move)
---

# Range move (drag‑move)

Range‑move позволяет переносить блок ячеек в новое место.

## 1) Минимальный контракт

- Явный старт drag‑move (отдельный handle или модификатор).
- Плавное обновление target range.
- Отмена по Escape и безопасный rollback.

## 2) Базовая последовательность

```ts
orchestration.move.begin({ rowIndex: 1, colKey: "owner" })
orchestration.move.update({ rowIndex: 5, colKey: "owner" })
orchestration.move.commit()
```

## 3) UI‑рекомендации

- Показывайте placeholder в зоне назначения.
- Не смешивайте drag‑move и fill‑handle.
- Учитывайте виртуализацию при drag over.

