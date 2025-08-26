import React from 'react';
import { DeleteIcon } from '../icons';

interface DeleteTagButtonProps {
  onDelete: () => void;
  buttonColor?: string;
  iconStrokeColor?: string;
  className?: string;
}

const DeleteTagButton: React.FC<DeleteTagButtonProps> = ({
  onDelete,
  buttonColor = '#FBF7F3',
  iconStrokeColor = '#E76835',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent tag
    onDelete();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center
        w-[10px] h-[10px]
        rounded-[6px]
        hover:opacity-80 transition-opacity
        ${className}
      `}
      style={{ backgroundColor: buttonColor }}
      aria-label="Delete tag"
    >
      <DeleteIcon strokeColor={iconStrokeColor} />
    </button>
  );
};

export default DeleteTagButton;
