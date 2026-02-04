<?php

namespace App\Livewire\Dialog;

use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    public array $timeline = [];

    public ?array $lastEvent = null;

    public array $journeys = [];

    public string $activeJourney = 'stabilize';

    public bool $manualPinned = false;

    public int $timelineCounter = 0; // Persist counter so timeline keys stay unique across morphs

    public function mount(): void
    {
        $this->journeys = [
            'stabilize' => [
                'title' => 'Stabilize incidents',
                'summary' => 'Pin the dialog and dispatch cross-region warmups after every escalation.',
                'duration' => '14 minutes',
                'steps' => [
                    'Lock the dialog focus loop so triage stays in one surface.',
                    'Queue database failover scripts and broadcast stats to observers.',
                    'Send the run-link to Livewire dashboards for regional leads.',
                ],
            ],
            'handoff' => [
                'title' => 'Follow-the-sun handoff',
                'summary' => 'Capture playback notes and transfer ownership without losing scroll locks.',
                'duration' => '11 minutes',
                'steps' => [
                    'Snapshot the command palette timeline.',
                    'Pin the dialog open while ownership transfers.',
                    'Dispatch `affino-dialog:manual` so the EU desk inherits the active surface.',
                ],
            ],
            'retro' => [
                'title' => 'Incident retro prep',
                'summary' => 'Collect guardrail breaches and annotate the next runbook inside the dialog.',
                'duration' => '9 minutes',
                'steps' => [
                    'Archive the latest four timeline events for the report.',
                    'Export the dialog summary directly from Livewire state.',
                    'Unlock scroll once the retro doc is attached to the case.',
                ],
            ],
        ];

        $this->seedTimeline();
    }

    public function logEvent(string $event): void
    {
        $catalog = [
            'compose' => [
                'label' => 'Composer launched',
                'detail' => 'Opened the surface to draft a network-wide update.',
                'meta' => 'Now',
            ],
            'dispatch' => [
                'label' => 'Dispatch queued',
                'detail' => 'Escalated the cluster to the paging ladder.',
                'meta' => '+45s',
            ],
            'sync' => [
                'label' => 'Mirrors synced',
                'detail' => 'Kicked off diagnostics across three regions.',
                'meta' => '+90s',
            ],
            'archive' => [
                'label' => 'Retro archived',
                'detail' => 'Saved the transcript from the active dialog surface.',
                'meta' => 'Done',
            ],
        ];

        if (! isset($catalog[$event])) {
            return;
        }

        $payload = $catalog[$event];
        $this->addTimelineEntry($payload['label'], $payload['detail'], $payload['meta']);
    }

    public function selectJourney(string $journey): void
    {
        if (array_key_exists($journey, $this->journeys)) {
            $this->activeJourney = $journey;
        }
    }

    public function updatedManualPinned(bool $value): void
    {
        $this->dispatch('affino-dialog:manual', id: 'manual-ops-dialog', action: $value ? 'open' : 'close', reason: 'programmatic');
    }

    public function render(): View
    {
        $journey = $this->journeys[$this->activeJourney] ?? (array_values($this->journeys)[0] ?? [
            'title' => 'Dialog playbook',
            'summary' => 'Define journeys to preview guardrails.',
            'duration' => '—',
            'steps' => [],
        ]);

        return view('livewire.dialog.showcase', [
            'activeJourneyData' => $journey,
            'journeyKeys' => array_keys($this->journeys),
        ]);
    }

    protected function seedTimeline(): void
    {
        $this->timeline = [];
        $this->addTimelineEntry('Escalation pinned', 'Ops triage anchored the dialog for the current incident.', '00:12 UTC');
        $this->addTimelineEntry('Warmup synced', 'Cache mirrors hydrated after the modal opened.', '00:13 UTC');
        $this->addTimelineEntry('Steps updated', 'Livewire re-render completed and hydration resumed.', '00:15 UTC');
        $this->lastEvent = null;
    }

    protected function addTimelineEntry(string $label, string $detail, string $meta): void
    {
        $entry = [
            'id' => ++$this->timelineCounter,
            'label' => $label,
            'detail' => $detail,
            'meta' => $meta,
        ];

        $this->timeline = array_slice(array_merge([$entry], $this->timeline), 0, 4);

        $this->lastEvent = [
            'label' => $label,
            'detail' => $detail,
            'meta' => $meta,
        ];
    }
}
