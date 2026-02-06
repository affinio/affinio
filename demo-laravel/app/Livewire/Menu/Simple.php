<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    public string $lastAction = '—';

    public function selectAction(string $action): void
    {
        $this->lastAction = $action;
    }

    public function render(): View
    {
        return view('livewire.menu.simple');
    }
}
