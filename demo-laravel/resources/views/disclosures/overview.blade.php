@php
    $insights = [
        ['title' => 'Research pulse', 'context' => 'Weekly roundup', 'metric' => '+18% completion', 'meta' => '6m ago'],
        ['title' => 'Design QA', 'context' => 'Checklist', 'metric' => '3 blockers', 'meta' => 'Auto triaged'],
        ['title' => 'Launch ops', 'context' => 'Crew sync', 'metric' => '7 owners', 'meta' => 'Crew ready'],
    ];

    $advancedCards = [
        ['label' => 'Tabs', 'title' => 'Tabs', 'description' => 'Pair tab triggers with disclosures for stacked navigation.', 'href' => '/tabs'],
        ['label' => 'Menus', 'title' => 'Menus', 'description' => 'Tie disclosures to menu selections for contextual help.', 'href' => '/livewire/menus'],
        ['label' => 'Dialogs', 'title' => 'Dialogs', 'description' => 'Escalate disclosures into dialogs when flows get complex.', 'href' => '/livewire/dialogs'],
        ['label' => 'Docs', 'title' => 'Disclosure README', 'description' => 'Inspect the core package contract.', 'href' => 'https://github.com/affinio/affinio/tree/main/packages/disclosure-core'],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Affino · Laravel disclosures</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="adapter-body">
        <main class="adapter-shell">
            <header class="adapter-hero">
                <p class="adapter-hero__eyebrow">Affino disclosure</p>
                <h1>Mirror the Vue demo with the exact same markup contract</h1>
                <p>
                    The hero block below is tiny by design: one trigger, a frosted surface, and a telemetry log. Everything
                    is powered by `data-affino-disclosure-*` attributes so Livewire can hydrate it instantly.
                </p>
                <div class="adapter-hero__actions">
                    <a href="/">Back to overview</a>
                    <a href="https://github.com/affinio/affinio/tree/main/packages/disclosure-core" target="_blank" rel="noreferrer">
                        Disclosure docs
                    </a>
                </div>
            </header>

            <section class="adapter-demo-grid">
                <article class="adapter-demo-card adapter-disclosure-card">
                    <div
                        class="adapter-disclosure"
                        data-affino-disclosure-root="livewire-disclosure-demo"
                        data-affino-disclosure-default-open="false"
                    >
                        <button type="button" class="adapter-disclosure__trigger" data-affino-disclosure-trigger>
                            Toggle insight stack
                        </button>

                        <article class="adapter-disclosure__panel" data-affino-disclosure-content hidden>
                            <p class="adapter-disclosure__eyebrow">Notifications</p>
                            <h2>Studio sync feed</h2>
                            <p>Every item below mirrors the Vue controller demo—no conditional logic differences.</p>
                            <ul class="adapter-disclosure__list">
                                @foreach ($insights as $insight)
                                    <li>
                                        <div>
                                            <strong>{{ $insight['title'] }}</strong>
                                            <span>{{ $insight['context'] }}</span>
                                        </div>
                                        <div>
                                            <em>{{ $insight['metric'] }}</em>
                                            <small>{{ $insight['meta'] }}</small>
                                        </div>
                                    </li>
                                @endforeach
                            </ul>
                        </article>
                    </div>

                    <dl class="adapter-log">
                        <dt>Disclosure state</dt>
                        <dd data-adapter-disclosure-log>Collapsed</dd>
                    </dl>
                </article>

                <article class="adapter-code-card">
                    <p>Blade scaffold</p>
<pre>&lt;div
  data-affino-disclosure-root="insight-feed"
  data-affino-disclosure-default-open="false"
&gt;
  &lt;button data-affino-disclosure-trigger&gt;Toggle&lt;/button&gt;
  &lt;article data-affino-disclosure-content hidden&gt;
    ...
  &lt;/article&gt;
&lt;/div&gt;</pre>
                </article>
            </section>

            <section class="adapter-advanced">
                <header>
                    <p>Advanced flows</p>
                    <h2>Route to menus, dialogs, and tabs once this surface feels too small</h2>
                    <p>The same adapter runtime powers every advanced Livewire page linked below.</p>
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
                const root = document.querySelector('[data-affino-disclosure-root="livewire-disclosure-demo"]')
                const log = document.querySelector('[data-adapter-disclosure-log]')
                if (!root || !log) return

                const sync = () => {
                    const state = root.getAttribute('data-affino-disclosure-state') === 'open'
                    log.textContent = state ? 'Expanded' : 'Collapsed'
                }
                sync()

                const observer = new MutationObserver(sync)
                observer.observe(root, { attributes: true, attributeFilter: ['data-affino-disclosure-state'] })
            })()
        </script>
    </body>
</html>
