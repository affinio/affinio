<div class="tooltip-resize">
    <div class="tooltip-resize__controls">
        <button type="button" class="tooltip-trigger" wire:click="toggle">
            Toggle width and horizontal position
        </button>
    </div>

    <div
        class="tooltip-demo tooltip-resize__stage {{ $expanded ? 'is-expanded' : 'is-collapsed' }}"
        data-affino-tooltip-root="resize-tooltip"
        data-affino-tooltip-placement="bottom"
        data-affino-tooltip-align="center"
        data-affino-tooltip-gutter="10"
        data-affino-tooltip-open-delay="0"
        data-affino-tooltip-close-delay="0"
        data-affino-tooltip-trigger-mode="hover"
        data-affino-tooltip-state="closed"
    >
        <button type="button" class="tooltip-trigger tooltip-resize__button" data-affino-tooltip-trigger>
            {{ $expanded ? 'A much longer CTA that shifts to the right' : 'Short CTA (left)' }}
        </button>
        <div class="tooltip-surface" data-affino-tooltip-surface data-state="closed" hidden>
            Tooltip should realign when width and horizontal position both change.
        </div>
    </div>
</div>
