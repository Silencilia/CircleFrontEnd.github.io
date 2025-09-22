import React, { useState } from 'react';

interface TextButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  toggled?: boolean;
  disabled?: boolean;
  minWidth?: number;
  paddingX?: number; // px value
  inactiveClass?: string; // overrides default inactive bg/text
  activeClass?: string; // overrides default active bg/text
}

const TextButton: React.FC<TextButtonProps> = ({
  children,
  className = '',
  onClick,
  toggled,
  disabled = false,
  minWidth = 46,
  paddingX = 8,
  inactiveClass,
  activeClass,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const active = toggled !== undefined ? toggled : isActive;
  const baseClasses = 'btn-sm-txt font-circlebodymedium transition-colors';
  const defaultActive = 'bg-circle-primary text-circle-neutral';
  const defaultInactive = 'bg-circle-neutral text-circle-primary';
  const stateClasses = active
    ? (activeClass ?? defaultActive)
    : (inactiveClass ?? defaultInactive);
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = () => {
    if (disabled) return;
    if (toggled === undefined) setIsActive(!isActive);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      style={{ minWidth }}
    >
      {children}
    </button>
  );
};

export default TextButton;