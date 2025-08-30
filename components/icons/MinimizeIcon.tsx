import React from 'react';

interface MinimizeIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const MinimizeIcon: React.FC<MinimizeIconProps> = ({ width = 16, height = 16, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M2.66667 9.33333H6.66667M6.66667 9.33333V13.3333M6.66667 9.33333L2 14M13.3333 6.66667H9.33333M9.33333 6.66667V2.66667M9.33333 6.66667L14 2" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MinimizeIcon;
