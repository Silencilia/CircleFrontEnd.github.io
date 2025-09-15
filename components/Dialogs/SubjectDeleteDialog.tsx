import React from 'react';
import { createPortal } from 'react-dom';

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
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

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
            Remove Subject
          </h3>
          
          <p className="Circlebodymedium text-circle-primary mb-6 leading-relaxed">
            Are you sure you want to remove "{subjectLabel}" from this contact?
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
              Remove
            </button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
};

export default SubjectDeleteDialog;


