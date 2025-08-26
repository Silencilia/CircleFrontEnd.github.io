import React, { useState, useRef, useEffect } from 'react';
import DeleteTagButton from './DeleteTagButton';

interface TagProps {
  children: React.ReactNode;
  fillColor?: string;
  textColor?: string;
  className?: string;
  minWidth?: number;
  onClick?: () => void;
  editable?: boolean;
  onEdit?: (newValue: string) => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const Tag: React.FC<TagProps> = ({
  children,
  fillColor = 'bg-gray-200',
  textColor = 'text-gray-800',
  className = '',
  minWidth,
  onClick,
  editable = false,
  onEdit,
  onDelete,
  showDelete = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(children));
  const [isHovered, setIsHovered] = useState(false);
  const editRef = useRef<HTMLSpanElement>(null);
  
  const isInteractive = !!onClick && !editable;
  const isClickableEditable = editable && !!onClick;
  
  useEffect(() => {
    setEditValue(String(children));
  }, [children]);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // Select all text when entering edit mode
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (editable && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (isEditing && onEdit) {
      const trimmedValue = editValue.trim();
      if (trimmedValue && trimmedValue !== children) {
        onEdit(trimmedValue);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(children));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSave();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    setEditValue(e.currentTarget.textContent || '');
  };

  const handleClick = () => {
    if (isClickableEditable) {
      handleEdit();
    } else if (onClick && !isEditing) {
      onClick();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Determine button and icon colors for DeleteTagButton
  const getButtonColor = () => {
    // Extract color from textColor class or use fallback
    if (textColor.includes('text-white')) return 'white';
    if (textColor.includes('text-black')) return 'black';
    return 'white'; // Default fallback
  };

  const getIconColor = () => {
    // Extract color from fillColor class or use fallback
    if (fillColor.includes('bg-circle-secondary')) return '#E76835';
    if (fillColor.includes('bg-circle-primary')) return '#262B35';
    if (fillColor.includes('bg-[#E76835]')) return '#E76835';
    return '#E76835'; // Default fallback
  };

  const baseClasses = 'px-[5px] py-0.5 rounded-md flex items-center h-5 flex-shrink-0';
  const interactiveClasses = (isInteractive || isClickableEditable) ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  const editableClasses = editable ? 'hover:bg-opacity-80' : '';
  const gapClass = showDelete && isHovered && onDelete && !isEditing ? 'gap-[5px]' : '';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${editableClasses} ${gapClass} ${className}`;

  const style = minWidth ? { minWidth: `${minWidth}px` } : undefined;

  return (
    <div 
      className={combinedClasses}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <span
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className={`font-inter font-medium text-[11px] leading-4 text-center tracking-[0.5px] ${textColor} outline-none`}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          dangerouslySetInnerHTML={{ __html: editValue }}
        />
      ) : (
        <span 
          className={`font-inter font-medium text-[11px] leading-4 text-center tracking-[0.5px] ${textColor} ${isClickableEditable ? 'cursor-pointer' : ''}`}
          onClick={handleClick}
        >
          {children}
        </span>
      )}
      
      {/* Show DeleteTagButton on hover */}
      {showDelete && isHovered && onDelete && !isEditing && (
        <DeleteTagButton
          onDelete={handleDelete}
          buttonColor={getButtonColor()}
          iconStrokeColor={getIconColor()}
        />
      )}
    </div>
  );
};

export default Tag;
