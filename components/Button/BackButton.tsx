import React from 'react';
import { BackIcon } from '../icons';

interface BackButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  children = 'Back', 
  className = '',
  disabled = false,
  showIcon = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1 text-sm',
    lg: 'p-1 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 bg-transparent text-circle-primary rounded hover:bg-circle-neutral-variant transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <BackIcon 
          width={iconSizes[size]} 
          height={iconSizes[size]} 
          strokeColor="currentColor"
        />
      )}
      {children}
    </button>
  );
};

export default BackButton;


