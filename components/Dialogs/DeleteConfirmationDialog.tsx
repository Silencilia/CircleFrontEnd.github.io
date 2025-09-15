import React from 'react';
import { createPortal } from 'react-dom';

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
    (
      <div 
        className="fixed inset-0 bg-circle-primary/50 flex items-center justify-center z-[9999]"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="bg-circle-white border border-circle-neutral-variant rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
          <h3 className="Circletitlemedium text-circle-primary mb-3">
            {title}
          </h3>
          
          <p className="Circlebodymedium text-circle-primary mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 Circlelabelmedium text-circle-primary bg-circle-neutral-variant hover:bg-circle-neutral rounded-md transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className="px-4 py-2 Circlelabelmedium rounded-md transition-colors bg-circle-secondary hover:bg-circle-secondary/90 text-circle-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
};

export default DeleteConfirmationDialog;

