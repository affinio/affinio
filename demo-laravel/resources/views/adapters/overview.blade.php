@php
    $primaryActions = [
        ['label' => 'Invite collaborator', 'description' => 'Send a review link', 'shortcut' => 'I'],
        ['label' => 'Duplicate', 'description' => 'Clone layout + bindings', 'shortcut' => '⇧⌘D'],
        ['label' => 'Share preview', 'description' => 'Copy signed URL', 'shortcut' => 'S'],
    ];

    $secondaryActions = [
        ['label' => 'Archive', 'description' => 'Freeze analytics – keep data', 'shortcut' => 'A'],
        ['label' => 'Delete', 'description' => 'Remove project forever', 'shortcut' => '⌘⌫', 'danger' => true],
    ];

    $advancedCards = [
        ['label' => 'Menu stacks', 'title' => 'Menus', 'description' => 'Pointer intent, nested panels, automation logs.', 'href' => '/livewire/menus'],
        ['label' => 'Dialogs', 'title' => 'Dialogs', 'description' => 'Guards, optimistic closes, swipe-to-dismiss.', 'href' => '/livewire/dialogs'],
        ['label' => 'Popovers', 'title' => 'Popovers', 'description' => 'Filters, snooze labs, scroll guards.', 'href' => '/livewire/popovers'],
        ['label' => 'Tooltips', 'title' => 'Tooltips', 'description' => 'Hover + focus timers with Livewire telemetry.', 'href' => '/livewire/tooltips'],
        ['label' => 'Combobox + Listbox', 'title' => 'Selects', 'description' => 'Deterministic keyboard + pointer selection.', 'href' => '/livewire/selects'],
        ['label' => 'Disclosures', 'title' => 'Disclosures', 'description' => 'Single trigger reveal surfaces with shared logs.', 'href' => '/disclosures'],
        ['label' => 'Tabs', 'title' => 'Tabs', 'description' => 'Headless context switching for dashboards.', 'href' => '/tabs'],
        ['label' => 'Docs', 'title' => 'Adapter README', 'description' => 'Open the GitHub guide for runtime options.', 'href' => 'https://github.com/affinio/affinio/tree/main/packages/laravel-adapter'],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Affino · Laravel adapters</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="adapter-body">
        <main class="adapter-shell">
            <header class="adapter-hero">
                <p class="adapter-hero__eyebrow">Affino adapters</p>
                <h1>Laravel demo mirrors the Vue runtime 1:1</h1>
                <p>
                    The hero below is intentionally tiny: a single menu trigger that uses the same contract as the Vue example.
                    Scroll further only when you need the advanced Livewire pages.
                </p>
                <div class="adapter-hero__actions">
                    <a href="/livewire/menus">View advanced menu demo</a>
                    <a href="https://github.com/affinio/affinio/tree/main/packages/laravel-adapter" target="_blank" rel="noreferrer">
                        Laravel adapter docs
                    </a>
                </div>
            </header>

            <section class="adapter-demo-grid">
                <article class="adapter-demo-card">
                    <div>
                        <p class="adapter-hero__eyebrow">Simple example</p>
                        <h2>Gradient trigger · glassy surface</h2>
                        <p>The new adapter bootstraps once and keeps the handle on <code>root.affinoMenu</code>.</p>
                    </div>

                    <div
                        class="adapter-menu"
                        data-affino-menu-root="adapter-demo-menu"
                        data-affino-menu-placement="bottom"
                        data-affino-menu-align="start"
                        data-affino-menu-open-delay="80"
                        data-affino-menu-close-delay="120"
                        data-affino-menu-gutter="10"
                        data-affino-menu-portal="inline"
                    >
                        <div class="adapter-menu__surface">
                            <button type="button" class="adapter-menu__trigger" data-affino-menu-trigger>
                                Open Livewire menu
                            </button>

                            <div class="adapter-menu__panel" data-affino-menu-panel role="menu" hidden>
                                <p class="adapter-menu__label">Project</p>
                                <div class="adapter-menu__items">
                                    @foreach ($primaryActions as $action)
                                        <button
                                            type="button"
                                            class="adapter-menu__item"
                                            data-affino-menu-item
                                            data-adapter-action="{{ $action['label'] }}"
                                        >
                                            <span>
                                                <strong>{{ $action['label'] }}</strong>
                                                <small>{{ $action['description'] }}</small>
                                            </span>
                                            <span class="adapter-menu__shortcut">{{ $action['shortcut'] }}</span>
                                        </button>
                                    @endforeach
                                </div>

                                <hr />

                                <div class="adapter-menu__items">
                                    @foreach ($secondaryActions as $action)
                                        <button
                                            type="button"
                                            class="adapter-menu__item {{ ($action['danger'] ?? false) ? 'is-danger' : '' }}"
                                            data-affino-menu-item
                                            data-adapter-action="{{ $action['label'] }}"
                                        >
                                            <span>
                                                <strong>{{ $action['label'] }}</strong>
                                                <small>{{ $action['description'] }}</small>
                                            </span>
                                            <span class="adapter-menu__shortcut">{{ $action['shortcut'] }}</span>
                                        </button>
                                    @endforeach
                                </div>
                            </div>
                        </div>

                        <dl class="adapter-log">
                            <dt>Last action</dt>
                            <dd data-adapter-log>Nothing yet</dd>
                        </dl>
                    </div>
                </article>

                <article class="adapter-code-card">
                    <p>Bootstrap once per request</p>
<pre>import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters({
    registerScrollGuards: true,
    diagnostics: import.meta.env.DEV,
})</pre>
                </article>
            </section>

            <section class="adapter-advanced">
                <header>
                    <p>Advanced flows</p>
                    <h2>Jump into the bigger Livewire pages only when needed</h2>
                    <p>The cards reuse the same adapter contract—menus, dialogs, and tooltips all share the exact manual events.</p>
                </header>

                <div class="adapter-advanced__grid">
                    @foreach ($advancedCards as $card)
                        <a href="{{ $card['href'] }}" class="adapter-advanced__card">
                            <small>{{ $card['label'] }}</small>
                            <strong>{{ $card['title'] }}</strong>
                            <p>{{ $card['description'] }}</p>
                        </a>
                    @endforeach
                </div>
            </section>
        </main>

        <script>
            document.addEventListener("click", (event) => {
                const target = event.target instanceof HTMLElement ? event.target.closest('[data-adapter-action]') : null
                if (!target) return
                const log = document.querySelector('[data-adapter-log]')
                if (log) {
                    log.textContent = target.getAttribute('data-adapter-action') ?? '—'
                }
            })
        </script>
    </body>
</html>
