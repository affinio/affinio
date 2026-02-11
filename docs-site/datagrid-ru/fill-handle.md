---
title: Fill-handle и range-move
---

# Fill‑handle и range‑move

Fill‑handle используется для автозаполнения диапазона, а range‑move — для переносов диапазона.

## 1) Минимальный контракт UI

- Отдельный handle‑элемент с явным `mousedown`.
- Явный drag‑цикл: begin → update → commit.
- Поддержка отмены при Escape.

## 2) Пример последовательности

```ts
orchestration.fill.begin({ rowIndex: 0, colKey: "service" })
orchestration.fill.update({ rowIndex: 5, colKey: "service" })
orchestration.fill.commit()
```

## 3) Рекомендации

- Не смешивайте drag‑move и fill в одном handle.
- Используйте визуальные подсказки для range.
- Учитывайте виртуализацию при drag over.

Дальше: [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
