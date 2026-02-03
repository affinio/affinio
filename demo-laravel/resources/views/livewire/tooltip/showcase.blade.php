<section class="tooltip-demo-grid" wire:key="tooltip-showcase">
    <article class="tooltip-card">
        <p class="tooltip-card__eyebrow">Mode 01</p>
        <h2 class="tooltip-card__title">Hover + focus parity</h2>
        <p class="tooltip-card__text">
            A single Blade component wires data attributes for both pointer and keyboard flows. Livewire re-renders the
            trigger markup when slot content changes, but the JS bootstrapper re-hydrates the tooltip instantly.
        </p>

        <div class="tooltip-stage">
            <x-affino-tooltip
                class="tooltip-kernel"
                tooltip-id="livewire-tooltip-basic"
                open-delay="120"
                close-delay="120"
                placement="top"
                align="center"
                gutter="12"
            >
                <x-slot:trigger>
                    <button type="button" class="tooltip-trigger">Inspect SLA</button>
                </x-slot:trigger>

                <div class="tooltip-bubble" role="tooltip">
                    <p class="tooltip-bubble__title">Always-on</p>
                    <p class="tooltip-bubble__body">
                        Incident response under 4 minutes with on-call coverage across 11 regions.
                    </p>
                </div>
            </x-affino-tooltip>
        </div>
    </article>

    <article class="tooltip-card">
        <p class="tooltip-card__eyebrow">Mode 02</p>
        <h2 class="tooltip-card__title">Livewire task stream</h2>
        <p class="tooltip-card__text">
            Each task row re-renders via Livewire. The tooltip helper listens for mutation events, so rows added,
            removed, or updated after morphs keep their timers and ARIA wiring intact.
        </p>

        <div class="tooltip-card__actions">
            <button type="button" class="tooltip-button" wire:click="addTask">Add task</button>
            <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="toggleChecklist">
                {{ $showChecklist ? 'Hide extra checklist' : 'Show extra checklist' }}
            </button>
        </div>

        <ul class="tooltip-task-list">
            @foreach ($tasks as $task)
                <li class="tooltip-task" wire:key="task-{{ $task['id'] }}">
                    <x-affino-tooltip
                        tooltip-id="{{ $task['tooltip']['id'] }}"
                        placement="top"
                        align="center"
                        trigger="hover"
                        gutter="10"
                    >
                        <x-slot:trigger>
                            <div class="tooltip-task-row">
                                <div>
                                    <p class="tooltip-task__title">{{ $task['title'] }}</p>
                                    <p class="tooltip-task__meta">{{ $task['owner'] }}</p>
                                </div>
                                <div class="tooltip-task__status">{{ $task['status'] }}</div>
                            </div>
                        </x-slot:trigger>

                        <div class="tooltip-bubble" role="tooltip">
                            <p class="tooltip-bubble__title">{{ $task['tooltip']['title'] }}</p>
                            <p class="tooltip-bubble__body">{{ $task['tooltip']['body'] }}</p>
                        </div>
                    </x-affino-tooltip>

                    <div class="tooltip-task__controls">
                        <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="advanceTask({{ $task['id'] }})">
                            Advance state
                        </button>
                        <button type="button" class="tooltip-button tooltip-button--ghost" wire:click="removeTask({{ $task['id'] }})">
                            Remove
                        </button>
                    </div>
                </li>
            @endforeach
        </ul>
    </article>

    @if ($showChecklist)
        <article class="tooltip-card">
            <p class="tooltip-card__eyebrow">Mode 02b</p>
            <h2 class="tooltip-card__title">Nested focus helpers</h2>
            <p class="tooltip-card__text">
                Focus-driven tooltips remain accessible when optional sections mount or unmount. Livewire swaps this card
                in without any bespoke JS hooks.
            </p>

            <x-affino-tooltip
                tooltip-id="livewire-checklist-tooltip"
                placement="bottom"
                align="start"
                trigger="focus"
            >
                <x-slot:trigger>
                    <button type="button" class="tooltip-trigger tooltip-trigger--ghost">
                        View rollout checklist
                    </button>
                </x-slot:trigger>

                <div class="tooltip-bubble" role="tooltip">
                    <p class="tooltip-bubble__title">Rollout steps</p>
                    <p class="tooltip-bubble__body">
                        1) Pause webhooks, 2) warm caches, 3) resume ingestion once diagnostics stay green for 3 minutes.
                    </p>
                </div>
            </x-affino-tooltip>
        </article>
    @endif

    <article class="tooltip-card">
        <p class="tooltip-card__eyebrow">Mode 03</p>
        <h2 class="tooltip-card__title">Manual controls via dispatch</h2>
        <p class="tooltip-card__text">
            The manual trigger keeps pointer events disabled. Livewire dispatches CustomEvents so JS can call
            <code>affinoTooltip.open()</code> even after morphs or pagination.
        </p>

        <div class="tooltip-stage tooltip-stage--left">
            <x-affino-tooltip
                tooltip-id="manual-livewire-tooltip"
                trigger="manual"
                placement="right"
                align="start"
                gutter="18"
            >
                <x-slot:trigger>
                    <button type="button" class="tooltip-trigger tooltip-trigger--ghost">Manual tooltip anchor</button>
                </x-slot:trigger>

                <div class="tooltip-bubble" role="tooltip">
                    <p class="tooltip-bubble__title">Pinned tooltips</p>
                    <p class="tooltip-bubble__body">
                        Affino exposes a tiny controller on every tooltip root. Call <code>open</code>, <code>close</code>, or
                        <code>toggle</code> after any Livewire render.
                    </p>
                </div>
            </x-affino-tooltip>
        </div>

        <div class="tooltip-manual-controls">
            <button
                type="button"
                class="tooltip-button"
                wire:click="$dispatch('affino-tooltip:manual', { id: 'manual-livewire-tooltip', action: 'open', reason: 'programmatic' })"
            >
                Open now
            </button>

            <button
                type="button"
                class="tooltip-button tooltip-button--ghost"
                wire:click="$dispatch('affino-tooltip:manual', { id: 'manual-livewire-tooltip', action: 'close', reason: 'programmatic' })"
            >
                Close
            </button>

            <label class="tooltip-manual-toggle">
                <input type="checkbox" wire:model.live="pinManual">
                Keep open while checked
            </label>
        </div>
    </article>

    <article class="tooltip-card">
        <p class="tooltip-card__eyebrow">Mode 04</p>
        <h2 class="tooltip-card__title">Livewire forms + focus</h2>
        <p class="tooltip-card__text">
            Inputs use <code>wire:model.live</code>, so each keystroke re-renders validation hints. The tooltip remains
            focused because SurfaceCore maps the browser focus state, not synthetic events.
        </p>

        <form class="tooltip-form" wire:submit.prevent>
            <label>
                <span>Work email</span>
                <x-affino-tooltip
                    tooltip-id="livewire-email-tooltip"
                    trigger="focus"
                    placement="top"
                    align="start"
                    gutter="10"
                >
                    <x-slot:trigger>
                        <input type="email" wire:model.live="email" placeholder="alex@affino.dev" />
                    </x-slot:trigger>

                    <div class="tooltip-bubble" role="tooltip">
                        <p class="tooltip-bubble__title">Verified domains</p>
                        <p class="tooltip-bubble__body">
                            Use your company email so access can be provisioned across every workspace instantly.
                        </p>
                    </div>
                </x-affino-tooltip>
            </label>

            <p class="tooltip-card__text">Typed value: {{ $email === '' ? '—' : $email }}</p>
        </form>
    </article>
</section>
