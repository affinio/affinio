<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Tooltips extends Component
{
    public function render(): View
    {
        return view('livewire.page.tooltips')
            ->layout('layouts.app')
            ->title('Affino · Tooltips');
    }
}
