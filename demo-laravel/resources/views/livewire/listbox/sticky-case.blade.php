@php
    $display = count($selectedLabels) > 0 ? count($selectedLabels).' selected' : '';
@endphp

<div class="listbox-sticky">
    <div class="listbox-sticky__toolbar" data-affino-listbox-sticky="{{ $listboxId }}">
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="applyExecutivePreset">
            Executive preset
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="applyGrowthPreset">
            Growth preset
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="clearSelection">
            Clear
        </button>
    </div>

    <x-affino-listbox
        class="listbox-demo"
        :listbox-id="$listboxId"
        label="Audience segments"
        placeholder="Select one or more segments"
        mode="multiple"
        model="selection"
        :selected="$selection"
        :display="$display"
        wire:key="listbox-sticky-{{ $listboxId }}"
    >
        @foreach ($segments as $segment)
            <x-affino-listbox-option
                value="{{ $segment['value'] }}"
                :selected="in_array($segment['value'], $selection, true)"
            >
                <div class="listbox-optionView">
                    <strong>{{ $segment['label'] }}</strong>
                    <span>{{ $segment['meta'] }}</span>
                </div>
            </x-affino-listbox-option>
        @endforeach
    </x-affino-listbox>

    <div class="listbox-sticky__chips">
        @if ($selectedLabels === [])
            <span class="listbox-chip listbox-chip--ghost">No segments selected</span>
        @else
            @foreach ($selectedLabels as $label)
                <span class="listbox-chip">{{ $label }}</span>
            @endforeach
        @endif
    </div>
</div>
