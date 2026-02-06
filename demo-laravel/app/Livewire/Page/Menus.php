<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Menus extends Component
{
    public function render(): View
    {
        return view('livewire.page.menus')
            ->layout('layouts.app')
            ->title('Affino · Menus');
    }
}
