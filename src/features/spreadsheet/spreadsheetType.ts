export type CellType = 'text' | 'number' | 'formula' | 'boolean' | 'NULL';

export interface CellData {
    id: string;
    address: string;
    rawValue: string;
    computedValue: string;
    type: CellType;
}

export interface SpreadsheetData {
    rows: number;
    columns: number;
    cells: Record<string, CellData>;
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