import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import Cell from '@features/ui/cell';
import FormulaBar from '@features/ui/formulaBar';
import Toolbar from '@features/ui/toolbar';

import { createTable } from '@features/lib/tableFactory';
import { formatCellAddress } from '@features/lib/cellAddress';
import { evaluateFormula, getNumericCellValue } from '@features/lib/utils';

import type { CellData } from '@features/spreadsheet/spreadsheetType';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  cell: [number, number];
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

function normalizeTableAddresses(data: CellData[][]): CellData[][] {
  return data.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const address = formatCellAddress(rowIndex, columnIndex);

      return {
        ...cell,
        id: address,
        address,
      };
    }),
  );
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
  const [toolbar, setToolbar] = useState<ContextMenuState | null>(null);

  const [selectedRange, setSelectedRange] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const rowCount = data.length;
  const columnCount = data[0]?.length ?? 0;

  const clearSelection = useCallback(() => {
    setActiveCell(null);
    setEditingCell(null);
    setSelectedRange(null);
  }, []);

  const handleCellClick = useCallback(
    (rowIndex: number, columnIndex: number, shiftKey = false) => {
      setToolbar(null);

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

  const handleCellContextMenu = useCallback(
    (
      event: MouseEvent<HTMLDivElement>,
      rowIndex: number,
      columnIndex: number,
    ) => {
      event.preventDefault();

      setActiveCell([rowIndex, columnIndex]);
      setEditingCell(null);
      setSelectedRange(null);

      setToolbar({
        x: event.clientX,
        y: event.clientY,
        cell: [rowIndex, columnIndex],
      });
    },
    [],
  );

  const handleStartEditing = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setToolbar(null);
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

  const addRowAfter = useCallback(
    (rowIndex: number) => {
      setData((prevData) => {
        const columnLength = prevData[0]?.length ?? columns;
        const insertIndex = Math.min(rowIndex + 1, prevData.length);

        const newRow = Array.from({ length: columnLength }, (_, columnIndex) =>
          createEmptyCell(insertIndex, columnIndex),
        );

        const updatedData = [
          ...prevData.slice(0, insertIndex),
          newRow,
          ...prevData.slice(insertIndex),
        ];

        return recalculateTable(normalizeTableAddresses(updatedData));
      });

      setRowHeights((prev) => {
        const insertIndex = Math.min(rowIndex + 1, prev.length);

        return [...prev.slice(0, insertIndex), 24, ...prev.slice(insertIndex)];
      });

      clearSelection();
    },
    [columns, clearSelection],
  );

  const deleteRowAt = useCallback(
    (rowIndex: number) => {
      setData((prevData) => {
        if (prevData.length <= 1) {
          return prevData;
        }

        const updatedData = prevData.filter((_, index) => index !== rowIndex);

        return recalculateTable(normalizeTableAddresses(updatedData));
      });

      setRowHeights((prev) => {
        if (prev.length <= 1) {
          return prev;
        }

        return prev.filter((_, index) => index !== rowIndex);
      });

      clearSelection();
    },
    [clearSelection],
  );

  const addColumnAfter = useCallback(
    (columnIndex: number) => {
      setData((prevData) => {
        const insertIndex = Math.min(columnIndex + 1, columnCount);

        const updatedData = prevData.map((row, rowIndex) => {
          const newCell = createEmptyCell(rowIndex, insertIndex);

          return [
            ...row.slice(0, insertIndex),
            newCell,
            ...row.slice(insertIndex),
          ];
        });

        return recalculateTable(normalizeTableAddresses(updatedData));
      });

      setColumnWidths((prev) => {
        const insertIndex = Math.min(columnIndex + 1, prev.length);

        return [...prev.slice(0, insertIndex), 80, ...prev.slice(insertIndex)];
      });

      clearSelection();
    },
    [columnCount, clearSelection],
  );

  const deleteColumnAt = useCallback(
    (columnIndex: number) => {
      setData((prevData) => {
        const currentColumnCount = prevData[0]?.length ?? 0;

        if (currentColumnCount <= 1) {
          return prevData;
        }

        const updatedData = prevData.map((row) =>
          row.filter((_, index) => index !== columnIndex),
        );

        return recalculateTable(normalizeTableAddresses(updatedData));
      });

      setColumnWidths((prev) => {
        if (prev.length <= 1) {
          return prev;
        }

        return prev.filter((_, index) => index !== columnIndex);
      });

      clearSelection();
    },
    [clearSelection],
  );

  const addRow = useCallback(() => {
    addRowAfter(rowCount - 1);
  }, [addRowAfter, rowCount]);

  const deleteRow = useCallback(() => {
    deleteRowAt(rowCount - 1);
  }, [deleteRowAt, rowCount]);

  const addColumn = useCallback(() => {
    addColumnAfter(columnCount - 1);
  }, [addColumnAfter, columnCount]);

  const deleteColumn = useCallback(() => {
    deleteColumnAt(columnCount - 1);
  }, [deleteColumnAt, columnCount]);

  const handleToolbarAction = useCallback(
    (action: string) => {
      if (!toolbar) {
        return;
      }

      const [rowIndex, columnIndex] = toolbar.cell;

      switch (action) {
        case 'add-row':
          addRowAfter(rowIndex);
          break;

        case 'delete-row':
          deleteRowAt(rowIndex);
          break;

        case 'add-column':
          addColumnAfter(columnIndex);
          break;

        case 'delete-column':
          deleteColumnAt(columnIndex);
          break;

        default:
          break;
      }

      setToolbar(null);
    },
    [toolbar, addRowAfter, deleteRowAt, addColumnAfter, deleteColumnAt],
  );

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
        setToolbar(null);
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
                  onContextMenu={(event) =>
                    handleCellContextMenu(event, rowIndex, columnIndex)
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {toolbar && (
        <Toolbar
          x={toolbar.x}
          y={toolbar.y}
          onClose={() => setToolbar(null)}
          onAction={handleToolbarAction}
          items={[
            { label: 'Добавить строку ниже', action: 'add-row' },
            { label: 'Удалить строку', action: 'delete-row' },
            { label: 'Добавить столбец справа', action: 'add-column' },
            { label: 'Удалить столбец', action: 'delete-column' },
          ]}
        />
      )}
    </div>
  );
};

export default SpreadsheetGrid;