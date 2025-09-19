import React from 'react';
import { createPortal } from 'react-dom';
import ConfirmButton from '../Button/ConfirmButton';

interface MaximumSentimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MaximumSentimentDialog: React.FC<MaximumSentimentDialogProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-[450px] mx-4 px-6 py-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="Circletitlemedium text-circle-primary">Maximum Sentiments Reached</h2>
          <p className="Circlebodymedium text-circle-primary">
            You can only set up to three sentiments for a note. Click existing sentiment tags to delete some if you want to add a new one.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <ConfirmButton
            onClick={onClose}
            ariaLabel="Close dialog"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MaximumSentimentDialog;
