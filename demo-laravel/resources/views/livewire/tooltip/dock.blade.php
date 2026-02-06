<div class="tooltip-dock">
    <div class="tooltip-dock__rail" aria-label="Dock-style links">
        @foreach ($items as $item)
            <div
                class="tooltip-dock__item"
                data-affino-tooltip-root="{{ $item['id'] }}"
                data-affino-tooltip-placement="right"
                data-affino-tooltip-align="center"
                data-affino-tooltip-gutter="12"
                data-affino-tooltip-open-delay="0"
                data-affino-tooltip-close-delay="0"
                data-affino-tooltip-trigger-mode="hover"
                data-affino-tooltip-state="closed"
            >
                @php
                    $icon = strtoupper(substr($item['label'], 0, 1));
                @endphp
                <a class="tooltip-dock__link" href="#" data-affino-tooltip-trigger aria-label="{{ $item['label'] }}">
                    <span class="tooltip-dock__icon">{{ $icon }}</span>
                    <span class="tooltip-dock__sr">{{ $item['label'] }}</span>
                </a>
                <div class="tooltip-surface tooltip-surface--dock" data-affino-tooltip-surface data-state="closed" hidden>
                    <strong>{{ $item['label'] }}</strong>
                    <span>{{ $item['meta'] }}</span>
                </div>
            </div>
        @endforeach
    </div>
</div>
