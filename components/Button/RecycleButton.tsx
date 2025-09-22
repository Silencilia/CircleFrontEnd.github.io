import React from 'react';
import { RecycleIcon } from '../icons';

interface RecycleButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  hoverVariant?: 'neutral' | 'neutral-variant';
}

const RecycleButton: React.FC<RecycleButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Delete',
  hoverVariant = 'neutral-variant'
}) => {
  const hoverClass = hoverVariant === 'neutral' ? 'hover:bg-circle-neutral' : 'hover:bg-circle-neutral-variant';
  
  return (
    <button
      onClick={onClick}
      className={`btn-sm ${hoverClass} transition-colors ${className}`}
      aria-label={ariaLabel}
    >
      <RecycleIcon className="text-circle-primary" />
    </button>
  );
};

export default RecycleButton;
