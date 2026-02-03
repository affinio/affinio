<?php

namespace Tests\Feature;

use App\Livewire\Popover\Showcase;
use App\Livewire\Popover\Workbench;
use Livewire\Livewire;
use Tests\TestCase;

class PopoverLivewireTest extends TestCase
{
    public function test_popover_overview_route_renders_showcase(): void
    {
        $response = $this->get(route('livewire.popovers.overview'));

        $response->assertOk();
        $response->assertSee('data-affino-popover-root', false);
    }

    public function test_popover_workbench_route_renders_workbench(): void
    {
        $response = $this->get(route('livewire.popovers.workbench'));

        $response->assertOk();
        $response->assertSee('popover-stack', false);
    }

    public function test_showcase_manual_pin_dispatches_popover_event(): void
    {
        Livewire::test(Showcase::class)
            ->set('pinManual', true)
            ->assertDispatched('affino-popover:manual', function (string $event, array $payload) {
                return $event === 'affino-popover:manual'
                    && ($payload['id'] ?? null) === 'playbook-pin-popover'
                    && ($payload['action'] ?? null) === 'open';
            })
            ->set('pinManual', false)
            ->assertDispatched('affino-popover:manual', function (string $event, array $payload) {
                return $event === 'affino-popover:manual'
                    && ($payload['id'] ?? null) === 'playbook-pin-popover'
                    && ($payload['action'] ?? null) === 'close';
            });
    }

    public function test_showcase_schedule_window_appends_entry(): void
    {
        $component = Livewire::test(Showcase::class);
        $initialCount = count($component->get('windows'));

        $component->call('scheduleWindow');

        $this->assertCount($initialCount + 1, $component->get('windows'));
    }

    public function test_workbench_refresh_clusters_rotates_status(): void
    {
        Livewire::test(Workbench::class)
            ->call('refreshClusters')
            ->assertSet('refreshTick', 1);
    }
}
