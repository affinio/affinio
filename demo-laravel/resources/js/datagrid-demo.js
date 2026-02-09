import { createDataGridRuntime } from "@affino/datagrid-orchestration";

const ROW_HEIGHT = 36;
const OVERSCAN_ROWS = 8;
const DEFAULT_SIZE = 3600;
const MENU_ACTION_IDS = ["copy", "cut", "paste", "clear"];

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
    const viewport = root.querySelector("[data-datagrid-viewport]");
    const header = root.querySelector("[data-datagrid-header]");
    const rowsHost = root.querySelector("[data-datagrid-rows]");
    const spacerTop = root.querySelector("[data-datagrid-spacer-top]");
    const spacerBottom = root.querySelector("[data-datagrid-spacer-bottom]");

    const searchInput = root.querySelector("[data-datagrid-search]");
    const sortSelect = root.querySelector("[data-datagrid-sort]");
    const sizeSelect = root.querySelector("[data-datagrid-size]");
    const groupSelect = root.querySelector("[data-datagrid-group]");
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
    const activeCellNode = root.querySelector("[data-datagrid-active-cell]");
    const groupedNode = root.querySelector("[data-datagrid-grouped]");
    const statusNode = root.querySelector("[data-datagrid-status]");
    const filterIndicatorNode = root.querySelector("[data-datagrid-filter-indicator]");

    if (!stage || !viewport || !header || !rowsHost || !spacerTop || !spacerBottom) {
        return null;
    }

    const initialSize = readPositiveNumber(root.dataset.datagridInitialRows, DEFAULT_SIZE);
    let sourceRows = buildRows(initialSize, 1);
    let activeRows = sourceRows;
    let query = "";
    let sortMode = "latency-desc";
    let groupMode = "none";
    let generation = 1;

    let selectedRowKey = null;
    let activeCell = null;
    let activeCellLabel = "None";
    let statusMessage = "Ready";
    let clipboardState = null;

    const undoStack = [];
    const redoStack = [];

    const menuState = {
        open: false,
        activeIndex: 0,
    };

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

    const updateActiveCell = (rowKey, columnKey, explicitRowIndex = null) => {
        if (!rowKey || !columnKey) {
            activeCell = null;
            activeCellLabel = "None";
            selectedRowKey = null;
            return;
        }
        const rowIndex = explicitRowIndex === null ? resolveActiveRowIndex(rowKey) : explicitRowIndex;
        selectedRowKey = String(rowKey);
        activeCell = {
            rowKey: String(rowKey),
            columnKey: String(columnKey),
            rowIndex: rowIndex >= 0 ? rowIndex : 0,
        };
        activeCellLabel = `R${activeCell.rowIndex + 1} · ${String(columnKey)}`;
    };

    const ensureActiveCellVisible = () => {
        if (!activeCell) {
            return;
        }
        const selector = `[data-datagrid-row-key="${escapeCssToken(activeCell.rowKey)}"][data-datagrid-column-key="${escapeCssToken(activeCell.columnKey)}"]`;
        const node = rowsHost.querySelector(selector);
        if (node instanceof HTMLElement) {
            node.focus({ preventScroll: true });
            node.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
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
        if (!activeCell) {
            setStatus("No active cell");
            return;
        }
        const value = readCellValue(activeCell.rowKey, activeCell.columnKey);
        clipboardState = {
            columnKey: activeCell.columnKey,
            value,
        };
        const text = value == null ? "" : String(value);
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                // fall back to local clipboard state
            }
        }
        setStatus(`Copied ${activeCell.columnKey}`);
    };

    const cutCell = async () => {
        if (!activeCell) {
            setStatus("No active cell");
            return;
        }
        await copyCell();
        applyCellEdit("Cut cell", activeCell.rowKey, activeCell.columnKey, "", { recordHistory: true });
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
        applyCellEdit("Pasted cell", activeCell.rowKey, activeCell.columnKey, text, { recordHistory: true });
    };

    const clearCell = () => {
        if (!activeCell) {
            setStatus("No active cell");
            return;
        }
        applyCellEdit("Cleared cell", activeCell.rowKey, activeCell.columnKey, "", { recordHistory: true });
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

    const moveActiveCell = (rowDelta, columnDelta) => {
        const columns = orderColumns(api.getColumnModelSnapshot().visibleColumns);
        if (!columns.length || !activeRows.length) {
            return;
        }
        if (!activeCell) {
            const firstRow = activeRows[0];
            if (!firstRow) {
                return;
            }
            updateActiveCell(firstRow.rowId, columns[0].key, 0);
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
        updateActiveCell(nextRow.rowId, nextColumn.key, nextRowIndex);
        setStatus(`Active cell ${activeCellLabel}`);
        requestRender();
        requestAnimationFrame(() => {
            ensureActiveCellVisible();
        });
    };

    const onRootKeydown = (event) => {
        if (menuState.open) {
            onContextMenuKeydown(event);
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

        if (event.key === "ArrowDown") {
            event.preventDefault();
            moveActiveCell(1, 0);
            return;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            moveActiveCell(-1, 0);
            return;
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            moveActiveCell(0, 1);
            return;
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveActiveCell(0, -1);
        }
    };

    const onGlobalPointerDown = (event) => {
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

    const onSize = () => {
        const size = readPositiveNumber(sizeSelect?.value, DEFAULT_SIZE);
        generation += 1;
        sourceRows = buildRows(size, generation);
        selectedRowKey = null;
        activeCell = null;
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
        selectedRowKey = null;
        activeCell = null;
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
        if (pinStatusToggle) {
            pinStatusToggle.checked = false;
        }
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
        const filtered = sourceRows.filter((row) => matchesQuery(row, query));
        activeRows = sortRows(filtered, sortMode);
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
            activeCellLabel = `R${activeCell.rowIndex + 1} · ${activeCell.columnKey}`;
        }

        if (options.resetScroll !== false) {
            viewport.scrollTop = 0;
        }
        closeContextMenu();
        requestRender();
    }

    function renderHeader(columns, templateColumns, stickyOffsets) {
        header.innerHTML = "";
        header.style.gridTemplateColumns = templateColumns;
        const fragment = document.createDocumentFragment();
        columns.forEach((column) => {
            const cell = document.createElement("div");
            cell.className = "affino-datagrid-demo__cell affino-datagrid-demo__cell--header";
            cell.textContent = column.column.label || column.key;
            applyStickyStyles(cell, column.key, stickyOffsets);
            fragment.appendChild(cell);
        });
        header.appendChild(fragment);
    }

    function renderRows(columns, templateColumns, stickyOffsets, start, end) {
        rowsHost.innerHTML = "";
        const rows = start <= end ? api.getRowsInRange({ start, end }) : [];
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
                row.style.gridTemplateColumns = templateColumns;

                const meta = entry.groupMeta;
                const groupCell = document.createElement("button");
                groupCell.type = "button";
                groupCell.className = "affino-datagrid-demo__cell affino-datagrid-demo__cell--group";
                groupCell.style.gridColumn = `1 / span ${Math.max(columns.length, 1)}`;
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
            row.style.gridTemplateColumns = templateColumns;

            const rowKey = String(entry.rowKey ?? entry.rowId ?? "");
            if (rowKey && selectedRowKey === rowKey) {
                row.classList.add("is-selected");
            }

            columns.forEach((column) => {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.dataset.datagridRowKey = rowKey;
                cell.dataset.datagridColumnKey = column.key;

                const value = entry.data?.[column.key];
                cell.textContent = formatCellValue(column.key, value);
                cell.className = "affino-datagrid-demo__cell";

                if (column.key === "latencyMs" || column.key === "errorRate" || column.key === "throughputRps") {
                    cell.classList.add("affino-datagrid-demo__cell--numeric");
                }
                if (column.key === "status") {
                    cell.classList.add("affino-datagrid-demo__cell--status");
                }
                if (activeCell && activeCell.rowKey === rowKey && activeCell.columnKey === column.key) {
                    cell.classList.add("is-active-cell");
                }

                applyStickyStyles(cell, column.key, stickyOffsets);

                cell.addEventListener("click", () => {
                    updateActiveCell(rowKey, column.key, resolveActiveRowIndex(rowKey));
                    setStatus(`Active cell ${activeCellLabel}`);
                    requestRender();
                });

                cell.addEventListener("contextmenu", (event) => {
                    event.preventDefault();
                    openContextMenu(event.clientX, event.clientY, rowKey, column.key, resolveActiveRowIndex(rowKey));
                });

                row.appendChild(cell);
            });

            fragment.appendChild(row);
        });
        rowsHost.appendChild(fragment);
    }

    function renderMeta(rowCount, start, end) {
        if (totalNode) totalNode.textContent = String(sourceRows.length);
        if (filteredNode) filteredNode.textContent = String(activeRows.length);
        if (windowNode) {
            windowNode.textContent = rowCount > 0 && end >= start
                ? `${start + 1}-${end + 1}`
                : "0-0";
        }
        if (selectedNode) {
            selectedNode.textContent = selectedRowKey ? "1" : "0";
        }
        if (activeCellNode) {
            activeCellNode.textContent = activeCellLabel;
        }
        if (groupedNode) {
            groupedNode.textContent = groupMode !== "none" ? groupMode : "None";
        }
        if (statusNode) {
            statusNode.textContent = statusMessage;
        }
        if (filterIndicatorNode) {
            if (!query) {
                filterIndicatorNode.textContent = "Quick filter: all rows";
            } else {
                filterIndicatorNode.textContent = `Quick filter: "${query}" · ${activeRows.length}/${sourceRows.length}`;
            }
        }
        updateActionButtons();
    }

    function render() {
        const rowCount = api.getRowCount();
        const viewportHeight = Math.max(viewport.clientHeight - ROW_HEIGHT, ROW_HEIGHT);
        const visibleRows = Math.max(1, Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2);
        const start = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
        const end = rowCount > 0 ? Math.min(rowCount - 1, start + visibleRows - 1) : -1;

        api.setViewportRange({ start: Math.max(0, start), end: Math.max(0, end) });

        const visibleColumns = api.getColumnModelSnapshot().visibleColumns;
        const orderedColumns = orderColumns(visibleColumns);
        const templateColumns = orderedColumns.map((column) => `${Math.max(110, column.width ?? 160)}px`).join(" ");
        const stickyOffsets = createStickyOffsets(orderedColumns);

        renderHeader(orderedColumns, templateColumns, stickyOffsets);
        renderRows(orderedColumns, templateColumns, stickyOffsets, start, end);

        spacerTop.style.height = `${Math.max(0, start * ROW_HEIGHT)}px`;
        spacerBottom.style.height = `${Math.max(0, (rowCount - Math.max(end + 1, 0)) * ROW_HEIGHT)}px`;

        renderMeta(rowCount, start, end);
    }

    applyProjection({ resetScroll: true });

    return () => {
        viewport.removeEventListener("scroll", onScroll);
        searchInput?.removeEventListener("input", onSearch);
        sortSelect?.removeEventListener("change", onSort);
        sizeSelect?.removeEventListener("change", onSize);
        groupSelect?.removeEventListener("change", onGroup);
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
        if (column.pin === "left") {
            left.push(column);
        } else if (column.pin === "right") {
            right.push(column);
        } else {
            center.push(column);
        }
    });
    return [...left, ...center, ...right];
}

function createStickyOffsets(columns) {
    const leftOffsets = new Map();
    const rightOffsets = new Map();

    let left = 0;
    columns.forEach((column) => {
        if (column.pin !== "left") {
            return;
        }
        leftOffsets.set(column.key, left);
        left += Math.max(110, column.width ?? 160);
    });

    let right = 0;
    for (let index = columns.length - 1; index >= 0; index -= 1) {
        const column = columns[index];
        if (!column || column.pin !== "right") {
            continue;
        }
        rightOffsets.set(column.key, right);
        right += Math.max(110, column.width ?? 160);
    }

    return {
        leftOffsets,
        rightOffsets,
    };
}

function applyStickyStyles(cell, key, stickyOffsets) {
    if (stickyOffsets.leftOffsets.has(key)) {
        cell.classList.add("affino-datagrid-demo__cell--sticky");
        cell.style.left = `${stickyOffsets.leftOffsets.get(key)}px`;
        cell.style.right = "auto";
        return;
    }
    if (stickyOffsets.rightOffsets.has(key)) {
        cell.classList.add("affino-datagrid-demo__cell--sticky");
        cell.style.right = `${stickyOffsets.rightOffsets.get(key)}px`;
        cell.style.left = "auto";
    }
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
