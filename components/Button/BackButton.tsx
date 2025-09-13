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
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
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
      className={`flex items-center gap-2 bg-circle-neutral text-circle-primary rounded hover:bg-opacity-60 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
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


