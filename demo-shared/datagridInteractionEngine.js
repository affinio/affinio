const resolveFiniteNumber = (range, primaryKey, fallbackKey) => {
  const candidate = range?.[primaryKey] ?? range?.[fallbackKey]
  const value = Number(candidate)
  return Number.isFinite(value) ? value : null
}

const resolveSelectionPoint = (point) => {
  if (!point || typeof point !== "object") {
    return null
  }
  const rowKey = point.rowKey
  if (typeof rowKey !== "string" && typeof rowKey !== "number") {
    return null
  }
  const columnKey = typeof point.columnKey === "string" ? point.columnKey : ""
  if (columnKey.length === 0) {
    return null
  }
  const rowIndex = Number(point.rowIndex)
  const columnIndex = Number(point.columnIndex)
  if (!Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) {
    return null
  }
  return {
    rowKey,
    columnKey,
    rowIndex,
    columnIndex,
  }
}

const resolveRangeBounds = (range) => {
  if (!range || typeof range !== "object") {
    return null
  }
  const startRow = resolveFiniteNumber(range, "startRowIndex", "startRow")
  const endRow = resolveFiniteNumber(range, "endRowIndex", "endRow")
  const startColumn = resolveFiniteNumber(range, "startColumnIndex", "startColumn")
  const endColumn = resolveFiniteNumber(range, "endColumnIndex", "endColumn")
  if (
    startRow === null ||
    endRow === null ||
    startColumn === null ||
    endColumn === null
  ) {
    return null
  }
  return {
    startRow,
    endRow,
    startColumn,
    endColumn,
  }
}

export const normalizeSelectionRange = (anchorPoint, activePoint) => {
  const normalizedAnchorPoint = resolveSelectionPoint(anchorPoint)
  const normalizedActivePoint = resolveSelectionPoint(activePoint)
  if (!normalizedAnchorPoint || !normalizedActivePoint) {
    return null
  }
  return {
    startRowIndex: Math.min(normalizedAnchorPoint.rowIndex, normalizedActivePoint.rowIndex),
    endRowIndex: Math.max(normalizedAnchorPoint.rowIndex, normalizedActivePoint.rowIndex),
    startColumnIndex: Math.min(normalizedAnchorPoint.columnIndex, normalizedActivePoint.columnIndex),
    endColumnIndex: Math.max(normalizedAnchorPoint.columnIndex, normalizedActivePoint.columnIndex),
  }
}

export const rangeEquals = (left, right) => {
  if (left == null && right == null) {
    return true
  }
  const leftBounds = resolveRangeBounds(left)
  const rightBounds = resolveRangeBounds(right)
  if (!leftBounds || !rightBounds) {
    return false
  }
  return (
    leftBounds.startRow === rightBounds.startRow &&
    leftBounds.endRow === rightBounds.endRow &&
    leftBounds.startColumn === rightBounds.startColumn &&
    leftBounds.endColumn === rightBounds.endColumn
  )
}

export const isCellInRange = (range, rowIndex, columnIndex) => {
  const bounds = resolveRangeBounds(range)
  if (!bounds) {
    return false
  }
  return (
    rowIndex >= bounds.startRow &&
    rowIndex <= bounds.endRow &&
    columnIndex >= bounds.startColumn &&
    columnIndex <= bounds.endColumn
  )
}

export const isRangeFocusCell = (range, rowIndex, columnIndex) => {
  const bounds = resolveRangeBounds(range)
  if (!bounds) {
    return false
  }
  return rowIndex === bounds.endRow && columnIndex === bounds.endColumn
}

// Backward-compatible alias for existing imports.
export const isRangeEndpoint = isRangeFocusCell

export const countCellsInRange = (range) => {
  const bounds = resolveRangeBounds(range)
  if (!bounds) {
    return 0
  }
  const rowsCount = Math.max(0, bounds.endRow - bounds.startRow + 1)
  const columnsCount = Math.max(0, bounds.endColumn - bounds.startColumn + 1)
  return rowsCount * columnsCount
}

export const resolveSelectionTransition = ({
  activeCell,
  selectionAnchor,
  extendSelection,
}) => {
  const normalizedActiveCell = resolveSelectionPoint(activeCell)
  const normalizedSelectionAnchor = resolveSelectionPoint(selectionAnchor)
  if (!normalizedActiveCell) {
    return {
      selectionAnchor: null,
      selectionRange: null,
    }
  }
  const nextSelectionAnchor = (!extendSelection || !normalizedSelectionAnchor)
    ? {
      rowKey: normalizedActiveCell.rowKey,
      columnKey: normalizedActiveCell.columnKey,
      rowIndex: normalizedActiveCell.rowIndex,
      columnIndex: normalizedActiveCell.columnIndex,
    }
    : normalizedSelectionAnchor
  return {
    selectionAnchor: nextSelectionAnchor,
    selectionRange: normalizeSelectionRange(nextSelectionAnchor, normalizedActiveCell),
  }
}

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value)
    } catch {
      // Fall through to manual clone for non-cloneable payloads.
    }
  }
  if (Array.isArray(value)) {
    return value.map(entry => cloneValue(entry))
  }
  if (value && typeof value === "object") {
    const clone = {}
    Object.keys(value).forEach((key) => {
      clone[key] = cloneValue(value[key])
    })
    return clone
  }
  return value
}

const cloneHistoryTransaction = (transaction) => ({
  label: String(transaction?.label ?? ""),
  operations: Array.isArray(transaction?.operations)
    ? transaction.operations.map(operation => cloneValue(operation))
    : [],
  activeCell: resolveSelectionPoint(transaction?.activeCell),
})

const resolveMaxHistoryDepth = (candidate, fallback = 200) => {
  const value = Number(candidate)
  if (!Number.isFinite(value) || value <= 0) {
    return fallback
  }
  return Math.max(1, Math.round(value))
}

const enforceStackLimit = (stack, limit) => {
  if (stack.length <= limit) {
    return
  }
  stack.splice(0, stack.length - limit)
}

export const createInteractionHistoryStore = (options = {}) => {
  const maxDepth = resolveMaxHistoryDepth(options.maxDepth, 200)
  const undoStack = []
  const redoStack = []

  return {
    clear() {
      undoStack.length = 0
      redoStack.length = 0
    },
    push(transaction) {
      const nextTransaction = cloneHistoryTransaction(transaction)
      if (!nextTransaction.operations.length) {
        return
      }
      undoStack.push(nextTransaction)
      enforceStackLimit(undoStack, maxDepth)
      redoStack.length = 0
    },
    undo() {
      const transaction = undoStack.pop()
      if (!transaction) {
        return null
      }
      redoStack.push(cloneHistoryTransaction(transaction))
      enforceStackLimit(redoStack, maxDepth)
      return cloneHistoryTransaction(transaction)
    },
    redo() {
      const transaction = redoStack.pop()
      if (!transaction) {
        return null
      }
      undoStack.push(cloneHistoryTransaction(transaction))
      enforceStackLimit(undoStack, maxDepth)
      return cloneHistoryTransaction(transaction)
    },
    canUndo() {
      return undoStack.length > 0
    },
    canRedo() {
      return redoStack.length > 0
    },
    undoSize() {
      return undoStack.length
    },
    redoSize() {
      return redoStack.length
    },
  }
}
