import React from 'react';

interface BackIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const BackIcon: React.FC<BackIconProps> = ({
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
        d="M6.00008 6.66675L2.66675 10.0001M2.66675 10.0001L6.00008 13.3334M2.66675 10.0001H10.6667C11.374 10.0001 12.0523 9.71913 12.5524 9.21903C13.0525 8.71894 13.3334 8.04066 13.3334 7.33341V2.66675"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BackIcon;


