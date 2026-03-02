<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class DataGridPivot extends Component
{
    public function render(): View
    {
        return view('livewire.page.datagrid-pivot')
            ->layout('layouts.app')
            ->title('Affino · DataGrid Pivot');
    }
}

