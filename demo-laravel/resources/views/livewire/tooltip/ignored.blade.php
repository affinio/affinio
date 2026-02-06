<div class="tooltip-ignored">
    <div class="tooltip-ignored__controls">
        <button type="button" class="tooltip-trigger" wire:click="increment">
            Increment ({{ $count }})
        </button>
        <span class="tooltip-ignored__note">Tooltip lives inside <code>wire:ignore</code>.</span>
    </div>

    <div class="tooltip-ignored__stage">
        <div
            class="tooltip-demo"
            data-affino-tooltip-root="ignored-tooltip"
            data-affino-tooltip-placement="top"
            data-affino-tooltip-align="center"
            data-affino-tooltip-gutter="10"
            data-affino-tooltip-open-delay="0"
            data-affino-tooltip-close-delay="0"
            data-affino-tooltip-trigger-mode="hover"
            data-affino-tooltip-state="closed"
            wire:ignore
        >
            <button type="button" class="tooltip-trigger" data-affino-tooltip-trigger>
                Hover while Livewire updates
            </button>
            <div class="tooltip-surface" data-affino-tooltip-surface data-state="closed" hidden>
                Livewire updates outside should not reset me.
            </div>
        </div>
    </div>
</div>
