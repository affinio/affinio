<?php

namespace Tests\Feature;

use App\Livewire\Tooltip\Reports;
use App\Livewire\Tooltip\Showcase;
use Livewire\Livewire;
use Tests\TestCase;

class TooltipLivewireTest extends TestCase
{
    public function test_overview_page_renders_showcase_component(): void
    {
        $response = $this->get(route('livewire.tooltips.overview'));

        $response->assertOk();
        $response->assertSee('wire:navigate', false);
        $response->assertSee('data-affino-tooltip-trigger-mode="hover-focus"', false);
    }

    public function test_reports_page_renders_region_tooltips(): void
    {
        $response = $this->get(route('livewire.tooltips.reports'));

        $response->assertOk();
        $response->assertSee('report-tooltip-fr-edge', false);
    }

    public function test_tasks_preserve_tooltips_after_mutations(): void
    {
        $component = Livewire::test(Showcase::class);

        $initialTasks = $component->get('tasks');
        $this->assertGreaterThan(0, count($initialTasks));

        $component->call('addTask');
        $tasks = $component->get('tasks');
        $lastTask = end($tasks);

        $component->assertSee('data-affino-tooltip-root="' . $lastTask['tooltip']['id'] . '"', false);

        $firstTask = $tasks[0];

        $component->call('advanceTask', $firstTask['id']);
        $component->assertSee($firstTask['title'], false);

        $component->call('removeTask', $firstTask['id']);
        $component->assertDontSee($firstTask['tooltip']['id'], false);
    }

    public function test_manual_pin_dispatches_browser_event(): void
    {
        Livewire::test(Showcase::class)
            ->set('pinManual', true)
            ->assertDispatched('affino-tooltip:manual', function (string $event, array $payload) {
                return $event === 'affino-tooltip:manual'
                    && ($payload['id'] ?? null) === 'manual-livewire-tooltip'
                    && ($payload['action'] ?? null) === 'open';
            })
            ->set('pinManual', false)
            ->assertDispatched('affino-tooltip:manual', function (string $event, array $payload) {
                return $event === 'affino-tooltip:manual'
                    && ($payload['id'] ?? null) === 'manual-livewire-tooltip'
                    && ($payload['action'] ?? null) === 'close';
            });
    }

    public function test_reports_region_switches_keep_unique_tooltips(): void
    {
        Livewire::test(Reports::class)
            ->call('setRegion', 'apac')
            ->assertSet('activeRegion', 'apac')
            ->assertSee('report-tooltip-sin-core', false)
            ->call('refreshMetrics')
            ->assertSee('refresh 1', false);
    }
}
