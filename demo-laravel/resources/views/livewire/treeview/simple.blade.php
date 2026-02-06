@php
    $componentId = method_exists($this, 'getId') ? $this->getId() : 'treeview-simple';
    $treeRootId = "treeview-simple-{$componentId}";
    $branchNodes = ['workspace', 'roadmap', 'qa'];
@endphp

<div class="treeview-playground">
    <div class="treeview-playground__actions">
        <button type="button" class="treeview-button treeview-button--ghost" wire:click="clearSelection">
            Clear selection
        </button>
        <span class="treeview-playground__hint">Keyboard: Arrow keys, Home/End, Enter, Space</span>
    </div>

    <div
        class="treeview-demo"
        data-affino-treeview-root="{{ $treeRootId }}"
        data-affino-treeview-default-expanded="workspace,roadmap"
        data-affino-treeview-default-selected="{{ $selectedNode }}"
        data-affino-treeview-default-active="{{ $selectedNode }}"
        data-affino-treeview-loop="true"
        wire:key="treeview-demo-{{ $componentId }}"
    >
        @foreach ($nodes as $node)
            @php
                $value = $node['value'];
                $isBranch = in_array($value, $branchNodes, true);
            @endphp
            <button
                type="button"
                class="treeview-node"
                data-affino-treeview-item
                data-affino-treeview-value="{{ $value }}"
                @if (!empty($node['parent'])) data-affino-treeview-parent="{{ $node['parent'] }}" @endif
            >
                @if ($isBranch)
                    <span class="treeview-node__toggle" data-affino-treeview-toggle aria-hidden="true"></span>
                @else
                    <span class="treeview-node__toggle treeview-node__toggle--dot" aria-hidden="true"></span>
                @endif
                <span class="treeview-node__label">{{ $node['label'] }}</span>
                <span class="treeview-node__detail">{{ $node['detail'] }}</span>
            </button>
        @endforeach
    </div>

    <p class="treeview-playground__hint">
        Selection and focus are maintained client-side by <code>@affino/treeview-laravel</code>.
    </p>
</div>
