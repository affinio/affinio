@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'combobox-simple';
    $comboboxId = "hero-combobox-{$componentId}";
@endphp

<div class="combobox-playground">
    <div class="combobox-playground__controls">
        <button type="button" class="combobox-button" wire:click="selectNext">
            Select next
        </button>
        <button type="button" class="combobox-button combobox-button--ghost" wire:click="clearSelection">
            Clear
        </button>

        <label class="combobox-control combobox-control--toggle">
            <input type="checkbox" wire:model.live="pinned" />
            <span>Pinned</span>
        </label>

        <label class="combobox-control combobox-control--toggle">
            <input type="checkbox" wire:model.live="openOnPointerDown" />
            <span>Open on pointer</span>
        </label>
    </div>

    <div class="combobox-playground__stage">
        <x-affino-combobox
            class="combobox-demo"
            :combobox-id="$comboboxId"
            label="Customer account"
            placeholder="Search workspace, owner, or region"
            model="selectedAccount"
            :selected="$selectedAccount !== '' ? $selectedAccount : null"
            :display="$selectedAccount !== '' ? $selectedLabel : ''"
            :pinned="$pinned"
            :open-on-pointer-down="$openOnPointerDown"
            wire:key="combobox-simple-{{ $componentId }}"
        >
            @foreach ($accounts as $account)
                <x-affino-combobox-option
                    value="{{ $account['value'] }}"
                    label="{{ $account['label'] }}"
                    :selected="$selectedAccount === $account['value']"
                >
                    <div class="combobox-optionView">
                        <strong>{{ $account['label'] }}</strong>
                        <span>{{ $account['meta'] }}</span>
                    </div>
                </x-affino-combobox-option>
            @endforeach
        </x-affino-combobox>

        <dl class="combobox-meta">
            <div>
                <dt>Selection</dt>
                <dd>{{ $selectedAccount !== '' ? $selectedLabel : 'None' }}</dd>
            </div>
            <div>
                <dt>Owner</dt>
                <dd>{{ $selectedOwner }}</dd>
            </div>
            <div>
                <dt>Signal</dt>
                <dd>{{ $selectedMeta }}</dd>
            </div>
        </dl>
    </div>
</div>
