<section class="dialog-showcase" wire:key="dialog-showcase" data-affino-livewire-id="{{ $this->getId() }}">
    <article class="dialog-card dialog-card--spotlight">
        <p class="dialog-card__eyebrow">Mode 01</p>
        <h2 class="dialog-card__title">Command palette with optimistic telemetry</h2>
        <p class="dialog-card__text">
            The Blade helper handles focus choreography, scroll locking, and teleportation once the dialog opens. Buttons inside
            the surface call Livewire actions, and each morph re-hydrates the controller without losing the overlay.
        </p>

        <div class="dialog-panel__grid">
            <ul class="dialog-timeline" aria-label="Recent dialog actions">
                @foreach ($timeline as $entry)
                    <li class="dialog-timeline__item" wire:key="timeline-{{ $entry['id'] }}">
                        <div class="dialog-timeline__meta">
                            <p class="dialog-timeline__label">{{ $entry['label'] }}</p>
                            <p class="dialog-timeline__detail">{{ $entry['detail'] }}</p>
                        </div>
                        <span class="dialog-pill">{{ $entry['meta'] }}</span>
                    </li>
                @endforeach
            </ul>

            <div>
                <x-affino-dialog
                    dialog-id="livewire-dialog-command"
                    labelled-by="command-dialog-title"
                    description-id="command-dialog-description"
                    teleport="inline"
                >
                    <x-slot:trigger>
                        <button type="button" class="dialog-trigger">
                            <span class="dialog-trigger__pulse" aria-hidden="true"></span>
                            Launch command palette
                        </button>
                    </x-slot:trigger>

                    <div class="dialog-panel" role="document">
                        <div class="dialog-panel__header">
                            <div>
                                <p class="dialog-badge">Livewire surface</p>
                                <h3 id="command-dialog-title" class="dialog-panel__title">Productivity palette</h3>
                                <p id="command-dialog-description" class="dialog-panel__meta">
                                    Timeline entries append instantly while the controller keeps the modal mounted.
                                </p>
                            </div>
                            <button type="button" class="dialog-button dialog-button--ghost" data-affino-dialog-dismiss="programmatic">
                                Close
                            </button>
                        </div>

                        <div class="dialog-panel__grid">
                            <div class="dialog-checklist" role="group" aria-label="Quick commands">
                                <button
                                    type="button"
                                    class="dialog-button dialog-button--mono"
                                    data-affino-dialog-command="compose"
                                >
                                    <span class="dialog-button__label">Draft incident note</span>
                                    <span class="dialog-button__status" aria-hidden="true">Logging…</span>
                                </button>
                                <button
                                    type="button"
                                    class="dialog-button dialog-button--mono"
                                    data-affino-dialog-command="dispatch"
                                >
                                    <span class="dialog-button__label">Page on-call ladder</span>
                                    <span class="dialog-button__status" aria-hidden="true">Logging…</span>
                                </button>
                                <button
                                    type="button"
                                    class="dialog-button dialog-button--mono"
                                    data-affino-dialog-command="sync"
                                >
                                    <span class="dialog-button__label">Sync cache mirrors</span>
                                    <span class="dialog-button__status" aria-hidden="true">Logging…</span>
                                </button>
                                <button
                                    type="button"
                                    class="dialog-button dialog-button--mono"
                                    data-affino-dialog-command="archive"
                                >
                                    <span class="dialog-button__label">Archive retro draft</span>
                                    <span class="dialog-button__status" aria-hidden="true">Logging…</span>
                                </button>
                            </div>
                            <div class="dialog-panel__insights">
                                <div class="dialog-alert" aria-live="polite">
                                    <p class="dialog-alert__eyebrow">Last action</p>
                                    @if ($lastEvent)
                                        <p class="dialog-alert__title">{{ $lastEvent['label'] }}</p>
                                        <p class="dialog-alert__detail">{{ $lastEvent['detail'] }}</p>
                                        <span class="dialog-pill dialog-alert__pill">{{ $lastEvent['meta'] }}</span>
                                    @else
                                        <p class="dialog-alert__detail">Trigger any command to append a new timeline entry.</p>
                                    @endif
                                </div>

                                <div class="dialog-panel__feed" aria-live="polite">
                                    <p class="dialog-panel__feed-title">Live telemetry</p>
                                    <ul>
                                        @foreach (array_slice($timeline, 0, 3) as $entry)
                                            <li>
                                                <span>{{ $entry['label'] }}</span>
                                                <span class="dialog-pill">{{ $entry['meta'] }}</span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>

                                <ul class="dialog-checklist" aria-label="Live guardrails">
                                    <li>
                                        <span>Focus lock</span>
                                        <span class="dialog-pill">On</span>
                                    </li>
                                    <li>
                                        <span>Scroll lock</span>
                                        <span class="dialog-pill">Enabled</span>
                                    </li>
                                    <li>
                                        <span>Teleport target</span>
                                        <span class="dialog-pill">#affino-dialog-host</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </x-affino-dialog>
            </div>
        </div>
    </article>

    <div class="dialog-grid">
        <article class="dialog-card dialog-card--sheet">
            <p class="dialog-card__eyebrow">Mode 02</p>
            <h2 class="dialog-card__title">Sheets that hydrate after every Livewire render</h2>
            <p class="dialog-card__text">
                Select a journey to swap the copy that feeds the sheet dialog. The overlay-kind switches the visual treatment while
                the helper keeps the overlay teleported into the dialog host so stacking rules remain predictable.
            </p>

            <div class="dialog-journeys">
                <div class="dialog-journeys__tabs" role="tablist">
                    @foreach ($journeyKeys as $journey)
                        <button
                            type="button"
                            class="dialog-button dialog-button--ghost {{ $journey === $activeJourney ? 'is-active dialog-journeys__tab' : 'dialog-journeys__tab' }}"
                            wire:click="selectJourney('{{ $journey }}')"
                            role="tab"
                            aria-selected="{{ $journey === $activeJourney ? 'true' : 'false' }}"
                        >
                            {{ strtoupper($journey) }}
                        </button>
                    @endforeach
                </div>

                <div class="dialog-journeys__body">
                    <p class="dialog-card__eyebrow">{{ $activeJourneyData['duration'] }}</p>
                    <h3>{{ $activeJourneyData['title'] }}</h3>
                    <p class="dialog-card__text">{{ $activeJourneyData['summary'] }}</p>
                </div>

                <x-affino-dialog
                    dialog-id="journey-sheet"
                    modal="false"
                    lock-scroll="false"
                    close-on-backdrop="true"
                    overlay-kind="sheet"
                    labelled-by="journey-sheet-title"
                    description-id="journey-sheet-description"
                    surface-role="dialog"
                >
                    <x-slot:trigger>
                        <button type="button" class="dialog-button dialog-button--accent">Preview steps</button>
                    </x-slot:trigger>

                    <div class="dialog-sheet" role="document">
                        <div class="dialog-panel__header">
                            <div>
                                <p class="dialog-badge">Sheet overlay</p>
                                <h3 id="journey-sheet-title" class="dialog-panel__title">{{ $activeJourneyData['title'] }}</h3>
                                <p id="journey-sheet-description" class="dialog-panel__meta">
                                    These steps stay in sync as Livewire swaps the surrounding content.
                                </p>
                            </div>
                            <button type="button" class="dialog-button dialog-button--ghost" data-affino-dialog-dismiss="programmatic">
                                Close
                            </button>
                        </div>

                        <ol class="dialog-sheet__list">
                            @foreach ($activeJourneyData['steps'] as $index => $step)
                                <li>Step {{ $index + 1 }} · {{ $step }}</li>
                            @endforeach
                        </ol>
                    </div>
                </x-affino-dialog>
            </div>
        </article>

        <article class="dialog-card dialog-card--manual">
            <p class="dialog-card__eyebrow">Mode 03</p>
            <h2 class="dialog-card__title">Manual controllers + pinned overlays</h2>
            <p class="dialog-card__text">
                Dispatch `affino-dialog:manual` from Livewire to open or close the modal without a visible trigger. When the pinned flag
                is set, the helper remembers the open state and restores it after the next morph.
            </p>

            <div class="dialog-manual-anchor">
                <p class="dialog-card__text">
                    The visible anchor never receives pointer events. Instead, the server dispatches CustomEvents so the hydrated controller
                    decides when to open or close.
                </p>
            </div>

                <x-affino-dialog
                    dialog-id="manual-ops-dialog"
                    labelled-by="manual-dialog-title"
                    aria-label="Manual modal"
                    :close-on-backdrop="true"
                    :return-focus="false"
                    :pinned="$manualPinned"
                >
                <x-slot:trigger>
                    <button type="button" class="sr-only" aria-hidden="true" disabled>Manual trigger</button>
                </x-slot:trigger>

                <div class="dialog-panel" role="document">
                    <div class="dialog-panel__header">
                        <div>
                            <p class="dialog-badge">Pinned modal</p>
                            <h3 id="manual-dialog-title" class="dialog-panel__title">Livewire manual control</h3>
                            <p class="dialog-panel__meta">
                                The pinned attribute re-opens this dialog after morphs, so programmatic state survives.
                            </p>
                        </div>
                        <button type="button" class="dialog-button dialog-button--ghost" data-affino-dialog-dismiss="programmatic">
                            Close
                        </button>
                    </div>

                    <ul class="dialog-checklist" aria-label="Dialog traits">
                        <li>
                            <span>Focus return</span>
                            <span class="dialog-pill">Auto</span>
                        </li>
                        <li>
                            <span>Scroll lock</span>
                            <span class="dialog-pill">Enabled</span>
                        </li>
                        <li>
                            <span>Manual bridge</span>
                            <span class="dialog-pill">affino-dialog:manual</span>
                        </li>
                    </ul>
                </div>
            </x-affino-dialog>

            <div class="dialog-manual-controls" role="group" aria-label="Manual dialog controls">
                <button
                    type="button"
                    class="dialog-button dialog-button--accent"
                    data-manual-dialog-focus-target="true"
                    wire:click="$dispatch('affino-dialog:manual', { id: 'manual-ops-dialog', action: 'open', reason: 'programmatic' })"
                >
                    Open dialog
                </button>
                <button
                    type="button"
                    class="dialog-button dialog-button--ghost"
                    wire:click="$dispatch('affino-dialog:manual', { id: 'manual-ops-dialog', action: 'close', reason: 'programmatic' })"
                >
                    Close dialog
                </button>
                <label class="dialog-toggle" for="dialog-pin-toggle">
                    <input id="dialog-pin-toggle" type="checkbox" wire:model.live="manualPinned">
                    Keep pinned across morphs
                </label>
            </div>
            <p class="dialog-note">
                The JS helper retries hydration up to 20 animation frames so dispatching an event immediately after a Livewire render still works.
            </p>
        </article>
    </div>
</section>
