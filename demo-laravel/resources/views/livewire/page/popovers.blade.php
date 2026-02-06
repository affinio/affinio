<div class="page-shell">
    <section class="popover-page-hero" aria-label="Popover overview">
        <div class="popover-page-hero__content">
            <p class="popover-page-hero__eyebrow">preview</p>
            <h2>Popovers</h2>
            <p>Rich context panels.</p>
            <div class="popover-page-hero__chips" aria-label="Popover foundation">
                <span class="popover-page-hero__chip">@affino/popover-core</span>
                <span class="popover-page-hero__chip">@affino/overlay-kernel</span>
                <span class="popover-page-hero__chip">@affino/popover-laravel</span>
            </div>
        </div>

        <div class="popover-page-hero__preview">
            <h3>Preview</h3>
            <p class="popover-demo__lead">Open + close.</p>
            <livewire:popover.simple />
        </div>
    </section>

    <section class="popover-page-cases" aria-label="Popover scenarios">
        <div class="popover-page-cases__intro">
            <h3>Scenarios</h3>
            <p>Quick edit, nested, modal, mutations.</p>
        </div>

        <div class="popover-edge-list">
            <article
                class="popover-edge popover-edge--quick-edit"
                data-affino-disclosure-root="popover-edge-quick-edit"
                data-affino-disclosure-default-open="true"
                data-affino-disclosure-state="open"
            >
                <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                    <span class="popover-edge__kicker">Case 01</span>
                    <span class="popover-edge__title">Quick edit</span>
                    <span class="popover-edge__lead">Inline controls.</span>
                </button>
                <div class="popover-edge__content" data-affino-disclosure-content data-state="open">
                    <livewire:popover.quick-edit />
                </div>
            </article>

            <article
                class="popover-edge popover-edge--nested"
                data-affino-disclosure-root="popover-edge-nested"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                    <span class="popover-edge__kicker">Case 02</span>
                    <span class="popover-edge__title">Nested stack</span>
                    <span class="popover-edge__lead">Popover in popover.</span>
                </button>
                <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:popover.nested />
                </div>
            </article>

            <article
                class="popover-edge popover-edge--modal"
                data-affino-disclosure-root="popover-edge-modal"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                    <span class="popover-edge__kicker">Case 03</span>
                    <span class="popover-edge__title">Modal</span>
                    <span class="popover-edge__lead">Focus + scroll.</span>
                </button>
                <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:popover.modal-case />
                </div>
            </article>

            <article
                class="popover-edge popover-edge--mutation"
                data-affino-disclosure-root="popover-edge-mutation"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
            >
                <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                    <span class="popover-edge__kicker">Case 04</span>
                    <span class="popover-edge__title">List changes</span>
                    <span class="popover-edge__lead">Rows update.</span>
                </button>
                <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                    <livewire:popover.mutation-board />
                </div>
            </article>
        </div>
    </section>
</div>
