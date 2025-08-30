import React from 'react';
import Tag from './Tag';
import { Subject } from '../../contexts/ContactContext';

interface SubjectTagProps {
  subject: Subject;
  contactId?: number;
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

  return (
    <Tag
      fillColor={fillColor}
      textColor={textColor}
      className={className}
      onClick={onClick ? () => onClick(subject) : undefined}
      editable={editable}
      onEdit={editable ? handleEdit : undefined}
    >
      {subject.label}
    </Tag>
  );
};

export default SubjectTag;
