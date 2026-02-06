@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'disclosure-mutation';
@endphp

<div class="disclosure-mutation">
    <div class="disclosure-mutation__controls">
        <button type="button" class="disclosure-action" wire:click="addItem">Add panel</button>
    </div>

    <div class="disclosure-mutation__list">
        @foreach ($items as $item)
            @php
                $rootId = "disclosure-mutation-{$componentId}-{$item['id']}";
            @endphp
            <article
                class="disclosure-item disclosure-item--compact"
                data-affino-disclosure-root="{{ $rootId }}"
                data-affino-disclosure-default-open="false"
                data-affino-disclosure-state="closed"
                wire:key="disclosure-mutation-{{ $item['id'] }}"
            >
                <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
                    <div>
                        <span class="disclosure-item__title">{{ $item['title'] }}</span>
                        <span class="disclosure-item__meta">Owner · {{ $item['owner'] }}</span>
                    </div>
                    <span class="disclosure-item__icon" aria-hidden="true">+</span>
                </button>
                <div class="disclosure-item__content" data-affino-disclosure-content data-state="closed" hidden>
                    <p>{{ $item['detail'] }}</p>
                    <button type="button" class="disclosure-action disclosure-action--ghost" wire:click="removeItem({{ $item['id'] }})">Remove panel</button>
                </div>
            </article>
        @endforeach
    </div>
</div>
