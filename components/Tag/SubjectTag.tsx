import React, { useState } from 'react';
import { Subject, useContacts } from '../../contexts/ContactContext';
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
}) => {
  const { state, updateContact } = useContacts();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current contact data
  const currentContact = state.contacts.find(c => c.id === contactId);

  const handleTagClick = () => {
    if (onClick) {
      onClick(subject);
    } else {
      // Toggle delete button visibility
      setShowDeleteButton(!showDeleteButton);
    }
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
  const interactiveClasses = 'cursor-pointer hover:opacity-80 transition-opacity';
  const combinedClasses = `${baseClasses} ${fillColor} ${interactiveClasses} ${className}`;

  return (
    <>
      <div className={combinedClasses}>
        <span 
          className={`text-center ${textColor}`}
          onClick={handleTagClick}
        >
          {subject.label}
        </span>
        
        {/* Delete button - only show when clicked */}
        {showDeleteButton && (
          <DeleteTagButton
            buttonColor="#FBF7F3"
            iconStrokeColor="#E76835"
            className="hover:opacity-80"
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
