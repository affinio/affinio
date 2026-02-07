<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class Pulse extends Component
{
    public int $ticks = 0;

    public bool $running = false;

    public function tick(): void
    {
        if (! $this->running) {
            return;
        }

        $this->ticks++;
    }

    public function toggleRunning(): void
    {
        $this->running = ! $this->running;
    }

    public function render(): View
    {
        return view('livewire.menu.pulse');
    }
}
