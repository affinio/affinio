<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Popovers extends Component
{
    public function render(): View
    {
        return view('livewire.page.popovers')
            ->layout('layouts.app')
            ->title('Affino · Popovers');
    }
}
