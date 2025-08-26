import React from 'react';

interface DeleteIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

const DeleteIcon: React.FC<DeleteIconProps> = ({
  width = 8,
  height = 8,
  strokeColor = '#E76835',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 2L2 6M2 2L6 6"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DeleteIcon;
