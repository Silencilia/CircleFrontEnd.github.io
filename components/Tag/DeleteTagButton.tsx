import React from 'react';
import { DeleteTagIcon } from '../icons';
import { COLORS } from '../../data/variables';

interface DeleteTagButtonProps {
  onDelete: () => void;
  buttonColor?: string;
  iconStrokeColor?: string;
  className?: string;
}

const DeleteTagButton: React.FC<DeleteTagButtonProps> = ({
  onDelete,
  buttonColor = COLORS.DELETE_TAG_FILL,
  iconStrokeColor = COLORS.DELETE_TAG_STROKE,
  className = '',
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
        btn-tg
        hover:opacity-80 transition-opacity
        ${className}
      `}
      style={{ backgroundColor: buttonColor }}
      aria-label="Delete tag"
    >
      <DeleteTagIcon fillColor={buttonColor} strokeColor={iconStrokeColor} />
    </button>
  );
};

export default DeleteTagButton;
