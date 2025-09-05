import React from 'react';

interface DownIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const DownIcon: React.FC<DownIconProps> = ({
  width = 17,
  height = 17,
  strokeColor = '#1E1E1E',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M4.5 6.5L8.5 10.5L12.5 6.5" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default DownIcon;


