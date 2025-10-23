import React, { useState, useRef, useEffect } from 'react';
import { Subject, useContacts } from '../../contexts/ContactContext';
import ContentEditable from 'react-contenteditable';
import { DeleteTagButton } from './index';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';

interface SubjectTagProps {
  subject: Subject;
  contactId: string;
  fillColor?: string;
  textColor?: string;
  className?: string;
  deleteButtonColor?: string;
  iconStrokeColor?: string;
  onClick?: (subject: Subject) => void;
  editable?: boolean;
  onEditComplete?: () => void;
}

const SubjectTag: React.FC<SubjectTagProps> = ({
  subject,
  contactId,
  fillColor = 'bg-circle-secondary',
  textColor = 'text-white',
  className = '',
  deleteButtonColor = 'bg-circle-secondary',
  iconStrokeColor = 'rgb(255 255 255)',
  onClick,
  editable = false,
  onEditComplete,
}) => {
  const { state, updateSubject, updateContact } = useContacts();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subject.label);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);

  // Get current contact data
  const currentContact = state.contacts.find(c => c.id === contactId);
  
  useEffect(() => {
    setEditValue(subject.label);
  }, [subject.label]);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      // Place cursor at the end of the text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleEditClick = () => {
    if (editable) {
      setIsEditing(true);
    } else if (onClick) {
      // If not editable, trigger the onClick handler
      onClick(subject);
    } else {
      // Toggle delete button visibility
      setShowDeleteButton(!showDeleteButton);
    }
  };

  const handleEdit = async (newLabel: string) => {
    try {
      // Update the subject label in the contact context
      if (currentContact && newLabel.trim() !== subject.label) {
        // Create a new subject with updated label
        const updatedSubject = { ...subject, label: newLabel.trim() };
        
        // Update the subject in the context state
        await updateSubject(subject.id, { label: newLabel.trim() });
        
        if (onEditComplete) {
          onEditComplete();
        }
      }
    } catch (error) {
      console.error('Failed to edit subject:', error);
      // Revert to original value on error
      setEditValue(subject.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    if (isEditing) {
      setIsEditing(false);
      if (editValue.trim() !== subject.label) {
        handleEdit(editValue);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(subject.label);
  };

  const handleBlur = () => {
    // Delay to allow click events (e.g., delete) to register before saving
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  const handleDelete = async () => {
    if (!currentContact) {
      console.error('No current contact found, cannot delete subject');
      return;
    }

    try {
      // Remove the subject from the contact's subject_ids array
      const updatedSubjectIds = currentContact.subject_ids.filter(id => id !== subject.id);
      await updateContact(currentContact.id, { subject_ids: updatedSubjectIds });
      setShowDeleteConfirm(false);
      setShowDeleteButton(false);
    } catch (error) {
      console.error('Failed to remove subject:', error);
    }
  };

  const baseClasses = 'tg flex items-center flex-shrink-0';
  const interactiveClasses = (onClick || editable || true) ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${className}`;

  return (
    <>
      <div className={combinedClasses}>
        {isEditing ? (
          <ContentEditable
            innerRef={contentEditableRef}
            html={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`text-center ${textColor} outline-none flex-1`}
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        ) : (
          <span 
            className={`text-center ${textColor}`}
            onClick={handleEditClick}
          >
            {subject.label}
          </span>
        )}
        
        {/* Delete button - show when editing OR when clicked */}
        {(isEditing || showDeleteButton) && (
          <DeleteTagButton
            buttonColor={isEditing ? "#FFFFFF" : deleteButtonColor}
            iconStrokeColor={isEditing ? "#E76835" : iconStrokeColor}
            className={isEditing ? "hover:bg-gray-100" : "hover:opacity-80"}
            onDelete={() => setShowDeleteConfirm(true)}
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
        itemType="subject tag"
        itemName={subject.label}
      />
    </>
  );
};

export default SubjectTag;
