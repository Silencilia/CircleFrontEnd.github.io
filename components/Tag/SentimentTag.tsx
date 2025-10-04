import React, { useState } from 'react';
import { Sentiment, useContacts } from '../../contexts/ContactContext';
import { DeleteTagButton } from './index';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';

interface SentimentTagProps {
  sentiment: Sentiment;
  noteId: string;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: (sentiment: Sentiment) => void;
}

const SentimentTag: React.FC<SentimentTagProps> = ({
  sentiment,
  noteId,
  fillColor = 'bg-circle-neutral',
  textColor = 'text-circle-primary',
  className = '',
  onClick,
}) => {
  const { state, updateNote } = useContacts();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current note data
  const currentNote = state.notes.find(n => n.id === noteId);

  const handleTagClick = () => {
    if (onClick) {
      onClick(sentiment);
    } else {
      // Toggle delete button visibility
      setShowDeleteButton(!showDeleteButton);
    }
  };

  const handleDelete = async () => {
    if (!currentNote) {
      console.error('No current note found, cannot delete sentiment');
      return;
    }
    
    try {
      // Remove the sentiment from the note's sentiment_ids array
      const updatedSentimentIds = currentNote.sentiment_ids.filter(id => id !== sentiment.id);
      await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });
      setShowDeleteConfirm(false);
      setShowDeleteButton(false);
    } catch (error) {
      console.error('Failed to remove sentiment:', error);
    }
  };

  // Combined layout (desktop style)
  const baseClasses = 'tg flex items-center flex-shrink-0';
  const interactiveClasses = 'cursor-pointer transition-all';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${className}`;

  return (
    <>
      <div className={combinedClasses}>
        <span
          className={`text-center ${textColor}`}
          onClick={handleTagClick}
        >
          {sentiment.label}
        </span>

        {/* Delete button - only show when clicked */}
        {showDeleteButton && (
          <DeleteTagButton
            buttonColor="bg-circle-neutral"
            iconStrokeColor="text-circle-primary"
            className="hover:opacity-80"
            onDelete={() => {
              setShowDeleteConfirm(true);
            }}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={() => {
          handleDelete();
        }}
        itemType="sentiment tag"
        itemName={sentiment.label}
      />
    </>
  );
};

export default SentimentTag;
