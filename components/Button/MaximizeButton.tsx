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
      className={`p-1 hover:bg-circle-neutral rounded transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      <MaximizeIcon width={16} height={16} className="text-circle-primary" />
    </button>
  );
};

export default MaximizeButton;
