import React from 'react';
import ConfirmationDialog from '../ConfirmationDialog';

interface SubjectDeleteDialogProps {
  isOpen: boolean;
  subjectLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const SubjectDeleteDialog: React.FC<SubjectDeleteDialogProps> = ({
  isOpen,
  subjectLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Remove Subject"
      message={`Are you sure you want to remove "${subjectLabel}" from this contact?`}
      confirmText="Remove"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isDestructive={true}
    />
  );
};

export default SubjectDeleteDialog;


