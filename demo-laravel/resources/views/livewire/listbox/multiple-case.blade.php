@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'listbox-multiple';
    $listboxId = "multiple-listbox-{$componentId}";
    $display = count($selectedLabels) > 0 ? count($selectedLabels).' selected' : '';
@endphp

<div class="listbox-multiple">
    <div class="listbox-multiple__actions">
        <button type="button" class="listbox-button" wire:click="seedFollowSun">
            Seed follow-the-sun
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="clearSelection">
            Clear all
        </button>
    </div>

    <x-affino-listbox
        class="listbox-demo"
        :listbox-id="$listboxId"
        label="Watch teams"
        placeholder="Select one or more teams"
        mode="multiple"
        model="selection"
        :selected="$selection"
        :display="$display"
        wire:key="listbox-multiple-{{ $componentId }}"
    >
        @foreach ($teams as $team)
            <x-affino-listbox-option
                value="{{ $team['value'] }}"
                :selected="in_array($team['value'], $selection, true)"
            >
                <div class="listbox-optionView">
                    <strong>{{ $team['label'] }}</strong>
                    <span>{{ $team['meta'] }}</span>
                </div>
            </x-affino-listbox-option>
        @endforeach
    </x-affino-listbox>

    <div class="listbox-multiple__chips">
        @if ($selectedLabels === [])
            <span class="listbox-chip listbox-chip--ghost">No teams selected</span>
        @else
            @foreach ($selectedLabels as $label)
                <span class="listbox-chip">{{ $label }}</span>
            @endforeach
        @endif
    </div>
</div>
