@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'disclosure-ignored';
    $rootId = "disclosure-ignored-{$componentId}";
@endphp

<div class="disclosure-ignored" wire:poll.1s="tick">
    <div class="disclosure-ignored__meta">
        <span>Livewire ticks: {{ $ticks }}</span>
        <span class="disclosure-ignored__note">Disclosure stays interactive inside <code>wire:ignore</code>.</span>
    </div>

    <div wire:ignore>
        <article
            class="disclosure-item disclosure-item--compact"
            data-affino-disclosure-root="{{ $rootId }}"
            data-affino-disclosure-default-open="false"
            data-affino-disclosure-state="closed"
        >
            <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
                <div>
                    <span class="disclosure-item__title">Ignored panel</span>
                    <span class="disclosure-item__meta">Livewire morphs outside only</span>
                </div>
                <span class="disclosure-item__icon" aria-hidden="true">+</span>
            </button>
            <div class="disclosure-item__content" data-affino-disclosure-content data-state="closed" hidden>
                <p>This disclosure is not morphed by Livewire and keeps its state.</p>
            </div>
        </article>
    </div>
</div>
