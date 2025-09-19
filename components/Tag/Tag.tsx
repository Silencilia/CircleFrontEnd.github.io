import React, { useState, useRef, useEffect } from 'react';

interface TagProps {
  children: React.ReactNode;
  fillColor?: string;
  textColor?: string;
  className?: string;
  minWidth?: number;
  onClick?: () => void;
  editable?: boolean;
  onEdit?: (newValue: string) => void;
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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(children));
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

  const baseClasses = 'px-[5px] py-0.5 rounded-md flex items-center h-5 flex-shrink-0';
  const interactiveClasses = (isInteractive || isClickableEditable) ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  const editableClasses = editable ? 'hover:bg-opacity-80' : '';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${editableClasses} ${className}`;

  const style = minWidth ? { minWidth: `${minWidth}px` } : undefined;

  return (
    <div 
      className={combinedClasses}
      style={style}
    >
      {isEditing ? (
        <span
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className={`font-circlelabelsmall text-center ${textColor} outline-none`}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          dangerouslySetInnerHTML={{ __html: editValue }}
        />
      ) : (
        <span 
          className={`font-circlelabelsmall text-center ${textColor} ${isClickableEditable ? 'cursor-pointer' : ''}`}
          onClick={handleClick}
        >
          {children}
        </span>
      )}
    </div>
  );
};

export default Tag;
