export interface IndexRangeLike {
  startRowIndex?: number
  endRowIndex?: number
  startColumnIndex?: number
  endColumnIndex?: number
  startRow?: number
  endRow?: number
  startColumn?: number
  endColumn?: number
}

export interface SelectionPointLike {
  rowKey: string | number
  columnKey: string
  rowIndex: number
  columnIndex: number
}

export interface HistoryOperationLike {
  rowKey: string
  columnKey: string
  before: unknown
  after: unknown
}

export interface HistoryTransactionLike {
  label: string
  operations: readonly HistoryOperationLike[]
  activeCell: SelectionPointLike | null
}

export function normalizeSelectionRange(
  anchorPoint: SelectionPointLike | null | undefined,
  activePoint: SelectionPointLike | null | undefined,
): IndexRangeLike | null

export function rangeEquals(
  left: IndexRangeLike | null | undefined,
  right: IndexRangeLike | null | undefined,
): boolean

export function isCellInRange(
  range: IndexRangeLike | null | undefined,
  rowIndex: number,
  columnIndex: number,
): boolean

export function isRangeFocusCell(
  range: IndexRangeLike | null | undefined,
  rowIndex: number,
  columnIndex: number,
): boolean

/**
 * Backward-compatible alias for `isRangeFocusCell`.
 */
export function isRangeEndpoint(
  range: IndexRangeLike | null | undefined,
  rowIndex: number,
  columnIndex: number,
): boolean

export function countCellsInRange(
  range: IndexRangeLike | null | undefined,
): number

export function resolveSelectionTransition(input: {
  activeCell: SelectionPointLike | null
  selectionAnchor: SelectionPointLike | null
  extendSelection: boolean
}): {
  selectionAnchor: SelectionPointLike | null
  selectionRange: IndexRangeLike | null
}

export function createInteractionHistoryStore(options?: {
  maxDepth?: number
}): {
  clear(): void
  push(transaction: HistoryTransactionLike): void
  undo(): HistoryTransactionLike | null
  redo(): HistoryTransactionLike | null
  canUndo(): boolean
  canRedo(): boolean
  undoSize(): number
  redoSize(): number
}
