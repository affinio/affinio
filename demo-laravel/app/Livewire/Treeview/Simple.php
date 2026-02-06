<?php

namespace App\Livewire\Treeview;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    /**
     * @var array<int, array{value: string, parent: string|null, label: string, detail: string}>
     */
    public array $nodes = [
        ['value' => 'workspace', 'parent' => null, 'label' => 'Workspace', 'detail' => 'Primary product workspace root'],
        ['value' => 'roadmap', 'parent' => 'workspace', 'label' => 'Roadmap', 'detail' => 'Quarter planning lanes'],
        ['value' => 'backlog', 'parent' => 'roadmap', 'label' => 'Backlog', 'detail' => 'Candidate stories and spikes'],
        ['value' => 'sprint', 'parent' => 'roadmap', 'label' => 'Sprint', 'detail' => 'Execution lane with active goals'],
        ['value' => 'qa', 'parent' => 'workspace', 'label' => 'Quality', 'detail' => 'Validation and release gates'],
        ['value' => 'incidents', 'parent' => 'qa', 'label' => 'Incidents', 'detail' => 'Live triage and timelines'],
        ['value' => 'postmortems', 'parent' => 'qa', 'label' => 'Postmortems', 'detail' => 'Root-cause notes'],
        ['value' => 'archive', 'parent' => 'workspace', 'label' => 'Archive', 'detail' => 'Retired branches'],
    ];

    public string $selectedNode = 'backlog';

    public function clearSelection(): void
    {
        $this->selectedNode = '';
    }

    public function render(): View
    {
        return view('livewire.treeview.simple');
    }
}
