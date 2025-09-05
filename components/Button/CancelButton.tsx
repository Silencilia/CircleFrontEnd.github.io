import React from 'react';

interface CancelButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const CancelButton: React.FC<CancelButtonProps> = ({ 
  onClick, 
  children = 'Cancel', 
  className = '',
  disabled = false 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 bg-circle-neutral text-circle-primary text-xs rounded hover:bg-opacity-60 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default CancelButton;
