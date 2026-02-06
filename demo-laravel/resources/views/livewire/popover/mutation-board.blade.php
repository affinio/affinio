<div class="popover-mutation-board">
    <div class="popover-mutation-board__controls">
        <button type="button" class="popover-trigger" wire:click="addItem">
            Add row
        </button>
    </div>

    <div class="popover-mutation-board__rows">
        @foreach ($items as $item)
            <div class="popover-mutation-board__row" wire:key="mutation-row-{{ $item['id'] }}">
                <div class="popover-mutation-board__meta">
                    <strong>{{ $item['title'] }}</strong>
                    <span>{{ $item['owner'] }} · ETA {{ $item['eta'] }}</span>
                </div>

                <x-affino-popover
                    class="popover-demo"
                    :popover-id="'mutation-popover-'.$item['id']"
                    placement="top"
                    align="end"
                    :gutter="8"
                >
                    <x-slot:trigger>
                        <button type="button" class="popover-trigger popover-trigger--ghost">
                            Details
                        </button>
                    </x-slot:trigger>

                    <div class="popover-surface">
                        <strong>{{ $item['title'] }}</strong>
                        <span>Owner: {{ $item['owner'] }}</span>
                        <span>ETA: {{ $item['eta'] }}</span>
                        <div class="popover-actions">
                            <button type="button" class="popover-action" wire:click="removeItem({{ $item['id'] }})">Remove row</button>
                        </div>
                    </div>
                </x-affino-popover>
            </div>
        @endforeach
    </div>
</div>
