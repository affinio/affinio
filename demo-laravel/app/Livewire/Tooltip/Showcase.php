<?php

namespace App\Livewire\Tooltip;

use Illuminate\Support\Str;
use Livewire\Component;
use Illuminate\View\View;

class Showcase extends Component
{
    public array $tasks = [];

    public bool $showChecklist = false;

    public bool $pinManual = false;

    public string $email = '';

    protected int $taskCounter = 1;

    protected array $statusCycle = ['Queued', 'Running', 'Complete'];

    public function mount(): void
    {
        $this->tasks = [
            $this->makeTask(
                'Sync incidents to Opsgenie',
                'Running',
                'Opsgenie sync',
                'Mirrors every P1 to Opsgenie within 2 seconds with automatic ack routing.',
            ),
            $this->makeTask(
                'Backfill audit log viewers',
                'Queued',
                'Audit visibility',
                'Tooltips explain why permission changes stay soft-locked for 15 minutes.',
            ),
            $this->makeTask(
                'Warm the EU West cache',
                'Complete',
                'Cache warming',
                'Preloads hero reports so the first hover feels instant.',
            ),
        ];
    }

    public function addTask(): void
    {
        $nextLabel = $this->taskCounter + 1;
        $this->tasks[] = $this->makeTask(
            "Escalate incident #{$nextLabel}",
            'Queued',
            'Runbook drafted',
            'Livewire re-renders the task row, then the tooltip re-hydrates automatically.',
        );
    }

    public function advanceTask(int $taskId): void
    {
        $this->tasks = array_map(function (array $task) use ($taskId) {
            if ($task['id'] !== $taskId) {
                return $task;
            }

            $currentIndex = array_search($task['status'], $this->statusCycle, true) ?: 0;
            $task['status'] = $this->statusCycle[($currentIndex + 1) % count($this->statusCycle)];

            return $task;
        }, $this->tasks);
    }

    public function removeTask(int $taskId): void
    {
        $this->tasks = array_values(array_filter($this->tasks, fn (array $task) => $task['id'] !== $taskId));
    }

    public function toggleChecklist(): void
    {
        $this->showChecklist = ! $this->showChecklist;
    }

    public function updatedPinManual(bool $value): void
    {
        $this->dispatch('affino-tooltip:manual', id: 'manual-livewire-tooltip', action: $value ? 'open' : 'close', reason: 'programmatic');
    }

    public function render(): View
    {
        return view('livewire.tooltip.showcase');
    }

    protected function makeTask(string $title, string $status, string $tooltipTitle, string $tooltipBody): array
    {
        $id = $this->taskCounter++;

        return [
            'id' => $id,
            'title' => $title,
            'status' => $status,
            'owner' => 'SurfaceCore · Cluster ' . strtoupper(Str::random(2)),
            'tooltip' => [
                'id' => "task-tooltip-{$id}",
                'title' => $tooltipTitle,
                'body' => $tooltipBody,
            ],
        ];
    }
}
