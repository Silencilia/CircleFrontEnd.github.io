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
      className={`p-1 flex items-center justify-center hover:bg-circle-neutral-variant focus:outline-none focus:ring-2 focus:ring-inset focus:ring-circle-primary rounded transition-colors group ${className}`}
      aria-label={ariaLabel}
    >
        <ConfirmIcon
          className="text-circle-primary"
        />
    </button>
  );
};

export default ConfirmButton;
