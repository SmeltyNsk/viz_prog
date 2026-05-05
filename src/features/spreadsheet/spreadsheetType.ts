export type CellValue = string | number | boolean | null;

export type CellType = 'string' | 'number' | 'formula' | 'boolean' | 'date' | 'empty';

export interface CellData {
  id: string;
  address: string;
  rawValue: string;
  computedValue: CellValue;
  type: CellType;
}

export interface SpreadsheetData {
  rows: number;
  columns: number;
  cells: CellData[][];
}

export interface CellPosition {
    rowIndex: number;
    columnIndex: number;
}

export interface SelectedCell {
    address: string;
    rowIndex: number;
    columnIndex: number;
}