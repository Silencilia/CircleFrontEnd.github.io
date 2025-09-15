import React from 'react';

interface ZapIconProps {
  width?: number;
  height?: number;
  className?: string;
  strokeColor?: string;
}

const ZapIcon: React.FC<ZapIconProps> = ({ 
  width = 16, 
  height = 16, 
  className = '',
  strokeColor = 'currentColor'
}) => {
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
        d="M8.66667 1.3335L2 9.3335H8L7.33333 14.6668L14 6.66683H8L8.66667 1.3335Z" 
        stroke={strokeColor} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ZapIcon;
