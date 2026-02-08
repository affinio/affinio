<?php

namespace App\Livewire\Header;

use Livewire\Component;

class Navigation extends Component
{
    /**
     * @var array<int, array<string, string>>
     */
    public array $components = [];

    /**
     * @param array<int, array<string, string>> $components
     */
    public function mount(array $components = []): void
    {
        $this->components = $components !== [] ? $components : $this->defaultComponents();
    }

    public function render()
    {
        return view('livewire.header.navigation');
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function defaultComponents(): array
    {
        return [
            ['value' => 'treeview', 'name' => 'Treeview', 'path' => '/treeview'],
            ['value' => 'tabs', 'name' => 'Tabs', 'path' => '/tabs'],
            ['value' => 'disclosure', 'name' => 'Disclosure', 'path' => '/disclosure'],
            ['value' => 'listbox', 'name' => 'Listbox', 'path' => '/listbox'],
            ['value' => 'combobox', 'name' => 'Combobox', 'path' => '/combobox'],
            ['value' => 'datagrid', 'name' => 'DataGrid', 'path' => '/datagrid'],
            ['value' => 'menus', 'name' => 'Menus', 'path' => '/menus'],
            ['value' => 'popovers', 'name' => 'Popovers', 'path' => '/popovers'],
            ['value' => 'dialogs', 'name' => 'Dialogs', 'path' => '/dialogs'],
            ['value' => 'tooltips', 'name' => 'Tooltips', 'path' => '/tooltips'],
            ['value' => 'overlay-kernel', 'name' => 'Overlay kernel', 'path' => '/overlay-kernel'],
        ];
    }
}
