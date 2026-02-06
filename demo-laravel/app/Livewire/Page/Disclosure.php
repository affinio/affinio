<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Disclosure extends Component
{
    public function render(): View
    {
        return view('livewire.page.disclosure')
            ->layout('layouts.app')
            ->title('Affino · Disclosure');
    }
}
