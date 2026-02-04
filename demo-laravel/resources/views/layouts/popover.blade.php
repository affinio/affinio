<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Affino Popover · Livewire</title>

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

                .demo-stack-nav {
                    display: grid;
                    gap: 1rem;
                    border: 1px solid var(--tooltip-border);
                    border-radius: 1.5rem;
                    padding: 1rem;
                    background: rgba(5, 6, 12, 0.65);
                }

                .demo-stack-nav__group {
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 1.25rem;
                    padding: 1rem 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .demo-stack-nav__group.is-active {
                    border-color: var(--tooltip-accent);
                    background: rgba(248, 184, 3, 0.08);
                    box-shadow: 0 0 0 1px rgba(248, 184, 3, 0.2);
                }

                .demo-stack-nav__header {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .demo-stack-nav__title {
                    margin: 0;
                    font-size: 0.75rem;
                    letter-spacing: 0.32em;
                    text-transform: uppercase;
                    color: var(--tooltip-text-soft);
                }

                .demo-stack-nav__subtitle {
                    color: rgba(247, 248, 255, 0.6);
                    font-size: 0.8rem;
                }

                .demo-stack-nav__list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .demo-stack-nav__link {
                    border-radius: 0.9rem;
                    border: 1px solid transparent;
                    padding: 0.4rem 1rem;
                    color: var(--tooltip-text);
                    text-decoration: none;
                    font-size: 0.82rem;
                    background: rgba(255, 255, 255, 0.04);
                    transition: border-color 0.2s ease, background 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .demo-stack-nav__link:hover {
                    border-color: var(--tooltip-border);
                    background: rgba(255, 255, 255, 0.07);
                }

                .demo-stack-nav__link.is-active {
                    border-color: var(--tooltip-accent);
                    background: rgba(248, 184, 3, 0.12);
                    color: var(--tooltip-accent-strong);
                }

                @media (min-width: 768px) {
                    .demo-stack-nav {
                        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    }
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

                .popover-showcase {
                    gap: 2rem;
                }

                .popover-grid {
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                }

                .popover-bubble {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                }

                .popover-bubble__title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin: 0;
                }

                .popover-bubble__body {
                    margin: 0;
                    color: var(--tooltip-text-soft);
                    font-size: 0.85rem;
                    line-height: 1.5;
                }

                .popover-bubble__cta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.65rem;
                }

                .popover-bubble__list {
                    margin: 0;
                    padding-left: 1.25rem;
                    color: var(--tooltip-text-soft);
                    font-size: 0.82rem;
                    display: grid;
                    gap: 0.3rem;
                }

                .popover-bubble__ordered {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    gap: 0.45rem;
                }

                .popover-bubble__ordered li {
                    display: flex;
                    gap: 0.75rem;
                    align-items: flex-start;
                    color: var(--tooltip-text-soft);
                }

                .popover-bubble__ordered li span {
                    width: 1.75rem;
                    height: 1.75rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                }

                .popover-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .popover-trigger {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 0.75rem;
                    border-radius: 1rem;
                    border: 1px solid var(--tooltip-border);
                    padding: 0.85rem 1rem;
                    background: rgba(255, 255, 255, 0.04);
                    color: var(--tooltip-text);
                    text-align: left;
                }

                .popover-trigger small {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--tooltip-text-soft);
                }

                .popover-trigger__label {
                    font-weight: 600;
                    display: block;
                    margin-bottom: 0.15rem;
                }

                .popover-pill {
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    padding: 0.25rem 0.85rem;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .popover-row__actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 0.4rem;
                }

                .popover-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .popover-journey {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .popover-journey h3 {
                    margin: 0;
                }

                .popover-journey__eyebrow {
                    text-transform: uppercase;
                    letter-spacing: 0.25em;
                    font-size: 0.7rem;
                    margin: 0 0 0.35rem;
                    color: var(--tooltip-text-soft);
                }

                .popover-modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }

                .popover-modal {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                }

                .popover-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                }

                .popover-form label {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    font-size: 0.8rem;
                }

                .popover-form input,
                .popover-form textarea {
                    border-radius: 0.85rem;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    background: rgba(5, 6, 12, 0.55);
                    color: var(--tooltip-text);
                    padding: 0.6rem 0.8rem;
                    font-family: inherit;
                }

                .popover-stack {
                    list-style: none;
                    margin: 0 0 1rem;
                    padding: 0;
                    display: grid;
                    gap: 0.75rem;
                }

                .popover-stack__row {
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 0.9rem;
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 0.65rem;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.03);
                }

                .popover-stack__meta p {
                    margin: 0;
                    font-weight: 600;
                }

                .popover-stack__meta small {
                    color: var(--tooltip-text-soft);
                }

                .popover-runtime {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    font-size: 0.8rem;
                    color: var(--tooltip-text-soft);
                }

                .popover-matrix {
                    display: grid;
                    gap: 1.25rem;
                }

                .popover-matrix__group ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 0.75rem;
                }

                .popover-matrix__title {
                    margin: 0 0 0.5rem;
                    font-size: 0.85rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--tooltip-text-soft);
                }

                .popover-matrix__row {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.65rem;
                    align-items: center;
                }

                [data-affino-popover-content] {
                    position: fixed;
                    min-width: 240px;
                    max-width: 360px;
                    padding: 1rem 1.15rem;
                    border-radius: 1.25rem;
                    border: 1px solid var(--tooltip-border);
                    background: rgba(5, 6, 12, 0.97);
                    box-shadow: 0 28px 60px rgba(5, 6, 12, 0.55);
                    color: var(--tooltip-text);
                    z-index: 50;
                }

                [data-affino-popover-content][hidden] {
                    display: none !important;
                }

                [data-affino-popover-arrow] {
                    position: absolute;
                    width: var(--popover-arrow-size, 16px);
                    height: var(--popover-arrow-size, 16px);
                    pointer-events: none;
                }

                [data-affino-popover-arrow]::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(5, 6, 12, 0.97);
                    border: 1px solid var(--tooltip-border);
                    transform: rotate(45deg);
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
                <h1>Popovers anchored to Livewire</h1>
                <p>
                    The <code>@affino/popover-laravel</code> adapter keeps SurfaceCore positioning, focus, and modal guards
                    intact even as Livewire morphs the DOM. These scenarios render as Livewire components, then re-hydrate
                    each popover after dataset swaps, pagination, and wire:navigate transitions.
                </p>
                <div class="tooltip-hero__cta">
                    <span class="tooltip-hero__badge">Surface-aware</span>
                    <span>Popovers stay aligned while scroll locking, pinning, and manual flows remain deterministic.</span>
                </div>
            </header>
            <section
                class="overlay-panel overlay-panel--popover"
                data-overlay-panel
                data-overlay-panel-collapsed="false"
                hidden
                aria-live="polite"
            >
                <div class="overlay-panel__header">
                    <div>
                        <p class="overlay-panel__eyebrow">Overlay kernel</p>
                        <div class="overlay-panel__signal">
                            <span class="overlay-panel__dot" data-overlay-panel-dot data-active="false" aria-hidden="true"></span>
                            <div>
                                <h2 class="overlay-panel__title">
                                    Popover stack · <span data-overlay-panel-count>0</span>
                                </h2>
                                <p class="overlay-panel__copy">
                                    Every flyout that mounts through SurfaceCore shows up here, so Livewire morphs never hide what the kernel is tracking.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="overlay-panel__toggle"
                        data-overlay-panel-toggle
                        aria-controls="overlay-panel-list"
                        aria-expanded="true"
                    >
                        Hide stack
                    </button>
                </div>

                <ol id="overlay-panel-list" class="overlay-panel__list" data-overlay-panel-list aria-live="polite">
                    <li class="overlay-panel__empty">Stack is idle. Trigger any popover to populate it.</li>
                </ol>
            </section>

            @include('layouts.partials.demo-nav')

            @yield('content')
        </main>

        @livewireScripts
    </body>
</html>
