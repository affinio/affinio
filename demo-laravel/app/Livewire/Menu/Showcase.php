<?php

namespace App\Livewire\Menu;

use Illuminate\View\View;
use Livewire\Component;

class Showcase extends Component
{
    /**
     * @var array<int, array<string, mixed>>
     */
    public array $simplePrimaryActions = [];

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $simpleSecondaryActions = [];

    public string $simpleLastAction = 'None yet';

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $nestedStacks = [];

    public string $nestedLastSelection = 'Waiting for highlight';

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $advancedColumns = [];

    public string $activeColumnId = '';

    public string $activeActionId = '';

    public ?string $activeChildId = null;

    public ?string $activeLeafId = null;

    /**
     * @var array<int, array<string, string>>
     */
    public array $advancedLog = [];

    /**
     * @var array<int, string>
     */
    public array $advancedTrail = [];

    public function mount(): void
    {
        $this->simplePrimaryActions = [
            ['id' => 'edit-headline', 'label' => 'Edit headline', 'description' => 'Tweak copy and CTA pairs', 'shortcut' => 'E'],
            ['id' => 'duplicate', 'label' => 'Duplicate', 'description' => 'Clone layout and preserve bindings', 'shortcut' => 'D'],
            ['id' => 'share', 'label' => 'Share preview', 'description' => 'Generate signed review links', 'shortcut' => 'S'],
        ];

        $this->simpleSecondaryActions = [
            ['id' => 'archive', 'label' => 'Archive', 'description' => 'Freeze analytics without deleting', 'shortcut' => 'A'],
            ['id' => 'delete', 'label' => 'Delete', 'description' => 'Remove project forever', 'shortcut' => '⌘⌫', 'danger' => true],
        ];

        $this->nestedStacks = [
            [
                'id' => 'analytics',
                'label' => 'Analytics',
                'code' => 'AN',
                'note' => 'Funnels, retention, pulse',
                'items' => [
                    ['id' => 'sessions', 'label' => 'Sessions'],
                    ['id' => 'funnel', 'label' => 'Funnel analysis'],
                    ['id' => 'cohort', 'label' => 'Cohort compare'],
                    ['id' => 'pulse', 'label' => 'Pulse alerts'],
                ],
            ],
            [
                'id' => 'automation',
                'label' => 'Automation',
                'code' => 'AU',
                'note' => 'Playbooks and jobs',
                'items' => [
                    ['id' => 'schedule', 'label' => 'Create schedule'],
                    ['id' => 'sync', 'label' => 'Sync segments'],
                    ['id' => 'webhooks', 'label' => 'Trigger webhooks'],
                ],
            ],
            [
                'id' => 'access',
                'label' => 'Access',
                'code' => 'AC',
                'note' => 'Teams, roles, audit',
                'items' => [
                    ['id' => 'invite', 'label' => 'Invite teammate'],
                    ['id' => 'promote', 'label' => 'Promote to admin'],
                    ['id' => 'transfer', 'label' => 'Transfer ownership'],
                ],
            ],
        ];

        $this->advancedColumns = $this->buildAdvancedColumns();
        $this->activeColumnId = $this->advancedColumns[0]['id'] ?? '';
        $this->activeActionId = $this->advancedColumns[0]['actions'][0]['id'] ?? '';
        $this->activeChildId = $this->activeActionId ? ($this->advancedColumns[0]['actions'][0]['children'][0]['id'] ?? null) : null;
        $this->activeLeafId = $this->activeChildId ? ($this->advancedColumns[0]['actions'][0]['children'][0]['children'][0]['id'] ?? null) : null;

        $this->advancedLog = [
            ['label' => 'Deploy lanes › Canary lanes › Edge mesh › 5% traffic', 'at' => '05:24 UTC'],
            ['label' => 'Observability › Trace gatherer › Snapshot run › 15 minute capture', 'at' => '05:18 UTC'],
            ['label' => 'Recovery playbooks › Contain blast radius › Geo fences', 'at' => '05:12 UTC'],
        ];
        $this->advancedTrail = $this->composeTrail(false);
    }

    public function selectSimpleAction(string $actionId): void
    {
        $action = $this->findSimpleAction($actionId);
        if (!$action) {
            return;
        }

        $this->simpleLastAction = $action['label'] ?? $actionId;
    }

    public function selectNestedItem(string $stackId, string $itemId): void
    {
        $stack = $this->findNestedStack($stackId);
        if (!$stack) {
            return;
        }

        $item = $this->findNestedEntry($stack, $itemId);
        if (!$item) {
            return;
        }

        $this->nestedLastSelection = $item['label'] ?? $itemId;
    }

    public function focusAdvancedColumn(string $columnId): void
    {
        $column = $this->findColumn($columnId);
        if (!$column) {
            return;
        }

        $this->activeColumnId = $columnId;
        $this->activeActionId = $column['actions'][0]['id'] ?? '';
        $this->activeChildId = $this->resolveFirstChildId($column['actions'][0] ?? null);
        $this->activeLeafId = $this->resolveFirstLeafId($column['actions'][0] ?? null, $this->activeChildId);
        $this->advancedTrail = $this->composeTrail();
    }

    public function focusAdvancedAction(string $columnId, string $actionId): void
    {
        if ($columnId !== $this->activeColumnId) {
            $this->focusAdvancedColumn($columnId);
        }
        $column = $this->findColumn($this->activeColumnId);
        if (!$column) {
            return;
        }
        $action = $this->findAction($column, $actionId);
        if (!$action) {
            return;
        }
        $this->activeActionId = $actionId;
        $this->activeChildId = $this->resolveFirstChildId($action);
        $this->activeLeafId = $this->resolveFirstLeafId($action, $this->activeChildId);
        $this->advancedTrail = $this->composeTrail();
    }

    public function focusAdvancedChild(string $columnId, string $actionId, string $childId): void
    {
        if ($columnId !== $this->activeColumnId || $actionId !== $this->activeActionId) {
            $this->focusAdvancedAction($columnId, $actionId);
        }
        $column = $this->findColumn($this->activeColumnId);
        $action = $column ? $this->findAction($column, $this->activeActionId) : null;
        if (!$action) {
            return;
        }
        $child = $this->findChild($action, $childId);
        if (!$child) {
            return;
        }
        $this->activeChildId = $childId;
        $this->activeLeafId = $this->resolveFirstLeafId($action, $childId);
        $this->advancedTrail = $this->composeTrail();
    }

    public function focusAdvancedLeaf(string $columnId, string $actionId, string $childId, string $leafId): void
    {
        if ($columnId !== $this->activeColumnId || $actionId !== $this->activeActionId || $childId !== $this->activeChildId) {
            $this->focusAdvancedChild($columnId, $actionId, $childId);
        }
        $column = $this->findColumn($this->activeColumnId);
        $action = $column ? $this->findAction($column, $this->activeActionId) : null;
        $child = $action ? $this->findChild($action, $this->activeChildId ?? '') : null;
        $leaf = $child ? $this->findLeaf($child, $leafId) : null;
        if (!$leaf) {
            return;
        }
        $this->activeLeafId = $leafId;
        $this->advancedTrail = $this->composeTrail();
    }

    public function render(): View
    {
        $column = $this->findColumn($this->activeColumnId);
        $action = $column ? $this->findAction($column, $this->activeActionId) : null;
        $child = $action ? $this->findChild($action, $this->activeChildId ?? '') : null;
        return view('livewire.menu.showcase', [
            'activeColumn' => $column,
            'activeAction' => $action,
            'activeChild' => $child,
            'activeLeafOptions' => $child['children'] ?? [],
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findSimpleAction(string $actionId): ?array
    {
        $candidates = array_merge($this->simplePrimaryActions, $this->simpleSecondaryActions);
        foreach ($candidates as $action) {
            if (($action['id'] ?? null) === $actionId) {
                return $action;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findNestedStack(string $stackId): ?array
    {
        foreach ($this->nestedStacks as $stack) {
            if (($stack['id'] ?? null) === $stackId) {
                return $stack;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $stack
     * @return array<string, mixed>|null
     */
    private function findNestedEntry(array $stack, string $itemId): ?array
    {
        foreach ($stack['items'] ?? [] as $item) {
            if (($item['id'] ?? null) === $itemId) {
                return $item;
            }
        }

        return null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildAdvancedColumns(): array
    {
        return [
            [
                'id' => 'observability',
                'label' => 'Observability',
                'description' => 'Traces, spans, blended metrics.',
                'actions' => [
                    [
                        'id' => 'trace',
                        'label' => 'Trace gatherer',
                        'description' => 'Warm pods + baseline spans.',
                        'children' => [
                            [
                                'id' => 'snapshot',
                                'label' => 'Snapshot run',
                                'description' => 'Focused capture window.',
                                'children' => [
                                    ['id' => '5m', 'label' => '5 minute capture'],
                                    ['id' => '15m', 'label' => '15 minute capture'],
                                    ['id' => 'custom', 'label' => 'Custom duration'],
                                ],
                            ],
                            [
                                'id' => 'mirror',
                                'label' => 'Mirroring lane',
                                'description' => 'Ship to staging twin.',
                                'children' => [
                                    ['id' => 'stage', 'label' => 'Stage sync'],
                                    ['id' => 'drill', 'label' => 'DR drill'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'signals',
                        'label' => 'Signal blender',
                        'description' => 'Merge metrics + logs.',
                        'children' => [
                            [
                                'id' => 'rollup',
                                'label' => 'Rollup plan',
                                'description' => '5-second buckets.',
                                'children' => [
                                    ['id' => 'silver', 'label' => 'Silver profile'],
                                    ['id' => 'gold', 'label' => 'Gold profile'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'deploy',
                'label' => 'Deploy lanes',
                'description' => 'Promotions, rollbacks, canaries.',
                'actions' => [
                    [
                        'id' => 'canary',
                        'label' => 'Canary lanes',
                        'description' => 'Route % of traffic.',
                        'children' => [
                            [
                                'id' => 'edge',
                                'label' => 'Edge mesh',
                                'description' => 'Edge-specific rollout.',
                                'children' => [
                                    ['id' => '5pct', 'label' => '5% traffic'],
                                    ['id' => '25pct', 'label' => '25% traffic'],
                                ],
                            ],
                            [
                                'id' => 'control',
                                'label' => 'Control plane',
                                'description' => 'Coordinated release.',
                                'children' => [
                                    ['id' => 'drift', 'label' => 'Drift monitor'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'rollback',
                        'label' => 'Rollback kit',
                        'description' => 'Rapid revert tools.',
                        'children' => [
                            [
                                'id' => 'restore',
                                'label' => 'Restore snapshot',
                                'description' => 'Volume + schema safety.',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'recovery',
                'label' => 'Recovery playbooks',
                'description' => 'Manual + auto remediation.',
                'actions' => [
                    [
                        'id' => 'contain',
                        'label' => 'Contain blast radius',
                        'description' => 'Traffic shaping + pause.',
                        'children' => [
                            [
                                'id' => 'geo',
                                'label' => 'Geo fences',
                                'description' => 'Regional throttles.',
                                'children' => [
                                    ['id' => 'emea', 'label' => 'EMEA lanes'],
                                    ['id' => 'amer', 'label' => 'Amer lanes'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'handoff',
                        'label' => 'Handoff scripts',
                        'description' => 'Follow-the-sun briefs.',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findColumn(string $id): ?array
    {
        foreach ($this->advancedColumns as $column) {
            if (($column['id'] ?? null) === $id) {
                return $column;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $column
     * @return array<string, mixed>|null
     */
    private function findAction(array $column, string $actionId): ?array
    {
        $actions = $column['actions'] ?? [];
        foreach ($actions as $action) {
            if (($action['id'] ?? null) === $actionId) {
                return $action;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $action
     * @return array<string, mixed>|null
     */
    private function findChild(array $action, string $childId): ?array
    {
        $children = $action['children'] ?? [];
        foreach ($children as $child) {
            if (($child['id'] ?? null) === $childId) {
                return $child;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $child
     * @return array<string, mixed>|null
     */
    private function findLeaf(array $child, string $leafId): ?array
    {
        $leaves = $child['children'] ?? [];
        foreach ($leaves as $leaf) {
            if (($leaf['id'] ?? null) === $leafId) {
                return $leaf;
            }
        }

        return null;
    }

    private function resolveFirstChildId(?array $action): ?string
    {
        if (!$action) {
            return null;
        }

        return $action['children'][0]['id'] ?? null;
    }

    private function resolveFirstLeafId(?array $action, ?string $childId): ?string
    {
        if (!$action || !$childId) {
            return null;
        }
        $child = $this->findChild($action, $childId);
        if (!$child) {
            return null;
        }

        return $child['children'][0]['id'] ?? null;
    }

    /**
     * @param bool $log
     * @return array<int, string>
     */
    private function composeTrail(bool $log = true): array
    {
        $column = $this->findColumn($this->activeColumnId);
        $trail = [];
        if ($column) {
            $trail[] = $column['label'] ?? $this->activeColumnId;
            $action = $this->findAction($column, $this->activeActionId);
            if ($action) {
                $trail[] = $action['label'] ?? $this->activeActionId;
                if ($this->activeChildId) {
                    $child = $this->findChild($action, $this->activeChildId);
                    if ($child) {
                        $trail[] = $child['label'] ?? $this->activeChildId;
                        if ($this->activeLeafId) {
                            $leaf = $this->findLeaf($child, $this->activeLeafId);
                            if ($leaf) {
                                $trail[] = $leaf['label'] ?? $this->activeLeafId;
                            }
                        }
                    }
                }
            }
        }

        if ($trail === []) {
            return $trail;
        }

        if ($log) {
            array_unshift($this->advancedLog, [
                'label' => implode(' › ', $trail),
                'at' => now()->format('H:i') . ' UTC',
            ]);
            $this->advancedLog = array_slice($this->advancedLog, 0, 6);
        }

        return $trail;
    }
}
