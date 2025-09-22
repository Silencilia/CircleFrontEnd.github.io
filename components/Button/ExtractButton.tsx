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
      className={`btn-sm-txt bg-circle-secondary hover:bg-circle-primary transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Text */}
      <div className="font-circlelabelsmall text-white">
        {children}
      </div>

      {/* Zap Icon */}
      <ZapIcon
        className=""
        strokeColor="#FFFFFF"
      />
    </button>
  );
};

export default ExtractButton;
