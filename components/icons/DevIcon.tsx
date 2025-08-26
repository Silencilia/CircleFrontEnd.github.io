import React from 'react';

interface DevIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const DevIcon: React.FC<DevIconProps> = ({ width = 30, height = 30, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 30 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M5 21.25L12.5 13.75L5 6.25M15 23.75H25" 
        stroke="#262B35" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DevIcon;
