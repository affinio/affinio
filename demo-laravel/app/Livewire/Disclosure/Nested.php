<?php

namespace App\Livewire\Disclosure;

use Illuminate\View\View;
use Livewire\Component;

class Nested extends Component
{
    public int $checks = 0;

    public function ping(): void
    {
        $this->checks++;
    }

    public function render(): View
    {
        return view('livewire.disclosure.nested');
    }
}
