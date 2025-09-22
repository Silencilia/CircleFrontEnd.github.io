import React from 'react';
import { CancelIcon } from '../icons';

interface CancelButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Cancel' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn-sm bg-transparent hover:bg-circle-neutral-variant focus:outline-none focus:ring-2 focus:ring-inset focus:ring-circle-primary transition-colors group ${className}`}
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