import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-12 h-12 p-1.5',
    lg: 'w-16 h-16 p-2',
  };

  const variantClasses = {
    default: 'hover:bg-circle-neutral-variant transition-colors',
    primary: 'bg-circle-primary hover:bg-circle-primary/90 text-white transition-colors',
    secondary: 'bg-circle-neutral hover:bg-circle-neutral-variant transition-colors',
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28,
  };

  const baseClasses = 'flex items-center justify-center rounded-[25px] focus:outline-none focus:ring-2 focus:ring-circle-primary';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Icon size={iconSizes[size]} className={variant === 'primary' ? 'text-white' : 'text-circle-primary'} />
    </button>
  );
};

export default IconButton;
