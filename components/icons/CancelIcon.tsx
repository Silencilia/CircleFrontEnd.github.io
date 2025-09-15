import React from 'react';

interface CancelIconProps {
  className?: string;
  strokeWidth?: number;
  strokeColor?: string;
}

const CancelIcon: React.FC<CancelIconProps> = ({ 
  className = '', 
  strokeWidth = 1.5, 
  strokeColor = '#262B35' 
}) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CancelIcon;