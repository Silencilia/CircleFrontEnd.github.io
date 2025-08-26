import React from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
  confirmMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'button';
  className?: string;
  children?: React.ReactNode;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  confirmMessage = 'Are you sure you want to delete this item?',
  size = 'md',
  variant = 'text',
  className = '',
  children = 'Delete',
}) => {
  const handleDelete = () => {
    if (confirm(confirmMessage)) {
      onDelete();
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const variantClasses = {
    text: 'text-red-500 hover:text-red-700 bg-transparent hover:bg-red-50',
    button: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };

  const baseClasses = variant === 'button' 
    ? 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 cursor-pointer'
    : 'transition-colors cursor-pointer';

  return (
    <button
      onClick={handleDelete}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default DeleteButton;
