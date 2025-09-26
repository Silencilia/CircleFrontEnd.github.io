import React from 'react';
import { createPortal } from 'react-dom';
import { CancelButton, ConfirmButton } from '../Button';

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
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const title = `Delete ${itemType}`;
  const message = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-circle-primary/50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-circle-white border border-circle-neutral-variant rounded-md p-md max-w-[480px] w-full mx-md shadow-lg">
        <h3 className="font-circletitlemedium text-circle-primary mb-lg">
          {title}
        </h3>
        
        <p className="font-circlebodymedium-draft text-circle-primary mb-lg leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-row gap-xs justify-end">
          <CancelButton
            onClick={onCancel}
            ariaLabel="Cancel deletion"
          />
          
          <ConfirmButton
            onClick={onConfirm}
            ariaLabel="Confirm deletion"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmationDialog;

