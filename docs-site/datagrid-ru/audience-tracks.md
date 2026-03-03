---
title: Треки пользователей (Core / Adapter / Sugar)
---

# Треки пользователей

Эта страница фиксирует целевой контракт документации по уровням пользователя.

## Матрица треков

| Трек | Для кого | Основной пакет | Ожидаемая глубина | Стартовые страницы |
| --- | --- | --- | --- | --- |
| Core (Pro) | Platform-инженеры, собирающие headless/runtime интеграции | `@affino/datagrid-core` | Низкоуровневый API, контракты, runtime-инварианты, протоколы | [/datagrid-ru/core-quickstart](/datagrid-ru/core-quickstart), [/datagrid-ru/core-factories-reference](/datagrid-ru/core-factories-reference), [/datagrid-ru/core-advanced-reference](/datagrid-ru/core-advanced-reference), [/datagrid-ru/grid-api](/datagrid-ru/grid-api), [/datagrid-ru/model-contracts](/datagrid-ru/model-contracts), [/datagrid-ru/data-source-protocol](/datagrid-ru/data-source-protocol) |
| Adapter (Mid) | Framework-разработчики, собирающие production grid во Vue/Laravel | `@affino/datagrid-vue`, `@affino/datagrid-laravel` | Framework-facing API map, интеграционные сценарии, выбор runtime-режима | [/datagrid-ru/vue-api-reference](/datagrid-ru/vue-api-reference), [/datagrid-ru/vue-integration](/datagrid-ru/vue-integration), [/datagrid-ru/laravel-integration](/datagrid-ru/laravel-integration) |
| Sugar (Rapid) | Product-разработчики, которым нужен быстрый запуск таблицы | `@affino/datagrid-vue` sugar layer | Декларативная настройка, feature toggles, практические рецепты | [/datagrid-ru/sugar-overview](/datagrid-ru/sugar-overview), [/datagrid-ru/vue-sugar-playbook](/datagrid-ru/vue-sugar-playbook) |

## Политика доступа к пакетам

- Core-трек: можно напрямую импортировать `@affino/datagrid-core`.
- Adapter-трек: рекомендуется использовать только framework-адаптеры, без прямых импортов core/orchestration.
- Sugar-трек: рекомендуется оставаться на sugar API, без ручной low-level orchestration.

## Каталог возможностей

Канонический перечень возможностей для оценки соответствия требованиям:

- [DataGrid Feature Catalog](https://github.com/affinio/affinio/blob/main/docs/datagrid-feature-catalog.md)

## Быстрое правило выбора runtime-режима

| Потребность | Рекомендуемый режим |
| --- | --- |
| Небольшая/простая таблица | `main-thread` |
| Тяжелая интерактивная нагрузка (edit/patch) | `worker-owned` |
| Backend-owned shaping и очень большие удалённые данные | `server-side` |
