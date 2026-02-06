<div class="tooltip-pulse">
    @if ($running)
        <span class="tooltip-pulse__poll" wire:poll.1s="tick" aria-hidden="true"></span>
    @endif
    <div class="tooltip-pulse__controls">
        <button type="button" class="tooltip-trigger" wire:click="toggleRunning">
            {{ $running ? 'Stop pulse' : 'Start pulse' }}
        </button>
        <button type="button" class="tooltip-trigger tooltip-trigger--ghost" wire:click="resetCount">
            Reset
        </button>
        <span class="tooltip-pulse__count">Count: {{ $count }}</span>
    </div>

    <div
        class="tooltip-demo tooltip-pulse__stage"
        data-affino-tooltip-root="pulse-tooltip"
        data-affino-tooltip-placement="top"
        data-affino-tooltip-align="center"
        data-affino-tooltip-gutter="10"
        data-affino-tooltip-trigger-mode="hover"
        data-affino-tooltip-state="closed"
        wire:ignore
    >
        <button type="button" class="tooltip-trigger" data-affino-tooltip-trigger>
            Pulse target
        </button>
        <div class="tooltip-surface" data-affino-tooltip-surface data-state="closed" hidden>
            Livewire updates should not close me.
        </div>
    </div>
</div>
