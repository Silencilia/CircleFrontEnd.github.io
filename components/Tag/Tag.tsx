import React from 'react';

interface TagProps {
  children: React.ReactNode;
  fillColor?: string;
  textColor?: string;
  className?: string;
  minWidth?: number;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({
  children,
  fillColor = 'bg-gray-200',
  textColor = 'text-gray-800',
  className = '',
  minWidth,
  onClick,
}) => {
  const isInteractive = !!onClick;
  
  const baseClasses = 'tg flex items-center flex-shrink-0';
  const interactiveClasses = isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${className}`;

  const style = minWidth ? { minWidth: `${minWidth}px` } : undefined;

  return (
    <div 
      className={combinedClasses}
      style={style}
    >
      <span 
        className={`text-center ${textColor}`}
        onClick={onClick}
      >
        {children}
      </span>
    </div>
  );
};

export default Tag;
