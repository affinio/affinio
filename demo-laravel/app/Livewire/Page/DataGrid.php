<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class DataGrid extends Component
{
    public function render(): View
    {
        return view('livewire.page.datagrid')
            ->layout('layouts.app')
            ->title('Affino · DataGrid');
    }
}

