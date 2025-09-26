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
  const baseClasses = 'flex w-[20px] h-[20px] items-center justify-center rounded-xs svg:stroke-[1.5px] bg-circle-neutral focus:outline-none transition-all duration-200';
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
