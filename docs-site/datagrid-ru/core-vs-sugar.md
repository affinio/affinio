---
title: When to use Core vs Sugar
---

# When to use Core vs Sugar

Use Core if:
- нужен собственный слой рендера
- вы вручную контролируете viewport и overlays
- интеграция идёт в не‑Vue runtime
- нужен детерминированный контроль Interaction Orchestration Engine

Use Sugar if:
- вы строите Vue приложение
- нужен быстрый старт
- не нужен прямой доступ к `GridApi`
