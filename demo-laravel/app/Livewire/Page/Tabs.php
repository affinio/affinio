<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Tabs extends Component
{
    public function render(): View
    {
        return view('livewire.page.tabs')
            ->layout('layouts.app')
            ->title('Affino · Tabs');
    }
}
