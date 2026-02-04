<section class="select-showcase" wire:key="combobox-showcase">
    <header class="select-lede">
        <p class="select-kicker">Affino · Livewire</p>
        <h1>Combobox demos with instant filtering</h1>
        <p class="select-note">
            Text input drives `@affino/listbox-core` under the hood—typing filters options, open state persists across Livewire morphs, and
            every dropdown exposes a manual controller.
        </p>
    </header>

    <div class="select-grid">
        <article class="select-panel" id="demo-playbooks">
            <header class="select-panel__head">
                <span class="select-pill">Demo 01 · Search-first</span>
                <h2>Type to filter incident playbooks</h2>
                <p>Keyboard loops, substring filtering, and Livewire sync stay intact while the surface remains pinned open.</p>
            </header>

            <ul class="select-checklist">
                <li>Case-insensitive substring match (label + slot text)</li>
                <li>Open state persists via `pinned="true"`</li>
                <li>`wire:model="playbook"` mirrors Livewire state</li>
            </ul>

            <x-affino-combobox
                class="select-combobox"
                combobox-id="demo-playbook-combobox"
                label="Primary playbook"
                placeholder="Search playbooks"
                model="playbook"
                :selected="$playbook"
                :pinned="true"
            >
                @foreach ($playbooks as $playbookOption)
                    <x-affino-combobox.option
                        :value="$playbookOption['value']"
                        :label="$playbookOption['label']"
                        :selected="$playbookOption['value'] === $playbook"
                    >
                        <div class="select-option select-option--stacked">
                            <strong>{{ $playbookOption['label'] }}</strong>
                            <small>{{ $playbookOption['meta'] }}</small>
                        </div>
                    </x-affino-combobox.option>
                @endforeach
            </x-affino-combobox>

            <div class="select-actions" data-affino-combobox-sticky="demo-playbook-combobox">
                <button type="button" class="select-btn" wire:click="rollPlaybook">Rotate highlight</button>
                <span class="select-meta">Selected: <code>{{ $playbookLabel }}</code></span>
            </div>
        </article>

        <article class="select-panel" id="demo-services">
            <header class="select-panel__head">
                <span class="select-pill">Demo 02 · Dataset swaps</span>
                <h2>Livewire rebuilds the list while open</h2>
                <p>Swap entire datasets with Livewire; the combobox keeps geometry, focus, and selection.</p>
            </header>

            <div class="select-dataset" data-affino-combobox-sticky="demo-service-combobox">
                <button type="button" class="select-btn select-btn--subtle" wire:click="loadPreviousServiceDataset">Previous dataset</button>
                <button type="button" class="select-btn" wire:click="loadNextServiceDataset">Load next dataset</button>
                @if ($serviceDataset)
                    <span class="select-meta">
                        {{ $serviceDataset['label'] }} · {{ $serviceDataset['description'] }}
                    </span>
                @endif
            </div>

            <x-affino-combobox
                class="select-combobox"
                combobox-id="demo-service-combobox"
                label="Service datasets"
                placeholder="Choose service"
                model="service"
                :selected="$service"
                :pinned="true"
            >
                @foreach ($serviceOptions as $option)
                    <x-affino-combobox.option
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
                    </x-affino-combobox.option>
                @endforeach
            </x-affino-combobox>

            <p class="select-note">Livewire swaps the option list every click, yet the combobox stays open and remembers focus.</p>
        </article>

        <article class="select-panel" id="demo-watchers">
            <header class="select-panel__head">
                <span class="select-pill">Demo 03 · Multi assign</span>
                <h2>Multi-select with Shift/Ctrl + filtering</h2>
                <p>Pinned toolbar prevents accidental closure while control groups dispatch Livewire updates.</p>
            </header>

            <div class="select-hint">Keep typing to filter teams, then use Shift/Ctrl to build a range. `Ctrl + A` selects every visible option.</div>

            <x-affino-combobox
                class="select-combobox"
                combobox-id="demo-watch-combobox"
                label="Coverage pools"
                placeholder="Search coverage teams"
                model="watchTeams"
                mode="multiple"
                :selected="$watchTeams"
            >
                @foreach ($watchCandidates as $team)
                    <x-affino-combobox.option
                        :value="$team['value']"
                        :label="$team['label']"
                        :selected="in_array($team['value'], $watchTeams, true)"
                    >
                        <div class="select-option select-option--stacked">
                            <strong>{{ $team['label'] }}</strong>
                            <small>{{ $team['meta'] }}</small>
                        </div>
                    </x-affino-combobox.option>
                @endforeach
            </x-affino-combobox>

            <div class="select-chip-row">
                @forelse ($watchTeams as $value)
                    <span class="select-chip">{{ strtoupper($value) }}</span>
                @empty
                    <span class="select-chip select-chip--muted">No teams selected</span>
                @endforelse
            </div>

            <div class="select-actions" data-affino-combobox-sticky="demo-watch-combobox">
                <button type="button" class="select-btn" wire:click="seedWatchTeams">Preset (EMEA · USW · APAC)</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="clearWatchTeams">Clear</button>
            </div>
        </article>

        <article class="select-panel" id="demo-manual-combobox">
            <header class="select-panel__head">
                <span class="select-pill">Demo 04 · Manual control</span>
                <h2>Drive a combobox from Livewire</h2>
                <p>`affino-combobox:manual` proxies to the imperative handle so programmatic flows stay instant.</p>
            </header>

            <x-affino-combobox
                class="select-combobox select-combobox--ghost"
                combobox-id="manual-escalation-combobox"
                label="Escalation tier"
                placeholder="Choose escalation tier"
                model="manualEscalation"
                :selected="$manualEscalation"
            >
                @foreach ($manualEscalations as $tier)
                    <x-affino-combobox.option
                        :value="$tier['value']"
                        :label="$tier['label']"
                        :selected="$tier['value'] === $manualEscalation"
                    >
                        <div class="select-option select-option--stacked">
                            <strong>{{ $tier['label'] }}</strong>
                            <small>{{ $tier['meta'] }}</small>
                        </div>
                    </x-affino-combobox.option>
                @endforeach
            </x-affino-combobox>

            <div class="select-manual-bridge" data-affino-combobox-sticky="manual-escalation-combobox">
                <button type="button" class="select-btn" wire:click="openManualEscalation">Open controller</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="closeManualEscalation">Close</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="selectManualEscalation('tier-0')">Select Tier 0</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="selectManualEscalation('tier-2')">Select Tier 2</button>
                <button type="button" class="select-btn select-btn--subtle" wire:click="clearManualEscalation">Clear</button>
            </div>

            <p class="select-note">
                Buttons dispatch `affino-combobox:manual` so the dropdown responds instantly while Livewire remains source of truth.
            </p>
        </article>
    </div>
</section>
