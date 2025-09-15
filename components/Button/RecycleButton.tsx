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
      className={`p-1 flex items-center justify-center ${hoverClass} rounded transition-colors ${className}`}
      aria-label={ariaLabel}
    >
      <RecycleIcon width={16} height={16} className="text-circle-primary" />
    </button>
  );
};

export default RecycleButton;
