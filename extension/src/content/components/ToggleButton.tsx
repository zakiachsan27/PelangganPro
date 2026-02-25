import { h } from 'preact';

interface ToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ToggleButton({ isVisible, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: isVisible ? '320px' : '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2147483647, // Max z-index
        width: '28px',
        height: '80px',
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '6px 0 0 6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '-2px 0 12px rgba(0,0,0,0.3)',
        transition: 'right 0.3s ease',
        pointerEvents: 'auto'
      }}
      title={isVisible ? 'Sembunyikan CRM (Ctrl+Shift+S)' : 'Tampilkan CRM (Ctrl+Shift+S)'}
    >
      <span style={{ 
        transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.3s ease',
        display: 'inline-block'
      }}>
        ›
      </span>
    </button>
  );
}
