@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'listbox-dataset';
    $listboxId = "dataset-listbox-{$componentId}";
@endphp

<div class="listbox-dataset">
    <div class="listbox-dataset__actions">
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="loadPreviousDataset">
            Previous dataset
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="loadNextDataset">
            Next dataset
        </button>
        <button type="button" class="listbox-button" wire:click="addCustomOption">
            Add service
        </button>
        <button type="button" class="listbox-button listbox-button--ghost" wire:click="removeCurrentSelection" @disabled($selection === '')>
            Remove selected
        </button>
    </div>

    @if ($dataset)
        <p class="listbox-dataset__meta">
            <strong>{{ $dataset['label'] }}</strong> - {{ $dataset['description'] }}
        </p>

        <x-affino-listbox
            class="listbox-demo"
            :listbox-id="$listboxId"
            label="Service lane"
            placeholder="Select service lane"
            model="selection"
            :selected="$selection !== '' ? $selection : null"
            :display="$selection !== '' ? $selectionLabel : ''"
            wire:key="listbox-dataset-{{ $componentId }}"
        >
            @foreach ($options as $option)
                <x-affino-listbox-option
                    value="{{ $option['value'] }}"
                    :selected="$selection === $option['value']"
                >
                    <div class="listbox-optionView">
                        <strong>{{ $option['label'] }}</strong>
                        <span>{{ $option['meta'] }}</span>
                    </div>
                </x-affino-listbox-option>
            @endforeach
        </x-affino-listbox>

        <p class="listbox-dataset__meta">
            Active service: {{ $selection !== '' ? $selectionLabel : 'None' }}
        </p>
    @endif
</div>
