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
  const iconSizes = {
    sm: 16,
    md: 16,
    lg: 16,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn-sm gap-2 bg-transparent text-circle-primary hover:bg-circle-neutral-variant transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {showIcon && (
        <BackIcon
          strokeColor="currentColor"
        />
      )}
      {children}
    </button>
  );
};

export default BackButton;


