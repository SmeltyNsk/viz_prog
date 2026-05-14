import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { spreadsheetActions } from '@features/spreadsheet/spreadsheetSlice';

import Cell from '@features/ui/cell';
import FormulaBar from '@features/ui/formulaBar';
import Toolbar from '@features/ui/toolbar';

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

function getColumnTitle(columnIndex: number): string {
  let result = '';
  let index = columnIndex;

  while (index >= 0) {
    result = String.fromCharCode((index % 26) + 65) + result;
    index = Math.floor(index / 26) - 1;
  }

  return result;
}

const SpreadsheetGrid = () => {
  const dispatch = useAppDispatch();

  const data = useAppSelector((state) => state.spreadsheet.cells);
  const columnWidths = useAppSelector((state) => state.spreadsheet.columnWidths);
  const rowHeights = useAppSelector((state) => state.spreadsheet.rowHeights);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const editingCell = useAppSelector((state) => state.spreadsheet.editingCell);
  const selectedRange = useAppSelector(
    (state) => state.spreadsheet.selectedRange,
  );

  const [toolbar, setToolbar] = useState<ContextMenuState | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const rowCount = data.length;
  const columnCount = data[0]?.length ?? 0;

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

  const handleCellClick = useCallback(
    (rowIndex: number, columnIndex: number, shiftKey = false) => {
      setToolbar(null);

      if (shiftKey && activeCell) {
        dispatch(
          spreadsheetActions.setSelectedRange({
            start: activeCell,
            end: [rowIndex, columnIndex],
          }),
        );

        gridRef.current?.focus();
        return;
      }

      dispatch(spreadsheetActions.setActiveCell([rowIndex, columnIndex]));
      dispatch(spreadsheetActions.stopEditing());
      dispatch(spreadsheetActions.setSelectedRange(null));

      gridRef.current?.focus();
    },
    [activeCell, dispatch],
  );

  const handleCellToolbar = useCallback(
    (
      event: ReactMouseEvent<HTMLDivElement>,
      rowIndex: number,
      columnIndex: number,
    ) => {
      event.preventDefault();

      dispatch(spreadsheetActions.setActiveCell([rowIndex, columnIndex]));
      dispatch(spreadsheetActions.stopEditing());
      dispatch(spreadsheetActions.setSelectedRange(null));

      setToolbar({
        x: event.clientX,
        y: event.clientY,
        cell: [rowIndex, columnIndex],
      });

      gridRef.current?.focus();
    },
    [dispatch],
  );

  const handleStartEditing = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setToolbar(null);
      dispatch(spreadsheetActions.startEditing([rowIndex, columnIndex]));
    },
    [dispatch],
  );

  const handleCellChange = useCallback(
    (rowIndex: number, columnIndex: number, newValue: string) => {
      dispatch(
        spreadsheetActions.setCellValue({
          rowIndex,
          columnIndex,
          value: newValue,
        }),
      );
    },
    [dispatch],
  );

  const addRow = useCallback(() => {
    dispatch(spreadsheetActions.addRowAfter(rowCount - 1));
  }, [dispatch, rowCount]);

  const deleteRow = useCallback(() => {
    dispatch(spreadsheetActions.deleteRowAt(rowCount - 1));
  }, [dispatch, rowCount]);

  const addColumn = useCallback(() => {
    dispatch(spreadsheetActions.addColumnAfter(columnCount - 1));
  }, [dispatch, columnCount]);

  const deleteColumn = useCallback(() => {
    dispatch(spreadsheetActions.deleteColumnAt(columnCount - 1));
  }, [dispatch, columnCount]);

  const handleToolbarAction = useCallback(
    (action: string) => {
      if (!toolbar) {
        return;
      }

      const [rowIndex, columnIndex] = toolbar.cell;

      switch (action) {
        case 'add-row':
          dispatch(spreadsheetActions.addRowAfter(rowIndex));
          break;

        case 'delete-row':
          dispatch(spreadsheetActions.deleteRowAt(rowIndex));
          break;

        case 'add-column':
          dispatch(spreadsheetActions.addColumnAfter(columnIndex));
          break;

        case 'delete-column':
          dispatch(spreadsheetActions.deleteColumnAt(columnIndex));
          break;

        default:
          break;
      }

      setToolbar(null);
    },
    [dispatch, toolbar],
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
        dispatch(spreadsheetActions.clearSelection());
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatch(spreadsheetActions.undo());
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        dispatch(spreadsheetActions.redo());
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
          dispatch(spreadsheetActions.startEditing([rowIndex, columnIndex]));
          return;

        default:
          return;
      }

      event.preventDefault();
      dispatch(
        spreadsheetActions.setActiveCell([nextRowIndex, nextColumnIndex]),
      );
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
    dispatch,
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

        dispatch(
          spreadsheetActions.resizeColumn({
            columnIndex: resize.index,
            width: nextWidth,
          }),
        );

        return;
      }

      const diff = event.clientY - resize.startPosition;
      const nextHeight = Math.max(20, resize.startSize + diff);

      dispatch(
        spreadsheetActions.resizeRow({
          rowIndex: resize.index,
          height: nextHeight,
        }),
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
  }, [dispatch]);

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

    dispatch(
      spreadsheetActions.setCellValue({
        rowIndex,
        columnIndex,
        value: newValue,
      }),
    );
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

        <button
          type="button"
          onClick={() => dispatch(spreadsheetActions.undo())}
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => dispatch(spreadsheetActions.redo())}
        >
          Redo
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