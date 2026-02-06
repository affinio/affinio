<?php

namespace App\Livewire\Listbox;

use Illuminate\View\View;
use Livewire\Component;

class Simple extends Component
{
    /**
     * @var array<int, array{value: string, label: string, meta: string}>
     */
    public array $regions = [
        ['value' => 'emea-routing', 'label' => 'EMEA routing hub', 'meta' => 'Frankfurt + London health checks'],
        ['value' => 'amer-edges', 'label' => 'Americas edge mesh', 'meta' => 'Seattle + Montreal edge relays'],
        ['value' => 'apac-orbit', 'label' => 'APAC orbit lanes', 'meta' => 'Sydney + Seoul control nodes'],
        ['value' => 'latam-field', 'label' => 'LatAm field kit', 'meta' => 'Bogota + Sao Paulo rollouts'],
    ];

    public string $selection = 'emea-routing';

    public bool $disabled = false;

    public function selectNext(): void
    {
        $values = array_column($this->regions, 'value');
        if ($values === []) {
            return;
        }

        $currentIndex = array_search($this->selection, $values, true);
        $nextIndex = $currentIndex === false ? 0 : ($currentIndex + 1) % count($values);
        $this->selection = (string) $values[$nextIndex];
    }

    public function clearSelection(): void
    {
        $this->selection = '';
    }

    public function render(): View
    {
        return view('livewire.listbox.simple', [
            'selectedLabel' => $this->resolveLabel($this->selection),
            'selectedMeta' => $this->resolveMeta($this->selection),
        ]);
    }

    private function resolveLabel(string $value): string
    {
        foreach ($this->regions as $region) {
            if (($region['value'] ?? '') === $value) {
                return (string) ($region['label'] ?? $value);
            }
        }

        return 'No region selected';
    }

    private function resolveMeta(string $value): string
    {
        foreach ($this->regions as $region) {
            if (($region['value'] ?? '') === $value) {
                return (string) ($region['meta'] ?? '');
            }
        }

        return 'Selection cleared';
    }
}
