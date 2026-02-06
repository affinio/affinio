@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'disclosure-nested';
    $parentId = "disclosure-nested-parent-{$componentId}";
    $childId = "disclosure-nested-child-{$componentId}";
@endphp

<div class="disclosure-nested">
    <article
        class="disclosure-item disclosure-item--nested"
        data-affino-disclosure-root="{{ $parentId }}"
        data-affino-disclosure-default-open="true"
        data-affino-disclosure-state="open"
    >
        <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
            <div>
                <span class="disclosure-item__title">Parent disclosure</span>
                <span class="disclosure-item__meta">Nested panels remain independent</span>
            </div>
            <span class="disclosure-item__icon" aria-hidden="true">+</span>
        </button>
        <div class="disclosure-item__content" data-affino-disclosure-content data-state="open">
            <p>Open the nested panel without collapsing the parent content.</p>

            <article
                class="disclosure-item disclosure-item--child"
                data-affino-disclosure-root="{{ $childId }}"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
                wire:ignore.self
            >
                <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
                    <div>
                        <span class="disclosure-item__title">Nested disclosure</span>
                        <span class="disclosure-item__meta">Livewire updates stay scoped</span>
                    </div>
                    <span class="disclosure-item__icon" aria-hidden="true">+</span>
                </button>
                <div class="disclosure-item__content" data-affino-disclosure-content data-state="closed" hidden>
                    <p>Checks run: {{ $checks }}</p>
                    <button type="button" class="disclosure-action" wire:click="ping">Run check</button>
                </div>
            </article>
        </div>
    </article>
</div>
