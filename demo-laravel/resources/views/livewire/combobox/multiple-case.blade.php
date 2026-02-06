@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'combobox-multiple';
    $comboboxId = "multiple-combobox-{$componentId}";
    $display = count($selectedLabels) > 0 ? count($selectedLabels).' selected' : '';
@endphp

<div class="combobox-multiple">
    <div class="combobox-multiple__actions">
        <button type="button" class="combobox-button" wire:click="seedFollowSun">
            Seed follow-the-sun
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="clearSelection">
            Clear all
        </button>
    </div>

    <x-affino-combobox
        class="combobox-demo"
        :combobox-id="$comboboxId"
        label="Watch teams"
        placeholder="Search teams and select multiple"
        mode="multiple"
        model="selection"
        :selected="$selection"
        :display="$display"
        wire:key="combobox-multiple-{{ $componentId }}"
    >
        @foreach ($teams as $team)
            <x-affino-combobox-option
                value="{{ $team['value'] }}"
                label="{{ $team['label'] }}"
                :selected="in_array($team['value'], $selection, true)"
            >
                <div class="combobox-optionView">
                    <strong>{{ $team['label'] }}</strong>
                    <span>{{ $team['meta'] }}</span>
                </div>
            </x-affino-combobox-option>
        @endforeach
    </x-affino-combobox>

    <div class="combobox-multiple__chips">
        @if ($selectedLabels === [])
            <span class="combobox-chip combobox-chip--ghost">No teams selected</span>
        @else
            @foreach ($selectedLabels as $label)
                <span class="combobox-chip">{{ $label }}</span>
            @endforeach
        @endif
    </div>
</div>
