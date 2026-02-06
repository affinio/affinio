@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'combobox-dataset';
    $comboboxId = "dataset-combobox-{$componentId}";
@endphp

<div class="combobox-dataset">
    <div class="combobox-dataset__actions">
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="loadPreviousDataset">
            Previous dataset
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="loadNextDataset">
            Next dataset
        </button>
        <button type="button" class="combobox-button" wire:click="addCustomOption">
            Add service
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="removeCurrentSelection" @disabled($selection === '')>
            Remove selected
        </button>
    </div>

    @if ($dataset)
        <p class="combobox-dataset__meta">
            <strong>{{ $dataset['label'] }}</strong> · {{ $dataset['description'] }}
        </p>

        <x-affino-combobox
            class="combobox-demo"
            :combobox-id="$comboboxId"
            label="Service lane"
            placeholder="Search service lanes"
            model="selection"
            :selected="$selection !== '' ? $selection : null"
            :display="$selection !== '' ? $selectionLabel : ''"
            wire:key="combobox-dataset-{{ $componentId }}"
        >
            @foreach ($options as $option)
                <x-affino-combobox-option
                    value="{{ $option['value'] }}"
                    label="{{ $option['label'] }}"
                    :selected="$selection === $option['value']"
                >
                    <div class="combobox-optionView">
                        <strong>{{ $option['label'] }}</strong>
                        <span>{{ $option['meta'] }}</span>
                    </div>
                </x-affino-combobox-option>
            @endforeach
        </x-affino-combobox>

        <p class="combobox-dataset__meta">
            Active service: {{ $selection !== '' ? $selectionLabel : 'None' }}
        </p>
    @endif
</div>
