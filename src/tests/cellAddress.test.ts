import { describe, expect, it } from 'vitest';
import { formatCellAddress, parseCellAddress } from '@features/lib/cellAddress';

describe('cellAddress', () => {
  it('formats cell address', () => {
    expect(formatCellAddress(0, 0)).toBe('A1');
    expect(formatCellAddress(1, 1)).toBe('B2');
    expect(formatCellAddress(9, 2)).toBe('C10');
  });

  it('parses cell address', () => {
    expect(parseCellAddress('A1')).toEqual([0, 0]);
    expect(parseCellAddress('B2')).toEqual([1, 1]);
    expect(parseCellAddress('C10')).toEqual([9, 2]);
  });
});