import React from 'react';
import { SpeakerIcon } from '../../components/icons';

interface VoiceButtonProps {
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ ariaLabel = 'Voice input', onClick, className = '' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`relative btn-lg hover:bg-circle-neutral-variant transition-colors ${className}`}
    >
      <SpeakerIcon width={22} height={22} />
    </button>
  );
};

export default VoiceButton;


