import { useEffect } from 'react';

interface ToolbarProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  items: {
    label: string;
    action: string;
  }[];
}

const Toolbar = ({ x, y, onClose, onAction, items }: ToolbarProps) => {
  useEffect(() => {
    const handleClick = () => onClose();

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <ul
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: 'white',
        border: '1px solid #ccc',
        zIndex: 1000,
        listStyle: 'none',
        padding: 0,
        margin: 0,
        minWidth: 160,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {items.map((item) => (
        <li
          key={item.action}
          onClick={() => {
            onAction(item.action);
            onClose();
          }}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};

export default Toolbar;