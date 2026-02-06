<?php

namespace App\Livewire\Overlay;

use Illuminate\View\View;
use Livewire\Component;

class RehydrateCase extends Component
{
    public int $revision = 1;

    public string $draft = '';

    public bool $showDiagnostics = false;

    public function bumpRevision(): void
    {
        $this->revision++;
    }

    public function toggleDiagnostics(): void
    {
        $this->showDiagnostics = ! $this->showDiagnostics;
    }

    public function resetDraft(): void
    {
        $this->draft = '';
    }

    public function render(): View
    {
        return view('livewire.overlay.rehydrate-case');
    }
}
