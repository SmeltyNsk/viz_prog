import { CellData } from "@features/spreadsheet/spreadsheetType";

export interface SpreadsheetDocument {
    id: string;
    name: string;
    rows: number;
    columns: number;
    cells: Record<string, CellData>;
    createdAt: string;
    updatedAt: string;
}