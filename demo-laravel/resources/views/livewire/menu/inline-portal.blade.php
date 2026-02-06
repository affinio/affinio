@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-inline';
    $rootId = "menu-inline-{$componentId}";
@endphp

<div class="menu-inline">
    <div class="menu-inline__viewport">
        <div class="menu-inline__content">
            <p>Scroll the container and open the menu. Inline portal keeps the panel inside the card.</p>

            <div
                class="menu-root"
                data-affino-menu-root="{{ $rootId }}"
                data-affino-menu-state="closed"
                data-affino-menu-placement="bottom"
                data-affino-menu-align="start"
                data-affino-menu-gutter="8"
                data-affino-menu-portal="inline"
            >
                <button type="button" class="menu-trigger" data-affino-menu-trigger>
                    Inline portal
                </button>

                <div class="menu-panel" data-affino-menu-panel>
                    <button type="button" class="menu-item" data-affino-menu-item>Bring to front</button>
                    <button type="button" class="menu-item" data-affino-menu-item>Dock panel</button>
                    <button type="button" class="menu-item" data-affino-menu-item>Move to backlog</button>
                </div>
            </div>
        </div>
    </div>
</div>
