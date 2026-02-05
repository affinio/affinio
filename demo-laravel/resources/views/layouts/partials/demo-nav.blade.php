@php
    $demoSections = [
        [
            'label' => 'Tooltips',
            'description' => '@affino/tooltip-laravel',
            'pattern' => 'livewire.tooltips.*',
            'links' => [
                [
                    'label' => 'Overview',
                    'href' => route('livewire.tooltips.overview'),
                    'pattern' => 'livewire.tooltips.overview',
                ],
                [
                    'label' => 'Region reports',
                    'href' => route('livewire.tooltips.reports'),
                    'pattern' => 'livewire.tooltips.reports',
                ],
            ],
        ],
        [
            'label' => 'Dialogs',
            'description' => '@affino/dialog-laravel',
            'pattern' => 'livewire.dialogs.*',
            'links' => [
                [
                    'label' => 'Command center',
                    'href' => route('livewire.dialogs.overview'),
                    'pattern' => 'livewire.dialogs.overview',
                ],
            ],
        ],
        [
            'label' => 'Popovers',
            'description' => '@affino/popover-laravel',
            'pattern' => 'livewire.popovers.*',
            'links' => [
                [
                    'label' => 'Orchestrator',
                    'href' => route('livewire.popovers.overview'),
                    'pattern' => 'livewire.popovers.overview',
                ],
                [
                    'label' => 'Command center',
                    'href' => route('livewire.popovers.workbench'),
                    'pattern' => 'livewire.popovers.workbench',
                ],
            ],
        ],
        [
            'label' => 'Selects',
            'description' => '@affino/listbox-laravel',
            'pattern' => 'livewire.selects.*',
            'links' => [
                [
                    'label' => 'Overview',
                    'href' => route('livewire.selects.overview'),
                    'pattern' => 'livewire.selects.overview',
                ],
            ],
        ],
        [
            'label' => 'Comboboxes',
            'description' => '@affino/combobox-laravel',
            'pattern' => 'livewire.comboboxes.*',
            'links' => [
                [
                    'label' => 'Overview',
                    'href' => route('livewire.comboboxes.overview'),
                    'pattern' => 'livewire.comboboxes.overview',
                ],
            ],
        ],
        [
            'label' => 'Menus',
            'description' => '@affino/menu-laravel',
            'pattern' => 'livewire.menus.*',
            'links' => [
                [
                    'label' => 'Overview',
                    'href' => route('livewire.menus.overview'),
                    'pattern' => 'livewire.menus.overview',
                ],
            ],
        ],
    ];
@endphp

<div class="demo-header">
    <div class="demo-header__surface" aria-label="Affino Laravel demos">
        <div class="demo-header__brand">
            <div class="demo-header__logo">
                <h1>Affino</h1>
                <span class="header-pill">alpha</span>
                <span class="demo-header__badge">Laravel</span>
            </div>
            <div class="demo-header__meta">
                <h2>Menu core · Livewire</h2>
                <p>Mirrors the Vue reference shell while staying powered by Laravel adapters.</p>
            </div>
        </div>

        <nav class="demo-header__nav" aria-label="Affino demo navigation">
            @foreach ($demoSections as $section)
                @php
                    $target = $section['links'][0] ?? null;
                    $isActive = request()->routeIs($section['pattern']);
                @endphp
                @if ($target)
                    <a
                        wire:navigate
                        href="{{ $target['href'] }}"
                        class="nav-link {{ $isActive ? 'nav-link--active' : '' }}"
                    >{{ $section['label'] }}</a>
                @endif
            @endforeach
        </nav>
    </div>
</div>
