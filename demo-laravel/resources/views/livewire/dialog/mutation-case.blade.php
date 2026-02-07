@php
    $componentId = $this->getId();
@endphp

<div class="dialogs-case dialogs-mutation">
    <div class="dialogs-mutation__controls">
        <button type="button" class="dialogs-button dialogs-button--primary" wire:click="addRow">
            Add row
        </button>
    </div>

    <div class="dialogs-mutation__list">
        @foreach ($rows as $row)
            @php
                $rowId = (int) $row['id'];
                $dialogId = "dialogs-mutation-{$componentId}-{$rowId}";
            @endphp
            <article class="dialogs-mutation__row" wire:key="dialogs-mutation-row-{{ $rowId }}">
                <div class="dialogs-mutation__meta">
                    <strong>{{ $row['label'] }}</strong>
                    <span>{{ $row['owner'] }}</span>
                </div>

                <div class="dialogs-mutation__actions">
                    <x-affino-dialog
                        :dialog-id="$dialogId"
                        :modal="true"
                        :close-on-backdrop="true"
                        :close-on-escape="true"
                        teleport="body"
                    >
                        <x-slot:trigger>
                            <button type="button" class="dialogs-trigger dialogs-trigger--ghost">
                                Open row modal
                            </button>
                        </x-slot:trigger>

                        <div class="dialogs-surface dialogs-surface--compact">
                            <h4>{{ $row['label'] }}</h4>
                            <label class="dialogs-field">
                                <span>Row draft</span>
                                <input
                                    type="text"
                                    value="{{ $drafts[$rowId] ?? '' }}"
                                    data-affino-livewire-owner="{{ $componentId }}"
                                    data-affino-livewire-model="drafts.{{ $rowId }}"
                                    data-affino-livewire-model-event="input"
                                    data-affino-focus-key="dialogs-mutation-draft-{{ $rowId }}"
                                    placeholder="Type and mutate list"
                                />
                            </label>
                            <div class="dialogs-actions">
                                <button
                                    type="button"
                                    class="dialogs-button dialogs-button--ghost"
                                    data-affino-livewire-owner="{{ $componentId }}"
                                    data-affino-livewire-call="clearDraft"
                                    data-affino-livewire-args='[{{ $rowId }}]'
                                >
                                    Clear text
                                </button>
                                <button type="button" class="dialogs-button dialogs-button--ghost" data-affino-dialog-dismiss="programmatic">
                                    Close
                                </button>
                            </div>
                        </div>
                    </x-affino-dialog>

                    <button type="button" class="dialogs-button dialogs-button--ghost" wire:click="removeRow({{ $rowId }})">
                        Remove row
                    </button>
                </div>
            </article>
        @endforeach
    </div>
</div>
