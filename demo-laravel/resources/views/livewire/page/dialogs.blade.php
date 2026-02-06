<div class="page-shell">
    <section class="dialogs-page-hero" aria-label="Dialog overview">
        <div class="dialogs-page-hero__content">
            <p class="dialogs-page-hero__eyebrow">preview</p>
            <h2>Dialogs</h2>
            <p>Focus + overlay control.</p>
            <div class="dialogs-page-hero__chips" aria-label="Dialog foundation">
                <span class="dialogs-page-hero__chip">@affino/dialog-core</span>
                <span class="dialogs-page-hero__chip">@affino/dialog-laravel</span>
                <span class="dialogs-page-hero__chip">@affino/overlay-kernel</span>
            </div>
        </div>

        <div class="dialogs-page-hero__preview">
            <h3>Preview</h3>
            <p class="dialogs-hint">Open, close, stack.</p>
            <livewire:dialog.simple />
        </div>
    </section>

    <section class="dialogs-page-cases" aria-label="Dialog scenarios">
        <div class="dialogs-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Manual, nested, pinned, mutations.</p>
        </div>

        <div class="dialogs-edge-list">
            <article
                class="dialogs-edge dialogs-edge--manual"
                data-affino-disclosure-root="dialogs-edge-manual"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="dialogs-edge__summary" data-affino-disclosure-trigger>
                    <span class="dialogs-edge__kicker">Case 01</span>
                    <span class="dialogs-edge__title">Manual bridge</span>
                    <span class="dialogs-edge__lead">Open/close/toggle.</span>
                </button>
                <div class="dialogs-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:dialog.manual-case />
                </div>
            </article>

            <article
                class="dialogs-edge dialogs-edge--nested"
                data-affino-disclosure-root="dialogs-edge-nested"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="dialogs-edge__summary" data-affino-disclosure-trigger>
                    <span class="dialogs-edge__kicker">Case 02</span>
                    <span class="dialogs-edge__title">Nested stack</span>
                    <span class="dialogs-edge__lead">Parent + child.</span>
                </button>
                <div class="dialogs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:dialog.nested-case />
                </div>
            </article>

            <article
                class="dialogs-edge dialogs-edge--pinned"
                data-affino-disclosure-root="dialogs-edge-pinned"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="dialogs-edge__summary" data-affino-disclosure-trigger>
                    <span class="dialogs-edge__kicker">Case 03</span>
                    <span class="dialogs-edge__title">Pinned</span>
                    <span class="dialogs-edge__lead">Stay open.</span>
                </button>
                <div class="dialogs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:dialog.pinned-case />
                </div>
            </article>

            <article
                class="dialogs-edge dialogs-edge--mutation"
                data-affino-disclosure-root="dialogs-edge-mutation"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="dialogs-edge__summary" data-affino-disclosure-trigger>
                    <span class="dialogs-edge__kicker">Case 04</span>
                    <span class="dialogs-edge__title">List changes</span>
                    <span class="dialogs-edge__lead">Rows update.</span>
                </button>
                <div class="dialogs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:dialog.mutation-case />
                </div>
            </article>
        </div>
    </section>
</div>
