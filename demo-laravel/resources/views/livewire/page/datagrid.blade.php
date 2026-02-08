<div class="page-shell">
    <section class="datagrid-page-hero" aria-label="DataGrid overview">
        <div class="datagrid-page-hero__content">
            <p class="datagrid-page-hero__eyebrow">preview</p>
            <h2>DataGrid</h2>
            <p>Headless core + Livewire shell.</p>
            <div class="datagrid-page-hero__chips" aria-label="DataGrid foundation">
                <span class="datagrid-page-hero__chip">@affino/datagrid-core</span>
                <span class="datagrid-page-hero__chip">Client row model</span>
                <span class="datagrid-page-hero__chip">Viewport range</span>
            </div>
        </div>

        <div class="datagrid-page-hero__preview">
            <h3>Livewire host</h3>
            <p class="datagrid-page-hero__hint">Filter, sort, pin columns, and scroll virtual rows.</p>
            <div class="affino-datagrid-demo" data-affino-datagrid-demo data-datagrid-initial-rows="3600">
                <div class="affino-datagrid-demo__controls">
                    <label class="affino-datagrid-demo__control">
                        <span>Search</span>
                        <input type="text" placeholder="service / owner / region" data-datagrid-search>
                    </label>

                    <label class="affino-datagrid-demo__control">
                        <span>Sort</span>
                        <select data-datagrid-sort>
                            <option value="latency-desc">Latency desc</option>
                            <option value="latency-asc">Latency asc</option>
                            <option value="errors-desc">Errors desc</option>
                            <option value="service-asc">Service asc</option>
                        </select>
                    </label>

                    <label class="affino-datagrid-demo__control">
                        <span>Dataset</span>
                        <select data-datagrid-size>
                            <option value="1200">1 200 rows</option>
                            <option value="3600" selected>3 600 rows</option>
                            <option value="7200">7 200 rows</option>
                        </select>
                    </label>

                    <label class="affino-datagrid-demo__toggle">
                        <input type="checkbox" data-datagrid-pin-status>
                        <span>Pin status column</span>
                    </label>

                    <button type="button" class="affino-datagrid-demo__button" data-datagrid-shift>
                        Runtime shift
                    </button>
                </div>

                <dl class="affino-datagrid-demo__meta">
                    <div>
                        <dt>Total</dt>
                        <dd data-datagrid-total>0</dd>
                    </div>
                    <div>
                        <dt>Filtered</dt>
                        <dd data-datagrid-filtered>0</dd>
                    </div>
                    <div>
                        <dt>Window</dt>
                        <dd data-datagrid-window>0-0</dd>
                    </div>
                </dl>

                <div class="affino-datagrid-demo__viewport" data-datagrid-viewport>
                    <div class="affino-datagrid-demo__header" data-datagrid-header></div>
                    <div data-datagrid-spacer-top></div>
                    <div class="affino-datagrid-demo__rows" data-datagrid-rows></div>
                    <div data-datagrid-spacer-bottom></div>
                </div>
            </div>
        </div>
    </section>
</div>

