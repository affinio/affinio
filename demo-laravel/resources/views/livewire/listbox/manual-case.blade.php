<div class="listbox-manual">
    <div class="listbox-manual__actions" data-affino-listbox-sticky="{{ $listboxId }}">
        <button type="button" class="listbox-button" wire:click="openFromServer">
            Open
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="closeFromServer">
            Close
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="toggleFromServer">
            Toggle
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="selectFromServer('tier-0')">
            Select Tier 0
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="clearFromServer">
            Clear
        </button>
    </div>

    <x-affino-listbox
        class="listbox-demo"
        :listbox-id="$listboxId"
        label="Escalation lane"
        placeholder="Manual bridge controlled listbox"
        model="selection"
        :selected="$selection !== '' ? $selection : null"
        :display="$selection !== '' ? $selectionLabel : ''"
        wire:key="listbox-manual-{{ $listboxId }}"
    >
        @foreach ($tiers as $tier)
            <x-affino-listbox-option
                value="{{ $tier['value'] }}"
                :selected="$selection === $tier['value']"
            >
                <div class="listbox-optionView">
                    <strong>{{ $tier['label'] }}</strong>
                    <span>{{ $tier['meta'] }}</span>
                </div>
            </x-affino-listbox-option>
        @endforeach
    </x-affino-listbox>

    <dl class="listbox-manual__state">
        <div>
            <dt>Root id</dt>
            <dd>{{ $listboxId }}</dd>
        </div>
        <div>
            <dt>Last action</dt>
            <dd>{{ $lastAction }}</dd>
        </div>
        <div>
            <dt>Dispatches</dt>
            <dd>{{ $dispatchCount }}</dd>
        </div>
    </dl>
</div>
