import React from 'react';
import { SpeakerIcon } from '../../components/icons';

interface VoiceButtonLgProps {
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

const VoiceButtonLg: React.FC<VoiceButtonLgProps> = ({ ariaLabel = 'Voice input', onClick, className = '', isActive = false }) => {
  const baseClasses = 'group relative flex flex-row justify-center items-center p-lg rounded-full w-[75px] h-[75px] transition-colors duration-200 ease-out';
  const inactiveClasses = 'bg-circle-neutral-variant text-circle-primary hover:bg-circle-primary hover:text-circle-neutral';
  const activeClasses = 'bg-circle-primary text-circle-neutral voice-recording-anim';
  const composed = `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={composed}
    >
        <SpeakerIcon className={`w-full h-full transition-colors duration-200 ease-out ${isActive ? 'text-circle-neutral' : 'text-circle-primary group-hover:text-circle-neutral'}`} />
    </button>
  );
};

export default VoiceButtonLg;


