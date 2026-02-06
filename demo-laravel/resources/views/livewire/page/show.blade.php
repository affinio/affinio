<div class="page-shell">
    @if ($page === 'tabs')
        <section class="tabs-page-hero" aria-label="Tabs overview">
            <div class="tabs-page-hero__content">
                <p class="tabs-page-hero__eyebrow">preview</p>
                <h2>Tabs that stay predictable through Livewire morphing and server-driven selection</h2>
                <p>
                    Affino tabs are powered by <strong>@affino/tabs-core</strong> and hydrated through
                    <strong>@affino/tabs-laravel</strong>. The shared adapter contract keeps client tab state and
                    server updates aligned under one predictable markup protocol.
                </p>
                <div class="tabs-page-hero__chips" aria-label="Tabs foundation">
                    <span class="tabs-page-hero__chip">@affino/tabs-core</span>
                    <span class="tabs-page-hero__chip">@affino/tabs-laravel</span>
                    <span class="tabs-page-hero__chip">@affino/laravel-adapter</span>
                </div>
            </div>

            <div class="tabs-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="tabs-demo__lead">
                    Switch context blocks instantly and keep active state readable from Livewire.
                </p>
                <livewire:tabs.simple />
            </div>
        </section>

        <section class="tabs-page-cases" aria-label="Advanced tabs scenarios">
            <div class="tabs-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    These scenarios focus on server-driven selection, dynamic tab datasets, <code>wire:ignore</code>
                    islands, and multiple tab roots coexisting in one Livewire screen.
                </p>
            </div>

            <div class="tabs-edge-list">
                <article
                    class="tabs-edge tabs-edge--manual"
                    data-affino-disclosure-root="tabs-edge-manual"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="tabs-edge__summary" data-affino-disclosure-trigger>
                        <span class="tabs-edge__kicker">Edge case 01</span>
                        <span class="tabs-edge__title">Manual bridge dispatch</span>
                        <span class="tabs-edge__lead">Livewire dispatches <code>affino-tabs:manual</code> and controls the same tab root deterministically.</span>
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
                        <span class="tabs-edge__kicker">Edge case 02</span>
                        <span class="tabs-edge__title">Dynamic tab mutations</span>
                        <span class="tabs-edge__lead">Tabs are added and removed while selection fallback stays stable.</span>
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
                        <span class="tabs-edge__kicker">Edge case 03</span>
                        <span class="tabs-edge__title"><code>wire:ignore</code> tab island</span>
                        <span class="tabs-edge__lead">Client-side tab interaction stays untouched while Livewire updates neighboring state.</span>
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
                        <span class="tabs-edge__kicker">Edge case 04</span>
                        <span class="tabs-edge__title">Parallel tab roots</span>
                        <span class="tabs-edge__lead">Multiple independent tab groups coexist without id collisions or cross-talk.</span>
                    </button>
                    <div class="tabs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tabs.parallel-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'listbox')
        <section class="listbox-page-hero" aria-label="Listbox overview">
            <div class="listbox-page-hero__content">
                <p class="listbox-page-hero__eyebrow">preview</p>
                <h2>Listboxes that keep selection deterministic through Livewire morphing</h2>
                <p>
                    Affino listbox behavior is powered by <strong>@affino/listbox-core</strong> and synchronized in
                    Laravel through <strong>@affino/listbox-laravel</strong>. The adapter keeps keyboard flow,
                    selection, and overlay state stable while Livewire updates the DOM.
                </p>
                <div class="listbox-page-hero__chips" aria-label="Listbox foundation">
                    <span class="listbox-page-hero__chip">@affino/listbox-core</span>
                    <span class="listbox-page-hero__chip">@affino/listbox-laravel</span>
                    <span class="listbox-page-hero__chip">@affino/laravel-adapter</span>
                </div>
            </div>

            <div class="listbox-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="listbox-demo__lead">
                    Select routing regions while keeping server and client state aligned.
                </p>
                <livewire:listbox.simple />
            </div>
        </section>

        <section class="listbox-page-cases" aria-label="Advanced listbox scenarios">
            <div class="listbox-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    These scenarios stress manual bridge commands, multi-select behavior, dataset mutations, and
                    sticky toolbars that should not collapse the listbox surface.
                </p>
            </div>

            <div class="listbox-edge-list">
                <article
                    class="listbox-edge listbox-edge--manual"
                    data-affino-disclosure-root="listbox-edge-manual"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="listbox-edge__summary" data-affino-disclosure-trigger>
                        <span class="listbox-edge__kicker">Edge case 01</span>
                        <span class="listbox-edge__title">Manual bridge control</span>
                        <span class="listbox-edge__lead">Livewire dispatches <code>affino-listbox:manual</code> and controls the same listbox root deterministically.</span>
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
                        <span class="listbox-edge__kicker">Edge case 02</span>
                        <span class="listbox-edge__title">Multi-select watchlist</span>
                        <span class="listbox-edge__lead">Multiple mode keeps additive selection predictable while arrays sync through Livewire.</span>
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
                        <span class="listbox-edge__kicker">Edge case 03</span>
                        <span class="listbox-edge__title">Dataset mutations</span>
                        <span class="listbox-edge__lead">Switching datasets and injecting options preserves selection fallback.</span>
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
                        <span class="listbox-edge__kicker">Edge case 04</span>
                        <span class="listbox-edge__title">Sticky toolbar actions</span>
                        <span class="listbox-edge__lead">External preset controls stay inside the active interaction zone via <code>data-affino-listbox-sticky</code>.</span>
                    </button>
                    <div class="listbox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:listbox.sticky-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'combobox')
        <section class="combobox-page-hero" aria-label="Combobox overview">
            <div class="combobox-page-hero__content">
                <p class="combobox-page-hero__eyebrow">preview</p>
                <h2>Combobox search that stays deterministic under Livewire updates</h2>
                <p>
                    Affino combobox runs on <strong>@affino/combobox-core</strong> and shares list selection behavior
                    with <strong>@affino/listbox-core</strong>. The Laravel adapter keeps filtering, selection, and
                    overlay state synchronized while Livewire morphs the DOM.
                </p>
                <div class="combobox-page-hero__chips" aria-label="Combobox foundation">
                    <span class="combobox-page-hero__chip">@affino/combobox-core</span>
                    <span class="combobox-page-hero__chip">@affino/listbox-core</span>
                    <span class="combobox-page-hero__chip">@affino/combobox-laravel</span>
                </div>
            </div>

            <div class="combobox-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="combobox-demo__lead">
                    Search production-like records and keep state readable from Livewire.
                </p>
                <livewire:combobox.simple />
            </div>
        </section>

        <section class="combobox-page-cases" aria-label="Advanced combobox scenarios">
            <div class="combobox-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    These blocks verify manual bridge commands, multi-select watchlists, dataset mutation safety, and
                    sticky toolbars that should not collapse the combobox surface.
                </p>
            </div>

            <div class="combobox-edge-list">
                <article
                    class="combobox-edge combobox-edge--manual"
                    data-affino-disclosure-root="combobox-edge-manual"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                        <span class="combobox-edge__kicker">Edge case 01</span>
                        <span class="combobox-edge__title">Manual bridge control</span>
                        <span class="combobox-edge__lead">Livewire dispatches <code>affino-combobox:manual</code> for open, close, select, and clear.</span>
                    </button>
                    <div class="combobox-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:combobox.manual-case />
                    </div>
                </article>

                <article
                    class="combobox-edge combobox-edge--multiple"
                    data-affino-disclosure-root="combobox-edge-multiple"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                        <span class="combobox-edge__kicker">Edge case 02</span>
                        <span class="combobox-edge__title">Multi-select watchlist</span>
                        <span class="combobox-edge__lead">Range and additive selection in multiple mode with Livewire-backed arrays.</span>
                    </button>
                    <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:combobox.multiple-case />
                    </div>
                </article>

                <article
                    class="combobox-edge combobox-edge--dataset"
                    data-affino-disclosure-root="combobox-edge-dataset"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                        <span class="combobox-edge__kicker">Edge case 03</span>
                        <span class="combobox-edge__title">Dataset mutations</span>
                        <span class="combobox-edge__lead">Switching datasets and mutating options keeps selection fallback stable.</span>
                    </button>
                    <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:combobox.dataset-case />
                    </div>
                </article>

                <article
                    class="combobox-edge combobox-edge--sticky"
                    data-affino-disclosure-root="combobox-edge-sticky"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="combobox-edge__summary" data-affino-disclosure-trigger>
                        <span class="combobox-edge__kicker">Edge case 04</span>
                        <span class="combobox-edge__title">Sticky toolbar actions</span>
                        <span class="combobox-edge__lead">Preset buttons live outside root but stay part of the active combobox interaction zone.</span>
                    </button>
                    <div class="combobox-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:combobox.sticky-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'tooltips')
        <section class="tooltip-page-hero" aria-label="Tooltip overview">
            <div class="tooltip-page-hero__content">
                <p class="tooltip-page-hero__eyebrow">preview</p>
                <h2>Tooltips that feel instant and stay reliable under Livewire updates</h2>
                <p>
                    Affino tooltip flows are built on top of <strong>@affino/tooltip-core</strong> positioning and
                    coordinated by <strong>@affino/overlay-kernel</strong>. The Laravel layer keeps DOM state and
                    Livewire morphing in sync, so hints remain stable in real product screens.
                </p>
                <div class="tooltip-page-hero__chips" aria-label="Tooltip foundation">
                    <span class="tooltip-page-hero__chip">@affino/tooltip-core</span>
                    <span class="tooltip-page-hero__chip">@affino/overlay-kernel</span>
                    <span class="tooltip-page-hero__chip">@affino/tooltip-laravel</span>
                </div>
            </div>

            <div class="tooltip-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="tooltip-demo__lead">
                    Tune placement and trigger mode to match your product behavior.
                </p>
                <livewire:tooltip.simple />
            </div>
        </section>

        <section class="tooltip-page-cases" aria-label="Advanced tooltip scenarios">
            <div class="tooltip-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Each block below stresses a different production failure mode. Open one case at a time and inspect how the tooltip
                    behaves under stress.
                </p>
            </div>

            <div class="tooltip-edge-list">
                <article
                    class="tooltip-edge tooltip-edge--dock"
                    data-affino-disclosure-root="tooltip-edge-dock"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 01</span>
                        <span class="tooltip-edge__title">Dock hover rail</span>
                        <span class="tooltip-edge__lead">Fast cursor passes should feel like one continuous surface.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:tooltip.dock />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--pulse"
                    data-affino-disclosure-root="tooltip-edge-pulse"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 02</span>
                        <span class="tooltip-edge__title">Livewire pulse</span>
                        <span class="tooltip-edge__lead">Tooltip remains stable while Livewire keeps mutating state.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.pulse />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--ignored"
                    data-affino-disclosure-root="tooltip-edge-ignored"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 03</span>
                        <span class="tooltip-edge__title"><code>wire:ignore</code> island</span>
                        <span class="tooltip-edge__lead">Ignores subtree morphs while external updates continue.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.ignored />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--resize"
                    data-affino-disclosure-root="tooltip-edge-resize"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 04</span>
                        <span class="tooltip-edge__title">Dynamic trigger width</span>
                        <span class="tooltip-edge__lead">Positioning stays correct when trigger width changes.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.resize />
                    </div>
                </article>

                <article
                    class="tooltip-edge tooltip-edge--dialog"
                    data-affino-disclosure-root="tooltip-edge-dialog"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="tooltip-edge__summary" data-affino-disclosure-trigger>
                        <span class="tooltip-edge__kicker">Edge case 05</span>
                        <span class="tooltip-edge__title">Tooltip inside dialog</span>
                        <span class="tooltip-edge__lead">Layering remains predictable inside modal overlays.</span>
                    </button>
                    <div class="tooltip-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:tooltip.dialog-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'popovers')
        <section class="popover-page-hero" aria-label="Popover overview">
            <div class="popover-page-hero__content">
                <p class="popover-page-hero__eyebrow">preview</p>
                <h2>Popovers that carry rich context and stay deterministic in Livewire flows</h2>
                <p>
                    Affino popover behavior is powered by <strong>@affino/popover-core</strong> and coordinated by
                    <strong>@affino/overlay-kernel</strong>. The Laravel layer keeps focus, placement, and state
                    synced while DOM fragments are continuously morphed.
                </p>
                <div class="popover-page-hero__chips" aria-label="Popover foundation">
                    <span class="popover-page-hero__chip">@affino/popover-core</span>
                    <span class="popover-page-hero__chip">@affino/overlay-kernel</span>
                    <span class="popover-page-hero__chip">@affino/popover-laravel</span>
                </div>
            </div>

            <div class="popover-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="popover-demo__lead">
                    Tune placement, align, and mode to mirror real product behavior.
                </p>
                <livewire:popover.simple />
            </div>
        </section>

        <section class="popover-page-cases" aria-label="Advanced popover scenarios">
            <div class="popover-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Each case targets a production concern: editable inline panels, nested stacks, modal constraints,
                    and list mutations under Livewire updates.
                </p>
            </div>

            <div class="popover-edge-list">
                <article
                    class="popover-edge popover-edge--quick-edit"
                    data-affino-disclosure-root="popover-edge-quick-edit"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="popover-edge__summary" data-affino-disclosure-trigger>
                        <span class="popover-edge__kicker">Edge case 01</span>
                        <span class="popover-edge__title">Inline quick-edit popovers</span>
                        <span class="popover-edge__lead">Editable controls inside anchored panels, per-row and stateful.</span>
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
                        <span class="popover-edge__kicker">Edge case 02</span>
                        <span class="popover-edge__title">Nested popover stack</span>
                        <span class="popover-edge__lead">Popover opened from another popover should keep deterministic stack behavior.</span>
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
                        <span class="popover-edge__kicker">Edge case 03</span>
                        <span class="popover-edge__title">Modal popover behavior</span>
                        <span class="popover-edge__lead">Focus/scroll constraints for critical local confirmation flows.</span>
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
                        <span class="popover-edge__kicker">Edge case 04</span>
                        <span class="popover-edge__title">Livewire list mutations</span>
                        <span class="popover-edge__lead">Popover handles stay valid while rows are added or removed.</span>
                    </button>
                    <div class="popover-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:popover.mutation-board />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'dialogs')
        <section class="dialogs-page-hero" aria-label="Dialog overview">
            <div class="dialogs-page-hero__content">
                <p class="dialogs-page-hero__eyebrow">preview</p>
                <h2>Dialogs and modals that stay deterministic through Livewire updates</h2>
                <p>
                    Affino dialog behavior is powered by <strong>@affino/dialog-core</strong> and hydrated by
                    <strong>@affino/dialog-laravel</strong>. The adapter keeps focus loops, scroll lock, and overlay
                    stacking stable while Livewire morphs the page.
                </p>
                <div class="dialogs-page-hero__chips" aria-label="Dialog foundation">
                    <span class="dialogs-page-hero__chip">@affino/dialog-core</span>
                    <span class="dialogs-page-hero__chip">@affino/dialog-laravel</span>
                    <span class="dialogs-page-hero__chip">@affino/overlay-kernel</span>
                </div>
            </div>

            <div class="dialogs-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="dialogs-hint">
                    Tune modal rules and edit live fields inside the same dialog surface.
                </p>
                <livewire:dialog.simple />
            </div>
        </section>

        <section class="dialogs-page-cases" aria-label="Advanced dialog scenarios">
            <div class="dialogs-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    These cases validate manual bridge control, nested stacks, pinned behavior during morphs, and
                    list mutation safety for multiple dialog roots.
                </p>
            </div>

            <div class="dialogs-edge-list">
                <article
                    class="dialogs-edge dialogs-edge--manual"
                    data-affino-disclosure-root="dialogs-edge-manual"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="dialogs-edge__summary" data-affino-disclosure-trigger>
                        <span class="dialogs-edge__kicker">Edge case 01</span>
                        <span class="dialogs-edge__title">Manual bridge dispatch</span>
                        <span class="dialogs-edge__lead">Livewire dispatches <code>affino-dialog:manual</code> for open, close, and toggle.</span>
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
                        <span class="dialogs-edge__kicker">Edge case 02</span>
                        <span class="dialogs-edge__title">Nested dialog stack</span>
                        <span class="dialogs-edge__lead">Child dialog opened from parent should keep deterministic top-most behavior.</span>
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
                        <span class="dialogs-edge__kicker">Edge case 03</span>
                        <span class="dialogs-edge__title">Pinned dialog under morphs</span>
                        <span class="dialogs-edge__lead">Pinned mode should keep the dialog open while Livewire pulses rerender the component.</span>
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
                        <span class="dialogs-edge__kicker">Edge case 04</span>
                        <span class="dialogs-edge__title">Dialog list mutations</span>
                        <span class="dialogs-edge__lead">Adding and removing row-bound dialog roots should not leave stale overlays.</span>
                    </button>
                    <div class="dialogs-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:dialog.mutation-case />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'disclosure')
        <section class="disclosure-page-hero" aria-label="Disclosure overview">
            <div class="disclosure-page-hero__content">
                <p class="disclosure-page-hero__eyebrow">preview</p>
                <h2>Accordions that keep state predictable under Livewire morphs</h2>
                <p>
                    Affino disclosure panels run on <strong>@affino/disclosure-core</strong> and are hydrated by
                    <strong>@affino/disclosure-laravel</strong>. The demo keeps structure consistent while Livewire
                    updates content and lists in-place.
                </p>
                <div class="disclosure-page-hero__chips" aria-label="Disclosure foundation">
                    <span class="disclosure-page-hero__chip">@affino/disclosure-core</span>
                    <span class="disclosure-page-hero__chip">@affino/disclosure-laravel</span>
                    <span class="disclosure-page-hero__chip">Livewire</span>
                </div>
            </div>

            <div class="disclosure-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="disclosure-demo__lead">
                    Disclosure panels stay readable while content updates behind the scenes.
                </p>
                <livewire:disclosure.simple />
            </div>
        </section>

        <section class="disclosure-page-cases" aria-label="Advanced disclosure scenarios">
            <div class="disclosure-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Use the cases below to verify nested panels, Livewire mutations, and ignored islands.
                </p>
            </div>

            <div class="disclosure-edge-list">
                <article
                    class="disclosure-edge disclosure-edge--nested"
                    data-affino-disclosure-root="disclosure-edge-nested"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                        <span class="disclosure-edge__kicker">Edge case 01</span>
                        <span class="disclosure-edge__title">Nested accordion stack</span>
                        <span class="disclosure-edge__lead">Parent + child panels stay independent and clickable.</span>
                    </button>
                    <div class="disclosure-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:disclosure.nested />
                    </div>
                </article>

                <article
                    class="disclosure-edge disclosure-edge--pulse"
                    data-affino-disclosure-root="disclosure-edge-pulse"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                        <span class="disclosure-edge__kicker">Edge case 02</span>
                        <span class="disclosure-edge__title">Livewire pulse updates</span>
                        <span class="disclosure-edge__lead">Open panels should remain open as data refreshes.</span>
                    </button>
                    <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:disclosure.pulse />
                    </div>
                </article>

                <article
                    class="disclosure-edge disclosure-edge--mutation"
                    data-affino-disclosure-root="disclosure-edge-mutation"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                        <span class="disclosure-edge__kicker">Edge case 03</span>
                        <span class="disclosure-edge__title">List mutations</span>
                        <span class="disclosure-edge__lead">Panels continue to hydrate when items are added or removed.</span>
                    </button>
                    <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:disclosure.mutation-board />
                    </div>
                </article>

                <article
                    class="disclosure-edge disclosure-edge--ignored"
                    data-affino-disclosure-root="disclosure-edge-ignored"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="disclosure-edge__summary" data-affino-disclosure-trigger>
                        <span class="disclosure-edge__kicker">Edge case 04</span>
                        <span class="disclosure-edge__title"><code>wire:ignore</code> island</span>
                        <span class="disclosure-edge__lead">Component stays interactive while Livewire updates outside.</span>
                    </button>
                    <div class="disclosure-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:disclosure.ignored />
                    </div>
                </article>
            </div>
        </section>
    @elseif ($page === 'menus')
        <section class="menu-page-hero" aria-label="Menu overview">
            <div class="menu-page-hero__content">
                <p class="menu-page-hero__eyebrow">preview</p>
                <h2>Menus that stay crisp through nested paths and Livewire updates</h2>
                <p>
                    Affino menus are powered by <strong>@affino/menu-core</strong> and hydrated by
                    <strong>@affino/menu-laravel</strong>. Submenus, keyboard navigation, and overlay positioning
                    remain deterministic as content changes.
                </p>
                <div class="menu-page-hero__chips" aria-label="Menu foundation">
                    <span class="menu-page-hero__chip">@affino/menu-core</span>
                    <span class="menu-page-hero__chip">@affino/menu-laravel</span>
                    <span class="menu-page-hero__chip">Livewire</span>
                </div>
            </div>

            <div class="menu-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="menu-demo__lead">
                    Primary menu with nested branches, a danger action, and keyboard-first flow.
                </p>
                <livewire:menu.simple />
            </div>
        </section>

        {{-- <section class="menu-page-cases" aria-label="Advanced menu scenarios">
            <div class="menu-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    Validate menu stability under Livewire pulses, list mutations, inline portals, and ignored islands.
                </p>
            </div>

            <div class="menu-edge-list">
                <article
                    class="menu-edge menu-edge--pulse"
                    data-affino-disclosure-root="menu-edge-pulse"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                        <span class="menu-edge__kicker">Edge case 01</span>
                        <span class="menu-edge__title">Livewire pulse</span>
                        <span class="menu-edge__lead">Menu remains usable while Livewire updates run.</span>
                    </button>
                    <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:menu.pulse />
                    </div>
                </article>

                <article
                    class="menu-edge menu-edge--mutation"
                    data-affino-disclosure-root="menu-edge-mutation"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                        <span class="menu-edge__kicker">Edge case 02</span>
                        <span class="menu-edge__title">Menu list mutations</span>
                        <span class="menu-edge__lead">Items can be added or removed without breaking hydration.</span>
                    </button>
                    <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:menu.mutation-board />
                    </div>
                </article>

                <article
                    class="menu-edge menu-edge--inline"
                    data-affino-disclosure-root="menu-edge-inline"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                        <span class="menu-edge__kicker">Edge case 03</span>
                        <span class="menu-edge__title">Inline portal menu</span>
                        <span class="menu-edge__lead">Panels stay inside scroll containers when needed.</span>
                    </button>
                    <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:menu.inline-portal />
                    </div>
                </article>

                <article
                    class="menu-edge menu-edge--ignored"
                    data-affino-disclosure-root="menu-edge-ignored"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="menu-edge__summary" data-affino-disclosure-trigger>
                        <span class="menu-edge__kicker">Edge case 04</span>
                        <span class="menu-edge__title"><code>wire:ignore</code> island</span>
                        <span class="menu-edge__lead">Menu stays interactive while Livewire updates around it.</span>
                    </button>
                    <div class="menu-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:menu.ignored />
                    </div>
                </article>
            </div>
        </section> --}}
    @elseif ($page === 'overlay-kernel')
        <section class="overlay-kernel-page-hero" aria-label="Overlay kernel overview">
            <div class="overlay-kernel-page-hero__content">
                <p class="overlay-kernel-page-hero__eyebrow">preview</p>
                <h2>Overlay kernel orchestration for deterministic stack behavior across primitives</h2>
                <p>
                    This page validates how <strong>@affino/overlay-kernel</strong> coordinates dialog, popover,
                    menu, listbox, and tooltip layers. The goal is predictable stacking, close reasons, and focus
                    ownership while Livewire continuously morphs the DOM.
                </p>
                <div class="overlay-kernel-page-hero__chips" aria-label="Overlay kernel foundation">
                    <span class="overlay-kernel-page-hero__chip">@affino/overlay-kernel</span>
                    <span class="overlay-kernel-page-hero__chip">@affino/laravel-adapter</span>
                    <span class="overlay-kernel-page-hero__chip">Livewire</span>
                </div>
            </div>

            <div class="overlay-kernel-page-hero__preview">
                <h3>Interactive hero preview</h3>
                <p class="overlay-kernel-hint">
                    Open nested layers and keep the inspector panel visible to verify stack transitions.
                </p>
                <livewire:overlay.simple />
            </div>
        </section>

        <section class="overlay-kernel-page-cases" aria-label="Advanced overlay kernel scenarios">
            <div class="overlay-kernel-page-cases__intro">
                <h3>Advanced and edge-case scenarios</h3>
                <p>
                    These scenarios target production failures: parent-child collapse, modal constraints, priority
                    overrides, and stable ids under Livewire rehydration.
                </p>
            </div>

            <div class="overlay-kernel-edge-list">
                <article
                    class="overlay-kernel-edge overlay-kernel-edge--owner"
                    data-affino-disclosure-root="overlay-kernel-edge-owner"
                    data-affino-disclosure-default-open="true"
                    data-affino-disclosure-state="open"
                >
                    <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                        <span class="overlay-kernel-edge__kicker">Edge case 01</span>
                        <span class="overlay-kernel-edge__title">Parent-child cascade close</span>
                        <span class="overlay-kernel-edge__lead">Closing a parent dialog must remove child overlays from the stack without leftovers.</span>
                    </button>
                    <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="open">
                        <livewire:overlay.owner-cascade-case />
                    </div>
                </article>

                <article
                    class="overlay-kernel-edge overlay-kernel-edge--modal"
                    data-affino-disclosure-root="overlay-kernel-edge-modal"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                        <span class="overlay-kernel-edge__kicker">Edge case 02</span>
                        <span class="overlay-kernel-edge__title">Modal focus and scroll constraints</span>
                        <span class="overlay-kernel-edge__lead">Modal popover and modal dialog should enforce outside interaction constraints correctly.</span>
                    </button>
                    <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:overlay.modal-rules-case />
                    </div>
                </article>

                <article
                    class="overlay-kernel-edge overlay-kernel-edge--priority"
                    data-affino-disclosure-root="overlay-kernel-edge-priority"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                        <span class="overlay-kernel-edge__kicker">Edge case 03</span>
                        <span class="overlay-kernel-edge__title">Priority ordering</span>
                        <span class="overlay-kernel-edge__lead">Two menus with different overlay priorities should produce deterministic top ordering.</span>
                    </button>
                    <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:overlay.priority-case />
                    </div>
                </article>

                <article
                    class="overlay-kernel-edge overlay-kernel-edge--rehydrate"
                    data-affino-disclosure-root="overlay-kernel-edge-rehydrate"
                    data-affino-disclosure-default-open="false"
                    data-affino-disclosure-state="closed"
                >
                    <button type="button" class="overlay-kernel-edge__summary" data-affino-disclosure-trigger>
                        <span class="overlay-kernel-edge__kicker">Edge case 04</span>
                        <span class="overlay-kernel-edge__title">Stable ids during Livewire rehydrate</span>
                        <span class="overlay-kernel-edge__lead">Typing and re-renders should not produce duplicate overlay id registration errors.</span>
                    </button>
                    <div class="overlay-kernel-edge__content" data-affino-disclosure-content data-state="closed" hidden>
                        <livewire:overlay.rehydrate-case />
                    </div>
                </article>
            </div>
        </section>
    @endif
</div>
