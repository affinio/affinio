<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Affino Tooltip · Livewire</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @livewireStyles

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>
                :root {
                    --tooltip-demo-bg: radial-gradient(circle at 20% -10%, rgba(248, 184, 3, 0.25), transparent 55%),
                        radial-gradient(circle at 80% 0%, rgba(108, 92, 231, 0.4), transparent 60%), #05060a;
                    --tooltip-card-bg: rgba(9, 11, 18, 0.92);
                    --tooltip-border: rgba(255, 255, 255, 0.12);
                    --tooltip-text: #f7f8ff;
                    --tooltip-text-soft: rgba(247, 248, 255, 0.75);
                    --tooltip-accent: #f8b803;
                    --tooltip-accent-strong: #ffe49a;
                    font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                }

                body {
                    margin: 0;
                }

                .tooltip-demo-body {
                    font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                    background: var(--tooltip-demo-bg);
                    color: var(--tooltip-text);
                    min-height: 100vh;
                    margin: 0;
                    padding: 2.5rem 1.5rem 3rem;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }

                .tooltip-demo-shell {
                    width: min(1100px, 100%);
                    display: grid;
                    gap: 2.5rem;
                }

                .tooltip-hero {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                    text-align: left;
                }

                .tooltip-hero__eyebrow {
                    font-size: 0.75rem;
                    letter-spacing: 0.35em;
                    text-transform: uppercase;
                    color: var(--tooltip-text-soft);
                    margin: 0;
                }

                .tooltip-hero h1 {
                    font-size: clamp(2rem, 5vw, 3.4rem);
                    margin: 0;
                }

                .tooltip-hero p {
                    margin: 0;
                    color: var(--tooltip-text-soft);
                    line-height: 1.6;
                    max-width: 720px;
                }

                .tooltip-hero__cta {
                    display: inline-flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1.25rem;
                    border-radius: 999px;
                    border: 1px solid var(--tooltip-border);
                    background: rgba(255, 255, 255, 0.04);
                    font-size: 0.9rem;
                }

                .tooltip-hero__badge {
                    border-radius: 999px;
                    background: linear-gradient(120deg, var(--tooltip-accent), var(--tooltip-accent-strong));
                    color: #05060a;
                    font-weight: 600;
                    padding: 0.35rem 0.95rem;
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .tooltip-nav {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    border: 1px solid var(--tooltip-border);
                    border-radius: 999px;
                    padding: 0.65rem;
                    background: rgba(5, 6, 12, 0.65);
                }

                .tooltip-nav a {
                    color: var(--tooltip-text);
                    text-decoration: none;
                    font-size: 0.85rem;
                    padding: 0.4rem 1.1rem;
                    border-radius: 999px;
                    border: 1px solid transparent;
                    transition: background 0.2s ease, border-color 0.2s ease;
                }

                .tooltip-nav a:hover {
                    border-color: var(--tooltip-border);
                    background: rgba(255, 255, 255, 0.05);
                }

                .tooltip-nav a.is-active {
                    border-color: var(--tooltip-accent);
                    background: rgba(248, 184, 3, 0.12);
                    color: var(--tooltip-accent-strong);
                }

                .tooltip-demo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.75rem;
                }

                .tooltip-card {
                    border-radius: 1.5rem;
                    border: 1px solid var(--tooltip-border);
                    background: var(--tooltip-card-bg);
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    min-height: 100%;
                    box-shadow: 0 22px 50px rgba(5, 6, 12, 0.55);
                }

                .tooltip-card__eyebrow {
                    font-size: 0.65rem;
                    letter-spacing: 0.32em;
                    text-transform: uppercase;
                    color: var(--tooltip-text-soft);
                    margin: 0;
                }

                .tooltip-card__title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0;
                }

                .tooltip-card__text {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--tooltip-text-soft);
                    line-height: 1.6;
                }

                .tooltip-card__actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .tooltip-button {
                    border-radius: 0.95rem;
                    border: 1px solid var(--tooltip-border);
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--tooltip-text);
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 0.5rem 1.1rem;
                    cursor: pointer;
                    transition: background 0.15s ease, border 0.15s ease;
                }

                .tooltip-button:hover {
                    background: rgba(255, 255, 255, 0.12);
                }

                .tooltip-button--ghost {
                    background: transparent;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .tooltip-stage {
                    position: relative;
                    border-radius: 1.25rem;
                    border: 1px dashed rgba(255, 255, 255, 0.25);
                    padding: 2.25rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 220px;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
                }

                .tooltip-stage--left {
                    justify-content: flex-start;
                }

                .tooltip-stage [data-affino-tooltip-root] {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                [data-affino-tooltip-surface] {
                    position: fixed;
                    min-width: 220px;
                    max-width: 280px;
                    padding: 0.95rem 1.1rem;
                    border-radius: 1rem;
                    border: 1px solid var(--tooltip-border);
                    background: rgba(5, 6, 12, 0.95);
                    box-shadow: 0 24px 48px rgba(5, 6, 12, 0.55);
                    text-align: left;
                    z-index: 40;
                    pointer-events: auto;
                    color: var(--tooltip-text);
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                [data-affino-tooltip-surface]::after {
                    content: '';
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: inherit;
                    border: 1px solid var(--tooltip-border);
                    transform: rotate(45deg);
                    z-index: -1;
                }

                [data-affino-tooltip-surface][data-placement='top']::after {
                    left: 50%;
                    bottom: -6px;
                    translate: -50% 0;
                    border-top: none;
                    border-left: none;
                }

                .tooltip-trigger {
                    border-radius: 999px;
                    border: 1px solid var(--tooltip-border);
                    padding: 0.7rem 1.8rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    background: linear-gradient(120deg, var(--tooltip-accent), var(--tooltip-accent-strong));
                    color: #05060a;
                    box-shadow: 0 16px 32px rgba(8, 10, 16, 0.45);
                    cursor: pointer;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }

                .tooltip-trigger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 22px 38px rgba(8, 10, 16, 0.35);
                }

                .tooltip-trigger--ghost {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--tooltip-text);
                }

                .tooltip-trigger--minimal {
                    width: 100%;
                    justify-content: space-between;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1.1rem;
                    border-radius: 0.85rem;
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--tooltip-text);
                }

                .tooltip-bubble {
                    margin: 0;
                }

                .tooltip-bubble__title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin: 0 0 0.2rem;
                }

                .tooltip-bubble__body {
                    font-size: 0.82rem;
                    color: var(--tooltip-text-soft);
                    margin: 0;
                }

                .tooltip-bubble__meta {
                    display: inline-block;
                    margin-top: 0.4rem;
                    font-size: 0.75rem;
                    color: rgba(247, 248, 255, 0.6);
                }

                .tooltip-task-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 0.75rem;
                }

                .tooltip-task {
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 0.95rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.04);
                }

                .tooltip-task-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.75rem;
                    align-items: center;
                }

                .tooltip-task__title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .tooltip-task__meta {
                    margin: 0.2rem 0 0;
                    color: var(--tooltip-text-soft);
                    font-size: 0.8rem;
                }

                .tooltip-task__status {
                    font-size: 0.8rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .tooltip-task__controls {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .tooltip-manual-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    align-items: center;
                }

                .tooltip-manual-toggle {
                    display: inline-flex;
                    gap: 0.35rem;
                    align-items: center;
                    font-size: 0.85rem;
                    color: var(--tooltip-text-soft);
                }

                .tooltip-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                }

                .tooltip-form label {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                }

                .tooltip-form input,
                .tooltip-form textarea {
                    border-radius: 0.9rem;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    background: rgba(5, 6, 12, 0.55);
                    color: var(--tooltip-text);
                    padding: 0.65rem 0.9rem;
                    font-family: inherit;
                    font-size: 0.9rem;
                }

                .tooltip-report-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 0.9rem;
                }

                @media (min-width: 768px) {
                    .tooltip-demo-body {
                        padding: 3.5rem 3rem 4rem;
                    }
                }
            </style>
        @endif
    </head>
    <body class="tooltip-demo-body">
        <main class="tooltip-demo-shell">
            <header class="tooltip-hero">
                <p class="tooltip-hero__eyebrow">Surface Core</p>
                <h1>Tooltips built for Livewire</h1>
                <p>
                    The <code>@affino/tooltip-laravel</code> component reuses the shared SurfaceCore timers so hover, focus,
                    click, and manual semantics survive Livewire morphs. Each section below is rendered as a Livewire
                    component, then re-hydrated after DOM diffs and wire:navigate transitions.
                </p>
                <div class="tooltip-hero__cta">
                    <span class="tooltip-hero__badge">Livewire ready</span>
                    <span>Tooltips stay in sync through component updates, nested renders, and wire:navigate.</span>
                </div>
            </header>

            <nav class="tooltip-nav" aria-label="Livewire demo navigation">
                <a
                    wire:navigate
                    href="{{ route('tooltips.overview') }}"
                    class="{{ request()->routeIs('tooltips.overview') ? 'is-active' : '' }}"
                >Overview</a>
                <a
                    wire:navigate
                    href="{{ route('tooltips.reports') }}"
                    class="{{ request()->routeIs('tooltips.reports') ? 'is-active' : '' }}"
                >Region reports</a>
            </nav>

            @yield('content')
        </main>

        @livewireScripts
    </body>
</html>
