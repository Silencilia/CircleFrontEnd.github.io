import React from 'react';
import { DeleteTagIcon } from '../icons';
import { COLORS } from '../../data/variables';

interface DeleteTagButtonProps {
  onDelete: () => void;
  buttonColor?: string;
  iconStrokeColor?: string;
  className?: string;
  size?: number;
}

const DeleteTagButton: React.FC<DeleteTagButtonProps> = ({
  onDelete,
  buttonColor = COLORS.DELETE_TAG_FILL,
  iconStrokeColor = COLORS.DELETE_TAG_STROKE,
  className = '',
  size = 10,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent tag
    onDelete();
  };

  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={handleClick}
      className={`
        flex items-center justify-center
        rounded-[6px]
        hover:opacity-80 transition-opacity
        ${className}
      `}
      style={{ backgroundColor: buttonColor, width: `${size}px`, height: `${size}px` }}
      aria-label="Delete tag"
    >
      <DeleteTagIcon width={size} height={size} fillColor={buttonColor} strokeColor={iconStrokeColor} />
    </button>
  );
};

export default DeleteTagButton;
