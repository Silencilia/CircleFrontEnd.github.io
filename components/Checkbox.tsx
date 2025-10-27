import React from 'react';
import { ConfirmIcon } from './icons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        w-[18px] h-[18px] rounded-xs flex items-center justify-center shrink-0 
        transition-colors
        ${checked 
          ? 'bg-circle-primary' 
          : 'bg-circle-neutral-variant'
        }
        ${!disabled ? 'cursor-pointer hover:bg-circle-primary' : 'opacity-50 cursor-not-allowed'}
      `}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <ConfirmIcon 
          className="text-circle-white w-[15px] h-[15px]" 
          strokeWidth={1.5}
        />
      )}
    </button>
  );
};

export default Checkbox;

