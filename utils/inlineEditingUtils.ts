import { useState, useRef, useEffect } from 'react';
import { EDITING_MODE_PADDING } from '../data/variables';

export interface InlineEditingState {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  originalValue: string;
  setOriginalValue: (value: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  contentEditableRef: React.RefObject<HTMLElement>;
}

export interface InlineEditingHandlers {
  handleEditClick: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleKeyUp: (e: React.KeyboardEvent) => void;
  handleBlur: () => void;
}

/**
 * Creates the state management for inline editing
 */
export const createInlineEditingState = (initialValue: string): InlineEditingState => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);

  return {
    isEditing,
    setIsEditing,
    editValue,
    setEditValue,
    originalValue,
    setOriginalValue,
    isSaving,
    setIsSaving,
    contentEditableRef
  };
};

/**
 * Creates the event handlers for inline editing
 */
export const createInlineEditingHandlers = (
  state: InlineEditingState,
  currentValue: string,
  onSave: (value: string) => Promise<void>
): InlineEditingHandlers => {
  const {
    isEditing,
    setIsEditing,
    editValue,
    setEditValue,
    originalValue,
    setOriginalValue,
    isSaving,
    setIsSaving,
    contentEditableRef
  } = state;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(currentValue);
    setOriginalValue(currentValue);
    focusEditableElement(contentEditableRef);
  };

  const handleSave = async () => {
    const currentHtml = contentEditableRef.current?.innerHTML ?? editValue;
    const cleanValue = currentHtml.replace(/<[^>]*>/g, '').trim();
    
    if (cleanValue !== currentValue) {
      try {
        setIsSaving(true);
        await onSave(cleanValue);
      } catch (error) {
        console.error('Save failed:', error);
        setEditValue(originalValue);
        return; // Don't exit editing mode on error
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  return {
    handleEditClick,
    handleSave,
    handleCancel,
    handleKeyDown,
    handleKeyUp,
    handleBlur
  };
};

/**
 * Focuses the editable element and positions cursor at the end
 */
export const focusEditableElement = (ref: React.RefObject<HTMLElement>) => {
  setTimeout(() => {
    if (ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, 10);
};

/**
 * Gets the base styling for inline editing elements
 */
export const getBaseInlineEditingStyles = (minHeight = '20px') => ({
  className: `outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[${minHeight}] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50`,
  style: {
    minHeight,
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const
  }
});

/**
 * Syncs the edit value with external changes
 */
export const useInlineEditingSync = (
  state: InlineEditingState,
  currentValue: string,
  isEditing: boolean
) => {
  useEffect(() => {
    if (!isEditing) {
      state.setEditValue(currentValue);
    }
  }, [currentValue, isEditing, state]);
};
