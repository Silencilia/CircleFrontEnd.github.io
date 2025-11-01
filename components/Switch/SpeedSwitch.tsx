import React from 'react';

interface SpeedSwitchProps {
  isSpeedMode?: boolean;
  onToggle?: () => void;
  className?: string;
}

const SpeedSwitch: React.FC<SpeedSwitchProps> = ({ 
  isSpeedMode = false, 
  onToggle,
  className = '' 
}) => {
  return (
    <div 
      className={`relative flex items-center p-[3px] w-[40px] h-[20px] ${isSpeedMode ? 'bg-circle-secondary' : 'bg-circle-primary'} rounded-full cursor-pointer overflow-hidden transition-colors duration-300 ease-out select-none ${className}`}
      onClick={onToggle}
    >
      <div 
        className={`w-[14px] h-[14px] bg-white rounded-full absolute left-[3px] top-1/2 -translate-y-1/2 transform-gpu transition-transform duration-300 ease-out ${isSpeedMode ? 'translate-x-[21px]' : 'translate-x-0'}`}
      />
    </div>
  );
};

export default SpeedSwitch;
