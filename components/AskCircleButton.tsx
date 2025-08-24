import React from 'react';

interface AskCircleButtonProps {
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'small' | 'large';
}

const AskCircleButton: React.FC<AskCircleButtonProps> = ({ 
  className = '', 
  onClick,
  variant = 'default' 
}) => {
  const baseClasses = "font-merriweather font-normal text-black whitespace-nowrap bg-circle-neutral-variant rounded-full hover:bg-circle-neutral-variant/80 transition-colors";
  
  const variantClasses = {
    default: "px-4 py-2 text-sm sm:text-base",
    small: "px-3 py-1.5 text-xs sm:text-sm",
    large: "px-6 py-3 text-base sm:text-lg"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      type="button"
    >
      Ask Circle
    </button>
  );
};

export default AskCircleButton;
