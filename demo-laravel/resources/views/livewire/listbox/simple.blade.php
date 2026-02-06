@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'listbox-simple';
    $listboxId = "hero-listbox-{$componentId}";
@endphp

<div class="listbox-playground">
    <div class="listbox-playground__controls">
        <button type="button" class="listbox-button" wire:click="selectNext">
            Select next
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="clearSelection">
            Clear
        </button>

        <label class="listbox-control listbox-control--toggle">
            <input type="checkbox" wire:model.live="disabled" />
            <span>Disabled</span>
        </label>
    </div>

    <div class="listbox-playground__stage">
        <x-affino-listbox
            class="listbox-demo"
            :listbox-id="$listboxId"
            label="Routing region"
            placeholder="Select routing region"
            mode="single"
            model="selection"
            :selected="$selection !== '' ? $selection : null"
            :display="$selection !== '' ? $selectedLabel : ''"
            :disabled="$disabled"
            wire:key="listbox-simple-{{ $componentId }}"
        >
            @foreach ($regions as $region)
                <x-affino-listbox-option
                    value="{{ $region['value'] }}"
                    :selected="$selection === $region['value']"
                >
                    <div class="listbox-optionView">
                        <strong>{{ $region['label'] }}</strong>
                        <span>{{ $region['meta'] }}</span>
                    </div>
                </x-affino-listbox-option>
            @endforeach
        </x-affino-listbox>

        <dl class="listbox-meta">
            <div>
                <dt>Selection</dt>
                <dd>{{ $selection !== '' ? $selectedLabel : 'None' }}</dd>
            </div>
            <div>
                <dt>Signal</dt>
                <dd>{{ $selectedMeta }}</dd>
            </div>
            <div>
                <dt>State</dt>
                <dd>{{ $disabled ? 'Disabled' : 'Interactive' }}</dd>
            </div>
        </dl>
    </div>
</div>
