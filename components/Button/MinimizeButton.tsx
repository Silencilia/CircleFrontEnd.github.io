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
      className={`p-1 flex items-center justify-center hover:bg-circle-neutral-variant rounded transition-colors ${className}`}
      aria-label={ariaLabel}
    >
      <MinimizeIcon width={16} height={16} className="text-circle-primary" />
    </button>
  );
};

export default MinimizeButton;
