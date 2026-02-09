import { evaluateDataGridAdvancedFilterExpression } from "@affino/datagrid-core";
import {
    buildDataGridColumnLayers,
    createDataGridRuntime,
    resolveDataGridLayerTrackTemplate,
    useDataGridColumnLayoutOrchestration,
    resolveDataGridHeaderLayerViewportGeometry,
    resolveDataGridHeaderScrollSyncLeft,
} from "@affino/datagrid-orchestration";

const ROW_HEIGHT = 36;
const OVERSCAN_ROWS = 8;
const DEFAULT_SIZE = 3600;
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
    let activeRows = sourceRows;
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

    const undoStack = [];
    const redoStack = [];

    const menuState = {
        open: false,
        activeIndex: 0,
    };

    visibilityMode = String(visibilitySelect?.value || visibilityMode);
    advancedFilterMode = String(advancedFilterSelect?.value || advancedFilterMode);

    const runtime = createDataGridRuntime({
        rows: activeRows,
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
    const { api, rowModel, core } = runtime;
    void api.start();

    let frameHandle = null;
    let suppressedScrollEvents = 0;
    let lastScrollTop = viewport.scrollTop;
    let lastScrollLeft = viewport.scrollLeft;

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

    const clearHistory = () => {
        undoStack.length = 0;
        redoStack.length = 0;
        updateActionButtons();
    };

    const updateActionButtons = () => {
        if (undoButton) {
            undoButton.disabled = undoStack.length === 0;
        }
        if (redoButton) {
            redoButton.disabled = redoStack.length === 0;
        }
    };

    const isEditableColumn = (columnKey) => EDITABLE_COLUMNS.has(String(columnKey));

    const getSourceRowByKey = (rowKey) => {
        if (!rowKey) {
            return null;
        }
        return sourceRows.find((row) => String(row.rowId) === String(rowKey)) ?? null;
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
        sourceRows = sourceRows.map((row) => {
            if (String(row.rowId) !== String(rowKey)) {
                return row;
            }
            return {
                ...row,
                [columnKey]: nextValue,
            };
        });
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
        if (!rowKey) {
            return -1;
        }
        return activeRows.findIndex((row) => String(row.rowId) === String(rowKey));
    };

    const getColumnSnapshot = () => api.getColumnModelSnapshot?.() ?? { visibleColumns: [], allColumns: [] };

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
            api.setColumnVisibility(column.key, shouldBeVisible);
        });
    };

    const resolveAdvancedFilterExpression = () => {
        const expression = ADVANCED_FILTER_PRESETS[advancedFilterMode];
        return expression ?? null;
    };

    const matchesAdvancedFilter = (row) => {
        const expression = resolveAdvancedFilterExpression();
        if (!expression) {
            return true;
        }
        return evaluateDataGridAdvancedFilterExpression(expression, (condition) => row?.[condition.key]);
    };

    const resolveColumnIndex = (columnKey, columns = resolveVisibleColumns()) =>
        columns.findIndex((column) => column.key === String(columnKey));

    const normalizeSelectionRange = (anchorPoint, activePoint) => {
        if (!anchorPoint || !activePoint) {
            return null;
        }
        const startRowIndex = Math.min(anchorPoint.rowIndex, activePoint.rowIndex);
        const endRowIndex = Math.max(anchorPoint.rowIndex, activePoint.rowIndex);
        const startColumnIndex = Math.min(anchorPoint.columnIndex, activePoint.columnIndex);
        const endColumnIndex = Math.max(anchorPoint.columnIndex, activePoint.columnIndex);
        return {
            startRowIndex,
            endRowIndex,
            startColumnIndex,
            endColumnIndex,
        };
    };

    const rangesEqual = (left, right) => {
        if (!left && !right) {
            return true;
        }
        if (!left || !right) {
            return false;
        }
        return (
            left.startRowIndex === right.startRowIndex &&
            left.endRowIndex === right.endRowIndex &&
            left.startColumnIndex === right.startColumnIndex &&
            left.endColumnIndex === right.endColumnIndex
        );
    };

    const setSelectionFromActive = (extendSelection = false) => {
        if (!activeCell) {
            selectionAnchor = null;
            selectionRange = null;
            return;
        }
        if (!extendSelection || !selectionAnchor) {
            selectionAnchor = {
                rowKey: activeCell.rowKey,
                columnKey: activeCell.columnKey,
                rowIndex: activeCell.rowIndex,
                columnIndex: activeCell.columnIndex,
            };
        }
        selectionRange = normalizeSelectionRange(selectionAnchor, activeCell);
    };

    const updateActiveCell = (rowKey, columnKey, explicitRowIndex = null, options = {}) => {
        const extendSelection = Boolean(options.extendSelection);
        if (!rowKey || !columnKey) {
            activeCell = null;
            activeCellLabel = "None";
            selectedRowKey = null;
            selectionAnchor = null;
            selectionRange = null;
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
        if (!selectionRange) {
            return false;
        }
        return (
            rowIndex >= selectionRange.startRowIndex &&
            rowIndex <= selectionRange.endRowIndex &&
            columnIndex >= selectionRange.startColumnIndex &&
            columnIndex <= selectionRange.endColumnIndex
        );
    };

    const getSelectedCellCount = () => {
        if (!selectionRange) {
            return 0;
        }
        const rowsCount = selectionRange.endRowIndex - selectionRange.startRowIndex + 1;
        const columnsCount = selectionRange.endColumnIndex - selectionRange.startColumnIndex + 1;
        return Math.max(0, rowsCount * columnsCount);
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

    const countCellsInRange = (range) => {
        if (!range) {
            return 0;
        }
        const rowsCount = Math.max(0, range.endRowIndex - range.startRowIndex + 1);
        const columnsCount = Math.max(0, range.endColumnIndex - range.startColumnIndex + 1);
        return rowsCount * columnsCount;
    };

    const resolveRangeCells = (range, columns = resolveVisibleColumns()) => {
        if (!range) {
            return [];
        }
        if (!activeRows.length || !columns.length) {
            return [];
        }

        const startRowIndex = clamp(range.startRowIndex, 0, activeRows.length - 1);
        const endRowIndex = clamp(range.endRowIndex, 0, activeRows.length - 1);
        const startColumnIndex = clamp(range.startColumnIndex, 0, columns.length - 1);
        const endColumnIndex = clamp(range.endColumnIndex, 0, columns.length - 1);
        if (endRowIndex < startRowIndex || endColumnIndex < startColumnIndex) {
            return [];
        }

        const cells = [];
        for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex += 1) {
            const row = activeRows[rowIndex];
            if (!row) {
                continue;
            }
            const rowKey = String(row.rowId);
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

    const isCoordInsideRange = (range, rowIndex, columnIndex) => {
        if (!range) {
            return false;
        }
        return (
            rowIndex >= range.startRowIndex &&
            rowIndex <= range.endRowIndex &&
            columnIndex >= range.startColumnIndex &&
            columnIndex <= range.endColumnIndex
        );
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
        if (!range || !activeRows.length || !columns.length) {
            return [[""]];
        }

        const startRowIndex = clamp(range.startRowIndex, 0, activeRows.length - 1);
        const endRowIndex = clamp(range.endRowIndex, 0, activeRows.length - 1);
        const startColumnIndex = clamp(range.startColumnIndex, 0, columns.length - 1);
        const endColumnIndex = clamp(range.endColumnIndex, 0, columns.length - 1);
        const matrix = [];
        for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex += 1) {
            const row = activeRows[rowIndex];
            if (!row) {
                continue;
            }
            const values = [];
            for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex += 1) {
                const column = columns[columnIndex];
                if (!column) {
                    continue;
                }
                const value = readCellValue(row.rowId, column.key);
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
        undoStack.push({
            label,
            operations: operations.map((operation) => ({ ...operation })),
            activeCell: activeCell ? { ...activeCell } : null,
        });
        redoStack.length = 0;
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
        if (!undoStack.length) {
            setStatus("Undo stack is empty");
            return;
        }
        const transaction = undoStack.pop();
        runOperations(transaction.operations, "undo");
        redoStack.push(transaction);
        if (transaction.activeCell) {
            updateActiveCell(transaction.activeCell.rowKey, transaction.activeCell.columnKey, transaction.activeCell.rowIndex);
        }
        applyProjection({ resetScroll: false });
        updateActionButtons();
        setStatus(`Undo: ${transaction.label}`);
    };

    const redoHistory = () => {
        if (!redoStack.length) {
            setStatus("Redo stack is empty");
            return;
        }
        const transaction = redoStack.pop();
        runOperations(transaction.operations, "redo");
        undoStack.push(transaction);
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
        const text = await readClipboardText();
        const matrix = parseClipboardMatrix(text);
        const matrixHeight = Math.max(1, matrix.length);
        const matrixWidth = Math.max(1, matrix[0]?.length ?? 1);
        const columns = resolveVisibleColumns();
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
                const row = activeRows[rowIndex];
                if (!row) {
                    continue;
                }
                for (let columnOffset = 0; columnOffset < targetColumns; columnOffset += 1) {
                    const columnIndex = currentRange.startColumnIndex + columnOffset;
                    const column = columns[columnIndex];
                    if (!column || !isEditableColumn(column.key)) {
                        continue;
                    }
                    const sourceValue = matrix[rowOffset % matrixHeight]?.[columnOffset % matrixWidth] ?? "";
                    const before = readCellValue(row.rowId, column.key);
                    const after = coerceValue(column.key, sourceValue);
                    if (before === after) {
                        continue;
                    }
                    operations.push({
                        rowKey: String(row.rowId),
                        columnKey: column.key,
                        before,
                        after,
                    });
                }
            }
        } else {
            for (let rowOffset = 0; rowOffset < matrixHeight; rowOffset += 1) {
                const rowIndex = activeCell.rowIndex + rowOffset;
                const row = activeRows[rowIndex];
                if (!row) {
                    continue;
                }
                for (let columnOffset = 0; columnOffset < matrixWidth; columnOffset += 1) {
                    const columnIndex = activeCell.columnIndex + columnOffset;
                    const column = columns[columnIndex];
                    if (!column || !isEditableColumn(column.key)) {
                        continue;
                    }
                    const sourceValue = matrix[rowOffset]?.[columnOffset] ?? "";
                    const before = readCellValue(row.rowId, column.key);
                    const after = coerceValue(column.key, sourceValue);
                    if (before === after) {
                        continue;
                    }
                    operations.push({
                        rowKey: String(row.rowId),
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

    const resolvePointerCellCoord = (clientX, clientY) => {
        const target = document.elementFromPoint(clientX, clientY);
        if (!(target instanceof Element)) {
            return null;
        }
        const cell = target.closest("[data-datagrid-cell='true']");
        if (!(cell instanceof HTMLElement)) {
            return null;
        }
        const rowIndex = Number(cell.dataset.datagridRowIndex);
        const columnIndex = Number(cell.dataset.datagridColumnIndex);
        if (!Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) {
            return null;
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
        if (rangesEqual(candidate, originRange)) {
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
        if (!columns.length || !activeRows.length) {
            return false;
        }

        const sourceRowCount = Math.max(1, originRange.endRowIndex - originRange.startRowIndex + 1);
        const sourceColumnCount = Math.max(1, originRange.endColumnIndex - originRange.startColumnIndex + 1);

        const sourceMatrix = Array.from({ length: sourceRowCount }, (_, rowOffset) => {
            const sourceRow = activeRows[originRange.startRowIndex + rowOffset];
            return Array.from({ length: sourceColumnCount }, (_, columnOffset) => {
                const sourceColumn = columns[originRange.startColumnIndex + columnOffset];
                if (!sourceRow || !sourceColumn) {
                    return "";
                }
                return readCellValue(sourceRow.rowId, sourceColumn.key);
            });
        });

        const operations = [];
        for (let rowIndex = previewRange.startRowIndex; rowIndex <= previewRange.endRowIndex; rowIndex += 1) {
            const row = activeRows[rowIndex];
            if (!row) {
                continue;
            }
            for (let columnIndex = previewRange.startColumnIndex; columnIndex <= previewRange.endColumnIndex; columnIndex += 1) {
                if (isCoordInsideRange(originRange, rowIndex, columnIndex)) {
                    continue;
                }
                const column = columns[columnIndex];
                if (!column || !isEditableColumn(column.key)) {
                    continue;
                }

                const sourceRowOffset = positiveModulo(rowIndex - originRange.startRowIndex, sourceRowCount);
                const sourceColumnOffset = positiveModulo(columnIndex - originRange.startColumnIndex, sourceColumnCount);
                const sourceValue = sourceMatrix[sourceRowOffset]?.[sourceColumnOffset] ?? "";

                const before = readCellValue(row.rowId, column.key);
                const after = coerceValue(column.key, sourceValue);
                if (before === after) {
                    continue;
                }
                operations.push({
                    rowKey: String(row.rowId),
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

        if (apply) {
            commitFillPreview();
        }

        fillDragSession = null;
        fillPreviewRange = null;
        requestRender();
    };

    const onFillDragPointerMove = (event) => {
        if (!fillDragSession) {
            return;
        }
        fillPointerClient = {
            x: event.clientX,
            y: event.clientY,
        };
        const coord = resolvePointerCellCoord(event.clientX, event.clientY);
        const nextPreview = resolveFillPreviewRange(fillDragSession.originRange, coord);
        if (!rangesEqual(nextPreview, fillPreviewRange)) {
            fillPreviewRange = nextPreview;
            requestRender();
        }
        if (fillAutoScrollFrame === null) {
            fillAutoScrollFrame = window.requestAnimationFrame(runFillAutoScrollStep);
        }
    };

    const onFillDragPointerUp = (event) => {
        if (!fillDragSession) {
            return;
        }
        event.preventDefault();
        stopFillDrag(true);
    };

    const onFillDragPointerCancel = () => {
        stopFillDrag(false);
    };

    const startFillDrag = (event) => {
        if (event.button !== 0) {
            return;
        }
        const originRange = resolveEffectiveSelectionRange();
        if (!originRange) {
            return;
        }
        fillDragSession = {
            originRange: { ...originRange },
        };
        fillPreviewRange = null;
        fillPointerClient = {
            x: event.clientX,
            y: event.clientY,
        };
        closeContextMenu();
        root.classList.add("is-fill-dragging");

        window.addEventListener("pointermove", onFillDragPointerMove, true);
        window.addEventListener("pointerup", onFillDragPointerUp, true);
        window.addEventListener("pointercancel", onFillDragPointerCancel, true);
        if (fillAutoScrollFrame === null) {
            fillAutoScrollFrame = window.requestAnimationFrame(runFillAutoScrollStep);
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
            if (!rangesEqual(nextPreview, fillPreviewRange)) {
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
        if (!columns.length || !activeRows.length) {
            return;
        }
        if (!activeCell) {
            const firstRow = activeRows[0];
            if (!firstRow) {
                return;
            }
            updateActiveCell(firstRow.rowId, columns[0].key, 0, { extendSelection });
            requestRender();
            return;
        }
        const currentRowIndex = resolveActiveRowIndex(activeCell.rowKey);
        const currentColumnIndex = columns.findIndex((column) => column.key === activeCell.columnKey);

        const nextRowIndex = clamp(currentRowIndex + rowDelta, 0, activeRows.length - 1);
        const nextColumnIndex = clamp(currentColumnIndex + columnDelta, 0, columns.length - 1);

        const nextRow = activeRows[nextRowIndex];
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
            if (!rangesEqual(nextPreview, fillPreviewRange)) {
                fillPreviewRange = nextPreview;
            }
        }
        closeContextMenu();
        requestRender();
    };
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
        sourceRows = buildRows(size, generation);
        selectedRowKey = null;
        activeCell = null;
        selectionAnchor = null;
        selectionRange = null;
        activeCellLabel = "None";
        clearHistory();
        setStatus(`Dataset resized: ${size} rows`);
        applyProjection({ resetScroll: true });
    };
    sizeSelect?.addEventListener("change", onSize);

    const onPinStatus = () => {
        const pin = pinStatusToggle?.checked ? "left" : "none";
        api.setColumnPin("status", pin);
        setStatus(pin === "left" ? "Status column pinned" : "Status column unpinned");
        requestRender();
    };
    pinStatusToggle?.addEventListener("change", onPinStatus);

    const onShift = () => {
        generation += 1;
        sourceRows = sourceRows.map((row, index) => {
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
        });
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
        sourceRows = buildRows(size, generation);
        query = "";
        sortMode = "latency-desc";
        groupMode = "none";
        visibilityMode = "all";
        advancedFilterMode = "none";
        selectedRowKey = null;
        activeCell = null;
        selectionAnchor = null;
        selectionRange = null;
        activeCellLabel = "None";
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
        applyColumnVisibilityPreset();
        api.setColumnPin("status", "none");
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
        const advancedExpression = resolveAdvancedFilterExpression();
        const filtered = sourceRows.filter((row) => {
            if (!matchesQuery(row, query)) {
                return false;
            }
            return matchesAdvancedFilter(row);
        });
        activeRows = sortRows(filtered, sortMode);
        rowModel.setFilterModel({
            columnFilters: {},
            advancedFilters: {},
            advancedExpression,
        });
        rowModel.setRows(activeRows);

        if (groupMode === "none") {
            api.setGroupBy(null);
        } else {
            api.setGroupBy({
                fields: [groupMode],
                expandedByDefault: true,
            });
        }

        if (selectedRowKey && !activeRows.some((row) => String(row.rowId) === selectedRowKey)) {
            selectedRowKey = null;
        }
        if (activeCell && !activeRows.some((row) => String(row.rowId) === activeCell.rowKey)) {
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
        if (selectionAnchor && !activeRows.some((row) => String(row.rowId) === selectionAnchor.rowKey)) {
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

        const visibleColumns = resolveVisibleColumns();
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
        if (editingCell && !activeRows.some((row) => String(row.rowId) === editingCell.rowKey)) {
            editingCell = null;
        }

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

    function renderRows(columns, layers, layerTrackTemplate, start, end) {
        rowsHost.innerHTML = "";
        const handleRange = resolveEffectiveSelectionRange();
        const rows = start <= end ? api.getRowsInRange({ start, end }) : [];
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
                groupCell.textContent = `${expanded ? "▾" : "▸"} ${field}: ${value} (${count})`;
                groupCell.addEventListener("click", () => {
                    if (meta?.groupKey) {
                        api.toggleGroup(meta.groupKey);
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

            const rowKey = String(entry.rowKey ?? entry.rowId ?? "");
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

    function resolveSelectionSummary(columns) {
        const range = resolveEffectiveSelectionRange();
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

    function buildOverlaySegmentsForRange(range, columns, metrics) {
        if (!range || !columns.length || activeRows.length === 0) {
            return [];
        }
        const maxRowIndex = Math.max(0, activeRows.length - 1);
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

        const top = rowStart * ROW_HEIGHT - viewport.scrollTop;
        const bottom = (rowEnd + 1) * ROW_HEIGHT - viewport.scrollTop;
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

            let segmentLeft = startMetric.start - viewport.scrollLeft;
            if (part.mode === "left") {
                segmentLeft = startMetric.start;
            } else if (part.mode === "right") {
                const offsetInsideRightLayer = startMetric.start - (leftWidth + scrollWidth);
                segmentLeft = viewport.clientWidth - rightWidth + offsetInsideRightLayer;
            }

            let right = endMetric.end - viewport.scrollLeft;
            if (part.mode === "left") {
                right = endMetric.end;
            } else if (part.mode === "right") {
                const endOffsetInsideRightLayer = (endMetric.start - (leftWidth + scrollWidth)) + endMetric.width;
                right = viewport.clientWidth - rightWidth + endOffsetInsideRightLayer;
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
        if (filteredNode) filteredNode.textContent = String(activeRows.length);
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
                filterIndicatorNode.textContent = `Quick filter: ${quickFilterPart}${advancedPart} · ${activeRows.length}/${sourceRows.length}`;
            }
        }
        updateActionButtons();
    }

    function render() {
        const renderScrollTop = viewport.scrollTop;
        const renderScrollLeft = viewport.scrollLeft;
        const rowCount = api.getRowCount();
        const viewportHeight = Math.max(viewport.clientHeight, ROW_HEIGHT);
        const visibleRows = Math.max(1, Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2);
        const start = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
        const end = rowCount > 0 ? Math.min(rowCount - 1, start + visibleRows - 1) : -1;

        api.setViewportRange({ start: Math.max(0, start), end: Math.max(0, end) });

        const visibleColumns = getColumnSnapshot().visibleColumns ?? [];
        const columnLayout = useDataGridColumnLayoutOrchestration({
            columns: visibleColumns,
            resolveColumnWidth,
            viewportWidth: viewport.clientWidth,
            scrollLeft: viewport.scrollLeft,
        });
        const orderedColumns = columnLayout.orderedColumns;
        const columnMetrics = columnLayout.orderedColumnMetrics;
        const columnLayers = buildDataGridColumnLayers(columnLayout);
        const layerTrackTemplate = resolveDataGridLayerTrackTemplate(columnLayers);
        const visibleColumnsWindow = columnLayout.visibleColumnsWindow;
        const selectionSummary = resolveSelectionSummary(orderedColumns);
        const tableWidth = orderedColumns.reduce((total, column) => total + resolveColumnWidth(column), 0);

        renderHeader(columnLayers, layerTrackTemplate);
        renderRows(orderedColumns, columnLayers, layerTrackTemplate, start, end);
        renderSelectionOverlay(orderedColumns, columnMetrics);
        renderFillOverlay(orderedColumns, columnMetrics);

        const tableWidthCss = `${Math.max(tableWidth, viewport.clientWidth)}px`;
        header.style.width = tableWidthCss;
        rowsHost.style.width = tableWidthCss;
        spacerTop.style.width = tableWidthCss;
        spacerBottom.style.width = tableWidthCss;
        if (headerViewport instanceof HTMLElement) {
            headerViewport.scrollLeft = renderScrollLeft;
        }
        if (overlayLayer instanceof HTMLElement) {
            const geometry = resolveDataGridHeaderLayerViewportGeometry({
                headerViewportHeight: headerViewport instanceof HTMLElement ? headerViewport.offsetHeight : ROW_HEIGHT,
                bodyViewportWidth: viewport.clientWidth,
                bodyViewportHeight: viewport.clientHeight,
            });
            overlayLayer.style.top = `${geometry.overlayTop}px`;
            overlayLayer.style.height = `${geometry.overlayHeight}px`;
            overlayLayer.style.width = `${geometry.overlayWidth}px`;
        }

        spacerTop.style.height = `${Math.max(0, start * ROW_HEIGHT)}px`;
        spacerBottom.style.height = `${Math.max(0, (rowCount - Math.max(end + 1, 0)) * ROW_HEIGHT)}px`;

        if (viewport.scrollTop !== renderScrollTop || viewport.scrollLeft !== renderScrollLeft) {
            setViewportScroll(renderScrollTop, renderScrollLeft, "render-stabilize");
        }
        syncHeaderScroll();

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
        viewport.removeEventListener("scroll", onScroll);
        searchInput?.removeEventListener("input", onSearch);
        sortSelect?.removeEventListener("change", onSort);
        sizeSelect?.removeEventListener("change", onSize);
        groupSelect?.removeEventListener("change", onGroup);
        visibilitySelect?.removeEventListener("change", onVisibility);
        advancedFilterSelect?.removeEventListener("change", onAdvancedFilter);
        pinStatusToggle?.removeEventListener("change", onPinStatus);
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

function matchesQuery(row, query) {
    if (!query) {
        return true;
    }
    return (
        row.service.toLowerCase().includes(query) ||
        row.owner.toLowerCase().includes(query) ||
        row.region.toLowerCase().includes(query) ||
        row.environment.toLowerCase().includes(query) ||
        row.severity.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
    );
}

function sortRows(rows, mode) {
    const next = [...rows];
    switch (mode) {
        case "latency-asc":
            return next.sort((a, b) => a.latencyMs - b.latencyMs);
        case "errors-desc":
            return next.sort((a, b) => b.errorRate - a.errorRate);
        case "service-asc":
            return next.sort((a, b) => a.service.localeCompare(b.service));
        case "availability-desc":
            return next.sort((a, b) => b.availabilityPct - a.availabilityPct);
        case "latency-desc":
        default:
            return next.sort((a, b) => b.latencyMs - a.latencyMs);
    }
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
