<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class Pulse extends Component
{
    public int $ticks = 0;

    public function tick(): void
    {
        $this->ticks++;
    }

    public function render(): View
    {
        return view('livewire.menu.pulse');
    }
}
