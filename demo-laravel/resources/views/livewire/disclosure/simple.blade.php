@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'disclosure-simple';
@endphp

<div class="disclosure-demo">
    @foreach ($panels as $panel)
        @php
            $isOpen = $loop->first;
            $rootId = "disclosure-simple-{$componentId}-{$panel['id']}";
        @endphp
        <article
            class="disclosure-item"
            data-affino-disclosure-root="{{ $rootId }}"
            data-affino-disclosure-default-open="{{ $isOpen ? 'true' : 'false' }}"
            data-affino-disclosure-state="{{ $isOpen ? 'open' : 'closed' }}"
        >
            <button type="button" class="disclosure-item__summary" data-affino-disclosure-trigger>
                <div>
                    <span class="disclosure-item__title">{{ $panel['title'] }}</span>
                    <span class="disclosure-item__meta">{{ $panel['meta'] }}</span>
                </div>
                <span class="disclosure-item__icon" aria-hidden="true">+</span>
            </button>
            <div
                class="disclosure-item__content"
                data-affino-disclosure-content
                data-state="{{ $isOpen ? 'open' : 'closed' }}"
                @unless($isOpen) hidden @endunless
            >
                <p>{{ $panel['lead'] }}</p>
                <p>{{ $panel['detail'] }}</p>
            </div>
        </article>
    @endforeach
</div>
