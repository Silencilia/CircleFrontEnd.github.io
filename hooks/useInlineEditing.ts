import { useState, useEffect, useRef } from 'react';

export interface InlineEditingOptions {
  autoSave?: boolean;
  saveOnBlur?: boolean;
  keyboardShortcuts?: boolean;
  selectAllOnFocus?: boolean;
}

export interface InlineEditingState<T> {
  isEditing: boolean;
  editValue: T;
  originalValue: T;
  isSaving: boolean;
}

export interface InlineEditingActions<T> {
  startEditing: () => void;
  save: () => Promise<void>;
  cancel: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleKeyUp: (e: React.KeyboardEvent) => void;
  handleBlur: () => void;
}

/**
 * Reusable hook for inline editing functionality
 * Provides common patterns for save, cancel, keyboard events, and state management
 */
export function useInlineEditing<T>(
  initialValue: T,
  onSave: (value: T) => Promise<void>,
  options: InlineEditingOptions = {}
): [InlineEditingState<T>, InlineEditingActions<T>, React.RefObject<HTMLElement>] {
  const {
    autoSave = false,
    saveOnBlur = true,
    keyboardShortcuts = true,
    selectAllOnFocus = true
  } = options;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);

  // Update editValue when initialValue changes
  useEffect(() => {
    setEditValue(initialValue);
  }, [initialValue]);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(initialValue);
    setOriginalValue(initialValue);
    
    if (selectAllOnFocus) {
      setTimeout(() => {
        if (contentEditableRef.current) {
          contentEditableRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    }
  };

  const save = async () => {
    try {
      setIsSaving(true);
      await onSave(editValue);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(originalValue);
    } finally {
      setIsSaving(false);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setEditValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!keyboardShortcuts) return;

    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!keyboardShortcuts) return;

    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleBlur = () => {
    if (saveOnBlur) {
      setTimeout(() => {
        if (isEditing) {
          save();
        }
      }, 100);
    }
  };

  const state: InlineEditingState<T> = {
    isEditing,
    editValue,
    originalValue,
    isSaving
  };

  const actions: InlineEditingActions<T> = {
    startEditing,
    save,
    cancel,
    handleKeyDown,
    handleKeyUp,
    handleBlur
  };

  return [state, actions, contentEditableRef];
}
