import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Contact } from '../../contexts/ContactContext';
import { ConfirmButton, CancelButton } from '../Button';
import { contactReference } from '../../data/referenceParsing';
import { createSourceRecord } from '../../data/sourceRecord';
import ContactCardDetail from '../Cards/ContactCardDetail';

interface NameConfirmationModalProps {
  isOpen: boolean;
  onConfirm: (processedText: string) => void;
  onCancel: () => void;
  noteText: string;
  contacts: Contact[];
}

const NameConfirmationModal: React.FC<NameConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  noteText,
  contacts
}) => {
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  // State for managing contact detail overlay
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm(noteText);
    }
  };

  const handleContactClick = (contact: Contact | undefined, id: string) => {
    if (!contact) return;
    setSelectedContact(contact);
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-circle-primary/50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="crd-dtl border border-circle-neutral-variant shadow-lg">
        <h3 className="font-circletitlemedium text-circle-primary mb-lg">
          Confirm Contact Names
        </h3>
        
        <div className="mb-lg">
          <p className="font-circlebodymedium text-circle-primary mb-sm">
            People you know are mentioned in your note. Please review and confirm. Click the note to edit it. Click on a name to view more information.
          </p>
          
          <div className="bg-circle-neutral-variant rounded-sm p-md h-fit overflow-y-auto">
            <div className="font-circlebodymedium text-circle-primary text-left">
              {contactReference(
                noteText,
                contacts,
                handleContactClick,
                false // Use desktop layout
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-row gap-xs justify-end">
          <CancelButton
            onClick={onCancel}
            ariaLabel="Cancel name confirmation"
          />
          
      <ConfirmButton
        onClick={() => onConfirm(noteText)}
        ariaLabel="Confirm detected names"
      />
        </div>
      </div>

      {/* Contact Detail Overlay */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedContact(null);
            }
          }}
        >
          <div className="mx-4">
            <ContactCardDetail
              contact={selectedContact}
              caller={createSourceRecord('nameConfirmationDialog', 'temp')}
              onMinimize={() => {
                setSelectedContact(null);
              }}
              onOpenNote={(note) => {
                // Handle note opening if needed
                setSelectedContact(null); // Close contact detail when opening note
              }}
              onOpenContactDetail={(nextContact) => {
                setSelectedContact(nextContact);
              }}
            />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default NameConfirmationModal;

