import React, { useState } from 'react';

interface TextButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  toggled?: boolean;
  disabled?: boolean;
  minWidth?: number;
  paddingX?: number; // px value
}

const TextButton: React.FC<TextButtonProps> = ({
  children,
  className = '',
  onClick,
  toggled,
  disabled = false,
  minWidth = 46,
  paddingX = 8,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const active = toggled !== undefined ? toggled : isActive;
  const baseClasses = 'inline-flex items-center justify-center px-2 h-5 rounded-[12px] transition-colors';
  const fontClasses = 'font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px]';
  const stateClasses = active
    ? 'bg-circle-primary text-circle-neutral'
    : 'bg-circle-neutral text-circle-primary';
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
      className={`${baseClasses} ${fontClasses} ${stateClasses} ${disabledClasses} ${className}`}
      style={{ minWidth, paddingLeft: paddingX, paddingRight: paddingX }}
    >
      {children}
    </button>
  );
};

export default TextButton;


