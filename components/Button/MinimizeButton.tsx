import React from 'react';
import { MinimizeIcon } from '../icons';

interface MinimizeButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const MinimizeButton: React.FC<MinimizeButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Minimize' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn-sm hover:bg-circle-neutral-variant transition-colors ${className}`}
      aria-label={ariaLabel}
    >
      <MinimizeIcon className="text-circle-primary" />
    </button>
  );
};

export default MinimizeButton;
