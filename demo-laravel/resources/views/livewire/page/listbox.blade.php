<div class="page-shell">
    <section class="listbox-page-hero" aria-label="Listbox overview">
        <div class="listbox-page-hero__content">
            <p class="listbox-page-hero__eyebrow">preview</p>
            <h2>Listbox</h2>
            <p>Deterministic list selection.</p>
            <div class="listbox-page-hero__chips" aria-label="Listbox foundation">
                <span class="listbox-page-hero__chip">@affino/listbox-core</span>
                <span class="listbox-page-hero__chip">@affino/listbox-laravel</span>
                <span class="listbox-page-hero__chip">@affino/laravel-adapter</span>
            </div>
        </div>

        <div class="listbox-page-hero__preview">
            <h3>Preview</h3>
            <p class="listbox-demo__lead">Pick a value.</p>
            <livewire:listbox.simple />
        </div>
    </section>

    <section class="listbox-page-cases" aria-label="Listbox scenarios">
        <div class="listbox-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Manual, multi, dataset, sticky.</p>
        </div>

        <div class="listbox-edge-list">
            <article
                class="listbox-edge listbox-edge--manual"
                data-affino-disclosure-root="listbox-edge-manual"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="listbox-edge__summary" data-affino-disclosure-trigger>
                    <span class="listbox-edge__kicker">Case 01</span>
                    <span class="listbox-edge__title">Manual bridge</span>
                    <span class="listbox-edge__lead">Manual actions.</span>
                </button>
                <div class="listbox-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:listbox.manual-case />
                </div>
            </article>

            <article
                class="listbox-edge listbox-edge--multiple"
                data-affino-disclosure-root="listbox-edge-multiple"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="listbox-edge__summary" data-affino-disclosure-trigger>
                    <span class="listbox-edge__kicker">Case 02</span>
                    <span class="listbox-edge__title">Multi-select</span>
                    <span class="listbox-edge__lead">Additive picks.</span>
                </button>
                <div class="listbox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:listbox.multiple-case />
                </div>
            </article>

            <article
                class="listbox-edge listbox-edge--dataset"
                data-affino-disclosure-root="listbox-edge-dataset"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="listbox-edge__summary" data-affino-disclosure-trigger>
                    <span class="listbox-edge__kicker">Case 03</span>
                    <span class="listbox-edge__title">Dataset swap</span>
                    <span class="listbox-edge__lead">Replace options.</span>
                </button>
                <div class="listbox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:listbox.dataset-case />
                </div>
            </article>

            <article
                class="listbox-edge listbox-edge--sticky"
                data-affino-disclosure-root="listbox-edge-sticky"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="listbox-edge__summary" data-affino-disclosure-trigger>
                    <span class="listbox-edge__kicker">Case 04</span>
                    <span class="listbox-edge__title">Sticky tools</span>
                    <span class="listbox-edge__lead">Pinned actions.</span>
                </button>
                <div class="listbox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:listbox.sticky-case />
                </div>
            </article>
        </div>
    </section>
</div>
