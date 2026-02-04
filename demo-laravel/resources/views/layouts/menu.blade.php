<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Affino Menu · Livewire</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=general-sans:400,500,600" rel="stylesheet" />

        @livewireStyles

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>{!! file_get_contents(resource_path('css/menus.css')) !!}</style>
        @endif
    </head>
    <body class="menu-body">
        <main class="menu-shell">
            @include('layouts.partials.demo-nav')

            <section
                class="overlay-panel overlay-panel--menu"
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
                                    Menu stack · <span data-overlay-panel-count>0</span>
                                </h2>
                                <p class="overlay-panel__copy">
                                    Pin the hero menu or dive into the cascade and watch every surface register with the shared manager.
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
                    <li class="overlay-panel__empty">Stack is idle. Trigger any menu to populate it.</li>
                </ol>
            </section>

            @yield('content')
        </main>

        @livewireScripts
    </body>
</html>
