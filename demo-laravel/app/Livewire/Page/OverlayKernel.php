<?php

namespace App\Livewire\Page;

use Illuminate\View\View;
use Livewire\Component;

class OverlayKernel extends Component
{
    public function render(): View
    {
        return view('livewire.page.overlay-kernel')
            ->layout('layouts.app')
            ->title('Affino · Overlay kernel');
    }
}
