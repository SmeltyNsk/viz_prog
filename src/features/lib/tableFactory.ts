import type { CellData } from '@features/spreadsheet/spreadsheetType';
import { getCellAddress } from './cellAddress';

interface TableConfig {
  rows: number;
  columns: number;
}

export function createTable(config: TableConfig): CellData[][] {
  const { rows, columns } = config;
  const table: CellData[][] = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const rowCells: CellData[] = [];

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const address = getCellAddress(rowIndex, columnIndex);

      rowCells.push({
        id: address,
        address,
        rawValue: '',
        computedValue: '',
        type: 'string',
      });
    }

    table.push(rowCells);
  }

  return table;
}