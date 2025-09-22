import React from 'react';
import { ConfirmIcon } from '../icons';

interface ConfirmButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Confirm' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn-sm bg-transparent hover:bg-circle-neutral-variant focus:outline-none focus:ring-2 focus:ring-inset focus:ring-circle-primary transition-colors group ${className}`}
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