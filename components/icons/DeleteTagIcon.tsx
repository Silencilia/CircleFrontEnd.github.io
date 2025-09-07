import React from 'react';

interface DeleteTagIconProps {
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  className?: string;
}

const DeleteTagIcon: React.FC<DeleteTagIconProps> = ({
  width = 10,
  height = 10,
  fillColor = '#FBF7F3',
  strokeColor = '#E76835',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="10" height="10" rx="5" fill={fillColor} />
      <path d="M7 3L3 7M3 3L7 7" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default DeleteTagIcon;


