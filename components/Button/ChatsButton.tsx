import React from 'react';
import MenuIcon from '../icons/MenuIcon';

interface ChatsButtonProps {
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

const ChatsButton: React.FC<ChatsButtonProps> = ({ onClick, className = '', 'aria-label': ariaLabel, disabled = false }) => {
  const baseButtonClasses = 'buttonUtilities btn-sm group hover:bg-circle-neutral-variant transition-colors duration-200';
  const radiusOverride = 'rounded-full';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel ?? 'Chats'}
      disabled={disabled}
      className={`${baseButtonClasses} ${radiusOverride} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
    >
      <MenuIcon width={16} height={16} className="text-circle-primary group-hover:text-circle-primary" />
    </button>
  );
};

export default ChatsButton;


