import React from 'react';

interface RightIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const RightIcon: React.FC<RightIconProps> = ({
  width = 22,
  height = 22,
  strokeColor = '#1E1E1E',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.58325 11H17.4166M17.4166 11L10.9999 4.58337M17.4166 11L10.9999 17.4167"
        stroke={strokeColor}
        strokeWidth="1.54"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RightIcon;


