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
      className={`btn-sm hover:bg-circle-neutral-variant transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      <MenuIcon className="text-circle-primary" />
    </button>
  );
};

export default MenuButton;

