import React, { useState, useRef, useEffect } from 'react';
import { Sentiment, useContacts } from '../../contexts/ContactContext';
import ContentEditable from 'react-contenteditable';
import { DeleteTagButton } from './index';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { STRINGS } from '../../data/strings';

interface SentimentTagProps {
  sentiment: Sentiment;
  noteId: string;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: (sentiment: Sentiment) => void;
  editable?: boolean;
  onEditComplete?: () => void;
}

const SentimentTag: React.FC<SentimentTagProps> = ({
  sentiment,
  noteId,
  fillColor = 'bg-circle-neutral',
  textColor = 'text-circle-primary',
  className = '',
  onClick,
  editable = false,
  onEditComplete,
}) => {
  const { state, updateSentiment, updateNote, addSentiment } = useContacts();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sentiment.label);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);

  // Get current note data
  const currentNote = state.notes.find(n => n.id === noteId);
  console.log('SentimentTag: currentNote found:', currentNote);
  
  // Update editValue when sentiment changes (important for when parent re-renders)
  useEffect(() => {
    console.log('SentimentTag: useEffect triggered - sentiment.label:', sentiment.label, 'isEditing:', isEditing, 'current editValue:', editValue);
    if (!isEditing) {
      console.log('SentimentTag: Setting editValue to sentiment.label:', sentiment.label);
      setEditValue(sentiment.label);
    }
  }, [sentiment.label, isEditing]);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      console.log('Setting focus on ContentEditable');
      contentEditableRef.current.focus();
      // Place cursor at the end of the text
      const range = document.createRange();
      const selection = window.getSelection();
      if (contentEditableRef.current.firstChild) {
        range.setStart(contentEditableRef.current.firstChild, contentEditableRef.current.textContent?.length || 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
      }
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleEditClick = () => {
    console.log('SentimentTag: handleEditClick called, editable:', editable);
    if (editable) {
      console.log('SentimentTag: Entering edit mode');
      setIsEditing(true);
    } else if (onClick) {
      // If not editable, trigger the onClick handler
      onClick(sentiment);
    }
  };

  const handleEdit = async (newLabel: string) => {
    console.log('SentimentTag: handleEdit called with:', newLabel);
    try {
      if (!currentNote) {
        console.error('SentimentTag: No current note found');
        return;
      }

      const trimmedLabel = newLabel.trim().toLowerCase();
      console.log('SentimentTag: Trimmed label:', trimmedLabel);
      console.log('SentimentTag: Current sentiment label:', sentiment.label.toLowerCase());

      if (trimmedLabel !== sentiment.label.toLowerCase()) {
        console.log('SentimentTag: Labels are different, proceeding with update');

        // Check if a sentiment with this label already exists
        const existingSentiment = state.sentiments.find(s =>
          s.label.toLowerCase() === trimmedLabel
        );
        console.log('SentimentTag: Existing sentiment found:', existingSentiment);

        if (existingSentiment) {
          console.log('SentimentTag: Using existing sentiment:', existingSentiment.label);
          // Use existing sentiment - update note to use the existing sentiment
          const updatedSentimentIds = currentNote.sentiment_ids.filter(id => id !== sentiment.id);
          updatedSentimentIds.push(existingSentiment.id);
          console.log('SentimentTag: Updated sentiment IDs:', updatedSentimentIds);
          await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });

          // Update local state to reflect the change immediately
          setEditValue(existingSentiment.label);
        } else {
          console.log('SentimentTag: Creating new sentiment with label:', trimmedLabel);
          // Create new sentiment and update note to use it
          const newSentiment = await addSentiment({
            label: trimmedLabel,
            category: STRINGS.SENTIMENTS.NEUTRAL
          });
          console.log('SentimentTag: New sentiment created:', newSentiment);
          const updatedSentimentIds = currentNote.sentiment_ids.filter(id => id !== sentiment.id);
          updatedSentimentIds.push(newSentiment.id);
          console.log('SentimentTag: Updated sentiment IDs:', updatedSentimentIds);
          await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });

          // Update local state to reflect the change immediately
          setEditValue(newSentiment.label);
        }

        // Force exit editing mode and update display
        setIsEditing(false);

        if (onEditComplete) {
          console.log('SentimentTag: Edit completed, calling onEditComplete');
          onEditComplete();
        }
      } else {
        console.log('SentimentTag: Labels are the same, no update needed');
      }
    } catch (error) {
      console.error('Failed to edit sentiment:', error);
      // Revert to original value on error
      setEditValue(sentiment.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('SentimentTag: Key pressed:', e.key, 'shiftKey:', e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('SentimentTag: Enter key detected, calling handleSave');
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      console.log('SentimentTag: Escape key detected, calling handleCancel');
      handleCancel();
    }
  };

  const handleSave = () => {
    console.log('SentimentTag: handleSave called, isEditing:', isEditing, 'editValue:', editValue, 'sentiment.label:', sentiment.label);
    if (isEditing) {
      console.log('SentimentTag: Exiting edit mode');
      setIsEditing(false);
      const trimmedEdit = editValue.trim().toLowerCase();
      const currentLabel = sentiment.label.toLowerCase();
      console.log('SentimentTag: Comparing', JSON.stringify(trimmedEdit), 'vs', JSON.stringify(currentLabel));
      if (trimmedEdit !== currentLabel) {
        console.log('SentimentTag: Labels differ, calling handleEdit');
        handleEdit(editValue);
      } else {
        console.log('SentimentTag: Labels are the same, no change needed');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(sentiment.label);
  };

  const handleBlur = () => {
    console.log('SentimentTag: handleBlur called, isEditing:', isEditing);
    // Delay to allow click events (e.g., delete) to register before saving
    setTimeout(() => {
      if (isEditing) {
        console.log('SentimentTag: handleBlur - calling handleSave');
        handleSave();
      }
    }, 100);
  };

  const handleDelete = async () => {
    if (!currentNote) return;
    
    try {
      // Remove the sentiment from the note's sentiment_ids array
      const updatedSentimentIds = currentNote.sentiment_ids.filter(id => id !== sentiment.id);
      await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to remove sentiment:', error);
    }
  };

  const baseClasses = 'px-[5px] py-0.5 rounded-md flex items-center h-5 flex-shrink-0 gap-[5px]';
  const interactiveClasses = (onClick || editable) ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${className}`;

  return (
    <>
      <div className={combinedClasses}>
        {isEditing ? (
          <ContentEditable
            innerRef={contentEditableRef}
            html={editValue}
            onChange={(e) => {
              console.log('ContentEditable onChange:', e.target.value, 'setting editValue');
              setEditValue(e.target.value);
              console.log('ContentEditable onChange: editValue should now be:', e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`font-inter font-medium text-[11px] leading-4 text-center tracking-[0.5px] ${textColor} outline-none flex-1`}
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        ) : (
          <span 
            className={`font-inter font-medium text-[11px] leading-4 text-center tracking-[0.5px] ${textColor}`}
            onClick={handleEditClick}
          >
            {sentiment.label}
          </span>
        )}
        
        {/* Delete button - only show when editing */}
        {isEditing && (
          <DeleteTagButton
            size={12}
            buttonColor="#262B35"
            iconStrokeColor="#FBF7F3"
            className="hover:opacity-80"
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemType="sentiment tag"
        itemName={sentiment.label}
      />
    </>
  );
};

export default SentimentTag;
