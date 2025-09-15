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
      className={`p-1 flex items-center justify-center hover:bg-circle-neutral-variant rounded transition-colors group ${className}`}
      aria-label={ariaLabel}
    >
        <CancelIcon
          className="text-circle-primary"
        />
    </button>
  );
};

export default CancelButton;
