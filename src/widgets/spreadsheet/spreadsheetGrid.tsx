import { useCallback, useEffect, useRef, useState } from 'react';
import Cell from '@features/ui/cell';
import { createTable } from '@features/lib/tableFactory';
import type { CellData } from '@features/spreadsheet/spreadsheetType';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
}

const SpreadsheetGrid = ({ rows = 100, columns = 26 }: SpreadsheetGridProps) => {
  const [data, setData] = useState<CellData[][]>(() =>
    createTable({ rows, columns }),
  );

  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleCellClick = useCallback((row: number, col: number) => {
    setActiveCell([row, col]);
    gridRef.current?.focus();
  }, []);

  const handleCellChange = useCallback(
    (rowIndex: number, columnIndex: number, newValue: string) => {
      setData((prevData) =>
        prevData.map((row, currentRowIndex) =>
          row.map((cell, currentColumnIndex) => {
            if (
              currentRowIndex === rowIndex &&
              currentColumnIndex === columnIndex
            ) {
              return {
                ...cell,
                rawValue: newValue,
                computedValue: newValue,
                type: newValue.startsWith('=') ? 'formula' : 'string',
              };
            }

            return cell;
          }),
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeCell) return;

      if (
        document.activeElement !== gridRef.current &&
        !gridRef.current?.contains(document.activeElement)
      ) {
        return;
      }

      const [rowIndex, columnIndex] = activeCell;

      let nextRowIndex = rowIndex;
      let nextColumnIndex = columnIndex;

      switch (event.key) {
        case 'ArrowUp':
          nextRowIndex = Math.max(0, rowIndex - 1);
          break;

        case 'ArrowDown':
          nextRowIndex = Math.min(rows - 1, rowIndex + 1);
          break;

        case 'ArrowLeft':
          nextColumnIndex = Math.max(0, columnIndex - 1);
          break;

        case 'ArrowRight':
          nextColumnIndex = Math.min(columns - 1, columnIndex + 1);
          break;

        default:
          return;
      }

      event.preventDefault();
      setActiveCell([nextRowIndex, nextColumnIndex]);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCell, rows, columns]);

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      style={{ display: 'inline-block', outline: 'none' }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: 40, height: 24 }} />

        {Array.from({ length: columns }, (_, columnIndex) => (
          <div
            key={columnIndex}
            style={{
              width: 80,
              height: 24,
              border: '1px solid #ccc',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f0f0f0',
              lineHeight: '24px',
            }}
          >
            {String.fromCharCode(65 + columnIndex)}
          </div>
        ))}
      </div>

      {data.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          <div
            style={{
              width: 40,
              height: 24,
              border: '1px solid #ccc',
              textAlign: 'center',
              backgroundColor: '#f0f0f0',
              lineHeight: '24px',
              fontWeight: 'bold',
            }}
          >
            {rowIndex + 1}
          </div>

          {row.map((cell, columnIndex) => {
            const isActive =
              activeCell !== null &&
              activeCell[0] === rowIndex &&
              activeCell[1] === columnIndex;

            return (
              <Cell
                key={cell.address}
                value={String(cell.computedValue ?? '')}
                formula={
                  cell.rawValue.startsWith('=') ? cell.rawValue : undefined
                }
                isActive={isActive}
                onClick={() => handleCellClick(rowIndex, columnIndex)}
                onChange={(newValue) =>
                  handleCellChange(rowIndex, columnIndex, newValue)
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SpreadsheetGrid;