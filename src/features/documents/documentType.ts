import type { CellData } from '@features/spreadsheet/spreadsheetType';

export interface SpreadsheetDocument {
  id: string;
  userId: string;
  title: string;
  rows: number;
  columns: number;
  cells: CellData[][];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  title: string;
  rows: number;
  columns: number;
}

export interface UpdateDocumentPayload {
  title?: string;
  cells?: CellData[][];
  rows?: number;
  columns?: number;
}