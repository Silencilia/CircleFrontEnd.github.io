import React from 'react';
import PlusIcon from '../icons/PlusIcon';

interface NewChatButtonProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick, className = '', disabled = false, 'aria-label': ariaLabel }) => {
  const baseButtonClasses = 'group btn-nav-rd outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none';
  const bgClasses = 'bg-circle-white hover:bg-circle-secondary';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel ?? 'New chat'}
      disabled={disabled}
      className={`${baseButtonClasses} ${bgClasses} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      style={{ borderRadius: '50%' }}
    >
      <PlusIcon
        width={30}
        height={30}
        className="text-circle-primary group-hover:text-circle-neutral transition-colors duration-200"
      />
    </button>
  );
};

export default NewChatButton;


