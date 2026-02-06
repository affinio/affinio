@php
    $display = count($selectedLabels) > 0 ? count($selectedLabels).' selected' : '';
@endphp

<div class="combobox-sticky">
    <div class="combobox-sticky__toolbar" data-affino-combobox-sticky="{{ $comboboxId }}">
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="applyExecutivePreset">
            Executive preset
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="applyGrowthPreset">
            Growth preset
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="clearSelection">
            Clear
        </button>
    </div>

    <x-affino-combobox
        class="combobox-demo"
        :combobox-id="$comboboxId"
        label="Audience segments"
        placeholder="Search and mix multiple segments"
        mode="multiple"
        model="selection"
        :selected="$selection"
        :display="$display"
        :pinned="true"
        wire:key="combobox-sticky-{{ $comboboxId }}"
    >
        @foreach ($segments as $segment)
            <x-affino-combobox-option
                value="{{ $segment['value'] }}"
                label="{{ $segment['label'] }}"
                :selected="in_array($segment['value'], $selection, true)"
            >
                <div class="combobox-optionView">
                    <strong>{{ $segment['label'] }}</strong>
                    <span>{{ $segment['meta'] }}</span>
                </div>
            </x-affino-combobox-option>
        @endforeach
    </x-affino-combobox>

    <div class="combobox-sticky__chips">
        @if ($selectedLabels === [])
            <span class="combobox-chip combobox-chip--ghost">No segments selected</span>
        @else
            @foreach ($selectedLabels as $label)
                <span class="combobox-chip">{{ $label }}</span>
            @endforeach
        @endif
    </div>
</div>
