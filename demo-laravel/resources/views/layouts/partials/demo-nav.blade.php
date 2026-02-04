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

<nav class="demo-stack-nav" aria-label="Laravel Surface demos">
    @foreach ($demoSections as $section)
        @php
            $sectionIsActive = request()->routeIs($section['pattern']);
        @endphp
        <div class="demo-stack-nav__group {{ $sectionIsActive ? 'is-active' : '' }}">
            <div class="demo-stack-nav__header">
                <p class="demo-stack-nav__title">{{ $section['label'] }}</p>
                <small class="demo-stack-nav__subtitle">{{ $section['description'] }}</small>
            </div>

            <ul class="demo-stack-nav__list">
                @foreach ($section['links'] as $link)
                    <li>
                        <a
                            wire:navigate
                            href="{{ $link['href'] }}"
                            class="demo-stack-nav__link {{ request()->routeIs($link['pattern']) ? 'is-active' : '' }}"
                        >{{ $link['label'] }}</a>
                    </li>
                @endforeach
            </ul>
        </div>
    @endforeach
</nav>
