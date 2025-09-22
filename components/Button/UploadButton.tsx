import React from 'react';
import { PlusIcon } from '../../components/icons';

interface UploadButtonProps {
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ ariaLabel = 'Upload file', onClick, className = '' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`relative btn-lg hover:bg-circle-neutral-variant transition-colors ${className}`}
    >
      <PlusIcon width={22} height={22} />
    </button>
  );
};

export default UploadButton;


