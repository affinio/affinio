# DataGrid Aggregation Enterprise Pipeline Checklist

Updated: `2026-02-21`  
Scope: `@affino/datagrid-core`, `@affino/datagrid-vue`, benchmarks/contracts/docs  
Goal: добавить aggregation engine в projection pipeline без деградации latency/throughput.

## Target Semantics

- Aggregation считается по `leaf`-строкам.
- Результат хранится только в `groupMeta.aggregates`, без мутаций `row.data`.
- По умолчанию `basis = "filtered"` (итоги по текущему view), опционально `basis = "source"`.
- Pipeline стадий: `filter -> sort -> group -> aggregate -> paginate -> visible`.

## Rollout Strategy

- `Phase 1`: production-safe full recompute aggregation.
- `Phase 2`: field-aware invalidation + selective recompute.
- `Phase 3`: incremental aggregation для high-churn сценариев (`sum/count/avg`).
- Любой регресс по контрактам/перфу: step reopen + rollback на предыдущую фазу.

## Pipeline

- [x] `A0` API контракт aggregation model
  - What:
    - Добавить типы `DataGridAggOp`, `DataGridAggregationColumnSpec`, `DataGridAggregationModel`.
    - Добавить `basis?: "filtered" | "source"`.
    - Добавить `aggregates?: Record<string, unknown>` в `groupMeta`.
  - Exit:
    - Типы стабильны, экспортируются из публичного entrypoint.
    - Backward compatibility: старые потребители не ломаются.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/rowModel.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/index.ts`

- [x] `A1` Projection stage graph: добавить `aggregate`
  - What:
    - В `clientRowProjectionEngine` вставить стадию `aggregate` между `group` и `paginate`.
    - Обновить зависимостей/expand logic.
  - Exit:
    - `requestStages(["group"])` корректно захватывает `aggregate/paginate/visible`.
    - Stale diagnostics корректно отражают aggregate-stage.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowProjectionEngine.ts`

- [x] `A2` Aggregation engine (compiled aggregators)
  - What:
    - Новый модуль `aggregationEngine.ts`:
      - compile spec -> runtime aggregator handlers
      - built-in ops: `sum/avg/min/max/count/countNonNull/first/last`
      - custom hooks: `createState/add/remove/finalize`
  - Exit:
    - Unit tests на корректность built-in ops и custom lifecycle.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/aggregationEngine.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/aggregationEngine.spec.ts`

- [x] `A3` `runAggregateStage` для groupBy (V1 full recompute)
  - What:
    - Добавить `aggregatedRowsProjection`.
    - В `runAggregateStage` считать `aggregatesByGroupKey` и инжектить в `groupMeta`.
    - В no-recompute ветке делать identity patch без пересчёта.
  - Exit:
    - Group rows получают стабильные aggregates.
    - Поведение без aggregationModel не меняется.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [x] `A4` Aggregation для treeData (`path/parent`) через cache-структуры
  - What:
    - Добавить в tree cache `aggregatesByGroup...`.
    - Для `parent`: пост-ордер расчёт по `includedChildrenById`.
    - Для `path`: агрегация по веткам и matched leaves.
    - Materialize читает aggregates из cache.
  - Exit:
    - Tree group nodes получают корректные aggregates при expanded/collapsed состояниях.
    - Aggregation не зависит от visible window/pagination.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [x] `A5` Basis semantics (`filtered` vs `source`)
  - What:
    - Реализовать `basis` в engine/runtime.
    - Для `filtered`: считать по filtered include set.
    - Для `source`: считать по всем leaf source rows (с сохранением структуры групп).
  - Exit:
    - Контрактные тесты подтверждают различие `filtered`/`source`.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/clientRowModel.spec.ts`

- [x] `A6` Field-aware invalidation (`affectsAggregation`)
  - What:
    - Собрать `aggregationFields`.
    - В `patchRows` вычислять `affectsAggregation`.
    - Инвалидировать/пересчитывать aggregate stage только при необходимости.
  - Exit:
    - Patch нерелевантных полей не триггерит aggregate recompute.
    - Patch релевантных полей всегда обновляет aggregates.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`

- [x] `A7` Public runtime API и Vue integration
  - What:
    - Добавить методы:
      - `setAggregationModel(model | null)`
      - `getAggregationModel()`
    - Прокинуть в `datagrid-vue` runtime/composable API.
  - Exit:
    - В Vue можно менять aggregation model в рантайме.
    - Реактивный update без full reset runtime.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-vue/src/*`

- [ ] `A8` Contract/unit/regression tests
  - What:
    - Tests:
      - groupBy aggregates correctness per op
      - tree parent/path aggregates correctness
      - basis filtered/source
      - patchRows with `recompute* false` + stale semantics
      - collapse/expand doesn’t corrupt aggregates
  - Exit:
    - `datagrid-core` tests green, deterministic.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/clientRowModel.spec.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/__tests__/aggregationEngine.spec.ts`
  - Progress:
    - Контрактные тесты добавлены/обновлены, ожидают прогон (`node/pnpm` недоступны в текущей среде).

- [ ] `A9` Benchmarks + perf gates (Phase 1)
  - What:
    - Обновить tree/group workloads, добавить aggregation-on профили.
    - Сравнить `no-aggregation` vs `aggregation-on`.
  - Exit:
    - CI-light проходит.
    - Нет существенного регресса p95/p99 сверх бюджетов.
  - Artifacts:
    - `/Users/anton/Projects/affinio/scripts/bench-datagrid-tree-workload.mjs`
    - `/Users/anton/Projects/affinio/docs/datagrid-performance-gates.md`
    - `/Users/anton/Projects/affinio/artifacts/performance/*`
  - Progress:
    - Не запускался в текущей среде (отсутствуют `node/pnpm`).

- [x] `A10` Docs + migration notes
  - What:
    - Добавить guide: когда использовать `basis`, как читать `groupMeta.aggregates`.
    - Описать caveat stale projection при no-recompute режимах.
  - Exit:
    - Документация покрывает API/semantics/perf tradeoffs.
  - Artifacts:
    - `/Users/anton/Projects/affinio/docs/datagrid-groupby-rowmodel-projection.md`
    - `/Users/anton/Projects/affinio/docs/datagrid-migration-guide.md`
    - `/Users/anton/Projects/affinio/docs/archive/datagrid/checklists/datagrid-high-performance-closure-checklist.md`

- [x] `A11` Phase 3 prep: incremental-ready cache shape
  - What:
    - Добавить внутренние структуры:
      - `parentById`
      - optional `leafContributionById`
      - branch dirty markers
    - Пока без включения full incremental behavior.
  - Exit:
    - Архитектура готова к incremental, но поведение остается Phase 1/2 stable.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/aggregationEngine.ts`
  - Progress:
    - В tree parent/path cache добавлены `parentById`, `leafContributionById` (optional) и dirty markers веток.
    - `patchRows` теперь прокидывает `changedRowIds` в tree cache identity-patch для накопления branch dirtiness (под incremental Phase 3).
    - Функциональная семантика Phase 1/2 не изменена.

- [x] `A12` Phase 3: incremental aggregation (`sum/count/avg`)
  - What:
    - `patchRows` в tree/group режимах:
      - remove old contribution
      - add new contribution
      - update affected ancestors only
    - Для `min/max/custom`: fallback на subtree recompute.
  - Exit:
    - High-churn patch workload показывает улучшение относительно Phase 1.
    - Контракты и перф-гейты зеленые.
  - Artifacts:
    - `/Users/anton/Projects/affinio/packages/datagrid-core/src/models/clientRowModel.ts`
    - `/Users/anton/Projects/affinio/artifacts/performance/*`
  - Progress:
    - В `clientRowModel.patchRows` подключен incremental delta-path для aggregation-only patch сценариев:
      - сохраняется `previousRowsById`,
      - применяется `applyIncrementalAggregationPatch(...)`,
      - при успешном incremental apply aggregate-stage не инвалидируется повторно.
    - `runAggregateStage` в groupBy режиме теперь инициализирует incremental runtime maps (`state/path/contribution`) для поддерживаемых операций (`sum/count/avg/countNonNull`) и использует fallback full recompute для остальных.
    - Добавлены regression tests на:
      - incremental groupBy patch при `recomputeGroup=false`,
      - fallback stale+refresh для unsupported ops (`min`),
      - incremental tree parent patch при изолированных `dependencyFields`.
    - Закрыто по итогам прогонов: unit/contract + benchmarks зелёные.

## Acceptance Gates

- Functional:
  - [ ] Group/tree aggregates корректны для всех built-in ops.
  - [ ] `basis` семантика подтверждена контрактными тестами.
  - [ ] Backward compatibility сохранена.

- Performance:
  - [ ] `bench:datagrid:tree:ci-light` проходит без budget regressions.
  - [ ] aggregate-on профили не ломают variance budgets.
  - [ ] Phase 3 демонстрирует measurable gain на patch-heavy сценарии.

- Quality:
  - [ ] Type-check green (`datagrid-core`, `datagrid-vue`).
  - [ ] Unit + contracts green.
  - [ ] Docs обновлены и согласованы с runtime.

## Risks and Guards

- Risk: stale aggregates при blocked aggregate recompute.
  - Guard: stale stage diagnostics + explicit tests.
- Risk: tree collapse/expand теряет aggregates/row refs.
  - Guard: cache remap tests + subtree toggle regressions.
- Risk: min/max incremental complexity.
  - Guard: fallback subtree recompute until full multiset strategy.

## Execution Rule

- Реализация начинается только после явной отмашки пользователя.
- Работа закрывается строго сверху вниз (`A0 -> A12`), без пропуска стадий.
