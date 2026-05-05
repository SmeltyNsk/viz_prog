import { memo, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

interface CellProps {
  value: string;
  formula?: string;
  isActive: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onStartEditing?: () => void;
  onStopEditing: (newValue: string) => void;
  style?: CSSProperties;
}

const Cell = ({
  value,
  formula,
  isActive,
  isEditing,
  onClick,
  onDoubleClick,
  onStopEditing,
  style,
}: CellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(formula ?? value);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(formula ?? value);
    }
  }, [value, formula, isEditing]);

  const handleSave = () => {
    if (editValue !== (formula ?? value)) {
      onStopEditing(editValue);
    } else {
      onStopEditing(editValue);
    }
  };

  const handleCancel = () => {
    setEditValue(formula ?? value);
    onStopEditing(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      handleCancel();
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
          onBlur={handleSave}
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
      onDoubleClick={onDoubleClick}
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