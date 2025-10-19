import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Contact } from '../../contexts/ContactContext';
import { ConfirmButton, CancelButton } from '../Button';
import { contactReference } from '../../data/referenceParsing';
import { CardIndex, createSourceRecord } from '../../data/sourceRecord';
import ContactCardDetail from '../Cards/ContactCardDetail';

interface NameConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: (processedText: string) => void;
  onCancel: () => void;
  noteText: string;
  contacts: Contact[];
}

const NameConfirmationDialog: React.FC<NameConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  noteText,
  contacts
}) => {
  console.log('🎭 === NameConfirmationDialog render ===');
  console.log('isOpen:', isOpen);
  console.log('noteText:', `"${noteText}"`);
  console.log('noteText length:', noteText.length);
  console.log('contacts.length:', contacts.length);
  console.log('contacts names:', contacts.map(c => `"${c.name}"`));
  console.log('typeof window:', typeof window);

  if (!isOpen) {
    console.log('❌ Dialog not open, returning null');
    return null;
  }
  if (typeof window === 'undefined') {
    console.log('❌ Window undefined, returning null');
    return null;
  }

  console.log('✅ Rendering NameConfirmationDialog');

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
    console.log('🎯 Contact clicked in NameConfirmationDialog:', contact.name);
    setSelectedContact(contact);
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-circle-primary/50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-circle-white border border-circle-neutral-variant rounded-md p-md max-w-[600px] w-full mx-md shadow-lg">
        <h3 className="font-circletitlemedium text-circle-primary mb-lg">
          Confirm Contact Names
        </h3>
        
        <div className="mb-lg">
          <p className="font-circlebodymedium text-circle-primary mb-sm">
            We've detected potential contact names in your note. Please review and confirm:
          </p>
          
          <div className="bg-circle-neutral-variant rounded-sm p-md min-h-[120px] max-h-[300px] overflow-y-auto">
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
              console.log('🎭 Closing contact detail overlay');
              setSelectedContact(null);
            }
          }}
        >
          <div className="mx-4">
            <ContactCardDetail
              contact={selectedContact}
              caller={createSourceRecord('nameConfirmationDialog', 'temp')}
              onMinimize={() => {
                console.log('🎭 Contact detail minimized, returning to name confirmation');
                setSelectedContact(null);
              }}
              onOpenNote={(note) => {
                // Handle note opening if needed
                console.log('🎭 Note opened from contact detail in dialog');
                setSelectedContact(null); // Close contact detail when opening note
              }}
              onOpenContactDetail={(nextContact) => {
                console.log('🎭 Opening nested contact from dialog:', nextContact.name);
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

export default NameConfirmationDialog;
