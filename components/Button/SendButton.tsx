import React from 'react';
import { UpIcon } from '../icons';

interface SendButtonProps {
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

const SendButton: React.FC<SendButtonProps> = ({ ariaLabel = 'Send message', onClick, className = '' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`relative flex flex-row justify-center items-center p-0 w-[38px] h-[38px] rounded-full bg-circle-primary hover:bg-circle-neutral-variant transition-colors ${className}`}
    >
      <UpIcon width={22} height={22} className="text-circle-neutral" />
    </button>
  );
};

export default SendButton;
