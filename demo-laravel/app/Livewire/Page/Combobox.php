<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Combobox extends Component
{
    public function render(): View
    {
        return view('livewire.page.combobox')
            ->layout('layouts.app')
            ->title('Affino · Combobox');
    }
}
