import React from 'react';
import Tag from './Tag';
import { Relationship } from '../../contexts/ContactContext';

interface RelationshipTagProps {
  relationship: Relationship;
  contactId?: number;
  fillColor?: string;
  textColor?: string;
  className?: string;
  onClick?: (relationship: Relationship) => void;
  editable?: boolean;
  onEditComplete?: () => void;
}

const RelationshipTag: React.FC<RelationshipTagProps> = ({
  relationship,
  contactId,
  fillColor = 'bg-circle-primary',
  textColor = 'text-white',
  className = '',
  onClick,
  editable = false,
  onEditComplete,
}) => {
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

  return (
    <Tag
      fillColor={fillColor}
      textColor={textColor}
      className={className}
      onClick={onClick ? () => onClick(relationship) : undefined}
      editable={editable}
      onEdit={editable ? handleEdit : undefined}
    >
      {relationship.label}
    </Tag>
  );
};

export default RelationshipTag;
