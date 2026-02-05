<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Affino Menu · Livewire</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
            rel="stylesheet"
        />

        @livewireStyles

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>{!! file_get_contents(resource_path('css/menus.css')) !!}</style>
            <style>{!! file_get_contents(resource_path('css/vue-shell.css')) !!}</style>
        @endif
    </head>
    <body class="menu-layout">
        <div class="app-shell">
            <header class="app-shell__header">
                @include('layouts.partials.demo-nav')
            </header>

            <main class="app-shell__main" aria-live="polite">
                <div class="app-shell__content">
                    @yield('content')
                </div>
            </main>

            <footer class="app-shell__footer app-footer">
                <div class="app-footer__content">
                    <p class="app-footer__copy">© 2025 Affino · Laravel reference adapters</p>
                </div>
            </footer>
        </div>

        <aside
            class="overlay-panel overlay-panel--menu"
            data-overlay-panel
            data-overlay-panel-collapsed="false"
            data-overlay-panel-empty="Stack is idle. Trigger any menu to populate it."
            hidden
            aria-live="polite"
        >
            <button
                type="button"
                class="overlay-panel__toggle"
                data-overlay-panel-toggle
                data-overlay-panel-toggle-show="Show stack"
                data-overlay-panel-toggle-hide="Hide stack"
                aria-expanded="true"
            >
                <span class="overlay-panel__dot" data-overlay-panel-dot data-active="false" aria-hidden="true"></span>
                <span>Overlay kernel · <span data-overlay-panel-count>0</span></span>
            </button>

            <div class="overlay-panel__body">
                <p class="overlay-panel__hint">Live stack from @affino/overlay-kernel</p>
                <ul class="overlay-panel__list" data-overlay-panel-list aria-live="polite">
                    <li class="overlay-panel__empty">Stack is idle. Trigger any menu to populate it.</li>
                </ul>
            </div>
        </aside>

        @livewireScripts
    </body>
</html>
