@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-simple';
    $livewireId = $componentId;
    $rootId = "menu-hero-{$componentId}";
    $subId = "menu-hero-sub-{$componentId}";
    $subSubId = "menu-hero-subdeep-{$componentId}";
    $automationItemId = "menu-hero-automation-{$componentId}";
    $escalationsItemId = "menu-hero-escalations-{$componentId}";
@endphp

<div class="menu-demo">
    <div
        class="menu-root"
        data-affino-menu-root="{{ $rootId }}"
        data-affino-menu-state="closed"
        data-affino-menu-close-select="true"
        data-affino-menu-portal="body"
        data-affino-menu-placement="bottom"
        data-affino-menu-align="start"
        data-affino-menu-gutter="8"
    >
        <button type="button" class="menu-trigger" data-affino-menu-trigger>
            Open menu
        </button>

        <div class="menu-panel" data-affino-menu-panel>
            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="overview">
                <span>Overview</span>
                <span class="menu-item__meta">⌘O</span>
            </button>
            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="quick-search">
                <span>Quick search</span>
                <span class="menu-item__meta">⌘K</span>
            </button>

            <div
                class="menu-submenu"
                data-affino-menu-root="{{ $subId }}"
                data-affino-menu-parent="{{ $rootId }}"
                data-affino-menu-parent-item="{{ $automationItemId }}"
                data-affino-menu-state="closed"
                data-affino-menu-close-select="true"
                data-affino-menu-portal="inline"
                data-affino-menu-placement="right"
                data-affino-menu-align="start"
                data-affino-menu-gutter="6"
            >
                <button type="button" class="menu-item menu-item--submenu" id="{{ $automationItemId }}" data-affino-menu-item data-affino-menu-trigger>
                    <span>Automation</span>
                    <span class="menu-item__chevron">›</span>
                </button>

                <div class="menu-panel menu-panel--submenu" data-affino-menu-panel>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="runbook">Runbook</button>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="schedules">Schedules</button>
                    <div
                        class="menu-submenu"
                        data-affino-menu-root="{{ $subSubId }}"
                        data-affino-menu-parent="{{ $subId }}"
                        data-affino-menu-parent-item="{{ $escalationsItemId }}"
                        data-affino-menu-state="closed"
                        data-affino-menu-close-select="true"
                        data-affino-menu-portal="inline"
                        data-affino-menu-placement="right"
                        data-affino-menu-align="start"
                        data-affino-menu-gutter="6"
                    >
                        <button type="button" class="menu-item menu-item--submenu" id="{{ $escalationsItemId }}" data-affino-menu-item data-affino-menu-trigger>
                            <span>Escalations</span>
                            <span class="menu-item__chevron">›</span>
                        </button>
                        <div class="menu-panel menu-panel--submenu" data-affino-menu-panel>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="page-on-call">Page on-call</button>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="open-incident">Open incident</button>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="draft-report">Draft report</button>
                        </div>
                    </div>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="audit-logs">Audit logs</button>
                </div>
            </div>

            <button type="button" class="menu-item menu-item--danger" data-affino-menu-item data-affino-menu-close data-affino-livewire-owner="{{ $livewireId }}" data-affino-livewire-call="selectAction" data-affino-livewire-arg="delete-draft">
                Delete draft
            </button>
        </div>
    </div>

    <div class="menu-status">
        <p class="eyebrow">Last action</p>
        <p class="menu-status__value">{{ $lastAction }}</p>
    </div>
</div>
