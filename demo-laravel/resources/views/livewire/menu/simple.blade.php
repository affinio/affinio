@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'menu-simple';
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
        data-affino-menu-close-select="false"
        data-affino-menu-portal="body"
        data-affino-menu-placement="bottom"
        data-affino-menu-align="start"
        data-affino-menu-gutter="8"
    >
        <button type="button" class="menu-trigger" data-affino-menu-trigger>
            Open menu
        </button>

        <div class="menu-panel" data-affino-menu-panel>
            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                <span>Overview</span>
                <span class="menu-item__meta">⌘O</span>
            </button>
            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>
                <span>Quick search</span>
                <span class="menu-item__meta">⌘K</span>
            </button>

            <div
                class="menu-submenu"
                data-affino-menu-root="{{ $subId }}"
                data-affino-menu-parent="{{ $rootId }}"
                data-affino-menu-parent-item="{{ $automationItemId }}"
                data-affino-menu-state="closed"
                data-affino-menu-close-select="false"
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
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Runbook</button>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Schedules</button>
                    <div
                        class="menu-submenu"
                        data-affino-menu-root="{{ $subSubId }}"
                        data-affino-menu-parent="{{ $subId }}"
                        data-affino-menu-parent-item="{{ $escalationsItemId }}"
                        data-affino-menu-state="closed"
                        data-affino-menu-close-select="false"
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
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Page on-call</button>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Open incident</button>
                            <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Draft report</button>
                        </div>
                    </div>
                    <button type="button" class="menu-item" data-affino-menu-item data-affino-menu-close>Audit logs</button>
                </div>
            </div>

            <button type="button" class="menu-item menu-item--danger" data-affino-menu-item data-affino-menu-close>
                Delete draft
            </button>
        </div>
    </div>
</div>
