import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { createTable } from '@features/lib/tableFactory';
import { formatCellAddress } from '@features/lib/cellAddress';
import { detectCellType, evaluateFormula, getNumericCellValue, normalizeCellValue, } from '@features/lib/utils';

import type { CellData } from '@features/spreadsheet/spreadsheetType';

type CellPosition = [number, number];

interface SelectedRange {
  start: CellPosition;
  end: CellPosition;
}

interface HistoryState {
  past: CellData[][][];
  future: CellData[][][];
}

export interface SpreadsheetState {
  cells: CellData[][];
  columnWidths: number[];
  rowHeights: number[];
  activeCell: CellPosition | null;
  editingCell: CellPosition | null;
  selectedRange: SelectedRange | null;
  history: HistoryState;
}

function cloneTable(cells: CellData[][]): CellData[][] {
  return cells.map((row) => row.map((cell) => ({ ...cell })));
}

function createEmptyCell(rowIndex: number, columnIndex: number): CellData {
  const address = formatCellAddress(rowIndex, columnIndex);

  return {
    id: address,
    address,
    rawValue: '',
    computedValue: '',
    type: 'string',
  };
}

function normalizeTableAddresses(cells: CellData[][]): CellData[][] {
  return cells.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const address = formatCellAddress(rowIndex, columnIndex);

      return {
        ...cell,
        id: address,
        address,
      };
    }),
  );
}

function recalculateTable(cells: CellData[][]): CellData[][] {
  return cells.map((row) =>
    row.map((cell) => {
      if (!cell.rawValue.startsWith('=')) {
        return cell;
      }

      return {
        ...cell,
        computedValue: evaluateFormula(cell.rawValue, (address) =>
          getNumericCellValue(address, cells),
        ),
      };
    }),
  );
}

function remember(state: SpreadsheetState): void {
  state.history.past.push(cloneTable(state.cells));
  state.history.future = [];

  if (state.history.past.length > 30) {
    state.history.past.shift();
  }
}

const initialRows = 100;
const initialColumns = 26;

const initialState: SpreadsheetState = {
  cells: createTable({
    rows: initialRows,
    columns: initialColumns,
  }),
  columnWidths: Array.from({ length: initialColumns }, () => 80),
  rowHeights: Array.from({ length: initialRows }, () => 24),
  activeCell: null,
  editingCell: null,
  selectedRange: null,
  history: {
    past: [],
    future: [],
  },
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    loadTable(
      state,
      action: PayloadAction<{
        cells: CellData[][];
        rows: number;
        columns: number;
      }>,
    ) {
      state.cells = normalizeTableAddresses(action.payload.cells);
      state.columnWidths = Array.from(
        { length: action.payload.columns },
        () => 80,
      );
      state.rowHeights = Array.from({ length: action.payload.rows }, () => 24);
      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
      state.history = {
        past: [],
        future: [],
      };
    },

    setActiveCell(state, action: PayloadAction<CellPosition | null>) {
      state.activeCell = action.payload;
    },

    setSelectedRange(state, action: PayloadAction<SelectedRange | null>) {
      state.selectedRange = action.payload;
    },

    startEditing(state, action: PayloadAction<CellPosition>) {
      state.activeCell = action.payload;
      state.editingCell = action.payload;
    },

    stopEditing(state) {
      state.editingCell = null;
    },

    clearSelection(state) {
      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    setCellValue(
      state,
      action: PayloadAction<{
        rowIndex: number;
        columnIndex: number;
        value: string;
      }>,
    ) {
      const { rowIndex, columnIndex, value } = action.payload;
      const cell = state.cells[rowIndex]?.[columnIndex];

      if (!cell) {
        return;
      }

      remember(state);

      const cellType = detectCellType(value);

      cell.rawValue = value;
      cell.computedValue =
        cellType === 'formula' ? '' : normalizeCellValue(value);
      cell.type = cellType;

      state.cells = recalculateTable(state.cells);
      state.editingCell = null;
    },

    addRowAfter(state, action: PayloadAction<number>) {
      remember(state);

      const rowIndex = action.payload;
      const columnCount = state.cells[0]?.length ?? 26;
      const insertIndex = Math.min(rowIndex + 1, state.cells.length);

      const newRow = Array.from({ length: columnCount }, (_, columnIndex) =>
        createEmptyCell(insertIndex, columnIndex),
      );

      state.cells = recalculateTable(
        normalizeTableAddresses([
          ...state.cells.slice(0, insertIndex),
          newRow,
          ...state.cells.slice(insertIndex),
        ]),
      );

      state.rowHeights = [
        ...state.rowHeights.slice(0, insertIndex),
        24,
        ...state.rowHeights.slice(insertIndex),
      ];

      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    deleteRowAt(state, action: PayloadAction<number>) {
      if (state.cells.length <= 1) {
        return;
      }

      remember(state);

      const rowIndex = action.payload;

      state.cells = recalculateTable(
        normalizeTableAddresses(
          state.cells.filter((_, index) => index !== rowIndex),
        ),
      );

      state.rowHeights = state.rowHeights.filter(
        (_, index) => index !== rowIndex,
      );

      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    addColumnAfter(state, action: PayloadAction<number>) {
      remember(state);

      const columnIndex = action.payload;
      const currentColumnCount = state.cells[0]?.length ?? 0;
      const insertIndex = Math.min(columnIndex + 1, currentColumnCount);

      state.cells = recalculateTable(
        normalizeTableAddresses(
          state.cells.map((row, rowIndex) => {
            const newCell = createEmptyCell(rowIndex, insertIndex);

            return [
              ...row.slice(0, insertIndex),
              newCell,
              ...row.slice(insertIndex),
            ];
          }),
        ),
      );

      state.columnWidths = [
        ...state.columnWidths.slice(0, insertIndex),
        80,
        ...state.columnWidths.slice(insertIndex),
      ];

      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    deleteColumnAt(state, action: PayloadAction<number>) {
      const columnCount = state.cells[0]?.length ?? 0;

      if (columnCount <= 1) {
        return;
      }

      remember(state);

      const columnIndex = action.payload;

      state.cells = recalculateTable(
        normalizeTableAddresses(
          state.cells.map((row) =>
            row.filter((_, index) => index !== columnIndex),
          ),
        ),
      );

      state.columnWidths = state.columnWidths.filter(
        (_, index) => index !== columnIndex,
      );

      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    resizeColumn(
      state,
      action: PayloadAction<{
        columnIndex: number;
        width: number;
      }>,
    ) {
      state.columnWidths[action.payload.columnIndex] = action.payload.width;
    },

    resizeRow(
      state,
      action: PayloadAction<{
        rowIndex: number;
        height: number;
      }>,
    ) {
      state.rowHeights[action.payload.rowIndex] = action.payload.height;
    },

    undo(state) {
      const previous = state.history.past.pop();

      if (!previous) {
        return;
      }

      state.history.future.push(cloneTable(state.cells));
      state.cells = previous;
      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },

    redo(state) {
      const next = state.history.future.pop();

      if (!next) {
        return;
      }

      state.history.past.push(cloneTable(state.cells));
      state.cells = next;
      state.activeCell = null;
      state.editingCell = null;
      state.selectedRange = null;
    },
  },
});

export const spreadsheetActions = spreadsheetSlice.actions;
export default spreadsheetSlice.reducer;