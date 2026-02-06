<?php

namespace App\Livewire\Disclosure;

use Illuminate\View\View;
use Livewire\Component;

class Pulse extends Component
{
    public int $pulse = 0;

    public function tick(): void
    {
        $this->pulse++;
    }

    public function render(): View
    {
        return view('livewire.disclosure.pulse');
    }
}
