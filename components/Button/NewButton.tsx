import React from 'react';
import PlusIcon from '../icons/PlusIcon';

interface NewButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

const NewButton: React.FC<NewButtonProps> = ({ text, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        group
        flex flex-row justify-center items-center
        px-[5px] py-[5px] gap-[5px]
        w-fit h-[30px]
        bg-circle-neutral-variant
        rounded-[15px]
        transition-colors duration-200
        hover:bg-circle-secondary
        ${className}
      `}
    >
      {/* Plus Icon */}
      <div className="flex-none order-0 flex-grow-0">
        <PlusIcon 
          width={20} 
          height={20} 
          className="text-circle-primary group-hover:text-circle-neutral transition-colors duration-200" 
        />
      </div>
      
      {/* Text Frame */}
      <div className="flex flex-row justify-center items-center gap-[10px] h-[16px] flex-none order-1 flex-grow-0">
        <span className="h-[16px] font-circlelabelsmall text-circle-primary group-hover:text-circle-neutral transition-colors duration-200 flex-none order-0 flex-grow-0 pr-[5px]">
          {text}
        </span>
      </div>
    </button>
  );
};

export default NewButton;
