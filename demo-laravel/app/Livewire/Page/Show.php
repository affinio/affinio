<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Show extends Component
{
    public string $page = '';

    public string $pageName = '';

    /**
     * @var array<string, string>
     */
    private const PAGE_NAMES = [
        'tabs' => 'Tabs',
        'disclosure' => 'Disclosure',
        'listbox' => 'Listbox',
        'combobox' => 'Combobox',
        'menus' => 'Menus',
        'popovers' => 'Popovers',
        'dialogs' => 'Dialogs',
        'tooltips' => 'Tooltips',
        'overlay-kernel' => 'Overlay kernel',
    ];

    public function mount(string $page): void
    {
        abort_unless(isset(self::PAGE_NAMES[$page]), 404);

        $this->page = $page;
        $this->pageName = self::PAGE_NAMES[$page];
    }

    public function render(): View
    {
        return view('livewire.page.show')
            ->layout('layouts.app')
            ->title('Affino · '.$this->pageName);
    }
}
