import React from 'react';

interface CancelIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const CancelIcon: React.FC<CancelIconProps> = ({
  width = 16,
  height = 16,
  strokeColor = '#262B35',
  className = '',
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
        d="M4 4L12 12M12 4L4 12"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CancelIcon;


