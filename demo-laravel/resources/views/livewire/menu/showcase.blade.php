<section class="menu-showcase" wire:key="menu-showcase">
    <section class="menu-hero">
        <div class="menu-hero__copy">
            <p class="menu-hero__kicker">Affino · Livewire</p>
            <h1>Single trigger, immediate intent</h1>
            <p>
                This hero mirrors the Vue sample exactly: one gradient button that spawns a glassy list directly beneath it. The menu stays pinned
                while you scroll so you can keep it open during walkthroughs.
            </p>
        </div>

        <div class="menu-hero__demo">
            <div class="menu-inline">
                <div
                    class="menu-inline__surface"
                    data-affino-menu-root="simple-livewire-menu"
                    data-affino-menu-placement="bottom"
                    data-affino-menu-align="start"
                    data-affino-menu-gutter="8"
                    data-affino-menu-open-delay="60"
                    data-affino-menu-close-delay="120"
                    data-affino-menu-portal="inline"
                >
                    <button type="button" class="menu-inline__trigger" data-affino-menu-trigger>
                        Open Livewire menu
                    </button>

                    <div class="menu-inline__panel" data-affino-menu-panel role="menu" hidden>
                        <p class="menu-inline__label">Project</p>

                        <div class="menu-inline__section">
                            @foreach ($simplePrimaryActions as $action)
                                <button
                                    type="button"
                                    class="menu-inline__item"
                                    data-affino-menu-item
                                    wire:click="selectSimpleAction('{{ $action['id'] }}')"
                                >
                                    <span>
                                        <strong>{{ $action['label'] }}</strong>
                                        <small>{{ $action['description'] }}</small>
                                    </span>
                                    <span class="menu-inline__shortcut">{{ $action['shortcut'] }}</span>
                                </button>
                            @endforeach
                        </div>

                        <hr class="menu-inline__separator" />

                        <div class="menu-inline__section">
                            @foreach ($simpleSecondaryActions as $action)
                                <button
                                    type="button"
                                    class="menu-inline__item {{ ($action['danger'] ?? false) ? 'is-danger' : '' }}"
                                    data-affino-menu-item
                                    wire:click="selectSimpleAction('{{ $action['id'] }}')"
                                >
                                    <span>
                                        <strong>{{ $action['label'] }}</strong>
                                        <small>{{ $action['description'] }}</small>
                                    </span>
                                    <span class="menu-inline__shortcut">{{ $action['shortcut'] }}</span>
                                </button>
                            @endforeach
                        </div>
                    </div>
                </div>

                <dl class="menu-inline__log">
                    <dt>Last action</dt>
                    <dd>{{ $simpleLastAction }}</dd>
                </dl>
            </div>
        </div>
    </section>

    <section class="menu-advanced">
        <header class="menu-advanced__intro">
            <div>
                <p class="menu-advanced__kicker">Advanced · Control + Nested</p>
                <h2>Control panel and nested stacks</h2>
                <p>
                    The left card mirrors the Vue control surface—a four-level cascade you can click through. On the right we duplicate the nested
                    stacks demo with diagonal prediction and Livewire logs.
                </p>
            </div>
        </header>

        <div class="menu-advanced__grid">
            <article class="menu-card menu-card--control">
                <div class="menu-card__head">
                    <h3>Command control board</h3>
                    <p>Every selection repaints the subsequent column and appends to the automation log.</p>
                </div>

                <div class="menu-control__trail">
                    <span>Current trail</span>
                    <strong>
                        @if ($advancedTrail)
                            {{ implode(' › ', $advancedTrail) }}
                        @else
                            Select a command
                        @endif
                    </strong>
                </div>

                <div class="menu-cascade">
                    <div class="menu-cascade__column">
                        <p class="menu-cascade__label">Level 01 · Pillars</p>
                        <div class="menu-cascade__panel" role="menu">
                            @foreach ($advancedColumns as $column)
                                <button
                                    type="button"
                                    class="cascade-item {{ $activeColumnId === $column['id'] ? 'is-active' : '' }}"
                                    wire:click="focusAdvancedColumn('{{ $column['id'] }}')"
                                >
                                    <strong>{{ $column['label'] }}</strong>
                                    <small>{{ $column['description'] }}</small>
                                </button>
                            @endforeach
                        </div>
                    </div>

                    <div class="menu-cascade__column">
                        <p class="menu-cascade__label">Level 02 · Actions</p>
                        <div class="menu-cascade__panel" role="menu">
                            @forelse (($activeColumn['actions'] ?? []) as $action)
                                <button
                                    type="button"
                                    class="cascade-item {{ $activeActionId === ($action['id'] ?? '') ? 'is-active' : '' }}"
                                    wire:click="focusAdvancedAction('{{ $activeColumn['id'] ?? '' }}', '{{ $action['id'] ?? '' }}')"
                                >
                                    <strong>{{ $action['label'] ?? 'Action' }}</strong>
                                    <small>{{ $action['description'] ?? '—' }}</small>
                                </button>
                            @empty
                                <span class="cascade-empty">No actions</span>
                            @endforelse
                        </div>
                    </div>

                    <div class="menu-cascade__column">
                        <p class="menu-cascade__label">Level 03 · Branches</p>
                        <div class="menu-cascade__panel" role="menu">
                            @forelse (($activeAction['children'] ?? []) as $child)
                                <button
                                    type="button"
                                    class="cascade-item {{ $activeChildId === ($child['id'] ?? '') ? 'is-active' : '' }}"
                                    wire:click="focusAdvancedChild('{{ $activeColumn['id'] ?? '' }}', '{{ $activeAction['id'] ?? '' }}', '{{ $child['id'] ?? '' }}')"
                                >
                                    <strong>{{ $child['label'] ?? 'Branch' }}</strong>
                                    <small>{{ $child['description'] ?? '—' }}</small>
                                </button>
                            @empty
                                <span class="cascade-empty">Select an action</span>
                            @endforelse
                        </div>
                    </div>

                    <div class="menu-cascade__column">
                        <p class="menu-cascade__label">Level 04 · Leaves</p>
                        <div class="menu-cascade__panel" role="menu">
                            @forelse ($activeLeafOptions as $leaf)
                                <button
                                    type="button"
                                    class="cascade-item cascade-item--leaf {{ $activeLeafId === ($leaf['id'] ?? '') ? 'is-active' : '' }}"
                                    wire:click="focusAdvancedLeaf('{{ $activeColumn['id'] ?? '' }}', '{{ $activeAction['id'] ?? '' }}', '{{ $activeChild['id'] ?? '' }}', '{{ $leaf['id'] ?? '' }}')"
                                >
                                    <strong>{{ $leaf['label'] ?? 'Leaf' }}</strong>
                                </button>
                            @empty
                                <span class="cascade-empty">Pick a branch</span>
                            @endforelse
                        </div>
                    </div>
                </div>

                <div class="menu-control__log">
                    <p class="menu-control__log-label">Automation log</p>
                    <ul>
                        @foreach ($advancedLog as $entry)
                            <li>
                                <span>{{ $entry['label'] }}</span>
                                <time>{{ $entry['at'] }}</time>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </article>

            <article class="menu-card menu-card--nested">
                <div class="menu-card__head">
                    <h3>Nested stack browser</h3>
                    <p>Replicates the Vue nested menu with diagonal prediction and stacked overlays.</p>
                </div>

                <div
                    class="menu-nested"
                    data-affino-menu-root="nested-stacks"
                    data-affino-menu-placement="bottom"
                    data-affino-menu-align="start"
                    data-affino-menu-open-delay="60"
                    data-affino-menu-close-delay="140"
                    data-affino-menu-gutter="10"
                    data-affino-menu-portal="inline"
                >
                    <button type="button" class="menu-nested__trigger" data-affino-menu-trigger>
                        Browse stacks
                    </button>

                    <div class="menu-nested__panel" data-affino-menu-panel role="menu" hidden>
                        <p class="menu-nested__label">Stacks</p>
                        @foreach ($nestedStacks as $stack)
                            <div
                                class="menu-nested__submenu"
                                wire:key="nested-stack-{{ $stack['id'] }}"
                                data-affino-menu-root="nested-stack-{{ $stack['id'] }}"
                                data-affino-menu-placement="right"
                                data-affino-menu-align="start"
                                data-affino-menu-open-delay="60"
                                data-affino-menu-close-delay="140"
                                data-affino-menu-gutter="10"
                                data-affino-menu-portal="inline"
                            >
                                <button type="button" class="menu-nested__stack" data-affino-menu-trigger>
                                    <span class="menu-nested__code">{{ $stack['code'] }}</span>
                                    <span class="menu-nested__copy">
                                        <strong>{{ $stack['label'] }}</strong>
                                        <small>{{ $stack['note'] }}</small>
                                    </span>
                                </button>

                                <div class="menu-nested__child-panel" data-affino-menu-panel role="menu" hidden>
                                    @foreach ($stack['items'] as $item)
                                        <button
                                            type="button"
                                            class="menu-nested__item"
                                            data-affino-menu-item
                                            wire:click="selectNestedItem('{{ $stack['id'] }}', '{{ $item['id'] }}')"
                                        >
                                            <strong>{{ $item['label'] }}</strong>
                                            <span>Enter</span>
                                        </button>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="menu-nested__log">
                    <span>Last action</span>
                    <strong>{{ $nestedLastSelection }}</strong>
                </div>
            </article>
        </div>
    </section>
</section>
