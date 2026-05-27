export type CellValue = string | number | boolean | null;

export type CellType = 'string' | 'number' | 'boolean' | 'formula';

export type HorizontalAlign = 'left' | 'center' | 'right';

export type NumberFormat = 'default' | 'number' | 'percent' | 'currency' | 'date';

export interface CellFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textColor: string;
  backgroundColor: string;
  align: HorizontalAlign;
  numberFormat: NumberFormat;
}

export const defaultCellFormat: CellFormat = {
  bold: false,
  italic: false,
  underline: false,
  textColor: '#000000',
  backgroundColor: '#ffffff',
  align: 'left',
  numberFormat: 'default',
};

export interface CellData {
  id: string;
  address: string;
  rawValue: string;
  computedValue: CellValue;
  type: CellType;
  format: CellFormat;
}