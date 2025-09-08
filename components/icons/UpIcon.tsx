import React from 'react';

interface UpIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const UpIcon: React.FC<UpIconProps> = ({ width = 22, height = 22, className = '' }) => {
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
        d="M10.9999 17.4166V4.58325M10.9999 4.58325L4.58325 10.9999M10.9999 4.58325L17.4166 10.9999"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UpIcon;
