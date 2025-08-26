import React, { useState } from 'react';
import Tag from './Tag';
import { Subject, useContacts } from '../../contexts/ContactContext';
import ConfirmationDialog from '../ConfirmationDialog';

interface SubjectTagProps {
  subject: Subject;
  contactId?: number;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: (subject: Subject) => void;
  editable?: boolean;
  deletable?: boolean;
  onEditComplete?: () => void;
  onDeleteComplete?: () => void;
}

const SubjectTag: React.FC<SubjectTagProps> = ({
  subject,
  contactId,
  fillColor = 'bg-circle-secondary',
  textColor = 'text-white',
  className = '',
  onClick,
  editable = false,
  deletable = false,
  onEditComplete,
  onDeleteComplete,
}) => {
  const { updateContactAsync, state } = useContacts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = async (newLabel: string) => {
    try {
      // TODO: Update the subject in the database
      // For now, we'll update the subject label through the contact context
      // In a real implementation, you might have a updateSubjectAsync method
      console.log(`Editing subject ${subject.id} from "${subject.label}" to "${newLabel}"`);
      
      // This is a placeholder - you might need to implement subject editing in your data service
      // The actual implementation would depend on how you want to handle subject updates
      
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error('Failed to edit subject:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    
    try {
      if (contactId && updateContactAsync) {
        // Get the current contact from the context
        const currentContact = state.contacts.find(c => c.id === contactId);
        
        if (currentContact) {
          // Remove this subject ID from the contact's subjectIds array
          const updatedSubjectIds = currentContact.subjectIds.filter(id => id !== subject.id);
          
          console.log(`Removing subject ${subject.id}: "${subject.label}" from contact ${contactId}`);
          
          // Update the contact with the new subjectIds array
          await updateContactAsync(contactId, { subjectIds: updatedSubjectIds });
          
          if (onDeleteComplete) {
            onDeleteComplete();
          }
        }
      } else {
        // If no contactId provided, just log the action
        console.log(`Deleting subject ${subject.id}: "${subject.label}"`);
        if (onDeleteComplete) {
          onDeleteComplete();
        }
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Tag
        fillColor={fillColor}
        textColor={textColor}
        className={className}
        onClick={onClick ? () => onClick(subject) : undefined}
        editable={editable}
        onEdit={editable ? handleEdit : undefined}
        onDelete={deletable ? handleDeleteClick : undefined}
        showDelete={deletable}
      >
        {subject.label}
      </Tag>
      
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Remove Subject"
        message={`Are you sure you want to remove "${subject.label}" from this contact?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </>
  );
};

export default SubjectTag;
