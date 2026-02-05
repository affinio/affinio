@php
    $tabs = [
        [
            'value' => 'overview',
            'label' => 'Overview',
            'metric' => '14 tracks live',
            'summary' => 'Snapshot of docs, overlays, and Livewire components that changed recently.',
            'footnote' => 'Feeds a telemetry log for PMs.',
        ],
        [
            'value' => 'journeys',
            'label' => 'Journeys',
            'metric' => '6 guided flows',
            'summary' => 'Player-style walkthroughs that thread dialogs, menus, and disclosures together.',
            'footnote' => 'Pairs well with overlay kernel diagnostics.',
        ],
        [
            'value' => 'signals',
            'label' => 'Signals',
            'metric' => '24 watchers',
            'summary' => 'Realtime feed for Livewire telemetry and Vue adapter diagnostics.',
            'footnote' => 'Helps triage async incidents.',
        ],
    ];

    $advancedCards = [
        ['label' => 'Disclosures', 'title' => 'Disclosures', 'description' => 'Collapse complex data into a single reveal.', 'href' => '/disclosures'],
        ['label' => 'Menus', 'title' => 'Menus', 'description' => 'Route tabs into nested menus when flows scale.', 'href' => '/livewire/menus'],
        ['label' => 'Tooltips', 'title' => 'Tooltips', 'description' => 'Pair tabs with intent-based tooltips.', 'href' => '/livewire/tooltips'],
        ['label' => 'Docs', 'title' => 'Tabs README', 'description' => 'Review the core package API.', 'href' => 'https://github.com/affinio/affinio/tree/main/packages/tabs-core'],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Affino · Laravel tabs</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="adapter-body">
        <main class="adapter-shell">
            <header class="adapter-hero">
                <p class="adapter-hero__eyebrow">Affino tabs</p>
                <h1>Same contract as Vue—tabs stay headless and server aware</h1>
                <p>
                    Pick any markup, animate however you like, and let the adapter keep aria attributes and dataset values
                    aligned with Vue.
                </p>
                <div class="adapter-hero__actions">
                    <a href="/">Back to overview</a>
                    <a href="https://github.com/affinio/affinio/tree/main/packages/tabs-core" target="_blank" rel="noreferrer">
                        Tabs docs
                    </a>
                </div>
            </header>

            <section class="adapter-demo-grid">
                <article class="adapter-demo-card adapter-tabs-card">
                    <div
                        class="adapter-tabs"
                        data-affino-tabs-root="livewire-tabs-demo"
                        data-affino-tabs-default-value="overview"
                    >
                        <div class="adapter-tabs__triggers" role="tablist">
                            @foreach ($tabs as $tab)
                                <button
                                    type="button"
                                    class="adapter-tabs__trigger"
                                    data-affino-tabs-trigger
                                    data-affino-tabs-value="{{ $tab['value'] }}"
                                    role="tab"
                                >
                                    <span>{{ $tab['label'] }}</span>
                                    <small>{{ $tab['metric'] }}</small>
                                </button>
                            @endforeach
                        </div>
                        <div class="adapter-tabs__panels">
                            @foreach ($tabs as $tab)
                                <article
                                    class="adapter-tabs__panel"
                                    data-affino-tabs-content
                                    data-affino-tabs-value="{{ $tab['value'] }}"
                                    role="tabpanel"
                                    hidden
                                >
                                    <p class="adapter-tabs__eyebrow">{{ $tab['label'] }} focus</p>
                                    <h2>{{ $tab['metric'] }}</h2>
                                    <p>{{ $tab['summary'] }}</p>
                                    <footer>
                                        <span>Telemetry</span>
                                        <p>{{ $tab['footnote'] }}</p>
                                    </footer>
                                </article>
                            @endforeach
                        </div>
                    </div>

                    <dl class="adapter-log">
                        <dt>Active tab</dt>
                        <dd data-adapter-tabs-log>overview</dd>
                    </dl>
                </article>

                <article class="adapter-code-card">
                    <p>Blade scaffold</p>
<pre>&lt;div data-affino-tabs-root="stack" data-affino-tabs-default-value="overview"&gt;
  &lt;button
    data-affino-tabs-trigger
    data-affino-tabs-value="overview"
  &gt;Overview&lt;/button&gt;
  &lt;article
    data-affino-tabs-content
    data-affino-tabs-value="overview"
    hidden
  &gt;...&lt;/article&gt;
&lt;/div&gt;</pre>
                </article>
            </section>

            <section class="adapter-advanced">
                <header>
                    <p>Advanced flows</p>
                    <h2>Blend tabs with other adapters when surfaces grow</h2>
                    <p>Every card routes into a Livewire playground that reuses the exact same contract.</p>
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
            (() => {
                const root = document.querySelector('[data-affino-tabs-root="livewire-tabs-demo"]')
                const log = document.querySelector('[data-adapter-tabs-log]')
                if (!root || !log) return

                const sync = () => {
                    const value = root.getAttribute('data-affino-tabs-value') || '—'
                    log.textContent = value
                }
                sync()

                const observer = new MutationObserver(sync)
                observer.observe(root, { attributes: true, attributeFilter: ['data-affino-tabs-value'] })
            })()
        </script>
    </body>
</html>
