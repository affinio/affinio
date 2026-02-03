<?php

namespace App\Livewire\Popover;

use Illuminate\View\View;
use Livewire\Component;

class Workbench extends Component
{
    public array $clusters = [];

    public array $matrix = [];

    public bool $insightPinned = true;

    public int $refreshTick = 0;

    protected array $clusterStatuses = ['Monitoring', 'Draining', 'Scaling'];

    public function mount(): void
    {
        $this->clusters = [
            [
                'id' => 'ingest',
                'name' => 'Edge ingest',
                'owner' => 'Ops · Ceto',
                'status' => 'Monitoring',
                'detail' => 'Routes all EU ingest signals through the zero-copy pipeline.',
                'lag' => '210 ms',
                'load' => '62%',
                'checklist' => ['Freeze deploy queue', 'Page SRE on-call', 'Snapshot diagnostics'],
            ],
            [
                'id' => 'billing',
                'name' => 'Billing multiplexer',
                'owner' => 'Finance · Reva',
                'status' => 'Draining',
                'detail' => 'Splits traffic between card vaults while we patch the gateway.',
                'lag' => '340 ms',
                'load' => '78%',
                'checklist' => ['Lock ledger', 'Mirror writes', 'Notify partners'],
            ],
            [
                'id' => 'ml',
                'name' => 'Inference mesh',
                'owner' => 'ML · Taro',
                'status' => 'Scaling',
                'detail' => 'GPU-heavy estate that powers detection popovers in the dashboard.',
                'lag' => '480 ms',
                'load' => '88%',
                'checklist' => ['Split batches', 'Throttle reporters', 'Escalate backlog'],
            ],
        ];

        $this->matrix = [
            ['id' => 'authz', 'label' => 'AuthZ sync', 'role' => 'Approvals', 'owner' => 'Iris Soto', 'status' => 'Ready', 'notes' => 'Requires director sign-off once cache primes.'],
            ['id' => 'pipelines', 'label' => 'Pipeline replay', 'role' => 'Infra', 'owner' => 'Niles Vega', 'status' => 'Needs review', 'notes' => 'Waiting on clean sample before we fan out.'],
            ['id' => 'ml-rollout', 'label' => 'ML rollout', 'role' => 'Approvals', 'owner' => 'Kay Obi', 'status' => 'Ready', 'notes' => 'Last GPU block drained; ready for verification.'],
            ['id' => 'cust-updates', 'label' => 'Customer updates', 'role' => 'Comms', 'owner' => 'Bea Forman', 'status' => 'Needs review', 'notes' => 'Legal wants the popover pinned for regulated users.'],
        ];
    }

    public function refreshClusters(): void
    {
        $this->refreshTick++;
        $this->clusters = array_map(function (array $cluster) {
            $statusIndex = array_search($cluster['status'], $this->clusterStatuses, true) ?: 0;
            $cluster['status'] = $this->clusterStatuses[($statusIndex + 1) % count($this->clusterStatuses)];
            $cluster['lag'] = rand(120, 520) . ' ms';
            $cluster['load'] = rand(48, 94) . '%';

            return $cluster;
        }, $this->clusters);
    }

    public function toggleMatrix(string $entryId): void
    {
        $this->matrix = array_map(function (array $entry) use ($entryId) {
            if ($entry['id'] !== $entryId) {
                return $entry;
            }

            $entry['status'] = $entry['status'] === 'Ready' ? 'Needs review' : 'Ready';

            return $entry;
        }, $this->matrix);
    }

    public function updatedInsightPinned(bool $value): void
    {
        $this->dispatch('affino-popover:manual', id: 'insight-popover', action: $value ? 'open' : 'close', reason: 'programmatic');
    }

    public function render(): View
    {
        return view('livewire.popover.workbench', [
            'matrixGroups' => $this->groupMatrixByRole(),
        ]);
    }

    /**
     * @return array<string, array<int, array<string, string>>>
     */
    private function groupMatrixByRole(): array
    {
        $grouped = [];

        foreach ($this->matrix as $entry) {
            $grouped[$entry['role']][] = $entry;
        }

        return $grouped;
    }
}
