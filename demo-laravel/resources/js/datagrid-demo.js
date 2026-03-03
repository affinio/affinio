import {
    buildDataGridColumnLayers,
    createDataGridRuntime,
    resolveDataGridLayerTrackTemplate,
    useDataGridColumnLayoutOrchestration,
    useDataGridManagedWheelScroll,
    resolveDataGridHeaderScrollSyncLeft,
} from "@affino/datagrid-laravel";
import {
    countCellsInRange,
    createInteractionHistoryStore,
    isCellInRange,
    normalizeSelectionRange,
    rangeEquals,
    resolveSelectionTransition,
} from "../../../demo-shared/datagridInteractionEngine.js";

const ROW_HEIGHT = 36;
const OVERSCAN_ROWS = 8;
const DEFAULT_SIZE = 3600;
const MAX_HISTORY_DEPTH = 200;
const MENU_ACTION_IDS = ["copy", "cut", "paste", "clear"];
const FILL_AUTOSCROLL_EDGE_PX = 44;
const FILL_AUTOSCROLL_MAX_STEP_PX = 26;

const EDITABLE_COLUMNS = new Set([
    "owner",
    "region",
    "environment",
    "deployment",
    "severity",
    "latencyMs",
    "errorRate",
    "availabilityPct",
    "throughputRps",
    "updatedAt",
    "status",
]);

const NUMERIC_COLUMNS = new Set(["latencyMs", "errorRate", "availabilityPct", "throughputRps"]);
const DECIMAL_COLUMNS = new Set(["availabilityPct"]);
const COLUMN_VISIBILITY_PRESETS = {
    all: [
        "service",
        "owner",
        "region",
        "environment",
        "deployment",
        "severity",
        "latencyMs",
        "errorRate",
        "availabilityPct",
        "throughputRps",
        "updatedAt",
        "status",
    ],
    "incident-core": [
        "service",
        "owner",
        "region",
        "environment",
        "deployment",
        "severity",
        "latencyMs",
        "errorRate",
        "availabilityPct",
        "status",
    ],
    "reliability-ops": [
        "service",
        "owner",
        "region",
        "environment",
        "latencyMs",
        "errorRate",
        "availabilityPct",
        "throughputRps",
        "updatedAt",
        "status",
    ],
};
const ADVANCED_FILTER_PRESETS = {
    none: null,
    "risk-hotspots": {
        kind: "group",
        operator: "and",
        children: [
            {
                kind: "condition",
                key: "severity",
                type: "text",
                operator: "in",
                value: ["critical", "high"],
            },
            {
                kind: "group",
                operator: "or",
                children: [
                    {
                        kind: "condition",
                        key: "latencyMs",
                        type: "number",
                        operator: "gte",
                        value: 340,
                    },
                    {
                        kind: "condition",
                        key: "errorRate",
                        type: "number",
                        operator: "gte",
                        value: 8,
                    },
                ],
            },
        ],
    },
    "production-critical": {
        kind: "group",
        operator: "and",
        children: [
            {
                kind: "condition",
                key: "environment",
                type: "text",
                operator: "equals",
                value: "prod",
            },
            {
                kind: "condition",
                key: "status",
                type: "text",
                operator: "in",
                value: ["degraded", "watch"],
            },
            {
                kind: "condition",
                key: "availabilityPct",
                type: "number",
                operator: "lte",
                value: 99.75,
            },
        ],
    },
};

const GROUP_AGGREGATION_MODEL = Object.freeze({
    basis: "filtered",
    columns: [
        { key: "rows", field: "rowId", op: "count" },
        { key: "latencySum", field: "latencyMs", op: "sum" },
        { key: "latencyAvg", field: "latencyMs", op: "avg" },
        { key: "errorAvg", field: "errorRate", op: "avg" },
    ],
});

function resolveColumnPin(column) {
    const directPin = column?.pin;
    if (directPin === "left" || directPin === "right") {
        return directPin;
    }
    const nestedPin = column?.column?.pin;
    if (nestedPin === "left" || nestedPin === "right") {
        return nestedPin;
    }
    return "none";
}

const teardownByRoot = new WeakMap();

export function bootstrapAffinoDatagridDemos(root = document) {
    if (!(root instanceof Document || root instanceof DocumentFragment || root instanceof HTMLElement)) {
        return;
    }

    const roots = [];
    if (root instanceof HTMLElement && root.matches("[data-affino-datagrid-demo]")) {
        roots.push(root);
    }
    root.querySelectorAll?.("[data-affino-datagrid-demo]").forEach((element) => roots.push(element));

    roots.forEach((element) => {
        if (!(element instanceof HTMLElement)) {
            return;
        }
        const previousTeardown = teardownByRoot.get(element);
        if (typeof previousTeardown === "function") {
            previousTeardown();
            teardownByRoot.delete(element);
        }

        try {
            const teardown = mountDatagridDemo(element);
            if (typeof teardown === "function") {
                teardownByRoot.set(element, teardown);
            }
        } catch (error) {
            console.error("[Affino][DataGridDemo] mount failed", error);
        }
    });
}

function mountDatagridDemo(root) {
    const stage = root.querySelector(".affino-datagrid-demo__stage");
    const headerViewport = root.querySelector("[data-datagrid-header-viewport]");
    const viewport = root.querySelector("[data-datagrid-viewport]");
    const header = root.querySelector("[data-datagrid-header]");
    const rowsHost = root.querySelector("[data-datagrid-rows]");
    const spacerTop = root.querySelector("[data-datagrid-spacer-top]");
    const spacerBottom = root.querySelector("[data-datagrid-spacer-bottom]");
    const overlayLayer = root.querySelector("[data-datagrid-overlay-layer]");
    const selectionOverlay = root.querySelector("[data-datagrid-selection-overlay]");
    const fillOverlay = root.querySelector("[data-datagrid-fill-overlay]");

    const searchInput = root.querySelector("[data-datagrid-search]");
    const sortSelect = root.querySelector("[data-datagrid-sort]");
    const sizeSelect = root.querySelector("[data-datagrid-size]");
    const groupSelect = root.querySelector("[data-datagrid-group]");
    const visibilitySelect = root.querySelector("[data-datagrid-visibility]");
    const advancedFilterSelect = root.querySelector("[data-datagrid-advanced-filter]");
    const pinStatusToggle = root.querySelector("[data-datagrid-pin-status]");
    const autoReapplyToggle = root.querySelector("[data-datagrid-auto-reapply]");
    const reapplyButton = root.querySelector("[data-datagrid-reapply]");
    const shiftButton = root.querySelector("[data-datagrid-shift]");
    const undoButton = root.querySelector("[data-datagrid-undo]");
    const redoButton = root.querySelector("[data-datagrid-redo]");
    const resetButton = root.querySelector("[data-datagrid-reset]");
    const clearFilterButton = root.querySelector("[data-datagrid-clear-filter]");

    const contextMenu = root.querySelector("[data-datagrid-context-menu]");
    const contextMenuButtons = MENU_ACTION_IDS
        .map((actionId) => contextMenu?.querySelector(`[data-datagrid-menu-action="${actionId}"]`))
        .filter((node) => node instanceof HTMLButtonElement);

    const totalNode = root.querySelector("[data-datagrid-total]");
    const filteredNode = root.querySelector("[data-datagrid-filtered]");
    const windowNode = root.querySelector("[data-datagrid-window]");
    const selectedNode = root.querySelector("[data-datagrid-selected]");
    const anchorNode = root.querySelector("[data-datagrid-anchor]");
    const activeCellNode = root.querySelector("[data-datagrid-active-cell]");
    const groupedNode = root.querySelector("[data-datagrid-grouped]");
    const projectionStaleNode = root.querySelector("[data-datagrid-projection-stale]");
    const projectionCycleNode = root.querySelector("[data-datagrid-projection-cycle]");
    const projectionRecomputeNode = root.querySelector("[data-datagrid-projection-recompute]");
    const advancedFilterNode = root.querySelector("[data-datagrid-advanced-filter-summary]");
    const visibleColumnsWindowNode = root.querySelector("[data-datagrid-visible-columns-window]");
    const selectedLatencySumNode = root.querySelector("[data-datagrid-selected-latency-sum]");
    const selectedLatencyAvgNode = root.querySelector("[data-datagrid-selected-latency-avg]");
    const selectedOwnersNode = root.querySelector("[data-datagrid-selected-owners]");
    const statusNode = root.querySelector("[data-datagrid-status]");
    const filterIndicatorNode = root.querySelector("[data-datagrid-filter-indicator]");

    if (!stage || !headerViewport || !viewport || !header || !rowsHost || !spacerTop || !spacerBottom || !overlayLayer) {
        return null;
    }

    const initialSize = readPositiveNumber(root.dataset.datagridInitialRows, DEFAULT_SIZE);
    let sourceRows = buildRows(initialSize, 1);
    let query = "";
    let sortMode = "latency-desc";
    let groupMode = "none";
    let visibilityMode = "all";
    let advancedFilterMode = "none";
    let generation = 1;

    let selectedRowKey = null;
    let activeCell = null;
    let selectionAnchor = null;
    let selectionRange = null;
    let editingCell = null;
    let activeCellLabel = "None";
    let statusMessage = "Ready";
    let clipboardState = null;
    let fillDragSession = null;
    let fillPreviewRange = null;
    let fillPointerClient = null;
    let fillAutoScrollFrame = null;

    const historyStore = createInteractionHistoryStore({
        maxDepth: MAX_HISTORY_DEPTH,
    });

    const menuState = {
        open: false,
        activeIndex: 0,
    };

    visibilityMode = String(visibilitySelect?.value || visibilityMode);
    advancedFilterMode = String(advancedFilterSelect?.value || advancedFilterMode);

    const runtime = createDataGridRuntime({
        rows: sourceRows,
        columns: [
            { key: "service", label: "Service", width: 240, pin: "left" },
            { key: "owner", label: "Owner", width: 160 },
            { key: "region", label: "Region", width: 130 },
            { key: "environment", label: "Env", width: 120 },
            { key: "deployment", label: "Deploy", width: 170 },
            { key: "severity", label: "Severity", width: 120 },
            { key: "latencyMs", label: "Latency (ms)", width: 130 },
            { key: "errorRate", label: "Errors / h", width: 130 },
            { key: "availabilityPct", label: "Availability", width: 150 },
            { key: "throughputRps", label: "Throughput", width: 140 },
            { key: "updatedAt", label: "Updated", width: 170 },
            { key: "status", label: "Status", width: 130 },
        ],
    });
    const { api, core } = runtime;
    void api.start();
    if (autoReapplyToggle instanceof HTMLInputElement) {
        autoReapplyToggle.checked = api.rows.getAutoReapply();
    }

    let frameHandle = null;
    let suppressedScrollEvents = 0;
    let lastScrollTop = viewport.scrollTop;
    let lastScrollLeft = viewport.scrollLeft;
    let projectionDiagnostics = api.rows.getSnapshot().projection ?? null;
    let headerRenderSignature = "";
    let rowsRenderSignature = "";
    let selectionSummaryCacheKey = "";
    let selectionSummaryCache = {
        latencySum: null,
        latencyAvg: null,
        ownerDistinct: 0,
    };
    let sourceRowsLookup = new Map();
    let sourceRowsLookupDirty = true;
    let projectedRowsCache = [];
    let projectedLeafCountCache = 0;
    let projectedLeafIndexByRowKey = new Map();
    let projectedRowsCacheVersion = null;
    let pointerLayoutCache = {
        columns: [],
        metrics: [],
        leftWidth: 0,
        scrollWidth: 0,
        rightWidth: 0,
    };
    const unsubscribeProjectionDiagnostics = api.events.on("rows:changed", ({ snapshot }) => {
        projectionDiagnostics = snapshot.projection ?? null;
    });

    const markSourceRowsLookupDirty = () => {
        sourceRowsLookupDirty = true;
    };

    const ensureSourceRowsLookup = () => {
        if (!sourceRowsLookupDirty) {
            return;
        }
        sourceRowsLookup = new Map();
        sourceRows.forEach((row) => {
            sourceRowsLookup.set(String(row.rowId), row);
        });
        sourceRowsLookupDirty = false;
    };

    const replaceSourceRows = (nextRows) => {
        sourceRows = nextRows;
        markSourceRowsLookupDirty();
    };

    const resolveProjectedRowsCacheVersion = () => {
        const snapshot = api.rows.getSnapshot();
        if (Number.isFinite(snapshot?.revision)) {
            return `r:${snapshot.revision}`;
        }
        if (Number.isFinite(snapshot?.projection?.cycleVersion)) {
            return `c:${snapshot.projection.cycleVersion}`;
        }
        if (Number.isFinite(snapshot?.projection?.version)) {
            return `p:${snapshot.projection.version}`;
        }
        return null;
    };

    const refreshProjectedRowsCache = () => {
        const nextVersion = resolveProjectedRowsCacheVersion();
        if (nextVersion !== null && nextVersion === projectedRowsCacheVersion) {
            return;
        }
        const count = api.rows.getCount();
        const rows = count > 0 ? api.rows.getRange({ start: 0, end: count - 1 }) : [];
        const nextLeafIndex = new Map();
        let leafCount = 0;
        rows.forEach((rowNode, displayIndex) => {
            if (!rowNode || rowNode.kind !== "leaf") {
                return;
            }
            leafCount += 1;
            nextLeafIndex.set(String(rowNode.rowId), displayIndex);
        });
        projectedRowsCache = rows;
        projectedLeafCountCache = leafCount;
        projectedLeafIndexByRowKey = nextLeafIndex;
        projectedRowsCacheVersion = nextVersion;
    };

    const resolveProjectedRows = () => {
        refreshProjectedRowsCache();
        return projectedRowsCache;
    };

    const resolveProjectedLeafCount = () => {
        refreshProjectedRowsCache();
        return projectedLeafCountCache;
    };

    const hasProjectedLeafRowKey = (rowKey) => {
        if (!rowKey) {
            return false;
        }
        refreshProjectedRowsCache();
        return projectedLeafIndexByRowKey.has(String(rowKey));
    };

    const resolveProjectedLeafRowIndexByKey = (rowKey) => {
        if (!rowKey) {
            return -1;
        }
        refreshProjectedRowsCache();
        const index = projectedLeafIndexByRowKey.get(String(rowKey));
        return Number.isFinite(index) ? index : -1;
    };

    const resolveLeafRowNodeAtDisplayIndex = (rowIndex, projectedRows = resolveProjectedRows()) => {
        if (!Number.isFinite(rowIndex) || rowIndex < 0 || rowIndex >= projectedRows.length) {
            return null;
        }
        const rowNode = projectedRows[rowIndex];
        if (!rowNode || rowNode.kind !== "leaf") {
            return null;
        }
        return rowNode;
    };

    const resolveSelectionRangeKey = (range) => {
        if (!range) {
            return "none";
        }
        return [
            range.startRowIndex,
            range.endRowIndex,
            range.startColumnIndex,
            range.endColumnIndex,
        ].join(":");
    };

    const resolveSelectionSummaryCacheKey = (range, columns, rowRevision) => {
        const columnsKey = columns.map((column) => String(column.key)).join("|");
        return `${rowRevision}|${resolveSelectionRangeKey(range)}|${columnsKey}`;
    };

    const debugAutoScroll =
        root.dataset.datagridDebugAutoscroll === "true" ||
        (typeof window !== "undefined" && window.__AFFINO_DATAGRID_DEBUG_AUTOSCROLL === true);

    const logAutoScroll = (...args) => {
        if (!debugAutoScroll) {
            return;
        }
        console.debug("[Affino][DataGridDemo][AutoScroll]", ...args);
    };

    const resolveColumnWidth = (column) => Math.max(110, column.width ?? 160);

    const buildColumnVirtualWindow = ({ rowStart, rowEnd, rowTotal, colTotal }) => {
        const safeRowTotal = Math.max(0, Math.trunc(Number(rowTotal) || 0));
        const safeColTotal = Math.max(0, Math.trunc(Number(colTotal) || 0));
        const maxRowIndex = Math.max(0, safeRowTotal - 1);
        const maxColIndex = Math.max(0, safeColTotal - 1);
        return {
            rowStart: safeRowTotal > 0 ? clamp(rowStart, 0, maxRowIndex) : 0,
            rowEnd: safeRowTotal > 0 ? clamp(rowEnd, 0, maxRowIndex) : 0,
            rowTotal: safeRowTotal,
            colStart: 0,
            colEnd: safeColTotal > 0 ? maxColIndex : 0,
            colTotal: safeColTotal,
            overscan: {
                top: OVERSCAN_ROWS,
                bottom: OVERSCAN_ROWS,
                left: 0,
                right: 0,
            },
        };
    };

    const setStatus = (message) => {
        statusMessage = message;
        requestRender();
    };

    const requestRender = () => {
        if (frameHandle !== null) {
            return;
        }
        frameHandle = window.requestAnimationFrame(() => {
            frameHandle = null;
            render();
        });
    };

    const syncHeaderScroll = () => {
        if (!(headerViewport instanceof HTMLElement)) {
            return;
        }
        const nextScrollLeft = resolveDataGridHeaderScrollSyncLeft(
            headerViewport.scrollLeft,
            viewport.scrollLeft,
        );
        if (headerViewport.scrollLeft !== nextScrollLeft) {
            headerViewport.scrollLeft = nextScrollLeft;
        }
    };

    const setViewportScroll = (nextTop, nextLeft, reason = "programmatic") => {
        const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const resolvedTop = clamp(Number(nextTop) || 0, 0, maxTop);
        const resolvedLeft = clamp(Number(nextLeft) || 0, 0, maxLeft);
        const changed = resolvedTop !== viewport.scrollTop || resolvedLeft !== viewport.scrollLeft;
        if (!changed) {
            return false;
        }

        suppressedScrollEvents = Math.max(suppressedScrollEvents, 2);
        viewport.scrollTop = resolvedTop;
        viewport.scrollLeft = resolvedLeft;
        syncHeaderScroll();
        lastScrollTop = resolvedTop;
        lastScrollLeft = resolvedLeft;

        logAutoScroll("setViewportScroll", {
            reason,
            top: resolvedTop,
            left: resolvedLeft,
        });
        return true;
    };

    const managedWheelScroll = useDataGridManagedWheelScroll({
        resolveWheelMode: () => "managed",
        resolveWheelAxisLockMode: () => "dominant",
        resolvePreventDefaultWhenHandled: () => true,
        resolveBodyViewport() {
            return viewport;
        },
        resolveMainViewport() {
            return {
                scrollLeft: viewport.scrollLeft,
                scrollWidth: viewport.scrollWidth,
                clientWidth: viewport.clientWidth,
            };
        },
        setHandledScrollTop(value) {
            setViewportScroll(value, viewport.scrollLeft, "wheel-y");
        },
        setHandledScrollLeft(value) {
            setViewportScroll(viewport.scrollTop, value, "wheel-x");
        },
        onWheelConsumed() {
            closeContextMenu();
            requestRender();
        },
    });

    const onViewportWheel = (event) => {
        managedWheelScroll.onBodyViewportWheel(event);
    };

    const clearHistory = () => {
        historyStore.clear();
        updateActionButtons();
    };

    const clearSelectionState = () => {
        selectedRowKey = null;
        activeCell = null;
        selectionAnchor = null;
        selectionRange = null;
        activeCellLabel = "None";
    };

    const resetInteractionState = () => {
        clearSelectionState();
        editingCell = null;
        fillPreviewRange = null;
    };

    const updateActionButtons = () => {
        if (undoButton) {
            undoButton.disabled = !historyStore.canUndo();
        }
        if (redoButton) {
            redoButton.disabled = !historyStore.canRedo();
        }
    };

    const isEditableColumn = (columnKey) => EDITABLE_COLUMNS.has(String(columnKey));

    const getSourceRowByKey = (rowKey) => {
        if (!rowKey) {
            return null;
        }
        ensureSourceRowsLookup();
        return sourceRowsLookup.get(String(rowKey)) ?? null;
    };

    const getActiveRow = () => {
        if (!activeCell?.rowKey) {
            return null;
        }
        return getSourceRowByKey(activeCell.rowKey);
    };

    const readCellValue = (rowKey, columnKey) => {
        const row = getSourceRowByKey(rowKey);
        if (!row) {
            return undefined;
        }
        return row[columnKey];
    };

    const writeCellValue = (rowKey, columnKey, nextValue) => {
        replaceSourceRows(sourceRows.map((row) => {
            if (String(row.rowId) !== String(rowKey)) {
                return row;
            }
            return {
                ...row,
                [columnKey]: nextValue,
            };
        }));
    };

    const coerceValue = (columnKey, value) => {
        const key = String(columnKey);
        if (value == null) {
            return "";
        }
        const raw = String(value).trim();
        if (raw.length === 0) {
            return "";
        }
        if (NUMERIC_COLUMNS.has(key)) {
            const numeric = Number(raw);
            if (!Number.isFinite(numeric)) {
                return "";
            }
            if (DECIMAL_COLUMNS.has(key)) {
                return Number(numeric.toFixed(2));
            }
            return Math.round(numeric);
        }
        return raw;
    };

    const resolveActiveRowIndex = (rowKey) => {
        return resolveProjectedLeafRowIndexByKey(rowKey);
    };

    const getColumnSnapshot = () => api.columns?.getSnapshot?.() ?? { visibleColumns: [], allColumns: [] };

    const resolveVisibleColumns = () => orderColumns(getColumnSnapshot().visibleColumns ?? []);

    const resolveVisibilityPresetColumns = (mode = visibilityMode) => {
        const preset = COLUMN_VISIBILITY_PRESETS[mode];
        if (Array.isArray(preset) && preset.length > 0) {
            return preset;
        }
        return COLUMN_VISIBILITY_PRESETS.all;
    };

    const applyColumnVisibilityPreset = () => {
        const visibleSet = new Set(resolveVisibilityPresetColumns(visibilityMode));
        const snapshot = getColumnSnapshot();
        (snapshot.allColumns ?? []).forEach((column) => {
            const shouldBeVisible = visibleSet.has(column.key);
            api.columns.setVisibility(column.key, shouldBeVisible);
        });
    };

    const resolveAdvancedFilterExpression = () => {
        const expression = ADVANCED_FILTER_PRESETS[advancedFilterMode];
        return expression ?? null;
    };

    const resolveQuickFilterExpression = () => {
        const normalizedQuery = String(query ?? "").trim().toLowerCase();
        if (normalizedQuery.length === 0) {
            return null;
        }
        return {
            kind: "group",
            operator: "or",
            children: [
                { kind: "condition", key: "service", type: "text", operator: "contains", value: normalizedQuery },
                { kind: "condition", key: "owner", type: "text", operator: "contains", value: normalizedQuery },
                { kind: "condition", key: "region", type: "text", operator: "contains", value: normalizedQuery },
                { kind: "condition", key: "environment", type: "text", operator: "contains", value: normalizedQuery },
                { kind: "condition", key: "severity", type: "text", operator: "contains", value: normalizedQuery },
                { kind: "condition", key: "status", type: "text", operator: "contains", value: normalizedQuery },
            ],
        };
    };

    const resolveFilterModel = () => {
        const quickFilterExpression = resolveQuickFilterExpression();
        const advancedExpression = resolveAdvancedFilterExpression();
        if (!quickFilterExpression && !advancedExpression) {
            return null;
        }
        if (quickFilterExpression && advancedExpression) {
            return {
                columnFilters: {},
                advancedFilters: {},
                advancedExpression: {
                    kind: "group",
                    operator: "and",
                    children: [quickFilterExpression, advancedExpression],
                },
            };
        }
        return {
            columnFilters: {},
            advancedFilters: {},
            advancedExpression: quickFilterExpression ?? advancedExpression ?? null,
        };
    };

    const resolveSortModel = () => {
        switch (sortMode) {
            case "latency-asc":
                return [{ key: "latencyMs", direction: "asc" }];
            case "errors-desc":
                return [{ key: "errorRate", direction: "desc" }];
            case "service-asc":
                return [{ key: "service", direction: "asc" }];
            case "availability-desc":
                return [{ key: "availabilityPct", direction: "desc" }];
            case "latency-desc":
            default:
                return [{ key: "latencyMs", direction: "desc" }];
        }
    };

    const formatGroupAggregateNumber = (value, fractionDigits = 0) => {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return null;
        }
        if (fractionDigits > 0) {
            return value.toFixed(fractionDigits);
        }
        return String(Math.round(value));
    };

    const resolveGroupAggregateSummary = (aggregates) => {
        if (!aggregates || typeof aggregates !== "object") {
            return "";
        }
        const parts = [];
        const rows = formatGroupAggregateNumber(aggregates.rows, 0);
        if (rows) {
            parts.push(`rows ${rows}`);
        }
        const latencySum = formatGroupAggregateNumber(aggregates.latencySum, 0);
        if (latencySum) {
            parts.push(`lat Σ ${latencySum}`);
        }
        const latencyAvg = formatGroupAggregateNumber(aggregates.latencyAvg, 1);
        if (latencyAvg) {
            parts.push(`lat μ ${latencyAvg}`);
        }
        const errorAvg = formatGroupAggregateNumber(aggregates.errorAvg, 1);
        if (errorAvg) {
            parts.push(`err μ ${errorAvg}`);
        }
        return parts.join(" · ");
    };

    const resolveColumnIndex = (columnKey, columns = resolveVisibleColumns()) =>
        columns.findIndex((column) => column.key === String(columnKey));

    const setSelectionFromActive = (extendSelection = false) => {
        const transition = resolveSelectionTransition({
            activeCell,
            selectionAnchor,
            extendSelection,
        });
        selectionAnchor = transition.selectionAnchor;
        selectionRange = transition.selectionRange;
    };

    const updateActiveCell = (rowKey, columnKey, explicitRowIndex = null, options = {}) => {
        const extendSelection = Boolean(options.extendSelection);
        if (!rowKey || !columnKey) {
            clearSelectionState();
            return;
        }
        const columns = resolveVisibleColumns();
        const rowIndex = explicitRowIndex === null ? resolveActiveRowIndex(rowKey) : explicitRowIndex;
        const columnIndex = resolveColumnIndex(columnKey, columns);
        selectedRowKey = String(rowKey);
        activeCell = {
            rowKey: String(rowKey),
            columnKey: String(columnKey),
            rowIndex: rowIndex >= 0 ? rowIndex : 0,
            columnIndex: columnIndex >= 0 ? columnIndex : 0,
        };
        activeCellLabel = `R${activeCell.rowIndex + 1} · ${String(columnKey)}`;
        setSelectionFromActive(extendSelection);
    };

    const ensureActiveCellVisible = () => {
        if (!activeCell) {
            return;
        }
        const selector = `[data-datagrid-row-key="${escapeCssToken(activeCell.rowKey)}"][data-datagrid-column-key="${escapeCssToken(activeCell.columnKey)}"]`;
        const node = rowsHost.querySelector(selector);
        if (node instanceof HTMLElement) {
            node.focus({ preventScroll: true });
            const viewportRect = viewport.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();
            const bodyTop = viewportRect.top;

            let nextTop = viewport.scrollTop;
            let nextLeft = viewport.scrollLeft;

            if (nodeRect.top < bodyTop) {
                nextTop -= bodyTop - nodeRect.top;
            } else if (nodeRect.bottom > viewportRect.bottom) {
                nextTop += nodeRect.bottom - viewportRect.bottom;
            }

            const targetColumn = resolveVisibleColumns().find((column) => column.key === activeCell.columnKey);
            if (targetColumn && resolveColumnPin(targetColumn) === "none") {
                if (nodeRect.left < viewportRect.left) {
                    nextLeft -= viewportRect.left - nodeRect.left;
                } else if (nodeRect.right > viewportRect.right) {
                    nextLeft += nodeRect.right - viewportRect.right;
                }
            }

            if (setViewportScroll(nextTop, nextLeft, "ensure-visible-node")) {
                requestRender();
            }
            return;
        }

        if (!Number.isFinite(activeCell.rowIndex) || activeCell.rowIndex < 0) {
            return;
        }

        const columns = resolveVisibleColumns();
        const orderedColumns = orderColumns(columns);
        const targetColumnIndex = orderedColumns.findIndex((column) => column.key === activeCell.columnKey);
        const targetColumn = targetColumnIndex >= 0 ? orderedColumns[targetColumnIndex] : null;
        const rowTop = activeCell.rowIndex * ROW_HEIGHT;
        const rowBottom = rowTop + ROW_HEIGHT;

        let nextTop = viewport.scrollTop;
        let nextLeft = viewport.scrollLeft;

        if (rowTop < viewport.scrollTop) {
            nextTop = rowTop;
        } else if (rowBottom > viewport.scrollTop + viewport.clientHeight) {
            nextTop = rowBottom - viewport.clientHeight;
        }

        if (targetColumn && resolveColumnPin(targetColumn) === "none") {
            let leftOffset = 0;
            let targetWidth = resolveColumnWidth(targetColumn);
            orderedColumns.forEach((column, index) => {
                const width = resolveColumnWidth(column);
                if (index < targetColumnIndex) {
                    leftOffset += width;
                }
                if (index === targetColumnIndex) {
                    targetWidth = width;
                }
            });

            const columnLeft = leftOffset;
            const columnRight = columnLeft + targetWidth;
            const visibleLeft = viewport.scrollLeft;
            const visibleRight = viewport.scrollLeft + viewport.clientWidth;

            if (columnLeft < visibleLeft) {
                nextLeft = columnLeft;
            } else if (columnRight > visibleRight) {
                nextLeft = columnRight - viewport.clientWidth;
            }
        }

        if (setViewportScroll(nextTop, nextLeft, "ensure-visible-fallback")) {
            requestRender();
        }
    };

    const isCellInSelectionRange = (rowIndex, columnIndex) => {
        return isCellInRange(selectionRange, rowIndex, columnIndex);
    };

    const getSelectedCellCount = () => {
        return countCellsInRange(selectionRange);
    };

    const resolveEffectiveSelectionRange = () => {
        if (selectionRange) {
            return selectionRange;
        }
        if (!activeCell) {
            return null;
        }
        return {
            startRowIndex: activeCell.rowIndex,
            endRowIndex: activeCell.rowIndex,
            startColumnIndex: activeCell.columnIndex,
            endColumnIndex: activeCell.columnIndex,
        };
    };

    const resolveRangeCells = (range, columns = resolveVisibleColumns()) => {
        if (!range) {
            return [];
        }
        const projectedRows = resolveProjectedRows();
        if (!projectedRows.length || !columns.length) {
            return [];
        }

        const startRowIndex = clamp(range.startRowIndex, 0, projectedRows.length - 1);
        const endRowIndex = clamp(range.endRowIndex, 0, projectedRows.length - 1);
        const startColumnIndex = clamp(range.startColumnIndex, 0, columns.length - 1);
        const endColumnIndex = clamp(range.endColumnIndex, 0, columns.length - 1);
        if (endRowIndex < startRowIndex || endColumnIndex < startColumnIndex) {
            return [];
        }

        const cells = [];
        for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex += 1) {
            const rowNode = resolveLeafRowNodeAtDisplayIndex(rowIndex, projectedRows);
            if (!rowNode) {
                continue;
            }
            const rowKey = String(rowNode.rowId);
            for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex += 1) {
                const column = columns[columnIndex];
                if (!column) {
                    continue;
                }
                cells.push({
                    rowKey,
                    columnKey: column.key,
                    rowIndex,
                    columnIndex,
                });
            }
        }
        return cells;
    };

    const positiveModulo = (value, size) => {
        if (size <= 0) {
            return 0;
        }
        return ((value % size) + size) % size;
    };

    const resolveAxisAutoScrollDelta = (pointer, min, max) => {
        const start = min + FILL_AUTOSCROLL_EDGE_PX;
        const end = max - FILL_AUTOSCROLL_EDGE_PX;
        if (pointer < start) {
            const intensity = clamp((start - pointer) / FILL_AUTOSCROLL_EDGE_PX, 0, 1);
            return -Math.max(1, Math.round(FILL_AUTOSCROLL_MAX_STEP_PX * intensity));
        }
        if (pointer > end) {
            const intensity = clamp((pointer - end) / FILL_AUTOSCROLL_EDGE_PX, 0, 1);
            return Math.max(1, Math.round(FILL_AUTOSCROLL_MAX_STEP_PX * intensity));
        }
        return 0;
    };

    const matrixToTsv = (matrix) => matrix.map((row) => row.join("\t")).join("\n");

    const parseClipboardMatrix = (text) => {
        const normalized = String(text ?? "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");
        const rows = normalized.split("\n");
        if (rows.length > 1 && rows[rows.length - 1] === "") {
            rows.pop();
        }
        if (!rows.length) {
            return [[""]];
        }
        return rows.map((row) => row.split("\t"));
    };

    const buildClipboardMatrixFromRange = (range, columns = resolveVisibleColumns()) => {
        const projectedRows = resolveProjectedRows();
        if (!range || !projectedRows.length || !columns.length) {
            return [[""]];
        }

        const startRowIndex = clamp(range.startRowIndex, 0, projectedRows.length - 1);
        const endRowIndex = clamp(range.endRowIndex, 0, projectedRows.length - 1);
        const startColumnIndex = clamp(range.startColumnIndex, 0, columns.length - 1);
        const endColumnIndex = clamp(range.endColumnIndex, 0, columns.length - 1);
        const matrix = [];
        for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex += 1) {
            const rowNode = resolveLeafRowNodeAtDisplayIndex(rowIndex, projectedRows);
            if (!rowNode) {
                continue;
            }
            const values = [];
            for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex += 1) {
                const column = columns[columnIndex];
                if (!column) {
                    continue;
                }
                const value = readCellValue(rowNode.rowId, column.key);
                values.push(value == null ? "" : String(value));
            }
            matrix.push(values);
        }
        return matrix.length ? matrix : [[""]];
    };

    const formatCellLabel = (point) => {
        if (!point) {
            return "None";
        }
        return `R${point.rowIndex + 1} · ${point.columnKey}`;
    };

    const isEditingCell = (rowKey, columnKey) =>
        Boolean(editingCell) &&
        editingCell.rowKey === String(rowKey) &&
        editingCell.columnKey === String(columnKey);

    const focusInlineEditor = () => {
        if (!editingCell) {
            return;
        }
        const selector =
            `[data-datagrid-inline-editor="true"]` +
            `[data-datagrid-row-key="${escapeCssToken(editingCell.rowKey)}"]` +
            `[data-datagrid-column-key="${escapeCssToken(editingCell.columnKey)}"]`;
        const input = rowsHost.querySelector(selector);
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        if (document.activeElement !== input) {
            input.focus({ preventScroll: true });
            input.select();
        }
    };

    const beginInlineEdit = (rowKey, columnKey, rowIndex = null) => {
        if (!isEditableColumn(columnKey)) {
            return;
        }
        updateActiveCell(rowKey, columnKey, rowIndex);
        editingCell = {
            rowKey: String(rowKey),
            columnKey: String(columnKey),
            draft: String(readCellValue(rowKey, columnKey) ?? ""),
        };
        closeContextMenu();
        setStatus(`Editing ${editingCell.columnKey}`);
        requestAnimationFrame(() => {
            focusInlineEditor();
        });
    };

    const commitInlineEdit = () => {
        if (!editingCell) {
            return false;
        }
        const session = editingCell;
        editingCell = null;
        const applied = applyCellEdit(
            "Edited cell",
            session.rowKey,
            session.columnKey,
            session.draft,
            { recordHistory: true },
        );
        if (!applied) {
            requestRender();
        }
        return applied;
    };

    const cancelInlineEdit = () => {
        if (!editingCell) {
            return;
        }
        editingCell = null;
        setStatus("Edit cancelled");
        requestRender();
    };

    const pushHistory = (label, operations) => {
        if (!operations.length) {
            return;
        }
        historyStore.push({
            label,
            operations: operations.map((operation) => ({ ...operation })),
            activeCell: activeCell ? { ...activeCell } : null,
        });
        updateActionButtons();
    };

    const runOperations = (operations, direction) => {
        operations.forEach((operation) => {
            const value = direction === "undo" ? operation.before : operation.after;
            writeCellValue(operation.rowKey, operation.columnKey, value);
        });
    };

    const applyOperations = (label, operations, options = {}) => {
        if (!operations.length) {
            return false;
        }
        runOperations(operations, "redo");
        if (options.recordHistory !== false) {
            pushHistory(label, operations);
        }
        applyProjection({ resetScroll: false });
        return true;
    };

    const applyCellEdit = (label, rowKey, columnKey, rawValue, options = {}) => {
        if (!isEditableColumn(columnKey)) {
            setStatus(`Column ${columnKey} is read-only`);
            return false;
        }
        const before = readCellValue(rowKey, columnKey);
        const after = coerceValue(columnKey, rawValue);
        if (before === after) {
            return false;
        }
        const operation = { rowKey: String(rowKey), columnKey: String(columnKey), before, after };
        const applied = applyOperations(label, [operation], options);
        if (applied) {
            setStatus(label);
        }
        return applied;
    };

    const undoHistory = () => {
        const transaction = historyStore.undo();
        if (!transaction) {
            setStatus("Undo stack is empty");
            return;
        }
        runOperations(transaction.operations, "undo");
        if (transaction.activeCell) {
            updateActiveCell(transaction.activeCell.rowKey, transaction.activeCell.columnKey, transaction.activeCell.rowIndex);
        }
        applyProjection({ resetScroll: false });
        updateActionButtons();
        setStatus(`Undo: ${transaction.label}`);
    };

    const redoHistory = () => {
        const transaction = historyStore.redo();
        if (!transaction) {
            setStatus("Redo stack is empty");
            return;
        }
        runOperations(transaction.operations, "redo");
        if (transaction.activeCell) {
            updateActiveCell(transaction.activeCell.rowKey, transaction.activeCell.columnKey, transaction.activeCell.rowIndex);
        }
        applyProjection({ resetScroll: false });
        updateActionButtons();
        setStatus(`Redo: ${transaction.label}`);
    };

    const copyCell = async () => {
        const range = resolveEffectiveSelectionRange();
        if (!range || !activeCell) {
            setStatus("No active cell");
            return;
        }
        const matrix = buildClipboardMatrixFromRange(range);
        const text = matrixToTsv(matrix);
        clipboardState = {
            range: { ...range },
            matrix,
            text,
            columnKey: activeCell.columnKey,
            value: matrix[0]?.[0] ?? "",
            updatedAt: Date.now(),
        };
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                // fall back to local clipboard state
            }
        }
        const copiedCellsCount = countCellsInRange(range);
        if (copiedCellsCount > 1) {
            setStatus(`Copied range (${copiedCellsCount} cells)`);
        } else {
            setStatus(`Copied ${activeCell.columnKey}`);
        }
    };

    const cutCell = async () => {
        const range = resolveEffectiveSelectionRange();
        if (!activeCell || !range) {
            setStatus("No active cell");
            return;
        }
        await copyCell();

        const operations = resolveRangeCells(range)
            .filter((cell) => isEditableColumn(cell.columnKey))
            .map((cell) => {
                const before = readCellValue(cell.rowKey, cell.columnKey);
                return {
                    rowKey: cell.rowKey,
                    columnKey: cell.columnKey,
                    before,
                    after: "",
                };
            })
            .filter((operation) => operation.before !== operation.after);

        if (!operations.length) {
            setStatus("Selection has no editable cells to cut");
            return;
        }

        const label = operations.length > 1 ? "Cut range" : "Cut cell";
        const applied = applyOperations(label, operations, { recordHistory: true });
        if (applied) {
            setStatus(`${label} (${operations.length} cells)`);
        }
    };

    const readClipboardText = async () => {
        if (navigator.clipboard?.readText) {
            try {
                const text = await navigator.clipboard.readText();
                if (typeof text === "string" && text.length > 0) {
                    return text;
                }
            } catch {
                // ignore and use local state fallback
            }
        }
        if (typeof clipboardState?.text === "string") {
            return clipboardState.text;
        }
        return clipboardState?.value == null ? "" : String(clipboardState.value);
    };

    const pasteCell = async () => {
        if (!activeCell) {
            setStatus("No active cell");
            return;
        }
        if (!isEditableColumn(activeCell.columnKey)) {
            setStatus(`Column ${activeCell.columnKey} is read-only`);
            return;
        }
        const fallbackMatrix = Array.isArray(clipboardState?.matrix) ? clipboardState.matrix : null;
        const internalHasPayload = Boolean(
            fallbackMatrix && fallbackMatrix.some((row) =>
                row.some((cell) => String(cell ?? "").trim().length > 0),
            ),
        );
        const text = internalHasPayload ? null : await readClipboardText();
        const rawMatrix = text === null ? [[""]] : parseClipboardMatrix(text);
        const hasPayload = rawMatrix.some((row) =>
            row.some((cell) => String(cell ?? "").trim().length > 0),
        );
        const matrix = internalHasPayload
            ? fallbackMatrix
            : (!hasPayload && fallbackMatrix && fallbackMatrix.length
                ? fallbackMatrix
                : rawMatrix);
        const matrixHeight = Math.max(1, matrix.length);
        const matrixWidth = Math.max(1, matrix[0]?.length ?? 1);
        const columns = resolveVisibleColumns();
        const projectedRows = resolveProjectedRows();
        const operations = [];

        const currentRange = resolveEffectiveSelectionRange();
        const shouldFillSelection =
            Boolean(currentRange) &&
            countCellsInRange(currentRange) > 1 &&
            matrixHeight === 1 &&
            matrixWidth === 1;

        if (shouldFillSelection && currentRange) {
            resolveRangeCells(currentRange, columns).forEach((cell) => {
                if (!isEditableColumn(cell.columnKey)) {
                    return;
                }
                const before = readCellValue(cell.rowKey, cell.columnKey);
                const after = coerceValue(cell.columnKey, matrix[0]?.[0] ?? "");
                if (before === after) {
                    return;
                }
                operations.push({
                    rowKey: cell.rowKey,
                    columnKey: cell.columnKey,
                    before,
                    after,
                });
            });
        } else if (currentRange && countCellsInRange(currentRange) > 1) {
            const targetRows = Math.max(1, currentRange.endRowIndex - currentRange.startRowIndex + 1);
            const targetColumns = Math.max(1, currentRange.endColumnIndex - currentRange.startColumnIndex + 1);
            for (let rowOffset = 0; rowOffset < targetRows; rowOffset += 1) {
                const rowIndex = currentRange.startRowIndex + rowOffset;
                const rowNode = resolveLeafRowNodeAtDisplayIndex(rowIndex, projectedRows);
                if (!rowNode) {
                    continue;
                }
                for (let columnOffset = 0; columnOffset < targetColumns; columnOffset += 1) {
                    const columnIndex = currentRange.startColumnIndex + columnOffset;
                    const column = columns[columnIndex];
                    if (!column || !isEditableColumn(column.key)) {
                        continue;
                    }
                    const sourceValue = matrix[rowOffset % matrixHeight]?.[columnOffset % matrixWidth] ?? "";
                    const before = readCellValue(rowNode.rowId, column.key);
                    const after = coerceValue(column.key, sourceValue);
                    if (before === after) {
                        continue;
                    }
                    operations.push({
                        rowKey: String(rowNode.rowId),
                        columnKey: column.key,
                        before,
                        after,
                    });
                }
            }
        } else {
            for (let rowOffset = 0; rowOffset < matrixHeight; rowOffset += 1) {
                const rowIndex = activeCell.rowIndex + rowOffset;
                const rowNode = resolveLeafRowNodeAtDisplayIndex(rowIndex, projectedRows);
                if (!rowNode) {
                    continue;
                }
                for (let columnOffset = 0; columnOffset < matrixWidth; columnOffset += 1) {
                    const columnIndex = activeCell.columnIndex + columnOffset;
                    const column = columns[columnIndex];
                    if (!column || !isEditableColumn(column.key)) {
                        continue;
                    }
                    const sourceValue = matrix[rowOffset]?.[columnOffset] ?? "";
                    const before = readCellValue(rowNode.rowId, column.key);
                    const after = coerceValue(column.key, sourceValue);
                    if (before === after) {
                        continue;
                    }
                    operations.push({
                        rowKey: String(rowNode.rowId),
                        columnKey: column.key,
                        before,
                        after,
                    });
                }
            }
        }

        if (!operations.length) {
            setStatus("No editable target cells for paste");
            return;
        }

        const label = operations.length > 1 ? "Pasted range" : "Pasted cell";
        const applied = applyOperations(label, operations, { recordHistory: true });
        if (applied) {
            setStatus(`${label} (${operations.length} cells)`);
        }
    };

    const clearCell = () => {
        const range = resolveEffectiveSelectionRange();
        if (!activeCell || !range) {
            setStatus("No active cell");
            return;
        }

        const operations = resolveRangeCells(range)
            .filter((cell) => isEditableColumn(cell.columnKey))
            .map((cell) => {
                const before = readCellValue(cell.rowKey, cell.columnKey);
                return {
                    rowKey: cell.rowKey,
                    columnKey: cell.columnKey,
                    before,
                    after: "",
                };
            })
            .filter((operation) => operation.before !== operation.after);

        if (!operations.length) {
            setStatus("No editable cells to clear");
            return;
        }

        const label = operations.length > 1 ? "Cleared range" : "Cleared cell";
        const applied = applyOperations(label, operations, { recordHistory: true });
        if (applied) {
            setStatus(`${label} (${operations.length} cells)`);
        }
    };

    const resolvePointerCellCoordFromViewport = (clientX, clientY) => {
        const viewportRect = viewport.getBoundingClientRect();
        if (viewportRect.width <= 0 || viewportRect.height <= 0) {
            return null;
        }

        const localX = clientX - viewportRect.left;
        const localY = clientY - viewportRect.top;
        if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
            return null;
        }
        if (localX < 0 || localX > viewportRect.width || localY < 0 || localY > viewportRect.height) {
            return null;
        }

        const projectedRowCount = api.rows.getCount();
        if (projectedRowCount <= 0) {
            return null;
        }

        const rowIndex = clamp(
            Math.floor((viewport.scrollTop + localY) / ROW_HEIGHT),
            0,
            Math.max(0, projectedRowCount - 1),
        );

        const columns = pointerLayoutCache.columns;
        const metrics = pointerLayoutCache.metrics;
        if (!columns.length || !metrics.length) {
            return {
                rowIndex,
                columnIndex: 0,
            };
        }

        const leftWidth = pointerLayoutCache.leftWidth;
        const scrollWidth = pointerLayoutCache.scrollWidth;
        const rightWidth = pointerLayoutCache.rightWidth;

        let columnIndex = -1;
        for (let index = 0; index < columns.length; index += 1) {
            const metric = metrics[index];
            const column = columns[index];
            if (!metric || !column) {
                continue;
            }
            const pin = resolveColumnPin(column);
            let visualStart = metric.start - viewport.scrollLeft;
            let visualEnd = metric.end - viewport.scrollLeft;
            if (pin === "left") {
                visualStart = metric.start;
                visualEnd = metric.end;
            } else if (pin === "right") {
                const offsetInsideRightLayer = metric.start - (leftWidth + scrollWidth);
                visualStart = viewport.clientWidth - rightWidth + offsetInsideRightLayer;
                visualEnd = visualStart + metric.width;
            }

            if (localX >= visualStart && localX <= visualEnd) {
                columnIndex = index;
                break;
            }
        }

        if (columnIndex < 0) {
            let closestDistance = Number.POSITIVE_INFINITY;
            for (let index = 0; index < columns.length; index += 1) {
                const metric = metrics[index];
                if (!metric) {
                    continue;
                }
                const center = metric.start + metric.width / 2;
                const distance = Math.abs((viewport.scrollLeft + localX) - center);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    columnIndex = index;
                }
            }
        }

        return {
            rowIndex,
            columnIndex: clamp(columnIndex, 0, Math.max(0, columns.length - 1)),
        };
    };

    const resolvePointerCellCoord = (clientX, clientY) => {
        const target = document.elementFromPoint(clientX, clientY);
        if (!(target instanceof Element)) {
            return resolvePointerCellCoordFromViewport(clientX, clientY);
        }
        const cell = target.closest("[data-datagrid-cell='true']");
        if (!(cell instanceof HTMLElement)) {
            return resolvePointerCellCoordFromViewport(clientX, clientY);
        }
        const rowIndex = Number(cell.dataset.datagridRowIndex);
        const columnIndex = Number(cell.dataset.datagridColumnIndex);
        if (!Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) {
            return resolvePointerCellCoordFromViewport(clientX, clientY);
        }
        return {
            rowIndex,
            columnIndex,
        };
    };

    const resolveFillPreviewRange = (originRange, coord) => {
        if (!originRange || !coord) {
            return null;
        }
        const candidate = {
            startRowIndex: Math.min(originRange.startRowIndex, coord.rowIndex),
            endRowIndex: Math.max(originRange.endRowIndex, coord.rowIndex),
            startColumnIndex: Math.min(originRange.startColumnIndex, coord.columnIndex),
            endColumnIndex: Math.max(originRange.endColumnIndex, coord.columnIndex),
        };
        if (rangeEquals(candidate, originRange)) {
            return null;
        }
        return candidate;
    };

    const commitFillPreview = () => {
        if (!fillDragSession || !fillPreviewRange) {
            return false;
        }
        const originRange = fillDragSession.originRange;
        const previewRange = fillPreviewRange;
        const columns = resolveVisibleColumns();
        const projectedRows = resolveProjectedRows();
        if (!columns.length || !projectedRows.length) {
            return false;
        }

        const sourceRowCount = Math.max(1, originRange.endRowIndex - originRange.startRowIndex + 1);
        const sourceColumnCount = Math.max(1, originRange.endColumnIndex - originRange.startColumnIndex + 1);

        const sourceMatrix = Array.from({ length: sourceRowCount }, (_, rowOffset) => {
            const sourceRowNode = resolveLeafRowNodeAtDisplayIndex(originRange.startRowIndex + rowOffset, projectedRows);
            return Array.from({ length: sourceColumnCount }, (_, columnOffset) => {
                const sourceColumn = columns[originRange.startColumnIndex + columnOffset];
                if (!sourceRowNode || !sourceColumn) {
                    return "";
                }
                return readCellValue(sourceRowNode.rowId, sourceColumn.key);
            });
        });

        const operations = [];
        for (let rowIndex = previewRange.startRowIndex; rowIndex <= previewRange.endRowIndex; rowIndex += 1) {
            const rowNode = resolveLeafRowNodeAtDisplayIndex(rowIndex, projectedRows);
            if (!rowNode) {
                continue;
            }
            for (let columnIndex = previewRange.startColumnIndex; columnIndex <= previewRange.endColumnIndex; columnIndex += 1) {
                if (isCellInRange(originRange, rowIndex, columnIndex)) {
                    continue;
                }
                const column = columns[columnIndex];
                if (!column || !isEditableColumn(column.key)) {
                    continue;
                }

                const sourceRowOffset = positiveModulo(rowIndex - originRange.startRowIndex, sourceRowCount);
                const sourceColumnOffset = positiveModulo(columnIndex - originRange.startColumnIndex, sourceColumnCount);
                const sourceValue = sourceMatrix[sourceRowOffset]?.[sourceColumnOffset] ?? "";

                const before = readCellValue(rowNode.rowId, column.key);
                const after = coerceValue(column.key, sourceValue);
                if (before === after) {
                    continue;
                }
                operations.push({
                    rowKey: String(rowNode.rowId),
                    columnKey: column.key,
                    before,
                    after,
                });
            }
        }

        if (!operations.length) {
            return false;
        }

        const applied = applyOperations("Filled range", operations, { recordHistory: true });
        if (applied) {
            setStatus(`Filled range (${operations.length} cells)`);
        }
        return applied;
    };

    const stopFillDrag = (apply) => {
        if (!fillDragSession) {
            return;
        }
        window.removeEventListener("pointermove", onFillDragPointerMove, true);
        window.removeEventListener("pointerup", onFillDragPointerUp, true);
        window.removeEventListener("pointercancel", onFillDragPointerCancel, true);
        if (fillAutoScrollFrame !== null) {
            window.cancelAnimationFrame(fillAutoScrollFrame);
            fillAutoScrollFrame = null;
        }
        fillPointerClient = null;

        root.classList.remove("is-fill-dragging");

        const capturedHandle = fillDragSession.handleElement;
        if (
            capturedHandle instanceof HTMLElement &&
            typeof capturedHandle.releasePointerCapture === "function" &&
            Number.isInteger(fillDragSession.pointerId)
        ) {
            try {
                if (
                    typeof capturedHandle.hasPointerCapture !== "function" ||
                    capturedHandle.hasPointerCapture(fillDragSession.pointerId)
                ) {
                    capturedHandle.releasePointerCapture(fillDragSession.pointerId);
                }
            } catch {
                // ignore pointer capture release errors
            }
        }

        if (apply) {
            commitFillPreview();
        }

        fillDragSession = null;
        fillPreviewRange = null;
        requestRender();
    };

    const onFillDragPointerMove = (event) => {
        if (!fillDragSession || event.pointerId !== fillDragSession.pointerId) {
            return;
        }
        fillPointerClient = {
            x: event.clientX,
            y: event.clientY,
        };
        const coord = resolvePointerCellCoord(event.clientX, event.clientY);
        const nextPreview = resolveFillPreviewRange(fillDragSession.originRange, coord);
        if (!rangeEquals(nextPreview, fillPreviewRange)) {
            fillPreviewRange = nextPreview;
            requestRender();
        }
        if (fillAutoScrollFrame === null) {
            fillAutoScrollFrame = window.requestAnimationFrame(runFillAutoScrollStep);
        }
    };

    const onFillDragPointerUp = (event) => {
        if (!fillDragSession || event.pointerId !== fillDragSession.pointerId) {
            return;
        }
        const coord = resolvePointerCellCoord(event.clientX, event.clientY);
        const nextPreview = resolveFillPreviewRange(fillDragSession.originRange, coord);
        if (!rangeEquals(nextPreview, fillPreviewRange)) {
            fillPreviewRange = nextPreview;
        }
        event.preventDefault();
        stopFillDrag(true);
    };

    const onFillDragPointerCancel = (event) => {
        if (!fillDragSession || event.pointerId !== fillDragSession.pointerId) {
            return;
        }
        stopFillDrag(false);
    };

    const startFillDragFromClientPoint = (clientX, clientY, pointerId, handleElement) => {
        if (fillDragSession) {
            return false;
        }
        const originRange = resolveEffectiveSelectionRange();
        if (!originRange) {
            return false;
        }
        fillDragSession = {
            originRange: { ...originRange },
            pointerId,
            handleElement: handleElement instanceof HTMLElement ? handleElement : null,
        };
        fillPreviewRange = null;
        fillPointerClient = {
            x: clientX,
            y: clientY,
        };
        closeContextMenu();
        root.classList.add("is-fill-dragging");

        window.addEventListener("pointermove", onFillDragPointerMove, true);
        window.addEventListener("pointerup", onFillDragPointerUp, true);
        window.addEventListener("pointercancel", onFillDragPointerCancel, true);
        if (fillAutoScrollFrame === null) {
            fillAutoScrollFrame = window.requestAnimationFrame(runFillAutoScrollStep);
        }

        return true;
    };

    const startFillDrag = (event) => {
        if (fillDragSession) {
            return;
        }
        if (event.type !== "pointerdown") {
            return;
        }
        if (typeof event.button === "number" && event.button !== 0) {
            return;
        }
        const handleElement =
            event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
        const started = startFillDragFromClientPoint(
            event.clientX,
            event.clientY,
            event.pointerId,
            handleElement,
        );
        if (!started) {
            return;
        }
        if (
            handleElement &&
            typeof handleElement.setPointerCapture === "function" &&
            Number.isInteger(event.pointerId)
        ) {
            try {
                handleElement.setPointerCapture(event.pointerId);
            } catch {
                // ignore pointer capture errors
            }
        }
        event.preventDefault();
        event.stopPropagation();
    };

    const runFillAutoScrollStep = () => {
        fillAutoScrollFrame = null;
        if (!fillDragSession || !fillPointerClient) {
            return;
        }
        const viewportRect = viewport.getBoundingClientRect();
        const deltaX = resolveAxisAutoScrollDelta(fillPointerClient.x, viewportRect.left, viewportRect.right);
        const deltaY = resolveAxisAutoScrollDelta(fillPointerClient.y, viewportRect.top, viewportRect.bottom);
        if (deltaX === 0 && deltaY === 0) {
            return;
        }

        const changed = setViewportScroll(
            viewport.scrollTop + deltaY,
            viewport.scrollLeft + deltaX,
            "fill-autoscroll",
        );
        if (changed) {
            const coord = resolvePointerCellCoord(fillPointerClient.x, fillPointerClient.y);
            const nextPreview = resolveFillPreviewRange(fillDragSession.originRange, coord);
            if (!rangeEquals(nextPreview, fillPreviewRange)) {
                fillPreviewRange = nextPreview;
            }
            requestRender();
        }

        if (fillDragSession) {
            fillAutoScrollFrame = window.requestAnimationFrame(runFillAutoScrollStep);
        }
    };

    const closeContextMenu = () => {
        if (!contextMenu || !menuState.open) {
            return;
        }
        menuState.open = false;
        contextMenu.hidden = true;
    };

    const setContextMenuActiveIndex = (nextIndex) => {
        if (!contextMenuButtons.length) {
            return;
        }
        menuState.activeIndex = clamp(nextIndex, 0, contextMenuButtons.length - 1);
        contextMenuButtons.forEach((button, index) => {
            button.classList.toggle("is-active", index === menuState.activeIndex);
        });
        const activeButton = contextMenuButtons[menuState.activeIndex];
        activeButton?.focus({ preventScroll: true });
    };

    const openContextMenu = (x, y, rowKey, columnKey, rowIndex = null) => {
        if (!contextMenu) {
            return;
        }
        updateActiveCell(rowKey, columnKey, rowIndex);

        contextMenu.hidden = false;
        menuState.open = true;

        const stageRect = stage.getBoundingClientRect();
        const relativeX = x - stageRect.left;
        const relativeY = y - stageRect.top;

        contextMenu.style.left = `${Math.max(8, relativeX)}px`;
        contextMenu.style.top = `${Math.max(8, relativeY)}px`;

        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const maxLeft = Math.max(8, stage.clientWidth - menuWidth - 8);
        const maxTop = Math.max(8, stage.clientHeight - menuHeight - 8);

        contextMenu.style.left = `${Math.min(Math.max(8, relativeX), maxLeft)}px`;
        contextMenu.style.top = `${Math.min(Math.max(8, relativeY), maxTop)}px`;

        setContextMenuActiveIndex(0);
    };

    const runContextMenuAction = (actionId) => {
        switch (actionId) {
            case "copy":
                void copyCell();
                break;
            case "cut":
                void cutCell();
                break;
            case "paste":
                void pasteCell();
                break;
            case "clear":
                clearCell();
                break;
            default:
                break;
        }
        closeContextMenu();
    };

    const onContextMenuKeydown = (event) => {
        if (!menuState.open) {
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setContextMenuActiveIndex(menuState.activeIndex + 1);
            return;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setContextMenuActiveIndex(menuState.activeIndex - 1);
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const actionId = MENU_ACTION_IDS[menuState.activeIndex];
            if (actionId) {
                runContextMenuAction(actionId);
            }
            return;
        }
        if (event.key === "Escape" || event.key === "Tab") {
            event.preventDefault();
            closeContextMenu();
        }
    };

    const moveActiveCell = (rowDelta, columnDelta, extendSelection = false) => {
        const columns = resolveVisibleColumns();
        const projectedRows = resolveProjectedRows();
        if (!columns.length || !projectedRows.length) {
            return;
        }
        if (!activeCell) {
            const firstLeafRowIndex = projectedRows.findIndex((rowNode) => rowNode?.kind === "leaf");
            const firstLeafRow = firstLeafRowIndex >= 0 ? resolveLeafRowNodeAtDisplayIndex(firstLeafRowIndex, projectedRows) : null;
            if (!firstLeafRow) {
                return;
            }
            updateActiveCell(firstLeafRow.rowId, columns[0].key, firstLeafRowIndex, { extendSelection });
            requestRender();
            return;
        }
        const currentRowIndex = resolveActiveRowIndex(activeCell.rowKey);
        const currentColumnIndex = columns.findIndex((column) => column.key === activeCell.columnKey);

        const nextRowIndex = clamp(currentRowIndex + rowDelta, 0, projectedRows.length - 1);
        const nextColumnIndex = clamp(currentColumnIndex + columnDelta, 0, columns.length - 1);

        const nextRow = resolveLeafRowNodeAtDisplayIndex(nextRowIndex, projectedRows);
        const nextColumn = columns[nextColumnIndex];
        if (!nextRow || !nextColumn) {
            return;
        }
        updateActiveCell(nextRow.rowId, nextColumn.key, nextRowIndex, { extendSelection });
        setStatus(`Active cell ${activeCellLabel}`);
        requestRender();
        requestAnimationFrame(() => {
            ensureActiveCellVisible();
        });
    };

    const onRootKeydown = (event) => {
        if (fillDragSession && event.key === "Escape") {
            event.preventDefault();
            stopFillDrag(false);
            return;
        }
        if (menuState.open) {
            onContextMenuKeydown(event);
            return;
        }
        if (editingCell) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitInlineEdit();
                return;
            }
            if (event.key === "Escape") {
                event.preventDefault();
                cancelInlineEdit();
                return;
            }
            if (event.key === "Tab") {
                event.preventDefault();
                commitInlineEdit();
                moveActiveCell(0, event.shiftKey ? -1 : 1);
                return;
            }
            return;
        }
        if (event.defaultPrevented) {
            return;
        }

        const target = event.target;
        if (
            target instanceof HTMLElement &&
            target.closest(".affino-datagrid-demo__controls") &&
            !target.closest("[data-datagrid-context-menu]")
        ) {
            return;
        }

        const metaKey = event.ctrlKey || event.metaKey;
        if (metaKey && event.key.toLowerCase() === "c") {
            event.preventDefault();
            void copyCell();
            return;
        }
        if (metaKey && event.key.toLowerCase() === "x") {
            event.preventDefault();
            void cutCell();
            return;
        }
        if (metaKey && event.key.toLowerCase() === "v") {
            event.preventDefault();
            void pasteCell();
            return;
        }
        if (metaKey && event.key.toLowerCase() === "z" && event.shiftKey) {
            event.preventDefault();
            redoHistory();
            return;
        }
        if (metaKey && event.key.toLowerCase() === "z") {
            event.preventDefault();
            undoHistory();
            return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            if (activeCell && isEditableColumn(activeCell.columnKey)) {
                event.preventDefault();
                clearCell();
            }
            return;
        }
        if (event.shiftKey && event.key === "F10") {
            event.preventDefault();
            if (activeCell) {
                const selector = `[data-datagrid-row-key="${escapeCssToken(activeCell.rowKey)}"][data-datagrid-column-key="${escapeCssToken(activeCell.columnKey)}"]`;
                const cell = rowsHost.querySelector(selector);
                if (cell instanceof HTMLElement) {
                    const rect = cell.getBoundingClientRect();
                    openContextMenu(rect.left + 12, rect.top + 12, activeCell.rowKey, activeCell.columnKey, activeCell.rowIndex);
                }
            }
            return;
        }
        if (
            (event.key === "F2" || event.key === "Enter") &&
            activeCell &&
            isEditableColumn(activeCell.columnKey)
        ) {
            event.preventDefault();
            beginInlineEdit(activeCell.rowKey, activeCell.columnKey, activeCell.rowIndex);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            moveActiveCell(1, 0, event.shiftKey);
            return;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            moveActiveCell(-1, 0, event.shiftKey);
            return;
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            moveActiveCell(0, 1, event.shiftKey);
            return;
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveActiveCell(0, -1, event.shiftKey);
        }
    };

    const onGlobalPointerDown = (event) => {
        if (fillDragSession) {
            return;
        }
        if (!menuState.open || !contextMenu) {
            return;
        }
        if (!(event.target instanceof Node)) {
            closeContextMenu();
            return;
        }
        if (!contextMenu.contains(event.target)) {
            closeContextMenu();
        }
    };

    const onScroll = () => {
        if (suppressedScrollEvents > 0) {
            suppressedScrollEvents -= 1;
            return;
        }

        const nextTop = viewport.scrollTop;
        const nextLeft = viewport.scrollLeft;
        if (nextTop === lastScrollTop && nextLeft === lastScrollLeft) {
            return;
        }
        syncHeaderScroll();
        lastScrollTop = nextTop;
        lastScrollLeft = nextLeft;
        if (fillDragSession && fillPointerClient) {
            const coord = resolvePointerCellCoord(fillPointerClient.x, fillPointerClient.y);
            const nextPreview = resolveFillPreviewRange(fillDragSession.originRange, coord);
            if (!rangeEquals(nextPreview, fillPreviewRange)) {
                fillPreviewRange = nextPreview;
            }
        }
        closeContextMenu();
        requestRender();
    };
    viewport.addEventListener("wheel", onViewportWheel, { passive: false });
    viewport.addEventListener("scroll", onScroll, { passive: true });

    const onSearch = () => {
        query = String(searchInput?.value ?? "").trim().toLowerCase();
        setStatus(query ? `Quick filter: ${query}` : "Quick filter cleared");
        applyProjection({ resetScroll: true });
    };
    searchInput?.addEventListener("input", onSearch);

    const onSort = () => {
        sortMode = String(sortSelect?.value || "latency-desc");
        setStatus(`Sort: ${sortMode}`);
        applyProjection({ resetScroll: true });
    };
    sortSelect?.addEventListener("change", onSort);

    const onGroup = () => {
        groupMode = String(groupSelect?.value || "none");
        setStatus(groupMode === "none" ? "Grouping disabled" : `Grouped by ${groupMode}`);
        applyProjection({ resetScroll: true });
    };
    groupSelect?.addEventListener("change", onGroup);

    const onVisibility = () => {
        visibilityMode = String(visibilitySelect?.value || "all");
        applyColumnVisibilityPreset();
        setStatus(`Column visibility: ${visibilityMode}`);
        applyProjection({ resetScroll: false });
    };
    visibilitySelect?.addEventListener("change", onVisibility);

    const onAdvancedFilter = () => {
        advancedFilterMode = String(advancedFilterSelect?.value || "none");
        setStatus(advancedFilterMode === "none" ? "Advanced filter disabled" : `Advanced filter: ${advancedFilterMode}`);
        applyProjection({ resetScroll: true });
    };
    advancedFilterSelect?.addEventListener("change", onAdvancedFilter);

    const onSize = () => {
        const size = readPositiveNumber(sizeSelect?.value, DEFAULT_SIZE);
        generation += 1;
        replaceSourceRows(buildRows(size, generation));
        stopFillDrag(false);
        resetInteractionState();
        clearHistory();
        setStatus(`Dataset resized: ${size} rows`);
        applyProjection({ resetScroll: true });
    };
    sizeSelect?.addEventListener("change", onSize);

    const onPinStatus = () => {
        const pin = pinStatusToggle?.checked ? "left" : "none";
        api.columns.setPin("status", pin);
        setStatus(pin === "left" ? "Status column pinned" : "Status column unpinned");
        requestRender();
    };
    pinStatusToggle?.addEventListener("change", onPinStatus);

    const onAutoReapply = () => {
        const enabled = Boolean(autoReapplyToggle?.checked);
        api.rows.setAutoReapply(enabled);
        setStatus(enabled ? "Auto reapply view enabled" : "Auto reapply view disabled");
        requestRender();
    };
    autoReapplyToggle?.addEventListener("change", onAutoReapply);

    const onReapply = () => {
        api.view.reapply();
        setStatus("Projection reapply requested");
        requestRender();
    };
    reapplyButton?.addEventListener("click", onReapply);

    const onShift = () => {
        generation += 1;
        replaceSourceRows(sourceRows.map((row, index) => {
            const latencyShift = ((index + generation) % 7) * 5 - 12;
            const nextLatency = Math.max(20, row.latencyMs + latencyShift);
            const nextErrors = Math.max(0, row.errorRate + ((index + generation) % 4) - 1);
            const nextAvailability = Math.max(
                96.4,
                Math.min(99.99, row.availabilityPct - nextErrors * 0.02 + latencyShift * 0.002),
            );
            return {
                ...row,
                latencyMs: nextLatency,
                errorRate: nextErrors,
                availabilityPct: Number(nextAvailability.toFixed(2)),
                throughputRps: Math.max(120, Math.round(row.throughputRps + latencyShift * 2)),
                status: resolveStatus(nextLatency, nextErrors),
                updatedAt: resolveTimestamp(index + generation),
            };
        }));
        clearHistory();
        setStatus("Runtime shift applied");
        applyProjection({ resetScroll: false });
    };
    shiftButton?.addEventListener("click", onShift);

    const onUndo = () => {
        undoHistory();
    };
    undoButton?.addEventListener("click", onUndo);

    const onRedo = () => {
        redoHistory();
    };
    redoButton?.addEventListener("click", onRedo);

    const onReset = () => {
        generation = 1;
        const size = readPositiveNumber(sizeSelect?.value, initialSize);
        replaceSourceRows(buildRows(size, generation));
        query = "";
        sortMode = "latency-desc";
        groupMode = "none";
        visibilityMode = "all";
        advancedFilterMode = "none";
        stopFillDrag(false);
        resetInteractionState();
        clearHistory();
        if (searchInput) {
            searchInput.value = "";
        }
        if (sortSelect) {
            sortSelect.value = "latency-desc";
        }
        if (groupSelect) {
            groupSelect.value = "none";
        }
        if (visibilitySelect) {
            visibilitySelect.value = "all";
        }
        if (advancedFilterSelect) {
            advancedFilterSelect.value = "none";
        }
        if (pinStatusToggle) {
            pinStatusToggle.checked = false;
        }
        if (autoReapplyToggle) {
            autoReapplyToggle.checked = api.rows.getAutoReapply();
        }
        applyColumnVisibilityPreset();
        api.columns.setPin("status", "none");
        setStatus("Dataset reset");
        applyProjection({ resetScroll: true });
    };
    resetButton?.addEventListener("click", onReset);

    const onClearFilter = () => {
        query = "";
        if (searchInput) {
            searchInput.value = "";
        }
        setStatus("Quick filter cleared");
        applyProjection({ resetScroll: true });
    };
    clearFilterButton?.addEventListener("click", onClearFilter);

    const onMenuActionClick = (event) => {
        if (!(event.currentTarget instanceof HTMLElement)) {
            return;
        }
        const actionId = event.currentTarget.dataset.datagridMenuAction;
        if (typeof actionId === "string" && actionId.length > 0) {
            runContextMenuAction(actionId);
        }
    };
    contextMenuButtons.forEach((button) => {
        button.addEventListener("click", onMenuActionClick);
    });
    contextMenu?.addEventListener("keydown", onContextMenuKeydown);

    root.addEventListener("keydown", onRootKeydown);
    root.addEventListener("pointerdown", onGlobalPointerDown, true);

    function applyProjection(options = {}) {
        const applyProjectedRowsAndModels = () => {
            api.rows.batch(() => {
                api.rows.setData(sourceRows);
                api.rows.setFilterModel(resolveFilterModel());
                api.rows.setSortModel(resolveSortModel());

                if (groupMode === "none") {
                    api.rows.setAggregationModel(null);
                    api.rows.setGroupBy(null);
                } else {
                    api.rows.setAggregationModel({
                        basis: GROUP_AGGREGATION_MODEL.basis,
                        columns: GROUP_AGGREGATION_MODEL.columns.map((column) => ({ ...column })),
                    });
                    api.rows.setGroupBy({
                        fields: [groupMode],
                        expandedByDefault: true,
                    });
                }
            });
        };

        const normalizeInteractionStateAfterProjection = (visibleColumns) => {
            if (selectedRowKey && !hasProjectedLeafRowKey(selectedRowKey)) {
                selectedRowKey = null;
            }
            if (activeCell && !hasProjectedLeafRowKey(activeCell.rowKey)) {
                activeCell = null;
                activeCellLabel = "None";
            } else if (activeCell) {
                const normalizedIndex = resolveActiveRowIndex(activeCell.rowKey);
                activeCell.rowIndex = normalizedIndex >= 0 ? normalizedIndex : 0;
                const normalizedColumnIndex = resolveColumnIndex(activeCell.columnKey);
                activeCell.columnIndex = normalizedColumnIndex >= 0 ? normalizedColumnIndex : 0;
                activeCellLabel = `R${activeCell.rowIndex + 1} · ${activeCell.columnKey}`;
            }
            if (!activeCell) {
                selectionAnchor = null;
            }
            if (selectionAnchor && !hasProjectedLeafRowKey(selectionAnchor.rowKey)) {
                selectionAnchor = null;
            }
            if (selectionAnchor) {
                const normalizedAnchorRowIndex = resolveActiveRowIndex(selectionAnchor.rowKey);
                const normalizedAnchorColumnIndex = resolveColumnIndex(selectionAnchor.columnKey);
                selectionAnchor.rowIndex = normalizedAnchorRowIndex >= 0 ? normalizedAnchorRowIndex : 0;
                selectionAnchor.columnIndex = normalizedAnchorColumnIndex >= 0 ? normalizedAnchorColumnIndex : 0;
            }
            if (activeCell && !selectionAnchor) {
                selectionAnchor = {
                    rowKey: activeCell.rowKey,
                    columnKey: activeCell.columnKey,
                    rowIndex: activeCell.rowIndex,
                    columnIndex: activeCell.columnIndex,
                };
            }

            if (activeCell && !visibleColumns.some((column) => column.key === activeCell.columnKey)) {
                const fallbackColumn = visibleColumns[0];
                if (fallbackColumn) {
                    activeCell.columnKey = fallbackColumn.key;
                    activeCell.columnIndex = resolveColumnIndex(fallbackColumn.key, visibleColumns);
                    activeCellLabel = `R${activeCell.rowIndex + 1} · ${activeCell.columnKey}`;
                } else {
                    activeCell = null;
                    activeCellLabel = "None";
                }
            }
            if (selectionAnchor && !visibleColumns.some((column) => column.key === selectionAnchor.columnKey)) {
                selectionAnchor = activeCell
                    ? {
                        rowKey: activeCell.rowKey,
                        columnKey: activeCell.columnKey,
                        rowIndex: activeCell.rowIndex,
                        columnIndex: activeCell.columnIndex,
                    }
                    : null;
            }

            selectionRange = normalizeSelectionRange(selectionAnchor, activeCell);
            if (editingCell && !hasProjectedLeafRowKey(editingCell.rowKey)) {
                editingCell = null;
            }
        };

        applyProjectedRowsAndModels();
        normalizeInteractionStateAfterProjection(resolveVisibleColumns());
        selectionSummaryCacheKey = "";

        if (options.resetScroll !== false) {
            setViewportScroll(0, viewport.scrollLeft, "projection-reset");
        }
        closeContextMenu();
        requestRender();
    }

    function renderHeader(layers, layerTrackTemplate) {
        header.innerHTML = "";
        header.style.gridTemplateColumns = layerTrackTemplate;
        const fragment = document.createDocumentFragment();
        layers.forEach((layer) => {
            const layerNode = document.createElement("div");
            layerNode.className = `affino-datagrid-demo__layer affino-datagrid-demo__layer--header affino-datagrid-demo__layer--${layer.key}`;
            layerNode.style.gridTemplateColumns = layer.templateColumns;
            layerNode.style.width = `${Math.max(0, layer.width)}px`;

            layer.columns.forEach((column) => {
                const cell = document.createElement("div");
                cell.className = "affino-datagrid-demo__cell affino-datagrid-demo__cell--header";
                if (layer.key !== "scroll") {
                    cell.classList.add("affino-datagrid-demo__cell--sticky");
                }
                cell.textContent = column.column.label || column.key;
                layerNode.appendChild(cell);
            });
            fragment.appendChild(layerNode);
        });
        header.appendChild(fragment);
    }

    function renderRows(columns, layers, layerTrackTemplate, start, end, renderSignature) {
        if (renderSignature === rowsRenderSignature) {
            return;
        }
        rowsRenderSignature = renderSignature;
        rowsHost.innerHTML = "";
        const handleRange = resolveEffectiveSelectionRange();
        const rows = start <= end ? api.rows.getRange({ start, end }) : [];
        const columnIndexByKey = new Map();
        columns.forEach((column, index) => {
            columnIndexByKey.set(column.key, index);
        });
        if (!rows.length) {
            const emptyState = document.createElement("p");
            emptyState.className = "affino-datagrid-demo__empty";
            emptyState.textContent = "No rows matched the current filters.";
            rowsHost.appendChild(emptyState);
            return;
        }

        const fragment = document.createDocumentFragment();
        rows.forEach((entry) => {
            if (entry.kind === "group") {
                const row = document.createElement("div");
                row.className = "affino-datagrid-demo__row affino-datagrid-demo__row--group";
                row.style.gridTemplateColumns = layerTrackTemplate;

                const meta = entry.groupMeta;
                const groupCell = document.createElement("button");
                groupCell.type = "button";
                groupCell.className = "affino-datagrid-demo__cell affino-datagrid-demo__cell--group";
                groupCell.style.gridColumn = "1 / -1";
                const expanded = Boolean(entry.state?.expanded);
                const field = String(meta?.groupField || groupMode || "group");
                const value = String(meta?.groupValue ?? "Unknown");
                const count = Number(meta?.childrenCount ?? 0);
                const aggregateSummary = resolveGroupAggregateSummary(meta?.aggregates);
                groupCell.textContent = `${expanded ? "▾" : "▸"} ${field}: ${value} (${count})${aggregateSummary ? ` · ${aggregateSummary}` : ""}`;
                groupCell.addEventListener("click", () => {
                    if (meta?.groupKey) {
                        api.rows.toggleGroup(meta.groupKey);
                        setStatus(`${expanded ? "Collapsed" : "Expanded"} group ${value}`);
                    }
                });
                row.appendChild(groupCell);
                fragment.appendChild(row);
                return;
            }

            const row = document.createElement("div");
            row.className = "affino-datagrid-demo__row";
            row.style.gridTemplateColumns = layerTrackTemplate;

            const rowKey = String(entry.data?.rowId ?? entry.rowId ?? entry.rowKey ?? "");
            const rowIndex = resolveActiveRowIndex(rowKey);
            if (rowKey && selectedRowKey === rowKey) {
                row.classList.add("is-selected");
            }

            layers.forEach((layer) => {
                const layerNode = document.createElement("div");
                layerNode.className = `affino-datagrid-demo__layer affino-datagrid-demo__layer--row affino-datagrid-demo__layer--${layer.key}`;
                layerNode.style.gridTemplateColumns = layer.templateColumns;
                layerNode.style.width = `${Math.max(0, layer.width)}px`;

                layer.columns.forEach((column) => {
                    const columnIndex = columnIndexByKey.get(column.key) ?? 0;
                    const value = entry.data?.[column.key];
                    const currentlyEditing = isEditingCell(rowKey, column.key);
                    const cell = document.createElement(currentlyEditing ? "div" : "button");
                    cell.dataset.datagridRowKey = rowKey;
                    cell.dataset.datagridColumnKey = column.key;
                    cell.dataset.datagridCell = "true";
                    cell.dataset.datagridRowIndex = String(rowIndex);
                    cell.dataset.datagridColumnIndex = String(columnIndex);
                    cell.className = "affino-datagrid-demo__cell";
                    if (layer.key !== "scroll") {
                        cell.classList.add("affino-datagrid-demo__cell--sticky");
                    }

                    if (currentlyEditing) {
                        cell.classList.add("affino-datagrid-demo__cell--editing");
                    } else {
                        cell.type = "button";
                        cell.textContent = formatCellValue(column.key, value);
                    }

                    if (column.key === "latencyMs" || column.key === "errorRate" || column.key === "throughputRps") {
                        cell.classList.add("affino-datagrid-demo__cell--numeric");
                    }
                    if (column.key === "status") {
                        cell.classList.add("affino-datagrid-demo__cell--status");
                    }
                    if (activeCell && activeCell.rowKey === rowKey && activeCell.columnKey === column.key) {
                        cell.classList.add("is-active-cell");
                    }
                    if (isCellInSelectionRange(rowIndex, columnIndex)) {
                        cell.classList.add("is-in-range");
                    }

                    if (currentlyEditing) {
                        const input = document.createElement("input");
                        input.type = "text";
                        input.className = "affino-datagrid-demo__editor";
                        input.value = String(editingCell?.draft ?? "");
                        input.dataset.datagridInlineEditor = "true";
                        input.dataset.datagridRowKey = rowKey;
                        input.dataset.datagridColumnKey = column.key;
                        input.setAttribute("aria-label", `${column.key} editor`);
                        input.addEventListener("input", () => {
                            if (editingCell && editingCell.rowKey === rowKey && editingCell.columnKey === column.key) {
                                editingCell.draft = input.value;
                            }
                        });
                        input.addEventListener("keydown", (event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                commitInlineEdit();
                                return;
                            }
                            if (event.key === "Escape") {
                                event.preventDefault();
                                cancelInlineEdit();
                                return;
                            }
                            if (event.key === "Tab") {
                                event.preventDefault();
                                commitInlineEdit();
                                moveActiveCell(0, event.shiftKey ? -1 : 1);
                            }
                        });
                        input.addEventListener("blur", () => {
                            commitInlineEdit();
                        });
                        cell.appendChild(input);
                    } else {
                        cell.addEventListener("mousedown", (event) => {
                            if (event.button !== 0) {
                                return;
                            }
                            const clickedHandle =
                                event.target instanceof Element &&
                                event.target.closest("[data-datagrid-fill-handle]");
                            const handleNode = cell.querySelector("[data-datagrid-fill-handle]");
                            const handleZone = (() => {
                                if (!handleNode) {
                                    return false;
                                }
                                const rect = cell.getBoundingClientRect();
                                const threshold = 12;
                                return (
                                    event.clientX >= rect.right - threshold &&
                                    event.clientY >= rect.bottom - threshold
                                );
                            })();
                            if (clickedHandle || handleZone) {
                                startFillDrag(event);
                                return;
                            }
                            updateActiveCell(rowKey, column.key, rowIndex, {
                                extendSelection: event.shiftKey && Boolean(selectionAnchor),
                            });
                            requestRender();
                        });

                        cell.addEventListener("click", (event) => {
                            updateActiveCell(rowKey, column.key, rowIndex, {
                                extendSelection: event.shiftKey && Boolean(selectionAnchor),
                            });
                            setStatus(`Active cell ${activeCellLabel}`);
                            requestRender();
                        });

                        cell.addEventListener("dblclick", () => {
                            beginInlineEdit(rowKey, column.key, resolveActiveRowIndex(rowKey));
                        });

                        cell.addEventListener("contextmenu", (event) => {
                            event.preventDefault();
                            openContextMenu(event.clientX, event.clientY, rowKey, column.key, resolveActiveRowIndex(rowKey));
                        });

                        const shouldRenderFillHandle =
                            Boolean(handleRange) &&
                            isEditableColumn(column.key) &&
                            handleRange.endRowIndex === rowIndex &&
                            handleRange.endColumnIndex === columnIndex &&
                            !fillDragSession;
                        if (shouldRenderFillHandle) {
                            const handle = document.createElement("span");
                            handle.className = "affino-datagrid-demo__fill-handle";
                            handle.dataset.datagridFillHandle = "true";
                            handle.draggable = false;
                            handle.addEventListener("pointerdown", startFillDrag);
                            cell.appendChild(handle);
                        }
                    }

                    layerNode.appendChild(cell);
                });
                row.appendChild(layerNode);
            });

            fragment.appendChild(row);
        });
        rowsHost.appendChild(fragment);
    }

    function resolveSelectionSummary(columns, rangeOverride = null) {
        const range = rangeOverride ?? resolveEffectiveSelectionRange();
        if (!range) {
            return {
                latencySum: null,
                latencyAvg: null,
                ownerDistinct: 0,
            };
        }

        const cells = resolveRangeCells(range, columns);
        if (!cells.length) {
            return {
                latencySum: null,
                latencyAvg: null,
                ownerDistinct: 0,
            };
        }

        const latencyValues = [];
        const owners = new Set();
        cells.forEach((cell) => {
            const value = readCellValue(cell.rowKey, cell.columnKey);
            if (cell.columnKey === "latencyMs") {
                const numeric = Number(value);
                if (Number.isFinite(numeric)) {
                    latencyValues.push(numeric);
                }
            }
            if (cell.columnKey === "owner") {
                const text = String(value ?? "").trim();
                if (text.length > 0) {
                    owners.add(text);
                }
            }
        });

        if (!latencyValues.length) {
            return {
                latencySum: null,
                latencyAvg: null,
                ownerDistinct: owners.size,
            };
        }

        const latencySum = latencyValues.reduce((total, value) => total + value, 0);
        return {
            latencySum,
            latencyAvg: latencySum / latencyValues.length,
            ownerDistinct: owners.size,
        };
    }

    function resolveSelectionSummaryCached(columns, rowRevision) {
        const range = resolveEffectiveSelectionRange();
        const key = resolveSelectionSummaryCacheKey(range, columns, rowRevision);
        if (key === selectionSummaryCacheKey) {
            return selectionSummaryCache;
        }
        selectionSummaryCache = resolveSelectionSummary(columns, range);
        selectionSummaryCacheKey = key;
        return selectionSummaryCache;
    }

    function resolveHeaderRenderSignature(columnLayers, layerTrackTemplate) {
        const layersKey = columnLayers.map((layer) => {
            const columnsKey = layer.columns
                .map((column) => `${column.key}:${resolveColumnWidth(column)}:${resolveColumnPin(column) || "none"}`)
                .join(",");
            return `${layer.mode}:${columnsKey}`;
        }).join("|");
        return `${layerTrackTemplate}|${layersKey}`;
    }

    function updatePointerLayoutCache(columns, metrics) {
        let leftWidth = 0;
        let scrollWidth = 0;
        let rightWidth = 0;
        columns.forEach((column) => {
            const width = resolveColumnWidth(column);
            const pin = resolveColumnPin(column);
            if (pin === "left") {
                leftWidth += width;
            } else if (pin === "right") {
                rightWidth += width;
            } else {
                scrollWidth += width;
            }
        });
        pointerLayoutCache = {
            columns,
            metrics,
            leftWidth,
            scrollWidth,
            rightWidth,
        };
    }

    function resolveRowsRenderSignature({
        start,
        end,
        rowRevision,
        headerSignature,
    }) {
        const activeCellKey = activeCell
            ? `${activeCell.rowKey}:${activeCell.columnKey}:${activeCell.rowIndex}:${activeCell.columnIndex}`
            : "none";
        const editingKey = editingCell
            ? `${editingCell.rowKey}:${editingCell.columnKey}`
            : "none";
        const fillState = fillDragSession ? "fill:1" : "fill:0";
        return [
            start,
            end,
            rowRevision,
            headerSignature,
            selectedRowKey ?? "none",
            resolveSelectionRangeKey(selectionRange),
            activeCellKey,
            editingKey,
            fillState,
        ].join("|");
    }

    function buildOverlaySegmentsForRange(range, columns, metrics) {
        const projectedRowCount = api.rows.getCount();
        if (!range || !columns.length || projectedRowCount === 0) {
            return [];
        }
        const maxRowIndex = Math.max(0, projectedRowCount - 1);
        const rowStart = clamp(range.startRowIndex, 0, maxRowIndex);
        const rowEnd = clamp(range.endRowIndex, 0, maxRowIndex);
        const columnStart = clamp(range.startColumnIndex, 0, columns.length - 1);
        const columnEnd = clamp(range.endColumnIndex, 0, columns.length - 1);
        if (rowEnd < rowStart || columnEnd < columnStart) {
            return [];
        }

        const resolvedMetrics = metrics ?? [];
        let leftWidth = 0;
        let scrollWidth = 0;
        let rightWidth = 0;
        columns.forEach((column) => {
            const width = resolveColumnWidth(column);
            const pin = resolveColumnPin(column);
            if (pin === "left") {
                leftWidth += width;
            } else if (pin === "right") {
                rightWidth += width;
            } else {
                scrollWidth += width;
            }
        });

        const top = rowStart * ROW_HEIGHT;
        const bottom = (rowEnd + 1) * ROW_HEIGHT;
        const height = bottom - top;

        const parts = [];
        let partStart = columnStart;
        let partMode = resolveColumnPin(columns[columnStart]) || "none";

        for (let columnIndex = columnStart + 1; columnIndex <= columnEnd; columnIndex += 1) {
            const column = columns[columnIndex];
            const mode = resolveColumnPin(column) || "none";
            if (mode === partMode) {
                continue;
            }
            parts.push({
                startColumnIndex: partStart,
                endColumnIndex: columnIndex - 1,
                mode: partMode,
            });
            partStart = columnIndex;
            partMode = mode;
        }
        parts.push({
            startColumnIndex: partStart,
            endColumnIndex: columnEnd,
            mode: partMode,
        });

        return parts.map((part, index) => {
            const startMetric = resolvedMetrics[part.startColumnIndex];
            const endMetric = resolvedMetrics[part.endColumnIndex];
            if (!startMetric || !endMetric) {
                return null;
            }

            let segmentLeft = startMetric.start;
            if (part.mode === "left") {
                segmentLeft = startMetric.start + viewport.scrollLeft;
            } else if (part.mode === "right") {
                const offsetInsideRightLayer = startMetric.start - (leftWidth + scrollWidth);
                segmentLeft = viewport.scrollLeft + viewport.clientWidth - rightWidth + offsetInsideRightLayer;
            }

            let right = endMetric.end;
            if (part.mode === "left") {
                right = endMetric.end + viewport.scrollLeft;
            } else if (part.mode === "right") {
                const endOffsetInsideRightLayer = (endMetric.start - (leftWidth + scrollWidth)) + endMetric.width;
                right = viewport.scrollLeft + viewport.clientWidth - rightWidth + endOffsetInsideRightLayer;
            }
            const width = Math.max(1, right - segmentLeft);

            return {
                key: `${part.mode}-${rowStart}-${rowEnd}-${part.startColumnIndex}-${part.endColumnIndex}-${index}`,
                mode: part.mode,
                left: segmentLeft,
                top,
                width,
                height,
            };
        }).filter(Boolean);
    }

    function renderOverlaySegments(rootNode, segments, mode = "main") {
        if (!(rootNode instanceof HTMLElement)) {
            return;
        }
        if (!segments.length) {
            rootNode.hidden = true;
            rootNode.innerHTML = "";
            return;
        }
        rootNode.hidden = false;
        rootNode.innerHTML = "";

        const fragment = document.createDocumentFragment();
        segments.forEach((segment) => {
            const node = document.createElement("div");
            node.className = "affino-datagrid-demo__selection-overlay-segment";
            if (mode === "fill") {
                node.classList.add("affino-datagrid-demo__selection-overlay-segment--fill");
            }
            if (segment.mode === "left") {
                node.classList.add("affino-datagrid-demo__selection-overlay-segment--left");
            } else if (segment.mode === "right") {
                node.classList.add("affino-datagrid-demo__selection-overlay-segment--right");
            } else {
                node.classList.add("affino-datagrid-demo__selection-overlay-segment--scroll");
            }
            node.style.left = `${segment.left}px`;
            node.style.top = `${segment.top}px`;
            node.style.width = `${segment.width}px`;
            node.style.height = `${segment.height}px`;
            fragment.appendChild(node);
        });
        rootNode.appendChild(fragment);
    }

    function renderSelectionOverlay(columns, metrics) {
        renderOverlaySegments(selectionOverlay, buildOverlaySegmentsForRange(selectionRange, columns, metrics), "main");
    }

    function renderFillOverlay(columns, metrics) {
        renderOverlaySegments(fillOverlay, buildOverlaySegmentsForRange(fillPreviewRange, columns, metrics), "fill");
    }

    function renderMeta(rowCount, start, end, options = {}) {
        const visibleColumnsWindow = options.visibleColumnsWindow ?? { start: 0, end: 0, total: 0 };
        const selectionSummary = options.selectionSummary ?? {
            latencySum: null,
            latencyAvg: null,
            ownerDistinct: 0,
        };

        if (totalNode) totalNode.textContent = String(sourceRows.length);
        const projectedLeafCount = resolveProjectedLeafCount();
        if (filteredNode) filteredNode.textContent = String(projectedLeafCount);
        if (windowNode) {
            windowNode.textContent = rowCount > 0 && end >= start
                ? `${start + 1}-${end + 1}`
                : "0-0";
        }
        if (selectedNode) {
            selectedNode.textContent = String(getSelectedCellCount());
        }
        if (anchorNode) {
            anchorNode.textContent = formatCellLabel(selectionAnchor);
        }
        if (activeCellNode) {
            activeCellNode.textContent = activeCellLabel;
        }
        if (groupedNode) {
            groupedNode.textContent = groupMode !== "none" ? groupMode : "None";
        }
        if (projectionStaleNode) {
            const staleStages = Array.isArray(projectionDiagnostics?.staleStages)
                ? projectionDiagnostics.staleStages
                : [];
            projectionStaleNode.textContent = staleStages.length > 0 ? staleStages.join(", ") : "none";
        }
        if (projectionCycleNode) {
            const cycleVersion = projectionDiagnostics?.cycleVersion ?? projectionDiagnostics?.version ?? 0;
            projectionCycleNode.textContent = String(cycleVersion);
        }
        if (projectionRecomputeNode) {
            const recomputeVersion = projectionDiagnostics?.recomputeVersion ?? 0;
            projectionRecomputeNode.textContent = String(recomputeVersion);
        }
        if (advancedFilterNode) {
            advancedFilterNode.textContent = advancedFilterMode === "none" ? "None" : advancedFilterMode;
        }
        if (visibleColumnsWindowNode) {
            visibleColumnsWindowNode.textContent = visibleColumnsWindow.total > 0
                ? `${visibleColumnsWindow.start}-${visibleColumnsWindow.end} / ${visibleColumnsWindow.total}`
                : "0-0 / 0";
        }
        if (selectedLatencySumNode) {
            selectedLatencySumNode.textContent = Number.isFinite(selectionSummary.latencySum)
                ? String(Math.round(selectionSummary.latencySum))
                : "—";
        }
        if (selectedLatencyAvgNode) {
            selectedLatencyAvgNode.textContent = Number.isFinite(selectionSummary.latencyAvg)
                ? Number(selectionSummary.latencyAvg).toFixed(1)
                : "—";
        }
        if (selectedOwnersNode) {
            selectedOwnersNode.textContent = String(selectionSummary.ownerDistinct ?? 0);
        }
        if (statusNode) {
            statusNode.textContent = statusMessage;
        }
        if (filterIndicatorNode) {
            if (!query && advancedFilterMode === "none") {
                filterIndicatorNode.textContent = "Quick filter: all rows";
            } else {
                const quickFilterPart = query ? `"${query}"` : "all rows";
                const advancedPart = advancedFilterMode === "none" ? "" : ` · advanced: ${advancedFilterMode}`;
                filterIndicatorNode.textContent = `Quick filter: ${quickFilterPart}${advancedPart} · ${projectedLeafCount}/${sourceRows.length}`;
            }
        }
        updateActionButtons();
    }

    function render() {
        const rowSnapshot = api.rows.getSnapshot();
        const rowRevision = Number.isFinite(rowSnapshot?.revision) ? rowSnapshot.revision : 0;
        const renderScrollTop = viewport.scrollTop;
        const renderScrollLeft = viewport.scrollLeft;
        const rowCount = api.rows.getCount();
        const viewportHeight = Math.max(viewport.clientHeight, ROW_HEIGHT);
        const visibleRows = Math.max(1, Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2);
        const start = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
        const end = rowCount > 0 ? Math.min(rowCount - 1, start + visibleRows - 1) : -1;

        api.view.setViewportRange({ start: Math.max(0, start), end: Math.max(0, end) });

        const visibleColumns = getColumnSnapshot().visibleColumns ?? [];
        const columnLayout = useDataGridColumnLayoutOrchestration({
            columns: visibleColumns,
            resolveColumnWidth,
            virtualWindow: buildColumnVirtualWindow({
                rowStart: start,
                rowEnd: end,
                rowTotal: rowCount,
                colTotal: visibleColumns.length,
            }),
        });
        const orderedColumns = columnLayout.orderedColumns;
        const columnMetrics = columnLayout.orderedColumnMetrics;
        const columnLayers = buildDataGridColumnLayers(columnLayout);
        const layerTrackTemplate = resolveDataGridLayerTrackTemplate(columnLayers);
        const visibleColumnsWindow = columnLayout.visibleColumnsWindow;
        const selectionSummary = resolveSelectionSummaryCached(orderedColumns, rowRevision);
        const tableWidth = orderedColumns.reduce((total, column) => total + resolveColumnWidth(column), 0);
        updatePointerLayoutCache(orderedColumns, columnMetrics);

        const nextHeaderSignature = resolveHeaderRenderSignature(columnLayers, layerTrackTemplate);
        if (nextHeaderSignature !== headerRenderSignature) {
            renderHeader(columnLayers, layerTrackTemplate);
            headerRenderSignature = nextHeaderSignature;
        }
        const nextRowsSignature = resolveRowsRenderSignature({
            start,
            end,
            rowRevision,
            headerSignature: nextHeaderSignature,
        });
        renderRows(orderedColumns, columnLayers, layerTrackTemplate, start, end, nextRowsSignature);
        renderSelectionOverlay(orderedColumns, columnMetrics);
        renderFillOverlay(orderedColumns, columnMetrics);

        const tableWidthCss = `${Math.max(tableWidth, viewport.clientWidth)}px`;
        header.style.width = tableWidthCss;
        rowsHost.style.width = tableWidthCss;
        spacerTop.style.width = tableWidthCss;
        spacerBottom.style.width = tableWidthCss;
        if (overlayLayer instanceof HTMLElement) {
            overlayLayer.style.top = "0px";
            overlayLayer.style.left = "0px";
            overlayLayer.style.width = tableWidthCss;
            overlayLayer.style.height = `${Math.max(0, rowCount * ROW_HEIGHT)}px`;
        }

        spacerTop.style.height = `${Math.max(0, start * ROW_HEIGHT)}px`;
        spacerBottom.style.height = `${Math.max(0, (rowCount - Math.max(end + 1, 0)) * ROW_HEIGHT)}px`;

        if (viewport.scrollTop !== renderScrollTop || viewport.scrollLeft !== renderScrollLeft) {
            setViewportScroll(renderScrollTop, renderScrollLeft, "render-stabilize");
        }

        renderMeta(rowCount, start, end, {
            visibleColumnsWindow,
            selectionSummary,
        });
        if (editingCell) {
            requestAnimationFrame(() => {
                focusInlineEditor();
            });
        }
    }

    applyColumnVisibilityPreset();
    applyProjection({ resetScroll: true });

    return () => {
        stopFillDrag(false);
        managedWheelScroll.reset();
        viewport.removeEventListener("wheel", onViewportWheel);
        viewport.removeEventListener("scroll", onScroll);
        searchInput?.removeEventListener("input", onSearch);
        sortSelect?.removeEventListener("change", onSort);
        sizeSelect?.removeEventListener("change", onSize);
        groupSelect?.removeEventListener("change", onGroup);
        visibilitySelect?.removeEventListener("change", onVisibility);
        advancedFilterSelect?.removeEventListener("change", onAdvancedFilter);
        pinStatusToggle?.removeEventListener("change", onPinStatus);
        autoReapplyToggle?.removeEventListener("change", onAutoReapply);
        reapplyButton?.removeEventListener("click", onReapply);
        shiftButton?.removeEventListener("click", onShift);
        undoButton?.removeEventListener("click", onUndo);
        redoButton?.removeEventListener("click", onRedo);
        resetButton?.removeEventListener("click", onReset);
        clearFilterButton?.removeEventListener("click", onClearFilter);
        contextMenuButtons.forEach((button) => {
            button.removeEventListener("click", onMenuActionClick);
        });
        contextMenu?.removeEventListener("keydown", onContextMenuKeydown);
        root.removeEventListener("keydown", onRootKeydown);
        root.removeEventListener("pointerdown", onGlobalPointerDown, true);

        if (frameHandle !== null) {
            window.cancelAnimationFrame(frameHandle);
            frameHandle = null;
        }

        unsubscribeProjectionDiagnostics();
        void core.dispose();
    };
}

function readPositiveNumber(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.trunc(parsed);
}

function buildRows(size, seed) {
    const services = [
        "edge-gateway",
        "identity-api",
        "billing-sync",
        "search-indexer",
        "audit-stream",
        "ops-console",
        "realtime-feed",
        "notification-router",
    ];
    const owners = ["NOC", "Infra", "Platform", "Growth", "Payments", "Data"];
    const regions = ["us-east", "us-west", "eu-central", "ap-south"];
    const severities = ["critical", "high", "medium", "low"];
    const environments = ["prod", "staging", "dev"];

    return Array.from({ length: size }, (_, index) => {
        const latencyMs = 110 + ((index * 31 + seed * 19) % 340);
        const errorRate = (index * 11 + seed * 7) % 14;
        const availabilityPct = Number((99.98 - errorRate * 0.17 - (latencyMs - 90) * 0.0025).toFixed(2));
        return {
            rowId: `row-${seed}-${index + 1}`,
            service: `${services[index % services.length]}-${(index % 12) + 1}`,
            owner: owners[index % owners.length] || owners[0],
            region: regions[index % regions.length] || regions[0],
            environment: environments[index % environments.length] || "prod",
            deployment: `release-2026.${Math.floor(index / 140) + 1}.${(index % 28) + 1}`,
            severity: severities[(index + seed) % severities.length] || "medium",
            latencyMs,
            errorRate,
            availabilityPct: Math.max(96.4, Math.min(99.99, availabilityPct)),
            throughputRps: 180 + ((index * 17 + seed * 13) % 980),
            updatedAt: resolveTimestamp(index + seed),
            status: resolveStatus(latencyMs, errorRate),
        };
    });
}

function resolveTimestamp(seed) {
    const minute = seed % 60;
    const hour = Math.floor(seed / 6) % 24;
    return `2026-02-09 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} UTC`;
}

function resolveStatus(latencyMs, errorRate) {
    if (latencyMs > 380 || errorRate > 10) {
        return "degraded";
    }
    if (latencyMs > 270 || errorRate > 5) {
        return "watch";
    }
    return "stable";
}

function orderColumns(columns) {
    const left = [];
    const center = [];
    const right = [];
    columns.forEach((column) => {
        const pin = resolveColumnPin(column);
        if (pin === "left") {
            left.push(column);
        } else if (pin === "right") {
            right.push(column);
        } else {
            center.push(column);
        }
    });
    return [...left, ...center, ...right];
}

function formatCellValue(key, value) {
    if (key === "latencyMs" && Number.isFinite(value)) {
        return `${Math.round(value)} ms`;
    }
    if ((key === "errorRate" || key === "throughputRps") && Number.isFinite(value)) {
        return `${Math.round(value)}`;
    }
    if (key === "availabilityPct" && Number.isFinite(value)) {
        return `${Number(value).toFixed(2)}%`;
    }
    return String(value ?? "");
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function escapeCssToken(value) {
    if (typeof value !== "string") {
        return "";
    }
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }
    return value.replace(/["\\]/g, "\\$&");
}
