<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Affino Dialog · Livewire</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=space-grotesk:400,500,600,700" rel="stylesheet" />

        @livewireStyles

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>
                :root {
                    --dialog-bg: radial-gradient(circle at 20% 0%, rgba(112, 140, 255, 0.25), transparent 60%),
                        radial-gradient(circle at 80% 0%, rgba(0, 255, 224, 0.3), transparent 55%), #050510;
                    --dialog-surface: rgba(10, 12, 24, 0.78);
                    --dialog-card: rgba(9, 9, 18, 0.95);
                    --dialog-border: rgba(255, 255, 255, 0.12);
                    --dialog-border-strong: rgba(255, 255, 255, 0.35);
                    --dialog-text: #f5f6ff;
                    --dialog-muted: rgba(245, 246, 255, 0.7);
                    --dialog-accent: #58f5c6;
                    --dialog-accent-strong: #8b7bff;
                    --dialog-warm: #ffb347;
                    --dialog-font: 'Space Grotesk', ui-sans-serif, system-ui;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: var(--dialog-font);
                }

                .dialog-demo-body {
                    min-height: 100vh;
                    background: var(--dialog-bg);
                    color: var(--dialog-text);
                    padding: 2.5rem 1.5rem 3rem;
                    display: flex;
                    justify-content: center;
                }

                .dialog-demo-shell {
                    width: min(1200px, 100%);
                    display: grid;
                    gap: 2.5rem;
                }

                .dialog-hero {
                    display: grid;
                    gap: 1rem;
                    text-align: left;
                }

                .dialog-hero__eyebrow {
                    font-size: 0.78rem;
                    letter-spacing: 0.35em;
                    text-transform: uppercase;
                    color: var(--dialog-muted);
                    margin: 0;
                }

                .dialog-hero h1 {
                    margin: 0;
                    font-size: clamp(2.5rem, 5vw, 3.6rem);
                }

                .dialog-hero p {
                    margin: 0;
                    font-size: 1.05rem;
                    color: var(--dialog-muted);
                    line-height: 1.6;
                }

                .dialog-hero__cta {
                    display: inline-flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    align-items: center;
                    border-radius: 999px;
                    border: 1px solid var(--dialog-border);
                    padding: 0.85rem 1.35rem;
                    background: rgba(255, 255, 255, 0.03);
                    font-size: 0.9rem;
                }

                .dialog-hero__badge {
                    border-radius: 999px;
                    padding: 0.4rem 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: linear-gradient(120deg, var(--dialog-accent), var(--dialog-accent-strong));
                    color: #051518;
                }

                .dialog-showcase {
                    display: grid;
                    gap: 1.75rem;
                }

                .dialog-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                }

                .dialog-card {
                    border-radius: 1.6rem;
                    border: 1px solid var(--dialog-border);
                    background: var(--dialog-card);
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    box-shadow: 0 35px 70px rgba(5, 6, 20, 0.45);
                }

                .dialog-card--spotlight {
                    grid-column: 1 / -1;
                    background: linear-gradient(160deg, rgba(28, 28, 46, 0.95), rgba(16, 18, 36, 0.92));
                }

                .dialog-card__eyebrow {
                    text-transform: uppercase;
                    letter-spacing: 0.35em;
                    font-size: 0.74rem;
                    color: var(--dialog-muted);
                    margin: 0;
                }

                .dialog-card__title {
                    margin: 0;
                    font-size: 1.75rem;
                }

                .dialog-card__text {
                    margin: 0;
                    color: var(--dialog-muted);
                    line-height: 1.7;
                }

                .dialog-trigger {
                    border-radius: 0.9rem;
                    border: 1px solid var(--dialog-border-strong);
                    padding: 0.8rem 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--dialog-text);
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: inline-flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .dialog-trigger__pulse {
                    width: 0.6rem;
                    height: 0.6rem;
                    border-radius: 999px;
                    background: var(--dialog-accent);
                    box-shadow: 0 0 0 8px rgba(88, 245, 198, 0.15);
                }

                .dialog-panel {
                    min-width: clamp(320px, 70vw, 540px);
                    max-width: 560px;
                    padding: 1.5rem;
                    border-radius: 1.25rem;
                    border: 1px solid var(--dialog-border);
                    background: rgba(9, 11, 24, 0.92);
                    display: flex;
                    flex-direction: column;
                    gap: 1.1rem;
                }

                .dialog-panel__header {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .dialog-panel__title {
                    margin: 0;
                    font-size: 1.35rem;
                }

                .dialog-panel__meta {
                    font-size: 0.82rem;
                    color: var(--dialog-muted);
                    margin: 0;
                }

                [data-affino-dialog-overlay] {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: clamp(1rem, 3vw, 2.5rem);
                    z-index: 60;
                    background: rgba(5, 7, 16, 0.65);
                    opacity: 0;
                    pointer-events: auto;
                    transition: opacity 0.25s ease;
                }

                [data-affino-dialog-overlay][data-state='opening'],
                [data-affino-dialog-overlay][data-state='open'] {
                    opacity: 1;
                }

                [data-affino-dialog-overlay][hidden],
                [data-affino-dialog-overlay][data-state='closed'] {
                    pointer-events: none;
                }

                [data-affino-dialog-surface] {
                    box-shadow: 0 45px 90px rgba(5, 6, 20, 0.55);
                    transform-origin: center;
                    transition: transform 0.25s ease, opacity 0.25s ease;
                }

                [data-affino-dialog-overlay][data-state='opening'] [data-affino-dialog-surface],
                [data-affino-dialog-overlay][data-state='open'] [data-affino-dialog-surface] {
                    opacity: 1;
                    transform: translateY(0);
                }

                [data-affino-dialog-overlay][data-state='closing'] [data-affino-dialog-surface] {
                    opacity: 0;
                    transform: translateY(12px);
                }

                [data-affino-dialog-overlay][data-state='closed'] [data-affino-dialog-surface] {
                    opacity: 0;
                    transform: translateY(16px);
                }

                .dialog-badge {
                    border-radius: 999px;
                    padding: 0.35rem 0.8rem;
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid var(--dialog-border);
                }

                .dialog-button {
                    border-radius: 0.85rem;
                    border: 1px solid var(--dialog-border-strong);
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--dialog-text);
                    font-weight: 600;
                    padding: 0.65rem 1.1rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .dialog-button--ghost {
                    background: transparent;
                    border-color: rgba(255, 255, 255, 0.25);
                    color: var(--dialog-muted);
                }

                .dialog-button--accent {
                    background: linear-gradient(120deg, var(--dialog-accent), var(--dialog-accent-strong));
                    border-color: transparent;
                    color: #04100b;
                }

                .dialog-button--mono {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    font-size: 0.8rem;
                    letter-spacing: 0.1em;
                }

                .dialog-timeline {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 0.65rem;
                }

                .dialog-timeline__item {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.9rem;
                    padding: 0.65rem 0.9rem;
                    border-radius: 0.95rem;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px dashed rgba(255, 255, 255, 0.12);
                }

                .dialog-timeline__meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .dialog-timeline__label {
                    margin: 0;
                    font-weight: 600;
                }

                .dialog-timeline__detail {
                    margin: 0;
                    color: var(--dialog-muted);
                    font-size: 0.85rem;
                }

                .dialog-pill {
                    border-radius: 999px;
                    border: 1px solid var(--dialog-border);
                    padding: 0.25rem 0.85rem;
                    font-size: 0.8rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .dialog-panel__grid {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                }

                .dialog-checklist {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 0.65rem;
                }

                .dialog-checklist li {
                    border-radius: 0.9rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 0.7rem 0.9rem;
                    display: flex;
                    justify-content: space-between;
                    gap: 0.5rem;
                }

                .dialog-journeys {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                }

                .dialog-journeys__tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .dialog-journeys__tab {
                    border-radius: 0.75rem;
                    border: 1px solid transparent;
                    padding: 0.4rem 0.9rem;
                    background: rgba(255, 255, 255, 0.04);
                    color: var(--dialog-text);
                    font-size: 0.85rem;
                }

                .dialog-journeys__tab.is-active {
                    border-color: var(--dialog-accent);
                    color: var(--dialog-accent);
                    background: rgba(88, 245, 198, 0.08);
                }

                .dialog-sheet {
                    min-width: clamp(320px, 55vw, 420px);
                    padding: 1.25rem;
                    border-radius: 1.1rem;
                    border: 1px solid var(--dialog-border);
                    background: rgba(5, 6, 16, 0.95);
                }

                .dialog-sheet__list {
                    list-style: none;
                    margin: 1rem 0 0;
                    padding: 0;
                    display: grid;
                    gap: 0.65rem;
                }

                .dialog-sheet__list li {
                    border-radius: 0.9rem;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    padding: 0.7rem 0.9rem;
                    font-size: 0.9rem;
                }

                .dialog-manual-anchor {
                    border-radius: 1.1rem;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    font-size: 0.9rem;
                }

                .dialog-manual-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    align-items: center;
                }

                .dialog-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.85rem;
                    color: var(--dialog-muted);
                }

                .dialog-note {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--dialog-muted);
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    border: 0;
                }

                @media (min-width: 768px) {
                    .dialog-demo-body {
                        padding: 3.5rem;
                    }
                }
            </style>
        @endif
    </head>
    <body class="dialog-demo-body">
        <main class="dialog-demo-shell">
            <header class="dialog-hero">
                <p class="dialog-hero__eyebrow">Surface Core</p>
                <h1>Dialogs orchestrated for Livewire</h1>
                <p>
                    `@affino/dialog-laravel` keeps modal surfaces predictable while Livewire mutates the DOM. Scroll locking,
                    teleportation, manual controllers, and focus guards all ride on the shared dialog-core runtime, so you stay in
                    Blade while the helper handles hydration.
                </p>
                <div class="dialog-hero__cta">
                    <span class="dialog-hero__badge">Livewire ready</span>
                    <span>Open, close, or stack dialogs with CustomEvents – the helper rebinds after every morph.</span>
                </div>
            </header>

            @include('layouts.partials.demo-nav')

            @yield('content')
        </main>

        @livewireScripts
    </body>
</html>
