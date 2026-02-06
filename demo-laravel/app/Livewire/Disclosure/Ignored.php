<?php

namespace App\Livewire\Disclosure;

use Illuminate\View\View;
use Livewire\Component;

class Ignored extends Component
{
    public int $ticks = 0;

    public function tick(): void
    {
        $this->ticks++;
    }

    public function render(): View
    {
        return view('livewire.disclosure.ignored');
    }
}
