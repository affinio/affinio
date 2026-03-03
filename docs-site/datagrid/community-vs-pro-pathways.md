---
title: Community vs Pro Pathways
---

# Community vs Pro Pathways

Use this page as a quick routing guide.

## Decision table

| Need | Community | Pro |
| --- | --- | --- |
| Basic client grid (sort/filter/pagination) | ✅ | ✅ |
| Grouping / tree / aggregation | ❌ | ✅ |
| Pivot model + layout import/export | ❌ | ✅ |
| Worker-owned compute mode | ❌ | ✅ |
| Server/data-source row models | ❌ | ✅ |
| Backpressure controls | ❌ | ✅ |

## Runtime pathway

1. Start with `@affino/datagrid` (community mode).
2. Measure workload under realistic data and interaction pressure.
3. If blocked by pro domains, enable `@affino/datagrid-pro`.

## Benchmark-oriented hint

Representative pressure trend from internal matrix:

| Dataset | Worker-owned vs main-thread end-to-end |
| --- | --- |
| 20k rows | ~5.4x faster |
| 100k rows | ~1.6x faster |
| 200k rows | ~1.34x faster |

Interpretation:

- For small/simple workloads, community main-thread mode is usually enough.
- For heavy patch/edit/group/filter pressure, pro worker mode materially improves responsiveness.
- For backend-owned query shaping, move to pro server/data-source models.
