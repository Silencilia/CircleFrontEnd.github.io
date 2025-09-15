import React from 'react';
import { MenuIcon } from '../icons';

interface MenuButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ 
  onClick, 
  className = '', 
  ariaLabel = 'Menu' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 flex items-center justify-center hover:bg-circle-neutral-variant rounded transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      <MenuIcon width={16} height={16} className="text-circle-primary" />
    </button>
  );
};

export default MenuButton;

