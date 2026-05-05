import { useCallback, useEffect, useRef, useState } from 'react';
import Cell from '@features/ui/cell';
import { createTable } from '@features/lib/tableFactory';
import type { CellData } from '@features/spreadsheet/spreadsheetType';
import FormulaBar from '@features/ui/formulaBar';
import { evaluateFormula, getNumericCellValue } from '@features/lib/utils';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
}

function recalculateTable(data: CellData[][]): CellData[][] {
    return data.map((row) =>
      row.map((cell) => {
        if (!cell.rawValue.startsWith('=')) {
          return cell;
        }
  
        return {
          ...cell,
          computedValue: evaluateFormula(cell.rawValue, (address) =>
            getNumericCellValue(address, data),
          ),
        };
      }),
    );
  }

const SpreadsheetGrid = ({ rows = 100, columns = 26 }: SpreadsheetGridProps) => {
  const [data, setData] = useState<CellData[][]>(() =>
    createTable({ rows, columns }),
  );

  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const [selectedRange, setSelectedRange] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const handleCellClick = useCallback(
    (row: number, col: number, shiftKey = false) => {
      if (shiftKey && activeCell) {
        setSelectedRange({
          start: activeCell,
          end: [row, col],
        });
  
        gridRef.current?.focus();
        return;
      }
  
      setActiveCell([row, col]);
      setEditingCell(null);
      setSelectedRange(null);
      gridRef.current?.focus();
    },
    [activeCell],
  );

  const handleStartEditing = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setActiveCell([rowIndex, columnIndex]);
      setEditingCell([rowIndex, columnIndex]);
    },
    [],
  );
  
  const handleCellChange = useCallback(
    (rowIndex: number, columnIndex: number, newValue: string) => {
      setData((prevData) => {
        const updatedData: CellData[][] = prevData.map((row, currentRowIndex) =>
          row.map((cell, currentColumnIndex) => {
            if (
              currentRowIndex === rowIndex &&
              currentColumnIndex === columnIndex
            ) {
              const isFormula = newValue.startsWith('=');
              const cellType: CellData['type'] = isFormula ? 'formula' : 'string';
  
              return {
                ...cell,
                rawValue: newValue,
                computedValue: isFormula ? '' : newValue,
                type: cellType,
              };
            }
  
            return cell;
          }),
        );
  
        return recalculateTable(updatedData);
      });
  
      setEditingCell(null);
    },
    [],
  );

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
            setSelectedRange(null);
            setActiveCell(null);
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

const isCellInSelectedRange = (
    rowIndex: number,
    columnIndex: number,
  ): boolean => {
    if (!selectedRange) {
      return false;
    }
  
    const startRow = Math.min(selectedRange.start[0], selectedRange.end[0]);
    const endRow = Math.max(selectedRange.start[0], selectedRange.end[0]);
    const startColumn = Math.min(selectedRange.start[1], selectedRange.end[1]);
    const endColumn = Math.max(selectedRange.start[1], selectedRange.end[1]);
  
    return (
      rowIndex >= startRow &&
      rowIndex <= endRow &&
      columnIndex >= startColumn &&
      columnIndex <= endColumn
    );
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
            const isSelected = isCellInSelectedRange(rowIndex, columnIndex);
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
                formula={cell.rawValue.startsWith('=') ? cell.rawValue : undefined}
                isActive={isActive}
                isSelected={isSelected}
                isEditing={isEditing}
                onClick={(event) =>
                  handleCellClick(rowIndex, columnIndex, event.shiftKey)
                }
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