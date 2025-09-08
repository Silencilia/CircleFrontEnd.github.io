import React from 'react';

interface PlusIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({ width = 22, height = 22, className = '' }) => {
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
        d="M11 4.58334V17.4167M4.58337 11H17.4167"
        stroke="#262B35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default PlusIcon;


