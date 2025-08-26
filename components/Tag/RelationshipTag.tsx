import React, { useState } from 'react';
import Tag from './Tag';
import { Relationship, useContacts } from '../../contexts/ContactContext';
import ConfirmationDialog from '../ConfirmationDialog';

interface RelationshipTagProps {
  relationship: Relationship;
  contactId?: number;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: (relationship: Relationship) => void;
  editable?: boolean;
  deletable?: boolean;
  onEditComplete?: () => void;
  onDeleteComplete?: () => void;
}

const RelationshipTag: React.FC<RelationshipTagProps> = ({
  relationship,
  contactId,
  fillColor = 'bg-circle-primary',
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
      // TODO: Update the relationship in the database
      console.log(`Editing relationship ${relationship.id} from "${relationship.label}" to "${newLabel}"`);
      
      // This is a placeholder - you might need to implement relationship editing in your data service
      // The actual implementation would depend on how you want to handle relationship updates
      
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error('Failed to edit relationship:', error);
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
          // Remove this relationship ID from the contact's relationshipIds array
          const updatedRelationshipIds = currentContact.relationshipIds.filter(id => id !== relationship.id);
          
          console.log(`Removing relationship ${relationship.id}: "${relationship.label}" from contact ${contactId}`);
          
          // Update the contact with the new relationshipIds array
          await updateContactAsync(contactId, { relationshipIds: updatedRelationshipIds });
          
          if (onDeleteComplete) {
            onDeleteComplete();
          }
        }
      } else {
        // If no contactId provided, just log the action
        console.log(`Deleting relationship ${relationship.id}: "${relationship.label}"`);
        if (onDeleteComplete) {
          onDeleteComplete();
        }
      }
    } catch (error) {
      console.error('Failed to delete relationship:', error);
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
        onClick={onClick ? () => onClick(relationship) : undefined}
        editable={editable}
        onEdit={editable ? handleEdit : undefined}
        onDelete={deletable ? handleDeleteClick : undefined}
        showDelete={deletable}
      >
        {relationship.label}
      </Tag>
      
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Remove Relationship"
        message={`Are you sure you want to remove "${relationship.label}" from this contact?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </>
  );
};

export default RelationshipTag;
