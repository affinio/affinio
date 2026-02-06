<div class="page-shell">
    <section class="tabs-page-hero" aria-label="Tabs overview">
        <div class="tabs-page-hero__content">
            <p class="tabs-page-hero__eyebrow">preview</p>
            <h2>Tabs</h2>
            <p>Short, predictable tab switching.</p>
            <div class="tabs-page-hero__chips" aria-label="Tabs foundation">
                <span class="tabs-page-hero__chip">@affino/tabs-core</span>
                <span class="tabs-page-hero__chip">@affino/tabs-laravel</span>
                <span class="tabs-page-hero__chip">@affino/laravel-adapter</span>
            </div>
        </div>

        <div class="tabs-page-hero__preview">
            <h3>Preview</h3>
            <p class="tabs-demo__lead">Switch tabs fast.</p>
            <livewire:tabs.simple />
        </div>
    </section>

    <section class="tabs-page-cases" aria-label="Tabs scenarios">
        <div class="tabs-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Manual bridge, mutations, ignore, parallel roots.</p>
        </div>

        <div class="tabs-edge-list">
            <article
                class="tabs-edge tabs-edge--manual"
                data-affino-disclosure-root="tabs-edge-manual"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="tabs-edge__summary" data-affino-disclosure-trigger>
                    <span class="tabs-edge__kicker">Case 01</span>
                    <span class="tabs-edge__title">Manual bridge</span>
                    <span class="tabs-edge__lead">Dispatch + control.</span>
                </button>
                <div class="tabs-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:tabs.manual-case />
                </div>
            </article>

            <article
                class="tabs-edge tabs-edge--mutation"
                data-affino-disclosure-root="tabs-edge-mutation"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="tabs-edge__summary" data-affino-disclosure-trigger>
                    <span class="tabs-edge__kicker">Case 02</span>
                    <span class="tabs-edge__title">Dataset changes</span>
                    <span class="tabs-edge__lead">Add/remove tabs.</span>
                </button>
                <div class="tabs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:tabs.mutation-case />
                </div>
            </article>

            <article
                class="tabs-edge tabs-edge--ignore"
                data-affino-disclosure-root="tabs-edge-ignore"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="tabs-edge__summary" data-affino-disclosure-trigger>
                    <span class="tabs-edge__kicker">Case 03</span>
                    <span class="tabs-edge__title"><code>wire:ignore</code></span>
                    <span class="tabs-edge__lead">Client island.</span>
                </button>
                <div class="tabs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:tabs.ignore-case />
                </div>
            </article>

            <article
                class="tabs-edge tabs-edge--parallel"
                data-affino-disclosure-root="tabs-edge-parallel"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="tabs-edge__summary" data-affino-disclosure-trigger>
                    <span class="tabs-edge__kicker">Case 04</span>
                    <span class="tabs-edge__title">Parallel roots</span>
                    <span class="tabs-edge__lead">Multiple groups.</span>
                </button>
                <div class="tabs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:tabs.parallel-case />
                </div>
            </article>
        </div>
    </section>
</div>
