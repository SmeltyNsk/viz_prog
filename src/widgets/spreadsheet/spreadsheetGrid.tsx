import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import Cell from '@features/ui/cell';
import FormulaBar from '@features/ui/formulaBar';
import Toolbar from '@features/ui/toolbar';

import { createTable } from '@features/lib/tableFactory';
import { formatCellAddress } from '@features/lib/cellAddress';
import {
  detectCellType,
  evaluateFormula,
  getNumericCellValue,
  normalizeCellValue,
} from '@features/lib/utils';

import type { CellData } from '@features/spreadsheet/spreadsheetType';

interface SpreadsheetGridProps {
  rows?: number;
  columns?: number;
  initialData?: CellData[][];
  onDataChange?: (data: CellData[][]) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  cell: [number, number];
}

interface ResizeState {
  type: 'column' | 'row';
  index: number;
  startPosition: number;
  startSize: number;
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

function getColumnTitle(columnIndex: number): string {
  let result = '';
  let index = columnIndex;

  while (index >= 0) {
    result = String.fromCharCode((index % 26) + 65) + result;
    index = Math.floor(index / 26) - 1;
  }

  return result;
}

const SpreadsheetGrid = ({
  rows = 100,
  columns = 26,
  initialData,
  onDataChange,
}: SpreadsheetGridProps) => {
  const initialRowCount = initialData?.length ?? rows;
  const initialColumnCount = initialData?.[0]?.length ?? columns;

  const [data, setData] = useState<CellData[][]>(() =>
    initialData ?? createTable({ rows, columns }),
  );

  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    Array.from({ length: initialColumnCount }, () => 80),
  );

  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array.from({ length: initialRowCount }, () => 24),
  );

  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);
  const [toolbar, setToolbar] = useState<ContextMenuState | null>(null);

  const [selectedRange, setSelectedRange] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const rowCount = data.length;
  const columnCount = data[0]?.length ?? 0;

  const updateData = useCallback(
    (updater: (prevData: CellData[][]) => CellData[][]) => {
      setData((prevData) => {
        const nextData = updater(prevData);
        onDataChange?.(nextData);

        return nextData;
      });
    },
    [onDataChange],
  );

  const totalTableWidth = useMemo(
    () => 40 + columnWidths.reduce((sum, width) => sum + width, 0),
    [columnWidths],
  );

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => gridRef.current,
    estimateSize: (index) => rowHeights[index] ?? 24,
    overscan: 10,
  });

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

  const handleCellToolbar = useCallback(
    (
      event: ReactMouseEvent<HTMLDivElement>,
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

      gridRef.current?.focus();
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
      updateData((prevData) => {
        const updatedData: CellData[][] = prevData.map((row, currentRowIndex) =>
          row.map((cell, currentColumnIndex) => {
            if (
              currentRowIndex === rowIndex &&
              currentColumnIndex === columnIndex
            ) {
              const cellType = detectCellType(newValue);

              return {
                ...cell,
                rawValue: newValue,
                computedValue:
                  cellType === 'formula' ? '' : normalizeCellValue(newValue),
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
    [updateData],
  );

  const addRowAfter = useCallback(
    (rowIndex: number) => {
      updateData((prevData) => {
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
    [columns, clearSelection, updateData],
  );

  const deleteRowAt = useCallback(
    (rowIndex: number) => {
      updateData((prevData) => {
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
    [clearSelection, updateData],
  );

  const addColumnAfter = useCallback(
    (columnIndex: number) => {
      updateData((prevData) => {
        const currentColumnCount = prevData[0]?.length ?? 0;
        const insertIndex = Math.min(columnIndex + 1, currentColumnCount);

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
    [clearSelection, updateData],
  );

  const deleteColumnAt = useCallback(
    (columnIndex: number) => {
      updateData((prevData) => {
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
    [clearSelection, updateData],
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

  const handleColumnResizeStart = useCallback(
    (
      event: ReactMouseEvent<HTMLDivElement>,
      columnIndex: number,
      startWidth: number,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setToolbar(null);

      resizeRef.current = {
        type: 'column',
        index: columnIndex,
        startPosition: event.clientX,
        startSize: startWidth,
      };
    },
    [],
  );

  const handleRowResizeStart = useCallback(
    (
      event: ReactMouseEvent<HTMLDivElement>,
      rowIndex: number,
      startHeight: number,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setToolbar(null);

      resizeRef.current = {
        type: 'row',
        index: rowIndex,
        startPosition: event.clientY,
        startSize: startHeight,
      };
    },
    [],
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
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      const resize = resizeRef.current;

      if (!resize) {
        return;
      }

      if (resize.type === 'column') {
        const diff = event.clientX - resize.startPosition;
        const nextWidth = Math.max(40, resize.startSize + diff);

        setColumnWidths((prev) =>
          prev.map((width, index) =>
            index === resize.index ? nextWidth : width,
          ),
        );

        return;
      }

      const diff = event.clientY - resize.startPosition;
      const nextHeight = Math.max(20, resize.startSize + diff);

      setRowHeights((prev) =>
        prev.map((height, index) =>
          index === resize.index ? nextHeight : height,
        ),
      );
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!editingCell) {
      requestAnimationFrame(() => {
        gridRef.current?.focus();
      });
    }
  }, [editingCell]);

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowHeights, rowVirtualizer]);

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
        style={{
          height: 520,
          maxWidth: '100vw',
          overflow: 'auto',
          outline: 'none',
          border: '1px solid #ddd',
        }}
      >
        <div style={{ width: totalTableWidth }}>
          <div
            style={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              zIndex: 5,
              backgroundColor: 'white',
            }}
          >
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
                  position: 'relative',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {getColumnTitle(columnIndex)}

                <div
                  onMouseDown={(event) =>
                    handleColumnResizeStart(event, columnIndex, width)
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: -3,
                    width: 6,
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 2,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const row = data[rowIndex];

              if (!row) {
                return null;
              }

              return (
                <div
                  key={rowIndex}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: rowHeights[rowIndex] ?? 24,
                      border: '1px solid #ccc',
                      textAlign: 'center',
                      backgroundColor: '#f0f0f0',
                      lineHeight: `${rowHeights[rowIndex] ?? 24}px`,
                      fontWeight: 'bold',
                      position: 'relative',
                      userSelect: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {rowIndex + 1}

                    <div
                      onMouseDown={(event) =>
                        handleRowResizeStart(
                          event,
                          rowIndex,
                          rowHeights[rowIndex] ?? 24,
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: -3,
                        width: '100%',
                        height: 6,
                        cursor: 'row-resize',
                        zIndex: 2,
                      }}
                    />
                  </div>

                  {row.map((cell, columnIndex) => {
                    const isSelected = isCellInSelectedRange(
                      rowIndex,
                      columnIndex,
                    );

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
                          cell.rawValue.startsWith('=')
                            ? cell.rawValue
                            : undefined
                        }
                        isActive={isActive}
                        isSelected={isSelected}
                        isEditing={isEditing}
                        style={{
                          width: columnWidths[columnIndex] ?? 80,
                          height: rowHeights[rowIndex] ?? 24,
                        }}
                        onClick={(event) =>
                          handleCellClick(
                            rowIndex,
                            columnIndex,
                            event.shiftKey,
                          )
                        }
                        onDoubleClick={() =>
                          handleStartEditing(rowIndex, columnIndex)
                        }
                        onStopEditing={(newValue) =>
                          handleCellChange(rowIndex, columnIndex, newValue)
                        }
                        onContextMenu={(event) =>
                          handleCellToolbar(event, rowIndex, columnIndex)
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
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