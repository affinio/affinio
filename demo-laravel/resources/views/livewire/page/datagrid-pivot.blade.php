<div class="page-shell">
    <section class="datagrid-page-hero" aria-label="DataGrid pivot overview">
        <div class="datagrid-page-hero__content">
            <p class="datagrid-page-hero__eyebrow">preview · pivot</p>
            <h2>DataGrid Pivot</h2>
            <p>
                Obvious demo scenario: sales matrix. Pick pivot rows/columns/value aggregation
                and inspect generated pivot columns live.
            </p>
            <div class="datagrid-page-hero__chips" aria-label="Pivot foundations">
                <span class="datagrid-page-hero__chip">@affino/datagrid-core</span>
                <span class="datagrid-page-hero__chip">@affino/datagrid-laravel</span>
                <span class="datagrid-page-hero__chip">Livewire</span>
            </div>
            <a class="treeview-page-hero__link" href="http://127.0.0.1:5173/datagrid/pivot" target="_blank" rel="noreferrer">
                Open Vue mirror
            </a>
        </div>

        <div class="datagrid-page-hero__preview">
            <h3>Pivot route</h3>
            <p class="datagrid-page-hero__hint">
                Configure pivot and verify that the generated columns are deterministic.
            </p>
        </div>
    </section>

    <section class="affino-datagrid-pivot" data-affino-datagrid-pivot-demo data-pivot-initial-rows="480">
        <aside class="affino-datagrid-pivot__sidebar" aria-label="Pivot controls">
            <div class="affino-datagrid-pivot__controls">
                <label class="affino-datagrid-pivot__control">
                    <span>Rows in source</span>
                    <select data-pivot-size>
                        <option value="240">240</option>
                        <option value="480" selected>480</option>
                        <option value="1200">1200</option>
                    </select>
                </label>

                <label class="affino-datagrid-pivot__control">
                    <span>Pivot enabled</span>
                    <select data-pivot-enabled>
                        <option value="on" selected>On</option>
                        <option value="off">Off</option>
                    </select>
                </label>

                <label class="affino-datagrid-pivot__control">
                    <span>Rows axis</span>
                    <select data-pivot-row-field>
                        <option value="region" selected>region</option>
                        <option value="team">team</option>
                        <option value="owner">owner</option>
                        <option value="year">year</option>
                        <option value="quarter">quarter</option>
                        <option value="none">none</option>
                    </select>
                </label>

                <label class="affino-datagrid-pivot__control">
                    <span>Columns axis</span>
                    <select data-pivot-column-field>
                        <option value="year" selected>year</option>
                        <option value="quarter">quarter</option>
                        <option value="region">region</option>
                        <option value="team">team</option>
                        <option value="owner">owner</option>
                        <option value="none">none</option>
                    </select>
                </label>

                <label class="affino-datagrid-pivot__control">
                    <span>Value aggregation</span>
                    <select data-pivot-value-preset>
                        <option value="revenue:sum" selected>revenue:sum</option>
                        <option value="orders:sum">orders:sum</option>
                        <option value="latencyMs:avg">latencyMs:avg</option>
                    </select>
                </label>
            </div>

            <div class="affino-datagrid-pivot__actions">
                <button type="button" class="affino-datagrid-pivot__button" data-pivot-randomize>
                    Randomize values
                </button>
                <button type="button" class="affino-datagrid-pivot__button ghost" data-pivot-reset>
                    Reset preset
                </button>
            </div>

            <dl class="affino-datagrid-pivot__meta">
                <div>
                    <dt>Visible rows</dt>
                    <dd data-pivot-total>0</dd>
                </div>
                <div>
                    <dt>Pivot columns</dt>
                    <dd data-pivot-pivot-columns>0</dd>
                </div>
                <div>
                    <dt>Model</dt>
                    <dd data-pivot-model>disabled</dd>
                </div>
                <div>
                    <dt>Status</dt>
                    <dd data-pivot-status>Ready</dd>
                </div>
            </dl>

            <div class="affino-datagrid-pivot__preview">
                <p>Generated columns</p>
                <ul data-pivot-column-preview>
                    <li>No pivot columns</li>
                </ul>
            </div>
        </aside>

        <div class="affino-datagrid-pivot__stage">
            <div class="affino-datagrid-pivot__viewport">
                <table class="affino-datagrid-pivot__table" aria-label="Pivot grid">
                    <thead data-pivot-header></thead>
                    <tbody data-pivot-body></tbody>
                </table>
            </div>
        </div>
    </section>
</div>

