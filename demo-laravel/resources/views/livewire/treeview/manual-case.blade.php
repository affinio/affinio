<div class="treeview-manual">
    <div class="treeview-manual__actions">
        <button type="button" class="treeview-button" wire:click="selectBacklog">Select backlog</button>
        <button type="button" class="treeview-button treeview-button--ghost" wire:click="focusIncidents">Focus incidents</button>
        <button type="button" class="treeview-button treeview-button--ghost" wire:click="expandQuality">Expand quality</button>
        <button type="button" class="treeview-button treeview-button--ghost" wire:click="collapseQuality">Collapse quality</button>
        <button type="button" class="treeview-button treeview-button--ghost" wire:click="clearTreeSelection">Clear</button>
    </div>

    <div
        class="treeview-manual__root"
        data-affino-treeview-root="{{ $treeRootId }}"
        data-affino-treeview-default-expanded="workspace,roadmap"
        data-affino-treeview-default-selected="backlog"
        data-affino-treeview-default-active="backlog"
        wire:key="treeview-manual-root-{{ $treeRootId }}"
    >
        <button type="button" class="treeview-node" data-affino-treeview-item data-affino-treeview-value="workspace">
            <span class="treeview-node__toggle" data-affino-treeview-toggle aria-hidden="true"></span>
            <span class="treeview-node__label">Workspace</span>
            <span class="treeview-node__detail">Primary workspace root</span>
        </button>
        <button type="button" class="treeview-node" data-affino-treeview-item data-affino-treeview-value="roadmap" data-affino-treeview-parent="workspace">
            <span class="treeview-node__toggle" data-affino-treeview-toggle aria-hidden="true"></span>
            <span class="treeview-node__label">Roadmap</span>
            <span class="treeview-node__detail">Quarter planning lanes</span>
        </button>
        <button type="button" class="treeview-node" data-affino-treeview-item data-affino-treeview-value="backlog" data-affino-treeview-parent="roadmap">
            <span class="treeview-node__toggle treeview-node__toggle--dot" aria-hidden="true"></span>
            <span class="treeview-node__label">Backlog</span>
            <span class="treeview-node__detail">Candidate stories and spikes</span>
        </button>
        <button type="button" class="treeview-node" data-affino-treeview-item data-affino-treeview-value="qa" data-affino-treeview-parent="workspace">
            <span class="treeview-node__toggle" data-affino-treeview-toggle aria-hidden="true"></span>
            <span class="treeview-node__label">Quality</span>
            <span class="treeview-node__detail">Validation and release gates</span>
        </button>
        <button type="button" class="treeview-node" data-affino-treeview-item data-affino-treeview-value="incidents" data-affino-treeview-parent="qa">
            <span class="treeview-node__toggle treeview-node__toggle--dot" aria-hidden="true"></span>
            <span class="treeview-node__label">Incidents</span>
            <span class="treeview-node__detail">Live triage and timelines</span>
        </button>
    </div>

    <p class="treeview-manual__note">
        Livewire dispatches <code>affino-treeview:manual</code> and the adapter executes focus/selection/expand actions against a stable root id.
    </p>
</div>
