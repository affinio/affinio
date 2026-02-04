<section class="select-showcase" wire:key="select-showcase">
    <header class="select-lede">
        <p class="select-kicker">Affino · Livewire</p>
        <h1>Listbox demos built for Laravel</h1>
        <p class="select-note">
            Same dark skin as the tooltip and popover demos—visuals stay consistent while the component handles behavior, focus, and Livewire
            sync.
        </p>
    </header>

    <div class="select-grid">
        <article class="select-panel" id="demo-basic">
            <header class="select-panel__head">
                <span class="select-pill">Demo 01 · Drop-in select</span>
                <h2>Basic select that never resets</h2>
                <p>Wire it like `<x-affino-listbox model="region" />` and keep keyboard loops, aria, and Livewire state intact.</p>
            </header>

            <ul class="select-checklist">
                <li>Full keyboard control (Enter, ↑/↓, Esc)</li>
                <li>`wire:model="region"` mirrors the hidden input</li>
                <li>Livewire morphs do not close the list</li>
            </ul>

            <x-affino-listbox
                listbox-id="demo-basic-region"
                model="region"
                placeholder="Select region"
                :selected="$region"
                aria-label="Primary region"
            >
                <x-slot:trigger>
                    <button type="button" class="select-trigger">
                        <span class="select-trigger__label">Region</span>
                        <span class="select-trigger__value">{{ $regionLabel }}</span>
                        <span class="select-trigger__hint">wire:model="region"</span>
                    </button>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($demoRegions as $regionOption)
                        <x-affino-listbox.option
                            :value="$regionOption['value']"
                            :label="$regionOption['label']"
                            :selected="$regionOption['value'] === $region"
                        >
                            <div class="select-option">
                                <div>
                                    <strong>{{ $regionOption['label'] }}</strong>
                                    <small>{{ $regionOption['meta'] }}</small>
                                </div>
                                <span class="select-option__meta">ARIA-ready</span>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-actions" data-affino-listbox-sticky="demo-basic-region">
                <button type="button" class="select-btn" wire:click="cycleRegion">Simulate Livewire update</button>
                <span class="select-meta">Current value: <code>{{ $region }}</code></span>
            </div>
        </article>

        <article class="select-panel" id="demo-dynamic">
            <header class="select-panel__head">
                <span class="select-pill">Demo 02 · Dynamic options</span>
                <h2>Livewire keeps dropdowns open</h2>
                <p>Swap the dataset with Livewire and keep focus, selection, and geometry.</p>
            </header>

            <div class="select-dataset" data-affino-listbox-sticky="demo-service">
                <button type="button" class="select-btn select-btn--subtle" wire:click="loadPreviousDataset">Previous dataset</button>
                <button type="button" class="select-btn" wire:click="loadNextDataset">Load next dataset</button>
                @if ($serviceDataset)
                    <span class="select-meta">
                        {{ $serviceDataset['label'] }} · {{ $serviceDataset['description'] }}
                    </span>
                @endif
            </div>

            <x-affino-listbox
                listbox-id="demo-service"
                model="service"
                placeholder="Choose service"
                :selected="$service"
                aria-label="Service dataset"
            >
                <x-slot:trigger>
                    <button type="button" class="select-trigger">
                        <span class="select-trigger__label">Service</span>
                        <span class="select-trigger__value">{{ $serviceLabel }}</span>
                        <span class="select-trigger__hint">DOM morph safe</span>
                    </button>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($serviceOptions as $option)
                        <x-affino-listbox.option
                            :value="$option['value']"
                            :label="$option['label']"
                            :selected="$option['value'] === $service"
                        >
                            <div class="select-option">
                                <div>
                                    <strong>{{ $option['label'] }}</strong>
                                    <small>{{ $option['meta'] }}</small>
                                </div>
                                <span class="select-option__meta">{{ $serviceDataset['label'] ?? 'Dataset' }}</span>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <p class="select-note">Livewire rebuilds the option list every click, yet the dropdown stays open and the selection persists.</p>
        </article>

        <article class="select-panel" id="demo-multiselect">
            <header class="select-panel__head">
                <span class="select-pill">Demo 03 · Ranges</span>
                <h2>Multi-select with Shift/Ctrl</h2>
                <p>Desktop-grade selection: Shift ranges, Ctrl/⌘ toggles, and Ctrl+A select-all.</p>
            </header>

            <div class="select-hint">Hold Shift to select a range. Use Ctrl/⌘ to toggle. Press Ctrl+A to select every team.</div>

            <x-affino-listbox
                listbox-id="demo-teams"
                model="teamSelection"
                mode="multiple"
                placeholder="Choose coverage teams"
                :selected="$teamSelection"
                aria-label="Coverage pools"
            >
                <x-slot:trigger>
                    <button type="button" class="select-trigger">
                        <span class="select-trigger__label">Watchers</span>
                        <span class="select-trigger__value">
                            {{ count($teamSelection) ? count($teamSelection) . ' selected' : 'No teams assigned' }}
                        </span>
                        <span class="select-trigger__hint">mode="multiple"</span>
                    </button>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($responseTeams as $team)
                        <x-affino-listbox.option
                            :value="$team['value']"
                            :label="$team['label']"
                            :selected="in_array($team['value'], $teamSelection, true)"
                        >
                            <div class="select-option select-option--stacked">
                                <strong>{{ $team['label'] }}</strong>
                                <small>{{ $team['meta'] }}</small>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-chip-row">
                @forelse ($teamSelection as $value)
                    <span class="select-chip">{{ strtoupper($value) }}</span>
                @empty
                    <span class="select-chip select-chip--muted">No teams yet</span>
                @endforelse
            </div>

            <div class="select-actions" data-affino-listbox-sticky="demo-teams">
                <button type="button" class="select-btn" wire:click="seedTeams">Preset (EMEA · USW · APAC)</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="clearTeams">Clear</button>
            </div>
        </article>

        <article class="select-panel" id="demo-manual">
            <header class="select-panel__head">
                <span class="select-pill">Demo 04 · Manual control</span>
                <h2>Dispatch actions from Livewire</h2>
                <p>`affino-listbox:manual` drives the controller even while Livewire is morphing the DOM.</p>
            </header>

            <x-affino-listbox
                listbox-id="manual-tier-select"
                model="manualTier"
                placeholder="Choose escalation tier"
                :selected="$manualTier"
                aria-label="Escalation tier"
            >
                <x-slot:trigger>
                    <div class="select-trigger select-trigger--ghost">
                        <span class="select-trigger__label">Tier</span>
                        <span class="select-trigger__value">{{ $manualTierLabel }}</span>
                        <span class="select-trigger__hint">manual bridge</span>
                    </div>
                </x-slot:trigger>

                <div class="select-menu">
                    @foreach ($manualTiers as $tier)
                        <x-affino-listbox.option
                            :value="$tier['value']"
                            :label="$tier['label']"
                            :selected="$tier['value'] === $manualTier"
                        >
                            <div class="select-option select-option--stacked">
                                <strong>{{ $tier['label'] }}</strong>
                                <small>{{ $tier['meta'] }}</small>
                            </div>
                        </x-affino-listbox.option>
                    @endforeach
                </div>
            </x-affino-listbox>

            <div class="select-manual-bridge">
                <button type="button" class="select-btn" wire:click="openManualTier">Open controller</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="closeManualTier">Close</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="selectManualTier('tier-0')">Select Tier 0</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="selectManualTier('tier-1')">Select Tier 1</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="selectManualTier('none')">Mark unassigned</button>
            </div>

            <p class="select-note">
                Buttons dispatch `affino-listbox:manual` to the DOM controller, so the dropdown responds immediately while Livewire keeps the
                source of truth.
            </p>
        </article>
    </div>
</section>
