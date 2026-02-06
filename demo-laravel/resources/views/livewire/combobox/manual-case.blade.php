<div class="combobox-manual">
    <div class="combobox-manual__actions">
        <button type="button" class="combobox-button" wire:click="openFromServer">
            Open
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="closeFromServer">
            Close
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="selectFromServer('tier-0')">
            Select Tier 0
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="clearFromServer">
            Clear
        </button>
    </div>

    <x-affino-combobox
        class="combobox-demo"
        :combobox-id="$comboboxId"
        label="Escalation lane"
        placeholder="Manual bridge controlled combobox"
        model="selection"
        :selected="$selection !== '' ? $selection : null"
        :display="$selection !== '' ? $selectionLabel : ''"
        :open-on-pointer-down="false"
        wire:key="combobox-manual-{{ $comboboxId }}"
    >
        @foreach ($escalations as $escalation)
            <x-affino-combobox-option
                value="{{ $escalation['value'] }}"
                label="{{ $escalation['label'] }}"
                :selected="$selection === $escalation['value']"
            >
                <div class="combobox-optionView">
                    <strong>{{ $escalation['label'] }}</strong>
                    <span>{{ $escalation['meta'] }}</span>
                </div>
            </x-affino-combobox-option>
        @endforeach
    </x-affino-combobox>

    <dl class="combobox-manual__state">
        <div>
            <dt>Root id</dt>
            <dd>{{ $comboboxId }}</dd>
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
