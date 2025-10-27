import React from 'react';
import { CancelIcon } from '../icons';

interface CancelButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const CancelButton: React.FC<CancelButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Cancel',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-sm bg-transparent ${!disabled ? 'hover:bg-circle-neutral-variant' : ''} focus:outline-none transition-colors group ${className}`}
      aria-label={ariaLabel}
    >
        <CancelIcon
          className="text-circle-primary"
          strokeWidth={1.5}
        />
    </button>
  );
};

export default CancelButton;