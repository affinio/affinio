<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Listbox extends Component
{
    public function render(): View
    {
        return view('livewire.page.listbox')
            ->layout('layouts.app')
            ->title('Affino · Listbox');
    }
}
