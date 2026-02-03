<section class="select-showcase" wire:key="select-showcase">
    <article class="select-hero-card">
        <div>
            <p class="select-hero__eyebrow">Surface Lab</p>
            <h2>Headless selects that stay in sync</h2>
            <p>
                <code>@affino/listbox-laravel</code> keeps combobox semantics, keyboard loops, and Livewire models aligned while DOM nodes
                morph. Bind to a property, dispatch manual actions, or render multiple selections without touching Alpine.
            </p>
        </div>

        <div class="select-hero__stats">
            <div>
                <span>Primary region</span>
                <strong>{{ $primaryRegionLabel }}</strong>
            </div>
            <div>
                <span>Watchers</span>
                <strong>{{ count($watchlists) }}</strong>
            </div>
            <div>
                <span>Escalation tier</span>
                <strong>{{ $priorityTierLabel }}</strong>
            </div>
        </div>
    </article>

    <div class="select-grid">
        <article class="select-card">
            <p class="select-card__eyebrow">Mode 01</p>
            <h3>Reflowed Livewire regions</h3>
            <p class="select-card__lead">
                The single-select control rehydrates after each Livewire update. Surface geometry, focus return, and aria-expanded are all
                driven by the JS helper.
            </p>

            <x-affino-listbox
                listbox-id="primary-region-select"
                label="Primary region"
                placeholder="Choose a region"
                model="primaryRegion"
                :selected="$primaryRegion"
            >
                <x-slot:trigger>
                    <button type="button" class="select-trigger">
                        <span>
                            <small>Region</small>
                            <strong>{{ $primaryRegionLabel }}</strong>
                        </span>
                        <span class="select-trigger__hint">Switch</span>
                    </button>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($regions as $region)
                        <x-affino-listbox.option
                            :value="$region['value']"
                            :label="$region['label']"
                            :selected="$region['value'] === $primaryRegion"
                        >
                            <div class="select-option">
                                <div>
                                    <p>{{ $region['label'] }}</p>
                                    <small>{{ $region['meta'] }}</small>
                                </div>
                                <span class="select-option__status">{{ $region['status'] }}</span>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-card__actions">
                <button type="button" class="select-btn" wire:click="randomizePrimary">Shuffle region</button>
                <span class="select-card__meta">Pinned: {{ $primaryRegionLabel }}</span>
            </div>
        </article>

        <article class="select-card">
            <p class="select-card__eyebrow">Mode 02</p>
            <h3>Multi-select watcher pools</h3>
            <p class="select-card__lead">
                Multi-select listboxes emit arrays directly into the Livewire model. No hidden inputs or manual parsing—`set()` receives
                the hydrated array instantly.
            </p>

            <x-affino-listbox
                listbox-id="watcher-select"
                label="Coverage pools"
                placeholder="Assign follow-the-sun coverage"
                mode="multiple"
                model="watchlists"
                :selected="$watchlists"
            >
                <x-slot:trigger>
                    <button type="button" class="select-trigger">
                        <span>
                            <small>Watchers</small>
                            <strong>{{ count($watchlists) > 0 ? count($watchlists) . ' active' : 'No teams assigned' }}</strong>
                        </span>
                        <span class="select-trigger__hint">Toggle</span>
                    </button>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($watcherPools as $pool)
                        <x-affino-listbox.option
                            :value="$pool['value']"
                            :label="$pool['label']"
                            :selected="in_array($pool['value'], $watchlists, true)"
                        >
                            <div class="select-option select-option--chips">
                                <div>
                                    <p>{{ $pool['label'] }}</p>
                                    <small>{{ $pool['meta'] }}</small>
                                </div>
                                <span class="select-chip">{{ strtoupper($pool['value']) }}</span>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-chip-row">
                @forelse ($watchlists as $value)
                    <span class="select-chip select-chip--filled">{{ strtoupper($value) }}</span>
                @empty
                    <span class="select-chip">No watchers yet</span>
                @endforelse
            </div>

            <div class="select-card__actions">
                <button type="button" class="select-btn" wire:click="applyFollowTheSun">Follow-the-sun preset</button>
                <button type="button" class="select-btn select-btn--ghost" wire:click="clearWatchlists">Clear</button>
            </div>
        </article>

        <article class="select-card">
            <p class="select-card__eyebrow">Mode 03</p>
            <h3>Manual controller dispatch</h3>
            <p class="select-card__lead">
                Manual buttons dispatch <code>affino-listbox:manual</code> so the controller opens, closes, or selects values while Livewire is
                still morphing the DOM.
            </p>

            <x-affino-listbox
                listbox-id="priority-tier-select"
                label="Escalation tier"
                placeholder="Choose tier"
                model="priorityTier"
                :selected="$priorityTier"
            >
                <x-slot:trigger>
                    <div class="select-trigger select-trigger--ghost">
                        <div>
                            <small>Escalation tier</small>
                            <strong>{{ $priorityTierLabel }}</strong>
                        </div>
                        <span class="select-trigger__hint">Manual</span>
                    </div>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($priorityTiers as $tier)
                        <x-affino-listbox.option
                            :value="$tier['value']"
                            :label="$tier['label']"
                            :selected="$tier['value'] === $priorityTier"
                        >
                            <div class="select-option">
                                <div>
                                    <p>{{ $tier['label'] }}</p>
                                    <small>{{ $tier['meta'] }}</small>
                                </div>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-card__actions select-card__actions--stack">
                <button type="button" class="select-btn" wire:click="openPriority">Open controller</button>
                <div class="select-manual-buttons">
                    <button type="button" class="select-btn select-btn--ghost" wire:click="setPriority('tier-0')">Tier 0</button>
                    <button type="button" class="select-btn select-btn--ghost" wire:click="setPriority('tier-2')">Tier 2</button>
                    <button type="button" class="select-btn select-btn--ghost" wire:click="setPriority('tier-3')">Tier 3</button>
                </div>
            </div>
        </article>
    </div>
</section>
