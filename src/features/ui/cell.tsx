import { memo, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';

import type { CellFormat } from '@features/spreadsheet/spreadsheetType';

interface CellProps {
  value: string;
  rawValue: string;
  formula?: string;
  format: CellFormat;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
  onStopEditing: (newValue: string) => void;
  onCancelEditing: () => void;
  style?: CSSProperties;
}

const Cell = ({
  value,
  rawValue,
  formula,
  format,
  isActive,
  isSelected,
  isEditing,
  onClick,
  onDoubleClick,
  onContextMenu,
  onStopEditing,
  onCancelEditing,
  style,
}: CellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(rawValue);

  useEffect(() => {
    if (isEditing) {
      setEditValue(formula ?? rawValue);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, formula, rawValue]);

  const saveValue = () => {
    if (editValue !== rawValue) {
      onStopEditing(editValue);
      return;
    }

    onCancelEditing();
  };

  const cancelEditing = () => {
    setEditValue(rawValue);
    onCancelEditing();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      saveValue();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelEditing();
    }
  };

  const commonStyle: CSSProperties = {
    width: 80,
    height: 24,
    boxSizing: 'border-box',
    outline: isActive ? '2px solid #1a73e8' : '1px solid #ccc',
    ...style,
  };

  if (isEditing) {
    return (
      <div style={commonStyle}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(event) => setEditValue(event.target.value)}
          onBlur={saveValue}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            padding: '0 4px',
            boxSizing: 'border-box',
            fontWeight: format.bold ? 700 : 400,
            fontStyle: format.italic ? 'italic' : 'normal',
            textDecoration: format.underline ? 'underline' : 'none',
            color: format.textColor,
            textAlign: format.align,
            backgroundColor: format.backgroundColor,
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={{
        ...commonStyle,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '0 4px',
        lineHeight: `${style?.height ?? 24}px`,
        backgroundColor: isActive
          ? '#e8f0fe'
          : isSelected
            ? '#f1f7ff'
            : format.backgroundColor,
        cursor: 'cell',
        fontWeight: format.bold ? 700 : 400,
        fontStyle: format.italic ? 'italic' : 'normal',
        textDecoration: format.underline ? 'underline' : 'none',
        color: format.textColor,
        textAlign: format.align,
      }}
    >
      {value}
    </div>
  );
};

export default memo(Cell);