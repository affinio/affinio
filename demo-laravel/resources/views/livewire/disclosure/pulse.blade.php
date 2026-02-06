@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'disclosure-pulse';
    $rootId = "disclosure-pulse-{$componentId}";
@endphp

<div class="disclosure-pulse" wire:poll.1s="tick">
    <article
        class="disclosure-item"
        data-affino-disclosure-root="{{ $rootId }}"
        data-affino-disclosure-default-open="true"
        data-affino-disclosure-state="open"
    >
        <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
            <div>
                <span class="disclosure-item__title">Livewire pulse stream</span>
                <span class="disclosure-item__meta">Last update · {{ $pulse }}</span>
            </div>
            <span class="disclosure-item__icon" aria-hidden="true">+</span>
        </button>
        <div class="disclosure-item__content" data-affino-disclosure-content data-state="open">
            <p>Background updates should not collapse the open panel.</p>
            <p>Pulse count: {{ $pulse }}</p>
        </div>
    </article>
</div>
