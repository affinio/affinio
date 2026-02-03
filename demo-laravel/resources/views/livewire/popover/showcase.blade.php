<section class="tooltip-showcase popover-showcase" wire:key="popover-showcase">
    <article class="tooltip-simple popover-spotlight">
        <div class="tooltip-simple__copy">
            <p class="tooltip-simple__eyebrow">Mode 01</p>
            <h2>Click surfaces with built-in focus loops</h2>
            <p>
                Popovers share the SurfaceCore timers, so a single Blade component delivers click + keyboard parity without
                authoring custom listeners. The helper wires ARIA, maintains placement, and hydates after Livewire morphs.
            </p>

            <div class="tooltip-simple__chips">
                <span>Click + keyboard ready</span>
                <span>SurfaceCore positioning</span>
                <span>Livewire hydration</span>
            </div>
        </div>

        <div class="tooltip-simple__stage">
            <div class="tooltip-stage">
                <x-affino-popover
                    class="popover-kernel"
                    popover-id="popover-quickstart"
                    placement="top"
                    align="center"
                    gutter="14"
                >
                    <x-slot:trigger>
                        <button type="button" class="tooltip-trigger">Escalate cluster</button>
                    </x-slot:trigger>

                    <div class="popover-bubble" role="dialog">
                        <p class="popover-bubble__title">Runbook shortcuts</p>
                        <p class="popover-bubble__body">
                            Dispatch the on-call ladder, attach the current diagnostics, and keep the Livewire timeline pinned for
                            reviewers.
                        </p>

                        <div class="popover-bubble__cta">
                            <button type="button" class="tooltip-button tooltip-button--accent">Assign DRI</button>
                            <button type="button" class="tooltip-button tooltip-button--ghost">Queue follow-up</button>
                        </div>
                    </div>

                    <x-slot:arrow>
                        <span class="popover-arrow"></span>
                    </x-slot:arrow>
                </x-affino-popover>
            </div>
        </div>
    </article>

    <div class="tooltip-demo-grid popover-grid">
        <article class="tooltip-card popover-card">
            <p class="tooltip-card__eyebrow">Mode 02</p>
            <h2 class="tooltip-card__title">Release windows via Livewire arrays</h2>
            <p class="tooltip-card__text">
                Each maintenance window re-renders when Livewire mutates the backing array. The surface re-hydrates in place, so
                open popovers keep their ARIA relationships and focus context.
            </p>

            <div class="popover-list">
                @foreach ($windows as $window)
                    <x-affino-popover
                        :popover-id="'window-' . $window['id']"
                        placement="bottom"
                        align="start"
                        gutter="12"
                        role="dialog"
                    >
                        <x-slot:trigger>
                            <button type="button" class="popover-trigger">
                                <span>
                                    <span class="popover-trigger__label">{{ $window['label'] }}</span>
                                    <small>{{ $window['window'] }}</small>
                                </span>
                                <span class="popover-pill">{{ $window['status'] }}</span>
                            </button>
                        </x-slot:trigger>

                        <div class="popover-bubble" role="dialog">
                            <p class="popover-bubble__title">{{ $window['label'] }}</p>
                            <p class="popover-bubble__body">{{ $window['summary'] }}</p>

                            <ul class="popover-bubble__list">
                                @foreach ($window['actions'] as $action)
                                    <li>{{ $action }}</li>
                                @endforeach
                            </ul>
                        </div>

                        <x-slot:arrow>
                            <span class="popover-arrow"></span>
                        </x-slot:arrow>
                    </x-affino-popover>

                    <div class="popover-row__actions">
                        <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="cycleWindow({{ $window['id'] }})">
                            Rotate status
                        </button>
                    </div>
                @endforeach
            </div>

            <button type="button" class="tooltip-button" wire:click="scheduleWindow">Schedule new window</button>
        </article>

        <article class="tooltip-card popover-card">
            <p class="tooltip-card__eyebrow">Mode 03</p>
            <h2 class="tooltip-card__title">Contextual journeys</h2>
            <p class="tooltip-card__text">
                Select a journey to preview the exact checklist that a regional team should follow. The popover surface
                repositions automatically when the copy grows or shrinks.
            </p>

            <div class="popover-tabs">
                @foreach ($journeyKeys as $journey)
                    <button
                        type="button"
                        class="tooltip-button {{ $activeJourney === $journey ? '' : 'tooltip-button--ghost' }}"
                        wire:click="selectJourney('{{ $journey }}')"
                    >
                        {{ strtoupper($journey) }}
                    </button>
                @endforeach
            </div>

            <div class="popover-journey">
                <div>
                    <p class="popover-journey__eyebrow">{{ $activeJourneyData['duration'] }}</p>
                    <h3>{{ $activeJourneyData['title'] }}</h3>
                    <p class="tooltip-card__text">{{ $activeJourneyData['summary'] }}</p>
                </div>

                <x-affino-popover
                    :popover-id="'journey-' . $activeJourneyData['id']"
                    placement="bottom"
                    align="start"
                    gutter="14"
                >
                    <x-slot:trigger>
                        <button type="button" class="tooltip-button">View steps</button>
                    </x-slot:trigger>

                    <div class="popover-bubble" role="dialog">
                        <p class="popover-bubble__title">{{ $activeJourneyData['title'] }} steps</p>
                        <ol class="popover-bubble__ordered">
                            @foreach ($activeJourneyData['steps'] as $index => $step)
                                <li>
                                    <span>{{ $index + 1 }}</span>
                                    <p>{{ $step }}</p>
                                </li>
                            @endforeach
                        </ol>
                    </div>

                    <x-slot:arrow>
                        <span class="popover-arrow"></span>
                    </x-slot:arrow>
                </x-affino-popover>
            </div>
        </article>

        <article class="tooltip-card popover-card">
            <p class="tooltip-card__eyebrow">Mode 04</p>
            <h2 class="tooltip-card__title">Pinned follow-ups via manual dispatch</h2>
            <p class="tooltip-card__text">
                Keep the surface open across Livewire morphs. The anchor is visually present but pointer events are disabled –
                manual buttons dispatch <code>affino-popover:manual</code> so JS drives the controller.
            </p>

            <x-affino-popover
                popover-id="playbook-pin-popover"
                placement="top"
                align="center"
                gutter="18"
                close-on-interact-outside="false"
                :data-affino-popover-pinned="$pinManual ? 'true' : 'false'"
            >
                <x-slot:trigger>
                    <div class="tooltip-manual-anchor" role="presentation">
                        <span>Livewire playbook anchor</span>
                        <small>Pointer events disabled · manual only</small>
                    </div>
                </x-slot:trigger>

                <div class="popover-bubble" role="dialog">
                    <p class="popover-bubble__title">Pinned instructions</p>
                    <p class="popover-bubble__body">
                        Dispatch <code>affino-popover:manual</code> with an ID and action. The helper keeps the controller stable
                        even when Livewire swaps DOM nodes.
                    </p>
                    <ul class="popover-bubble__list">
                        <li>Open / close from PHP, Alpine, or vanilla JS</li>
                        <li>Keep pinned across pagination + poll renders</li>
                        <li>Return focus to the anchor automatically</li>
                    </ul>
                </div>
            </x-affino-popover>

            <div class="tooltip-manual-controls__actions">
                <button
                    type="button"
                    class="tooltip-button tooltip-button--accent"
                    wire:click="$dispatch('affino-popover:manual', { id: 'playbook-pin-popover', action: 'open', reason: 'programmatic' })"
                >
                    Open popover
                </button>
                <button
                    type="button"
                    class="tooltip-button tooltip-button--ghost"
                    wire:click="$dispatch('affino-popover:manual', { id: 'playbook-pin-popover', action: 'close', reason: 'programmatic' })"
                >
                    Close popover
                </button>
            </div>

            <label class="tooltip-manual-toggle" for="popover-pin-manual">
                <input id="popover-pin-manual" name="popover_pin_manual" type="checkbox" wire:model.live="pinManual">
                Keep popover pinned after morphs
            </label>
        </article>

        <article class="tooltip-card popover-card">
            <p class="tooltip-card__eyebrow">Mode 05</p>
            <h2 class="tooltip-card__title">Modal composer + scroll locking</h2>
            <p class="tooltip-card__text">
                The modal popover locks the document scroll, traps focus, and stays centered even when Livewire rebuilds the
                card. Buttons below call the controller manually.
            </p>

            <div class="popover-modal-actions">
                <button type="button" class="tooltip-button" wire:click="openComposer" @disabled($composerOpen)>
                    Launch composer
                </button>
                <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="closeComposer">
                    Dismiss composer
                </button>
            </div>

            <x-affino-popover
                popover-id="composer-popover"
                placement="top"
                align="center"
                gutter="20"
                modal="true"
                lock-scroll="true"
                :close-on-interact-outside="false"
                :default-open="$composerOpen"
                role="dialog"
            >
                <x-slot:trigger>
                    <button type="button" class="sr-only" aria-hidden="true" tabindex="-1">Hidden trigger</button>
                </x-slot:trigger>

                <div class="popover-modal" role="dialog">
                    <p class="popover-bubble__title">Compose new policy</p>
                    <p class="popover-bubble__body">Modal popovers keep scroll locked while you capture approvals.</p>

                    <form class="popover-form" wire:submit.prevent>
                        <label>
                            <span>Escalation name</span>
                            <input id="composer-escalation" name="composer_escalation" type="text" placeholder="Cache failover" />
                        </label>

                        <label>
                            <span>Notes</span>
                            <textarea
                                id="composer-notes"
                                name="composer_notes"
                                rows="3"
                                placeholder="Outline the recovery story"
                            ></textarea>
                        </label>
                    </form>

                    <div class="popover-bubble__cta">
                        <button type="button" class="tooltip-button tooltip-button--accent" wire:click="closeComposer">
                            Save &amp; close
                        </button>
                        <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="closeComposer">
                            Cancel
                        </button>
                    </div>
                </div>
            </x-affino-popover>
        </article>
    </div>
</section>
