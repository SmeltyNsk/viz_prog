import type {
    CellFormat,
    HorizontalAlign,
    NumberFormat,
  } from '@features/spreadsheet/spreadsheetType';
  
  interface FormattingToolbarProps {
    currentFormat: CellFormat | null;
    onChange: (format: Partial<CellFormat>) => void;
  }
  
  const FormattingToolbar = ({
    currentFormat,
    onChange,
  }: FormattingToolbarProps) => {
    const format = currentFormat;
  
    const handleAlignChange = (align: HorizontalAlign) => {
      onChange({ align });
    };
  
    const handleNumberFormatChange = (numberFormat: NumberFormat) => {
      onChange({ numberFormat });
    };
  
    return (
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          padding: '6px 0',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onChange({ bold: !format?.bold })}
        >
          B
        </button>
  
        <button
          type="button"
          onClick={() => onChange({ italic: !format?.italic })}
        >
          I
        </button>
  
        <button
          type="button"
          onClick={() => onChange({ underline: !format?.underline })}
        >
          U
        </button>
  
        <label>
          Текст:
          <input
            type="color"
            value={format?.textColor ?? '#000000'}
            onChange={(event) => onChange({ textColor: event.target.value })}
          />
        </label>
  
        <label>
          Фон:
          <input
            type="color"
            value={format?.backgroundColor ?? '#ffffff'}
            onChange={(event) =>
              onChange({ backgroundColor: event.target.value })
            }
          />
        </label>
  
        <button type="button" onClick={() => handleAlignChange('left')}>
          Left
        </button>
  
        <button type="button" onClick={() => handleAlignChange('center')}>
          Center
        </button>
  
        <button type="button" onClick={() => handleAlignChange('right')}>
          Right
        </button>
  
        <select
          value={format?.numberFormat ?? 'default'}
          onChange={(event) =>
            handleNumberFormatChange(event.target.value as NumberFormat)
          }
        >
          <option value="default">Обычный</option>
          <option value="number">Число</option>
          <option value="percent">Процент</option>
          <option value="currency">Валюта</option>
          <option value="date">Дата</option>
        </select>
      </div>
    );
  };
  
  export default FormattingToolbar;