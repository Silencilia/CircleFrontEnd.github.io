import React, { useState, useRef, useEffect } from 'react';
import { Subject, useContacts } from '../../contexts/ContactContext';
import ContentEditable from 'react-contenteditable';
import { DeleteTagButton } from './index';
import SubjectDeleteDialog from '../Dialogs/SubjectDeleteDialog';

interface SubjectTagProps {
  subject: Subject;
  contactId: number;
  fillColor?: string;
  textColor?: string;
  className?: string;
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
  onClick,
  editable = false,
  onEditComplete,
}) => {
  const { state, updateSubjectAsync, updateContactAsync } = useContacts();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subject.label);
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
    }
  };

  const handleEdit = async (newLabel: string) => {
    try {
      // Update the subject label in the contact context
      if (currentContact && newLabel.trim() !== subject.label) {
        // Create a new subject with updated label
        const updatedSubject = { ...subject, label: newLabel.trim() };
        
        // Update the subject in the context state
        await updateSubjectAsync(subject.id, { label: newLabel.trim() });
        
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
    if (!currentContact) return;
    
    try {
      // Remove the subject from the contact's subjectIds array
      const updatedSubjectIds = currentContact.subjectIds.filter(id => id !== subject.id);
      await updateContactAsync(currentContact.id, { subjectIds: updatedSubjectIds });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to remove subject:', error);
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
            onChange={(e) => setEditValue(e.target.value)}
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
            {subject.label}
          </span>
        )}
        
        {/* Delete button - only show when editing */}
        {isEditing && (
          <DeleteTagButton
            size={12}
            buttonColor="#FFFFFF"
            iconStrokeColor="#E76835"
            className="hover:bg-gray-100"
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <SubjectDeleteDialog
        isOpen={showDeleteConfirm}
        subjectLabel={subject.label}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default SubjectTag;
