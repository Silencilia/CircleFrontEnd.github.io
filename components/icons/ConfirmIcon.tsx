import React from 'react';

interface ConfirmIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const ConfirmIcon: React.FC<ConfirmIconProps> = ({
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
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ConfirmIcon;


