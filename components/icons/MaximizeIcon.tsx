import React from 'react';

interface MaximizeIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const MaximizeIcon: React.FC<MaximizeIconProps> = ({ width = 16, height = 16, className = '' }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2H14M14 2V6M14 2L9.33333 6.66667M6 14H2M2 14V10M2 14L6.66667 9.33333" stroke="#262B35" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
  );
};

export default MaximizeIcon;
