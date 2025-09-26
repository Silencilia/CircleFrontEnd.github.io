import React from 'react';
import { ZapIcon } from '../icons';

interface ExtractButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const ExtractButton: React.FC<ExtractButtonProps> = ({
  onClick,
  className = '',
  ariaLabel = 'Extract info',
  children = 'extract info'
}) => {
  return (
    <>
      {/* Desktop Version */}
      <button
        onClick={onClick}
        className={`hidden md:flex flex-row w-fit h-[24px] px-xs gap-xs rounded-[12px] items-center justify-center bg-circle-secondary hover:bg-circle-primary transition-colors duration-200 ${className}`}
        aria-label={ariaLabel}
      >
        {/* Text */}
        <div className="font-circlelabelsmall text-white">
          {children}
        </div>

        {/* Zap Icon */}
        <ZapIcon
          width={16}
          height={16}
          className=""
          strokeColor="#FFFFFF"
        />
      </button>

      {/* Mobile Version */}
      <button
        onClick={onClick}
        className={`flex flex-row md:hidden flex-row w-fit h-[20px] px-xs gap-xs rounded-[10px] items-center justify-center bg-circle-secondary hover:bg-circle-primary transition-colors duration-200 ${className}`}
        aria-label={ariaLabel}
      >
        {/* Text */}
        <div className="font-circlelabelxsmall text-white">
          {children}
        </div>

        {/* Zap Icon */}
        <ZapIcon
          width={14}
          height={14}
          className=""
          strokeColor="#FFFFFF"
        />
      </button>
    </>
  );
};

export default ExtractButton;
