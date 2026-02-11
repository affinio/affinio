---
title: Troubleshooting / FAQ
---

# Troubleshooting / FAQ

## 1) Нет selection или фокуса

- Проверьте стабильные `rowId`/`id`/`key`.
- Убедитесь, что используются bindings `grid.ui.bindDataCell`.

## 2) Не обновляется UI после изменения данных

- Вызывайте `api.refreshRows("manual")`.
- Не мутируйте массив `rows` in‑place без обновления ссылки.

## 3) Сортировка/фильтры “не работают”

- Проверьте, что `column.key` не менялся.
- Убедитесь, что model‑состояние не сброшено.

## 4) Потеря фокуса при scroll

- Используйте roving‑tabindex.
- Убедитесь, что active cell re‑applies фокус после virtual scroll.

## 5) Непредсказуемые значения в ячейках

- Проверьте обработчик commit/edit.
- Убедитесь, что `draft` кастится корректно (string→number/boolean).

