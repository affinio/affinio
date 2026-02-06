<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class Ignored extends Component
{
    public int $pulses = 0;

    public function tick(): void
    {
        $this->pulses++;
    }

    public function render(): View
    {
        return view('livewire.menu.ignored');
    }
}
