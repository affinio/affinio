<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class Dialogs extends Component
{
    public function render(): View
    {
        return view('livewire.page.dialogs')
            ->layout('layouts.app')
            ->title('Affino · Dialogs');
    }
}
