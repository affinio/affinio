@php
    $components = [
        [
            'value' => 'tabs',
            'name' => 'Tabs',
            'path' => '/tabs',
            'description' => 'Headless navigation contract mirrored across stacks.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/tabs-core',
        ],
        [
            'value' => 'disclosure',
            'name' => 'Disclosure',
            'path' => '/disclosure',
            'description' => 'Single-trigger reveals that keep dataset state in sync.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/disclosure-core',
        ],
        [
            'value' => 'listbox',
            'name' => 'Listbox',
            'path' => '/listbox',
            'description' => 'Dataset-driven selects that mirror Livewire + Vue markup.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/listbox-core',
        ],
        [
            'value' => 'combobox',
            'name' => 'Combobox',
            'path' => '/combobox',
            'description' => 'Searchable command palettes that hydrate Livewire inputs.',
            'status' => 'Beta',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/combobox-core',
        ],
        [
            'value' => 'menus',
            'name' => 'Menus',
            'path' => '/menus',
            'description' => 'Hierarchical overlays for denser operator flows.',
            'status' => 'Beta',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/menu-core',
        ],
        [
            'value' => 'popovers',
            'name' => 'Popovers',
            'path' => '/popovers',
            'description' => 'Anchored surfaces that pin diagnostics to any trigger.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/popover-core',
        ],
        [
            'value' => 'dialogs',
            'name' => 'Dialogs',
            'path' => '/dialogs',
            'description' => 'Escalation surface when disclosures are not enough.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/dialog-core',
        ],
        [
            'value' => 'tooltips',
            'name' => 'Tooltips',
            'path' => '/tooltips',
            'description' => 'Intent-driven hints layered on top of any primitive.',
            'status' => 'Preview',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/tooltip-core',
        ],
        [
            'value' => 'overlay-kernel',
            'name' => 'Overlay kernel',
            'path' => '/overlay-kernel',
            'description' => 'Document manager that coordinates every stacked surface.',
            'status' => 'Stable',
            'href' => 'https://github.com/affinio/affinio/tree/main/packages/overlay-kernel',
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Affino · Laravel layout</title>
        <meta name="description" content="Affino core-first UI primitives running inside Livewire." />
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @livewireStyles
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="app-body">
        <div class="app-shell">
            <header class="app-header">
                <div class="app-header__top">
                    <div class="app-header__brand">
                        <div class="app-header__title">
                            <h1>Affino Core</h1>
                            <span class="app-header__version" data-affino-version>v—</span>
                        </div>
                        <p>
                            Core-first UI primitives orchestrated by Livewire. This demo is a working showroom; documentation lives on a separate domain.
                        </p>
                    </div>
                    <div class="app-header__actions">
                        <a
                            class="app-header__github"
                            href="https://github.com/affinio/affinio"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Affinio on GitHub"
                            title="Affinio on GitHub"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M12 2C6.477 2 2 6.58 2 12.239c0 4.51 2.865 8.328 6.839 9.678.5.095.682-.223.682-.494 0-.244-.009-.892-.014-1.751-2.782.62-3.369-1.379-3.369-1.379-.454-1.183-1.109-1.498-1.109-1.498-.907-.64.069-.627.069-.627 1.003.072 1.531 1.058 1.531 1.058.892 1.567 2.341 1.115 2.91.853.091-.666.349-1.115.635-1.372-2.221-.26-4.555-1.141-4.555-5.077 0-1.122.39-2.04 1.029-2.759-.103-.26-.446-1.309.098-2.727 0 0 .84-.276 2.75 1.054A9.44 9.44 0 0 1 12 6.844c.85.004 1.705.118 2.504.346 1.909-1.33 2.747-1.054 2.747-1.054.546 1.418.202 2.467.099 2.727.64.72 1.028 1.637 1.028 2.759 0 3.946-2.338 4.814-4.566 5.069.359.317.679.943.679 1.9 0 1.372-.012 2.479-.012 2.817 0 .273.18.594.688.493C19.138 20.563 22 16.747 22 12.239 22 6.58 17.523 2 12 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
                <livewire:header.navigation :components="$components" />
            </header>

            <main class="app-main">
                <section class="app-hero" aria-label="Project overview">
                    <p class="eyebrow">Livewire demo</p>
                    <h2>Core-first primitives, fully wired in Livewire</h2>
                    <p>
                        Every component here is powered by the Affino core packages and then surfaced through Livewire
                        adapters. This keeps the demo grounded in the core stack while proving everything runs cleanly
                        inside Laravel.
                    </p>
                </section>

                <section class="component-grid" aria-label="Components">
                    @foreach($components as $componentItem)
                        <article id="{{ $componentItem['value'] }}" class="component-card">
                            <div class="component-card__head">
                                <h3>{{ $componentItem['name'] }}</h3>
                                <x-status-badge :status="$componentItem['status']" />
                            </div>
                            <p>{{ $componentItem['description'] }}</p>
                            <a class="component-card__link" href="{{ $componentItem['href'] }}" target="_blank" rel="noopener noreferrer">
                                View core package
                            </a>
                        </article>
                    @endforeach
                </section>
            </main>

            <footer class="app-footer">
                <span>© {{ date('Y') }} Affino. Laravel demo layout.</span>
            </footer>
        </div>

        <livewire:overlay.kernel-panel />
        @livewireScripts
    </body>
</html>
