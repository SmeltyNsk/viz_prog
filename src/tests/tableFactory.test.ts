import { describe, expect, it } from 'vitest';
import { createTable } from '@features/lib/tableFactory';

describe('tableFactory', () => {
  it('creates table with correct size', () => {
    const table = createTable({
      rows: 2,
      columns: 3,
    });

    expect(table).toHaveLength(2);
    expect(table[0]).toHaveLength(3);
  });

  it('creates empty cells', () => {
    const table = createTable({
      rows: 1,
      columns: 1,
    });

    expect(table[0]?.[0]?.address).toBe('A1');
    expect(table[0]?.[0]?.rawValue).toBe('');
    expect(table[0]?.[0]?.computedValue).toBe('');
    expect(table[0]?.[0]?.type).toBe('string');
  });
});