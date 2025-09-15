import React from 'react';

interface ConfirmIconProps {
  className?: string;
  strokeWidth?: number;
  strokeColor?: string;
}

const ConfirmIcon: React.FC<ConfirmIconProps> = ({ 
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
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ConfirmIcon;