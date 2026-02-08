import {
    createClientRowModel,
    createDataGridApi,
    createDataGridColumnModel,
    createDataGridCore,
} from "@affino/datagrid-core";

const ROW_HEIGHT = 36;
const OVERSCAN_ROWS = 8;
const DEFAULT_SIZE = 3600;

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
    const viewport = root.querySelector("[data-datagrid-viewport]");
    const header = root.querySelector("[data-datagrid-header]");
    const rowsHost = root.querySelector("[data-datagrid-rows]");
    const spacerTop = root.querySelector("[data-datagrid-spacer-top]");
    const spacerBottom = root.querySelector("[data-datagrid-spacer-bottom]");

    const searchInput = root.querySelector("[data-datagrid-search]");
    const sortSelect = root.querySelector("[data-datagrid-sort]");
    const sizeSelect = root.querySelector("[data-datagrid-size]");
    const pinStatusToggle = root.querySelector("[data-datagrid-pin-status]");
    const shiftButton = root.querySelector("[data-datagrid-shift]");

    const totalNode = root.querySelector("[data-datagrid-total]");
    const filteredNode = root.querySelector("[data-datagrid-filtered]");
    const windowNode = root.querySelector("[data-datagrid-window]");

    if (!viewport || !header || !rowsHost || !spacerTop || !spacerBottom) {
        return null;
    }

    const initialSize = readPositiveNumber(root.dataset.datagridInitialRows, DEFAULT_SIZE);
    let sourceRows = buildRows(initialSize, 1);
    let activeRows = sourceRows;
    let query = "";
    let sortMode = "latency-desc";
    let generation = 1;

    const rowModel = createClientRowModel({ rows: activeRows });
    const columnModel = createDataGridColumnModel({
        columns: [
            { key: "service", label: "Service", width: 240, pin: "left" },
            { key: "owner", label: "Owner", width: 180 },
            { key: "region", label: "Region", width: 130 },
            { key: "severity", label: "Severity", width: 120 },
            { key: "latencyMs", label: "Latency (ms)", width: 130 },
            { key: "errorRate", label: "Errors / h", width: 130 },
            { key: "status", label: "Status", width: 130 },
        ],
    });

    const core = createDataGridCore({
        services: {
            rowModel: { name: "rowModel", model: rowModel },
            columnModel: { name: "columnModel", model: columnModel },
            viewport: {
                name: "viewport",
                setViewportRange(range) {
                    rowModel.setViewportRange(range);
                },
            },
        },
    });
    const api = createDataGridApi({ core });
    void api.start();

    let frameHandle = null;

    const requestRender = () => {
        if (frameHandle !== null) {
            return;
        }
        frameHandle = window.requestAnimationFrame(() => {
            frameHandle = null;
            render();
        });
    };

    const onScroll = () => {
        requestRender();
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });

    const onSearch = () => {
        query = String(searchInput?.value ?? "").trim().toLowerCase();
        applyProjection();
    };
    searchInput?.addEventListener("input", onSearch);

    const onSort = () => {
        sortMode = String(sortSelect?.value || "latency-desc");
        applyProjection();
    };
    sortSelect?.addEventListener("change", onSort);

    const onSize = () => {
        const size = readPositiveNumber(sizeSelect?.value, DEFAULT_SIZE);
        generation += 1;
        sourceRows = buildRows(size, generation);
        applyProjection();
    };
    sizeSelect?.addEventListener("change", onSize);

    const onPinStatus = () => {
        const pin = pinStatusToggle?.checked ? "left" : "none";
        api.setColumnPin("status", pin);
        requestRender();
    };
    pinStatusToggle?.addEventListener("change", onPinStatus);

    const onShift = () => {
        generation += 1;
        sourceRows = sourceRows.map((row, index) => {
            const latencyShift = ((index + generation) % 7) * 5 - 12;
            const nextLatency = Math.max(20, row.latencyMs + latencyShift);
            const nextErrors = Math.max(0, row.errorRate + ((index + generation) % 4) - 1);
            return {
                ...row,
                latencyMs: nextLatency,
                errorRate: nextErrors,
                status: resolveStatus(nextLatency, nextErrors),
            };
        });
        applyProjection();
    };
    shiftButton?.addEventListener("click", onShift);

    function applyProjection() {
        const filtered = sourceRows.filter((row) => matchesQuery(row, query));
        activeRows = sortRows(filtered, sortMode);
        rowModel.setRows(activeRows);
        viewport.scrollTop = 0;
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
            const row = document.createElement("div");
            row.className = "affino-datagrid-demo__row";
            row.style.gridTemplateColumns = templateColumns;

            columns.forEach((column) => {
                const cell = document.createElement("div");
                const value = entry.data?.[column.key];
                cell.textContent = formatCellValue(column.key, value);
                cell.className = "affino-datagrid-demo__cell";
                if (column.key === "latencyMs" || column.key === "errorRate") {
                    cell.classList.add("affino-datagrid-demo__cell--numeric");
                }
                if (column.key === "status") {
                    cell.classList.add("affino-datagrid-demo__cell--status");
                }
                applyStickyStyles(cell, column.key, stickyOffsets);
                row.appendChild(cell);
            });

            fragment.appendChild(row);
        });
        rowsHost.appendChild(fragment);
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

        if (totalNode) totalNode.textContent = String(sourceRows.length);
        if (filteredNode) filteredNode.textContent = String(activeRows.length);
        if (windowNode) {
            windowNode.textContent = rowCount > 0 && end >= start
                ? `${start + 1}-${end + 1}`
                : "0-0";
        }
    }

    applyProjection();

    return () => {
        viewport.removeEventListener("scroll", onScroll);
        searchInput?.removeEventListener("input", onSearch);
        sortSelect?.removeEventListener("change", onSort);
        sizeSelect?.removeEventListener("change", onSize);
        pinStatusToggle?.removeEventListener("change", onPinStatus);
        shiftButton?.removeEventListener("click", onShift);

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

    return Array.from({ length: size }, (_, index) => {
        const latencyMs = 110 + ((index * 31 + seed * 19) % 340);
        const errorRate = (index * 11 + seed * 7) % 14;
        return {
            rowId: `row-${seed}-${index + 1}`,
            service: `${services[index % services.length]}-${(index % 12) + 1}`,
            owner: owners[index % owners.length] || owners[0],
            region: regions[index % regions.length] || regions[0],
            severity: severities[(index + seed) % severities.length] || "medium",
            latencyMs,
            errorRate,
            status: resolveStatus(latencyMs, errorRate),
        };
    });
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
        row.severity.toLowerCase().includes(query)
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
    if (key === "errorRate" && Number.isFinite(value)) {
        return `${Math.round(value)}`;
    }
    return String(value ?? "");
}
