import { useCallback, useEffect, useRef, useState } from 'react';
import Cell from '@features/ui/cell';
import FormulaBar from '@features/ui/formulaBar';
import { createTable } from '@features/lib/tableFactory';
import { formatCellAddress } from '@features/lib/cellAddress';
import { evaluateFormula, getNumericCellValue } from '@features/lib/utils';
import type { CellData } from '@features/spreadsheet/spreadsheetType';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
}

function createEmptyCell(rowIndex: number, columnIndex: number): CellData {
  const address = formatCellAddress(rowIndex, columnIndex);

  return {
    id: address,
    address,
    rawValue: '',
    computedValue: '',
    type: 'string',
  };
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

  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    Array.from({ length: columns }, () => 80),
  );

  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array.from({ length: rows }, () => 24),
  );

  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);

  const [selectedRange, setSelectedRange] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const rowCount = data.length;
  const columnCount = data[0]?.length ?? 0;

  const handleCellClick = useCallback(
    (rowIndex: number, columnIndex: number, shiftKey = false) => {
      if (shiftKey && activeCell) {
        setSelectedRange({
          start: activeCell,
          end: [rowIndex, columnIndex],
        });

        gridRef.current?.focus();
        return;
      }

      setActiveCell([rowIndex, columnIndex]);
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
              const cellType: CellData['type'] = isFormula
                ? 'formula'
                : 'string';

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

  const addRow = useCallback(() => {
    setData((prevData) => {
      const nextRowIndex = prevData.length;
      const currentColumnCount = prevData[0]?.length ?? columns;

      const newRow = Array.from({ length: currentColumnCount }, (_, columnIndex) =>
        createEmptyCell(nextRowIndex, columnIndex),
      );

      return recalculateTable([...prevData, newRow]);
    });

    setRowHeights((prev) => [...prev, 24]);
  }, [columns]);

  const deleteRow = useCallback(() => {
    if (rowCount <= 1) {
      return;
    }

    setData((prevData) => recalculateTable(prevData.slice(0, -1)));
    setRowHeights((prev) => prev.slice(0, -1));

    if (activeCell && activeCell[0] >= rowCount - 1) {
      setActiveCell(null);
    }

    if (editingCell && editingCell[0] >= rowCount - 1) {
      setEditingCell(null);
    }

    setSelectedRange(null);
  }, [rowCount, activeCell, editingCell]);

  const addColumn = useCallback(() => {
    setData((prevData) => {
      const updatedData = prevData.map((row, rowIndex) => {
        const nextColumnIndex = row.length;
        const newCell = createEmptyCell(rowIndex, nextColumnIndex);

        return [...row, newCell];
      });

      return recalculateTable(updatedData);
    });

    setColumnWidths((prev) => [...prev, 80]);
  }, []);

  const deleteColumn = useCallback(() => {
    if (columnCount <= 1) {
      return;
    }

    setData((prevData) =>
      recalculateTable(prevData.map((row) => row.slice(0, -1))),
    );

    setColumnWidths((prev) => prev.slice(0, -1));

    if (activeCell && activeCell[1] >= columnCount - 1) {
      setActiveCell(null);
    }

    if (editingCell && editingCell[1] >= columnCount - 1) {
      setEditingCell(null);
    }

    setSelectedRange(null);
  }, [columnCount, activeCell, editingCell]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (target instanceof HTMLInputElement) {
        return;
      }

      if (
        document.activeElement !== gridRef.current &&
        !gridRef.current?.contains(document.activeElement)
      ) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setEditingCell(null);
        setSelectedRange(null);
        setActiveCell(null);
        return;
      }

      if (!activeCell || editingCell) {
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
          nextRowIndex = Math.min(rowCount - 1, rowIndex + 1);
          break;

        case 'ArrowLeft':
          nextColumnIndex = Math.max(0, columnIndex - 1);
          break;

        case 'ArrowRight':
          nextColumnIndex = Math.min(columnCount - 1, columnIndex + 1);
          break;

        case 'Enter':
          event.preventDefault();
          handleStartEditing(rowIndex, columnIndex);
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
  }, [
    activeCell,
    editingCell,
    rowCount,
    columnCount,
    handleStartEditing,
  ]);

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
    if (!activeCell) {
      return;
    }

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

      <div style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
        <button type="button" onClick={addRow}>
          Добавить строку
        </button>

        <button type="button" onClick={deleteRow}>
          Удалить строку
        </button>

        <button type="button" onClick={addColumn}>
          Добавить столбец
        </button>

        <button type="button" onClick={deleteColumn}>
          Удалить столбец
        </button>
      </div>

      <div
        ref={gridRef}
        tabIndex={0}
        style={{ display: 'inline-block', outline: 'none' }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ width: 40, height: 24 }} />

          {columnWidths.map((width, columnIndex) => (
            <div
              key={columnIndex}
              style={{
                width,
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
                height: rowHeights[rowIndex] ?? 24,
                border: '1px solid #ccc',
                textAlign: 'center',
                backgroundColor: '#f0f0f0',
                lineHeight: `${rowHeights[rowIndex] ?? 24}px`,
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
                  formula={
                    cell.rawValue.startsWith('=') ? cell.rawValue : undefined
                  }
                  isActive={isActive}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  style={{
                    width: columnWidths[columnIndex] ?? 80,
                    height: rowHeights[rowIndex] ?? 24,
                  }}
                  onClick={(event) =>
                    handleCellClick(rowIndex, columnIndex, event.shiftKey)
                  }
                  onDoubleClick={() =>
                    handleStartEditing(rowIndex, columnIndex)
                  }
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