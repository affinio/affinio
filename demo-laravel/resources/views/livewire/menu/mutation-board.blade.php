@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-mutation';
    $rootId = "menu-mutation-{$componentId}";
@endphp

<div class="menu-mutation">
    <div class="menu-mutation__controls">
        <button type="button" class="menu-action" wire:click="addItem">Add item</button>
    </div>

    <div
        class="menu-root"
        data-affino-menu-root="{{ $rootId }}"
        data-affino-menu-state="closed"
        data-affino-menu-portal="inline"
        data-affino-menu-placement="bottom"
        data-affino-menu-align="start"
        data-affino-menu-gutter="8"
    >
        <button type="button" class="menu-trigger" data-affino-menu-trigger>
            Mutating menu
        </button>

        <div class="menu-panel" data-affino-menu-panel>
            @foreach ($items as $item)
                <button
                    type="button"
                    class="menu-item"
                    data-affino-menu-item
                    wire:key="menu-item-{{ $item['id'] }}"
                    wire:click="removeItem({{ $item['id'] }})"
                >
                    <span>{{ $item['label'] }}</span>
                    <span class="menu-item__meta">{{ $item['meta'] }}</span>
                </button>
            @endforeach
        </div>
    </div>
</div>
