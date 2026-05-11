import { formatCellAddress, parseCellAddress } from '@features/lib/cellAddress';
import type { CellData } from '@features/spreadsheet/spreadsheetType';

export interface CellRange {
  start: [number, number];
  end: [number, number];
}

export function parseRange(rangeStr: string): CellRange {
  const parts = rangeStr.split(':');

  if (parts.length === 1) {
    const [rowIndex, columnIndex] = parseCellAddress(parts[0]);

    return {
      start: [rowIndex, columnIndex],
      end: [rowIndex, columnIndex],
    };
  }

  const [startAddress, endAddress] = parts;

  if (!startAddress || !endAddress) {
    throw new Error('Invalid range');
  }

  const [startRow, startColumn] = parseCellAddress(startAddress);
  const [endRow, endColumn] = parseCellAddress(endAddress);

  return {
    start: [Math.min(startRow, endRow), Math.min(startColumn, endColumn)],
    end: [Math.max(startRow, endRow), Math.max(startColumn, endColumn)],
  };
}

export function getNumericValuesInRange(
  rangeStr: string,
  getCellValue: (address: string) => number | null,
): number[] {
  const range = parseRange(rangeStr);
  const numbers: number[] = [];

  for (let rowIndex = range.start[0]; rowIndex <= range.end[0]; rowIndex += 1) {
    for (
      let columnIndex = range.start[1];
      columnIndex <= range.end[1];
      columnIndex += 1
    ) {
      const address = formatCellAddress(rowIndex, columnIndex);
      const value = getCellValue(address);

      if (value !== null && !Number.isNaN(value)) {
        numbers.push(value);
      }
    }
  }

  return numbers;
}

export function evaluateFormula(
  formula: string,
  getCellValue: (address: string) => number | null,
): string {
  const rawFormula = formula.startsWith('=') ? formula.slice(1) : formula;
  const trimmedFormula = rawFormula.trim();

  if (!trimmedFormula) {
    return '';
  }

  const funcMatch = trimmedFormula.match(/^(SUM|AVERAGE)\(([^)]+)\)$/i);

  if (funcMatch) {
    const funcName = funcMatch[1]?.toUpperCase();
    const rangeStr = funcMatch[2]?.trim();

    if (!funcName || !rangeStr) {
      return '#ERROR';
    }

    const numbers = getNumericValuesInRange(rangeStr, getCellValue);

    if (numbers.length === 0) {
      return '#N/A';
    }

    if (funcName === 'SUM') {
      return String(numbers.reduce((sum, value) => sum + value, 0));
    }

    if (funcName === 'AVERAGE') {
      const sum = numbers.reduce((total, value) => total + value, 0);
      return String(sum / numbers.length);
    }
  }

  const expression = trimmedFormula.replace(/[A-Z]+\d+/g, (address) => {
    const value = getCellValue(address);

    return value !== null ? String(value) : '0';
  });

  try {
    const result = Function(`"use strict"; return (${expression})`)();

    if (typeof result === 'number' && !Number.isNaN(result)) {
      return String(result);
    }

    return '#ERROR';
  } catch {
    return '#ERROR';
  }
}

export function getNumericCellValue(
  address: string,
  data: CellData[][],
): number | null {
  const [rowIndex, columnIndex] = parseCellAddress(address);
  const cell = data[rowIndex]?.[columnIndex];

  if (!cell) {
    return null;
  }

  const value = cell.computedValue ?? cell.rawValue;
  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

export function detectCellType(value: string): CellData['type'] {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('=')) {
    return 'formula';
  }

  if (trimmedValue.toLowerCase() === 'true') {
    return 'boolean';
  }

  if (trimmedValue.toLowerCase() === 'false') {
    return 'boolean';
  }

  if (trimmedValue !== '' && !Number.isNaN(Number(trimmedValue))) {
    return 'number';
  }

  return 'string';
}

export function normalizeCellValue(value: string): CellData['computedValue'] {
  const cellType = detectCellType(value);
  const trimmedValue = value.trim();

  if (cellType === 'number') {
    return Number(trimmedValue);
  }

  if (cellType === 'boolean') {
    return trimmedValue.toLowerCase() === 'true';
  }

  return value;
}