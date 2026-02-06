<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Treeview extends Component
{
    public function render(): View
    {
        return view('livewire.page.treeview')
            ->layout('layouts.app')
            ->title('Affino · Treeview');
    }
}
