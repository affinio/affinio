---
title: Community vs Pro
---

# Community vs Pro

Краткий роутинг по уровню возможностей.

## Таблица выбора

| Потребность | Community | Pro |
| --- | --- | --- |
| Базовая клиентская таблица (sort/filter/pagination) | ✅ | ✅ |
| Grouping / tree / aggregation | ❌ | ✅ |
| Pivot + layout import/export | ❌ | ✅ |
| Worker-owned compute mode | ❌ | ✅ |
| Server/data-source row models | ❌ | ✅ |
| Backpressure controls | ❌ | ✅ |

## Путь внедрения

1. Стартуйте с `@affino/datagrid` (community mode).
2. Мерьте нагрузку на реальных данных и сценариях.
3. При необходимости pro-доменов включайте `@affino/datagrid-pro`.

## Подсказка по бенчам

Репрезентативный тренд из internal matrix:

| Размер | Worker-owned vs main-thread (end-to-end) |
| --- | --- |
| 20k строк | ~5.4x быстрее |
| 100k строк | ~1.6x быстрее |
| 200k строк | ~1.34x быстрее |

Интерпретация:

- Для небольших/простых сценариев обычно хватает community main-thread.
- При тяжёлой patch/edit/group/filter нагрузке pro worker-режим заметно улучшает отзывчивость.
- Если query/data shaping принадлежат backend, переходите на pro server/data-source модели.
