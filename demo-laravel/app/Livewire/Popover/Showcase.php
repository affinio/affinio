<?php

namespace App\Livewire\Popover;

use Illuminate\Support\Str;
use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    public array $windows = [];

    public array $journeys = [];

    public string $activeJourney = 'handoff';

    public bool $pinManual = false;

    public bool $composerOpen = false;

    protected array $statusCycle = ['Scheduled', 'Processing', 'Paused'];

    protected int $windowCounter = 0;

    public function mount(): void
    {
        $this->windows = [
            $this->makeWindow(
                'Edge cache warm-up',
                '00:20 – 00:45 UTC',
                'Processing',
                'Primes analytics caches while dashboards stay available.',
                ['Drain stale keys', 'Rebalance shards', 'Resume writers'],
            ),
            $this->makeWindow(
                'Runbook sync',
                '02:00 – 02:15 UTC',
                'Scheduled',
                'Pushes the latest Livewire playbooks to every region.',
                ['Sync markdown', 'Validate owners', 'Publish diff'],
            ),
            $this->makeWindow(
                'Incident insights export',
                '04:30 – 04:45 UTC',
                'Paused',
                'Locks ingestion while tier-one teams triage active incidents.',
                ['Snapshot queues', 'Escalate blockers', 'Resume ingestion'],
            ),
        ];

        $this->journeys = [
            'handoff' => [
                'id' => 'handoff',
                'title' => 'Shift hand-off',
                'summary' => 'Ensure the follow-the-sun team inherits the right context.',
                'duration' => '12 minutes',
                'steps' => [
                    'Confirm pager rotation and identity hand-off.',
                    'Review the pinned incident queue and run quick audits.',
                    'Dispatch Livewire update so everyone sees the same state.',
                ],
            ],
            'deploy' => [
                'id' => 'deploy',
                'title' => 'Progressive rollout',
                'summary' => 'Stagger deployments across core regions while keeping SRIs in the loop.',
                'duration' => '18 minutes',
                'steps' => [
                    'Lock the control plane popover so status never desyncs.',
                    'Drain queued changes from sandbox and staging.',
                    'Broadcast dashboard links + recovery checklist.',
                ],
            ],
            'retro' => [
                'id' => 'retro',
                'title' => 'Incident retro prep',
                'summary' => 'Collect the last 5 escalations and pre-fill the timeline.',
                'duration' => '9 minutes',
                'steps' => [
                    'Pin the escalation summary popover for authors.',
                    'Sync timeline markers from SurfaceCore diagnostics.',
                    'Queue Livewire tasks for DRI + comms reviewers.',
                ],
            ],
        ];
    }

    public function scheduleWindow(): void
    {
        $slotLabel = 'Replay ' . Str::upper(Str::random(2));
        $this->windows[] = $this->makeWindow(
            $slotLabel,
            'Rolling 10 min window',
            'Scheduled',
            'Ad-hoc replay seeded during the demo so hydration can be observed.',
            ['Copy baseline', 'Queue dry run', 'Promote changes'],
        );
    }

    public function cycleWindow(int $windowId): void
    {
        $this->windows = array_map(function (array $window) use ($windowId) {
            if ($window['id'] !== $windowId) {
                return $window;
            }

            $currentIndex = array_search($window['status'], $this->statusCycle, true) ?: 0;
            $window['status'] = $this->statusCycle[($currentIndex + 1) % count($this->statusCycle)];

            return $window;
        }, $this->windows);
    }

    public function selectJourney(string $journey): void
    {
        if (array_key_exists($journey, $this->journeys)) {
            $this->activeJourney = $journey;
        }
    }

    public function updatedPinManual(bool $value): void
    {
        $this->dispatch('affino-popover:manual', id: 'playbook-pin-popover', action: $value ? 'open' : 'close', reason: 'programmatic');
    }

    public function openComposer(): void
    {
        $this->composerOpen = true;
        $this->dispatch('affino-popover:manual', id: 'composer-popover', action: 'open', reason: 'programmatic');
    }

    public function closeComposer(): void
    {
        $this->composerOpen = false;
        $this->dispatch('affino-popover:manual', id: 'composer-popover', action: 'close', reason: 'programmatic');
    }

    public function render(): View
    {
        $journeyValues = array_values($this->journeys);
        $activeJourney = $this->journeys[$this->activeJourney] ?? ($journeyValues[0] ?? []);

        return view('livewire.popover.showcase', [
            'journeyKeys' => array_keys($this->journeys),
            'activeJourneyData' => $activeJourney,
        ]);
    }

    private function makeWindow(string $label, string $window, string $status, string $summary, array $actions): array
    {
        return [
            'id' => ++$this->windowCounter,
            'label' => $label,
            'window' => $window,
            'status' => $status,
            'summary' => $summary,
            'actions' => $actions,
        ];
    }
}
