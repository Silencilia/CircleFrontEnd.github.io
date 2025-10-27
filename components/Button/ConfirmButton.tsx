import React from 'react';
import { ConfirmIcon } from '../icons';

interface ConfirmButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Confirm',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-sm bg-transparent ${!disabled ? 'hover:bg-circle-neutral-variant' : ''} focus:outline-none transition-colors group ${className}`}
      aria-label={ariaLabel}
    >
        <ConfirmIcon
          className="text-circle-primary"
          strokeWidth={1.5}
        />
    </button>
  );
};

export default ConfirmButton;