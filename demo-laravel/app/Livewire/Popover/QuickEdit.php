<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class QuickEdit extends Component
{
    /**
     * @var array<int, array<string, string|int>>
     */
    public array $services = [
        ['id' => 1, 'name' => 'Incident router', 'owner' => 'Ops', 'status' => 'Monitoring'],
        ['id' => 2, 'name' => 'Billing guard', 'owner' => 'Finance', 'status' => 'Paused'],
        ['id' => 3, 'name' => 'Inference mesh', 'owner' => 'ML', 'status' => 'Scaling'],
    ];

    /**
     * @var array<int, array{owner: string, status: string}>
     */
    public array $drafts = [];

    public function mount(): void
    {
        $this->syncDraftsFromServices();
    }

    public function apply(int $serviceId): void
    {
        $this->services = array_map(function (array $service) use ($serviceId) {
            if (($service['id'] ?? 0) !== $serviceId) {
                return $service;
            }

            $draft = $this->drafts[$serviceId] ?? null;
            if (! is_array($draft)) {
                return $service;
            }

            $owner = trim((string) ($draft['owner'] ?? ''));
            $status = (string) ($draft['status'] ?? '');

            $service['owner'] = $owner !== '' ? $owner : (string) $service['owner'];
            $service['status'] = in_array($status, ['Monitoring', 'Scaling', 'Paused'], true)
                ? $status
                : (string) $service['status'];

            return $service;
        }, $this->services);

        $this->syncDraftsFromServices();
    }

    public function resetDraft(int $serviceId): void
    {
        foreach ($this->services as $service) {
            if (($service['id'] ?? 0) !== $serviceId) {
                continue;
            }

            $this->drafts[$serviceId] = [
                'owner' => (string) ($service['owner'] ?? ''),
                'status' => (string) ($service['status'] ?? 'Monitoring'),
            ];
            break;
        }
    }

    public function render(): View
    {
        return view('livewire.popover.quick-edit');
    }

    private function syncDraftsFromServices(): void
    {
        foreach ($this->services as $service) {
            $serviceId = (int) ($service['id'] ?? 0);
            if ($serviceId <= 0) {
                continue;
            }

            if (! isset($this->drafts[$serviceId])) {
                $this->drafts[$serviceId] = [
                    'owner' => (string) ($service['owner'] ?? ''),
                    'status' => (string) ($service['status'] ?? 'Monitoring'),
                ];
            }
        }
    }
}
