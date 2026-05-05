import { memo, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

interface CellProps {
  value: string;
  formula?: string;
  isActive: boolean;
  onClick: () => void;
  onChange: (newValue: string) => void;
  style?: CSSProperties;
}

const Cell = ({
  value,
  formula,
  isActive,
  onClick,
  onChange,
  style,
}: CellProps) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialEditValue = formula ?? value;

  const [editValue, setEditValue] = useState(initialEditValue);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setEditValue(formula ?? value);
    }
  }, [value, formula, editing]);

  const saveValue = () => {
    const currentValue = formula ?? value;

    if (editValue !== currentValue) {
      onChange(editValue);
    }

    setEditing(false);
  };

  const cancelEditing = () => {
    setEditValue(formula ?? value);
    setEditing(false);
  };

  const handleDoubleClick = () => {
    onClick();
    setEditing(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveValue();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
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

  if (editing) {
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
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      style={{
        ...commonStyle,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '0 4px',
        lineHeight: '24px',
        backgroundColor: isActive ? '#e8f0fe' : 'white',
        cursor: 'cell',
      }}
    >
      {value}
    </div>
  );
};

export default memo(Cell);