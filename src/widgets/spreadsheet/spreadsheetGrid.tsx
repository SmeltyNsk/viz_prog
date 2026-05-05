import { useCallback, useEffect, useRef, useState } from 'react';
import Cell from '@features/ui/cell';
import { createTable } from '@features/lib/tableFactory';
import type { CellData } from '@features/spreadsheet/spreadsheetType';
import FormulaBar from '@features/ui/formulaBar';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
}

const SpreadsheetGrid = ({ rows = 100, columns = 26 }: SpreadsheetGridProps) => {
  const [data, setData] = useState<CellData[][]>(() =>
    createTable({ rows, columns }),
  );

  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleCellClick = useCallback((rowIndex: number, columnIndex: number) => {
    setActiveCell([rowIndex, columnIndex]);
    setEditingCell(null);
    gridRef.current?.focus();
  }, []);

  const handleStartEditing = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setActiveCell([rowIndex, columnIndex]);
      setEditingCell([rowIndex, columnIndex]);
    },
    [],
  );

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

      setEditingCell(null);
      gridRef.current?.focus();
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

      if (editingCell) return;

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

        case 'Enter':
          event.preventDefault();
          handleStartEditing(rowIndex, columnIndex);
          return;

        case 'Escape':
          event.preventDefault();
          setEditingCell(null);
          return;

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
  }, [activeCell, editingCell, rows, columns, handleStartEditing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
  
      if (target instanceof HTMLInputElement) {
        return;
      }
  
      if (!activeCell) return;
  
      if (
        document.activeElement !== gridRef.current &&
        !gridRef.current?.contains(document.activeElement)
      ) {
        return;
      }
  
      if (editingCell) return;
  
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
  
        case 'Enter':
          event.preventDefault();
          handleStartEditing(rowIndex, columnIndex);
          return;
  
        case 'Escape':
          event.preventDefault();
          setEditingCell(null);
          return;
  
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
  }, [activeCell, editingCell, rows, columns, handleStartEditing]);

  useEffect(() => {
    if (!editingCell) {
      requestAnimationFrame(() => {
        gridRef.current?.focus();
      });
    }
  }, [editingCell]);

  const activeCellData =
  activeCell === null ? null : data[activeCell[0]]?.[activeCell[1]] ?? null;

const activeCellAddress = activeCellData?.address ?? null;
const activeCellValue = activeCellData?.rawValue ?? '';

const handleFormulaBarChange = (newValue: string) => {
  if (!activeCell) return;

  const [rowIndex, columnIndex] = activeCell;
  handleCellChange(rowIndex, columnIndex, newValue);
};

  return (
    <div style={{ display: 'inline-block' }}>
    <FormulaBar
      activeCellAddress={activeCellAddress}
      activeCellValue={activeCellValue}
      onChange={handleFormulaBarChange}
    />

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

            const isEditing =
              editingCell !== null &&
              editingCell[0] === rowIndex &&
              editingCell[1] === columnIndex;
              
            return (
              <Cell
                key={cell.address}
                value={String(cell.computedValue ?? '')}
                formula={
                  cell.rawValue.startsWith('=') ? cell.rawValue : undefined
                }
                isActive={isActive}
                isEditing={isEditing}
                onClick={() => handleCellClick(rowIndex, columnIndex)}
                onDoubleClick={() => handleStartEditing(rowIndex, columnIndex)}
                onStopEditing={(newValue) =>
                  handleCellChange(rowIndex, columnIndex, newValue)
                }
              />
            );
          })}
        </div>
      ))}
    </div>
    </div>
  );
};

export default SpreadsheetGrid;