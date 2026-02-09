<div class="page-shell">
    <div class="affino-datagrid-demo" data-affino-datagrid-demo data-datagrid-initial-rows="3600">
        <aside class="affino-datagrid-demo__sidebar" aria-label="DataGrid controls">
            <div class="affino-datagrid-demo__controls">
                <label class="affino-datagrid-demo__control">
                    <span>Rows</span>
                    <select data-datagrid-size>
                        <option value="1200">1 200</option>
                        <option value="3600" selected>3 600</option>
                        <option value="7200">7 200</option>
                    </select>
                </label>

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
                        <option value="availability-desc">Availability desc</option>
                    </select>
                </label>

                <label class="affino-datagrid-demo__control">
                    <span>Group by</span>
                    <select data-datagrid-group>
                        <option value="none" selected>None</option>
                        <option value="service">Service</option>
                        <option value="owner">Owner</option>
                        <option value="region">Region</option>
                        <option value="environment">Environment</option>
                        <option value="severity">Severity</option>
                        <option value="status">Status</option>
                    </select>
                </label>

                <label class="affino-datagrid-demo__control">
                    <span>Column visibility</span>
                    <select data-datagrid-visibility>
                        <option value="all" selected>All columns</option>
                        <option value="incident-core">Incident core</option>
                        <option value="reliability-ops">Reliability ops</option>
                    </select>
                </label>

                <label class="affino-datagrid-demo__control">
                    <span>Advanced filter</span>
                    <select data-datagrid-advanced-filter>
                        <option value="none" selected>None</option>
                        <option value="risk-hotspots">Risk hotspots</option>
                        <option value="production-critical">Production critical</option>
                    </select>
                </label>

                <label class="affino-datagrid-demo__toggle">
                    <input type="checkbox" data-datagrid-pin-status>
                    <span>Pin status column</span>
                </label>

                <div class="affino-datagrid-demo__actions">
                    <button type="button" class="affino-datagrid-demo__button" data-datagrid-shift>Runtime shift</button>
                    <button type="button" class="affino-datagrid-demo__button ghost" data-datagrid-undo>Undo</button>
                    <button type="button" class="affino-datagrid-demo__button ghost" data-datagrid-redo>Redo</button>
                    <button type="button" class="affino-datagrid-demo__button ghost" data-datagrid-reset>Reset</button>
                    <button type="button" class="affino-datagrid-demo__button ghost" data-datagrid-clear-filter>Clear filter</button>
                </div>
                <p class="affino-datagrid-demo__filter-indicator" data-datagrid-filter-indicator>Quick filter: all rows</p>
                <p class="affino-datagrid-demo__status" data-datagrid-status>Ready</p>
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
                <div>
                    <dt>Cells selected</dt>
                    <dd data-datagrid-selected>0</dd>
                </div>
                <div>
                    <dt>Selection anchor</dt>
                    <dd data-datagrid-anchor>None</dd>
                </div>
                <div>
                    <dt>Active cell</dt>
                    <dd data-datagrid-active-cell>None</dd>
                </div>
                <div>
                    <dt>Group by</dt>
                    <dd data-datagrid-grouped>None</dd>
                </div>
                <div>
                    <dt>Advanced filter</dt>
                    <dd data-datagrid-advanced-filter-summary>None</dd>
                </div>
                <div>
                    <dt>Visible columns window</dt>
                    <dd data-datagrid-visible-columns-window>0-0 / 0</dd>
                </div>
                <div>
                    <dt>Selected latency Σ</dt>
                    <dd data-datagrid-selected-latency-sum>—</dd>
                </div>
                <div>
                    <dt>Selected latency avg</dt>
                    <dd data-datagrid-selected-latency-avg>—</dd>
                </div>
                <div>
                    <dt>Selected owners</dt>
                    <dd data-datagrid-selected-owners>0</dd>
                </div>
            </dl>
        </aside>

        <div class="affino-datagrid-demo__stage">
            <div class="affino-datagrid-demo__header-viewport" data-datagrid-header-viewport aria-hidden="true">
                <div class="affino-datagrid-demo__header" data-datagrid-header></div>
            </div>
            <div class="affino-datagrid-demo__viewport" data-datagrid-viewport tabindex="0">
                <div class="affino-datagrid-demo__overlay-layer" data-datagrid-overlay-layer aria-hidden="true">
                    <div class="affino-datagrid-demo__selection-overlay" data-datagrid-selection-overlay hidden></div>
                    <div class="affino-datagrid-demo__selection-overlay affino-datagrid-demo__selection-overlay--fill" data-datagrid-fill-overlay hidden></div>
                </div>
                <div data-datagrid-spacer-top></div>
                <div class="affino-datagrid-demo__rows" data-datagrid-rows></div>
                <div data-datagrid-spacer-bottom></div>
            </div>
            <div class="affino-datagrid-demo__menu" data-datagrid-context-menu role="menu" hidden>
                <button type="button" role="menuitem" data-datagrid-menu-action="copy">Copy</button>
                <button type="button" role="menuitem" data-datagrid-menu-action="cut">Cut</button>
                <button type="button" role="menuitem" data-datagrid-menu-action="paste">Paste</button>
                <button type="button" role="menuitem" data-datagrid-menu-action="clear">Clear</button>
            </div>
        </div>
    </div>
</div>
