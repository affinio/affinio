<?php

namespace App\Livewire\Dialog;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class ManualCase extends Component
{
    public string $dialogId = '';

    public int $dispatchCount = 0;

    public string $lastAction = 'idle';

    public int $acknowledged = 0;

    public function mount(): void
    {
        $componentId = method_exists($this, 'getId')
            ? (string) $this->getId()
            : Str::lower(Str::random(8));

        $this->dialogId = 'dialogs-manual-'.$componentId;
    }

    public function openFromServer(): void
    {
        $this->dispatch('affino-dialog:manual', id: $this->dialogId, action: 'open', reason: 'programmatic');
        $this->dispatchCount++;
        $this->lastAction = 'open';
    }

    public function closeFromServer(): void
    {
        $this->dispatch('affino-dialog:manual', id: $this->dialogId, action: 'close', reason: 'programmatic');
        $this->dispatchCount++;
        $this->lastAction = 'close';
    }

    public function toggleFromServer(): void
    {
        $this->dispatch('affino-dialog:manual', id: $this->dialogId, action: 'toggle', reason: 'programmatic');
        $this->dispatchCount++;
        $this->lastAction = 'toggle';
    }

    public function acknowledge(): void
    {
        $this->acknowledged++;
    }

    public function render(): View
    {
        return view('livewire.dialog.manual-case');
    }
}
