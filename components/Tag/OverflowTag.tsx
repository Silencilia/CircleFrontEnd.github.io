import React from 'react';
import Tag from './Tag';

interface OverflowTagProps {
  count: number;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: () => void;
}

const OverflowTag: React.FC<OverflowTagProps> = ({
  count,
  fillColor = 'bg-circle-secondary',
  textColor = 'text-white',
  className = '',
  onClick,
}) => {
  return (
    <Tag
      fillColor={fillColor}
      textColor={textColor}
      className={className}
      onClick={onClick}
    >
      +{count}
    </Tag>
  );
};

export default OverflowTag;
