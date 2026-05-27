import {
  defaultCellFormat,
  type CellData,
} from '@features/spreadsheet/spreadsheetType';
import { formatCellAddress } from './cellAddress';

export interface TableConfig {
  rows: number;
  columns: number;
}

export function createTable(config: TableConfig): CellData[][] {
  const { rows, columns } = config;

  const table: CellData[][] = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const rowCells: CellData[] = [];

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const address = formatCellAddress(rowIndex, columnIndex);

      rowCells.push({
        id: address,
        address,
        rawValue: '',
        computedValue: '',
        type: 'string',
        format: {
          ...defaultCellFormat,
        },
      });
    }

    table.push(rowCells);
  }

  return table;
}