import React from 'react';

interface PlayButtonProps {
  ariaLabel?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ ariaLabel = 'Play audio', isActive = false, onClick, className = '' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`btn-sm ${isActive ? 'bg-circle-primary text-circle-neutral' : 'bg-circle-neutral-variant text-circle-primary hover:bg-circle-primary hover:text-circle-neutral'} transition-colors duration-200 ${className}`}
    >
      {/* Simple triangle play icon using CSS borders */}
      <span
        className="block"
        style={{
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '10px solid currentColor',
          marginLeft: '2px',
        }}
      />
    </button>
  );
};

export default PlayButton;


