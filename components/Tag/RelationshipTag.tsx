import React, { useState } from 'react';
import { Relationship, useContacts } from '../../contexts/ContactContext';
import { DeleteTagButton } from './index';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';

interface RelationshipTagProps {
  relationship: Relationship;
  contactId: string;
  fillColor?: string;
  textColor?: string;
  className?: string;
  deleteButtonColor?: string;
  iconStrokeColor?: string;
  onClick?: (relationship: Relationship) => void;
  editable?: boolean;
}

const RelationshipTag: React.FC<RelationshipTagProps> = ({
  relationship,
  contactId,
  fillColor = 'bg-circle-primary',
  textColor = 'text-white',
  className = '',
  deleteButtonColor = 'bg-circle-primary',
  iconStrokeColor = 'rgb(255 255 255)',
  onClick,
  editable = false,
}) => {
  const { state, updateContact } = useContacts();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current contact data
  const currentContact = state.contacts.find(c => c.id === contactId);

  const handleTagClick = () => {
    if (onClick) {
      onClick(relationship);
    } else {
      // Toggle delete button visibility
      setShowDeleteButton(!showDeleteButton);
    }
  };

  const handleDelete = async () => {
    if (!currentContact) {
      console.error('No current contact found, cannot delete relationship');
      return;
    }

    try {
      // Remove the relationship from the contact's relationship_ids array
      const updatedRelationshipIds = currentContact.relationship_ids.filter(id => id !== relationship.id);
      await updateContact(currentContact.id, { relationship_ids: updatedRelationshipIds });
      setShowDeleteConfirm(false);
      setShowDeleteButton(false);
    } catch (error) {
      console.error('Failed to remove relationship:', error);
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
          {relationship.label}
        </span>

        {/* Delete button - only show when clicked */}
        {showDeleteButton && (
          <DeleteTagButton
            buttonColor={deleteButtonColor}
            iconStrokeColor={iconStrokeColor}
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
        itemType="relationship tag"
        itemName={relationship.label}
      />
    </>
  );
};

export default RelationshipTag;
