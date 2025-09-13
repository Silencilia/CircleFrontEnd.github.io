import React from 'react';
import ConfirmationDialog from '../ConfirmationDialog';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemType?: string;
  itemName?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  itemType = 'item',
  itemName,
}) => {
  const title = `Delete ${itemType}`;
  const message = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title={title}
      message={message}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isDestructive={true}
    />
  );
};

export default DeleteConfirmationDialog;

