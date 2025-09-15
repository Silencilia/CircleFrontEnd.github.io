import React from 'react';
import PlusIcon from '../icons/PlusIcon';

interface NewTagButtonProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const NewTagButton: React.FC<NewTagButtonProps> = ({
  onClick,
  className = '',
  disabled = false,
  'aria-label': ariaLabel = 'Add new tag',
}) => {
  const baseClasses = 'flex flex-row justify-center items-center p-0 gap-2.5 w-5 h-5 bg-circle-neutral rounded-[6px] focus:outline-none transition-all duration-200';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-circle-primary';
  const iconClasses = disabled ? 'text-circle-primary' : 'text-circle-primary group-hover:text-circle-white';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${disabledClasses} ${className} group`}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <PlusIcon
        width={16}
        height={16}
        className={`${iconClasses} transition-colors duration-200`}
      />
    </button>
  );
};

export default NewTagButton;
