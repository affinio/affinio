<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    public string $title = 'API degradation in us-east';

    public string $owner = 'Ops lead';

    public string $severity = 'high';

    public int $saved = 0;

    public bool $modal = true;

    public bool $closeOnBackdrop = true;

    public bool $closeOnEscape = true;

    public bool $lockScroll = true;

    public function saveDraft(): void
    {
        $this->saved++;
    }

    public function resetDraft(): void
    {
        $this->title = '';
        $this->owner = '';
        $this->severity = 'medium';
    }

    public function render(): View
    {
        return view('livewire.dialog.simple');
    }
}
