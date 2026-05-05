import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface FormulaBarProps {
  activeCellAddress: string | null;
  activeCellValue: string;
  onChange: (newValue: string) => void;
}

const FormulaBar = ({
  activeCellAddress,
  activeCellValue,
  onChange,
}: FormulaBarProps) => {
  const [editValue, setEditValue] = useState(activeCellValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(activeCellValue);
  }, [activeCellValue, activeCellAddress]);

  const handleSubmit = () => {
    if (editValue !== activeCellValue) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditValue(activeCellValue);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderBottom: '1px solid #ccc',
        gap: 8,
      }}
    >
      <div style={{ width: 60, fontWeight: 'bold', userSelect: 'none' }}>
        {activeCellAddress ?? ''}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={editValue}
        disabled={!activeCellAddress}
        onChange={(event) => setEditValue(event.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          padding: '2px 6px',
          border: '1px solid #999',
        }}
      />
    </div>
  );
};

export default FormulaBar;