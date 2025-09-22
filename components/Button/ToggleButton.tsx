import React from 'react';

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isOpen,
  onClick,
  size,
  className = '',
  'aria-label': ariaLabel = 'Toggle dropdown',
}) => {
  // Use size prop if provided, otherwise let ctn-srch handle it
  const style = size ? { width: `${size}px`, height: `${size}px`, padding: '4px' } : { padding: '4px' };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center hover:bg-circle-neutral rounded transition-colors ${className}`}
      style={style}
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ToggleButton;
