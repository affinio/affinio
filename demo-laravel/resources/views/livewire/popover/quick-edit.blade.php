@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'popover-quick-edit';
@endphp

<div class="popover-quick-edit">
    <div class="popover-quick-edit__list">
        @foreach ($services as $service)
            <div class="popover-quick-edit__row" wire:key="popover-service-{{ $service['id'] }}">
                <div class="popover-quick-edit__meta">
                    <strong>{{ $service['name'] }}</strong>
                    <span>{{ $service['owner'] }} · {{ $service['status'] }}</span>
                </div>

                <x-affino-popover
                    class="popover-demo"
                    :popover-id="'quick-edit-'.$service['id']"
                    placement="left"
                    align="start"
                    :gutter="12"
                    data-affino-popover-state-sync="false"
                >
                    <x-slot:trigger>
                        <button type="button" class="popover-trigger">
                            Edit
                        </button>
                    </x-slot:trigger>

                    <div class="popover-surface popover-surface--form">
                        <label class="popover-field">
                            <span>Owner</span>
                            <input type="text" wire:model.live="drafts.{{ $service['id'] }}.owner" data-affino-focus-key="quick-edit-owner-{{ $service['id'] }}" />
                        </label>
                        <label class="popover-field">
                            <span>Status</span>
                            <x-affino-listbox
                                class="popover-field__listbox"
                                :listbox-id="'quick-edit-status-'.$service['id']"
                                placeholder="Select status"
                                mode="single"
                                :model="'drafts.' . $service['id'] . '.status'"
                                :data-affino-livewire-owner="$componentId"
                                :selected="$drafts[$service['id']]['status'] ?? $service['status']"
                                :display="$drafts[$service['id']]['status'] ?? $service['status']"
                            >
                                <x-affino-listbox-option value="Monitoring" :selected="($drafts[$service['id']]['status'] ?? $service['status']) === 'Monitoring'">Monitoring</x-affino-listbox-option>
                                <x-affino-listbox-option value="Scaling" :selected="($drafts[$service['id']]['status'] ?? $service['status']) === 'Scaling'">Scaling</x-affino-listbox-option>
                                <x-affino-listbox-option value="Paused" :selected="($drafts[$service['id']]['status'] ?? $service['status']) === 'Paused'">Paused</x-affino-listbox-option>
                            </x-affino-listbox>
                        </label>
                        <span class="popover-surface__live">Draft: {{ $drafts[$service['id']]['owner'] ?? $service['owner'] }} · {{ $drafts[$service['id']]['status'] ?? $service['status'] }}</span>
                        <div class="popover-actions">
                            <button
                                type="button"
                                class="popover-action popover-action--primary"
                                data-affino-livewire-owner="{{ $componentId }}"
                                data-affino-livewire-call="apply"
                                data-affino-livewire-args='[{{ (int) $service['id'] }}]'
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                class="popover-action"
                                data-affino-livewire-owner="{{ $componentId }}"
                                data-affino-livewire-call="resetDraft"
                                data-affino-livewire-args='[{{ (int) $service['id'] }}]'
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </x-affino-popover>
            </div>
        @endforeach
    </div>
</div>
