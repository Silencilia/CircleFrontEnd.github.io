import React from 'react';
import { MaximizeIcon } from '../icons';

interface MaximizeButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const MaximizeButton: React.FC<MaximizeButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Maximize' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn-sm hover:bg-circle-neutral transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      <MaximizeIcon className="text-circle-primary" />
    </button>
  );
};

export default MaximizeButton;
