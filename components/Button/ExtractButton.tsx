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
    <button
      onClick={onClick}
      className={`flex flex-row items-center justify-center px-[5px] py-[2px] gap-[5px] w-fit h-[20px] bg-circle-secondary rounded-[6px] hover:bg-circle-primary transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Text */}
      <div className="h-[16px] font-circlelabelsmall text-white flex items-center flex-none order-0 flex-grow-0">
        {children}
      </div>
      
      {/* Zap Icon */}
      <ZapIcon 
        width={16} 
        height={16} 
        className="flex-none order-1 flex-grow-0"
        strokeColor="#FFFFFF"
      />
    </button>
  );
};

export default ExtractButton;
