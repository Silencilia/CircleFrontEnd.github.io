import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '../icons/PlusIcon';
import ContactCardNew from '../Cards/ContactCardNew';
import { Contact, useContacts } from '../../contexts/ContactContext';

interface NewContactButtonProps {
  className?: string;
}

const NewContactButton: React.FC<NewContactButtonProps> = ({ className = '' }) => {
  const { createNewContact } = useContacts();
  const [newContact, setNewContact] = useState<Contact | null>(null);

  const handleClick = async () => {
    try {
      const contact = await createNewContact();
      setNewContact(contact);
    } catch (error) {
      console.error('Failed to create new contact:', error);
    }
  };

  const handleCloseDetail = () => {
    setNewContact(null);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          group
          flex flex-row justify-center items-center
          px-[5px] gap-[5px]
          w-fit h-[30px]
          bg-circle-neutral-variant
          rounded-[15px]
          transition-colors duration-200
          hover:bg-circle-secondary
          ${className}
        `}
      >
        {/* Plus Icon */}
        <div className="flex-none order-0 flex-grow-0">
          <PlusIcon
            width={20}
            height={20}
            className="text-circle-primary group-hover:text-circle-neutral transition-colors duration-200"
          />
        </div>

        {/* Text Frame */}
        <div className="flex flex-row justify-center items-center gap-[10px] h-[16px] flex-none order-1 flex-grow-0">
          <span className="h-[16px] font-circlelabelsmall text-circle-primary group-hover:text-circle-neutral transition-colors duration-200 flex-none order-0 flex-grow-0 pr-[5px]">
            new contact
          </span>
        </div>
      </button>

      {/* Overlay for ContactCardNew via portal to escape parent stacking contexts */}
      {newContact
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <ContactCardNew
                contact={newContact}
                onMinimize={handleCloseDetail}
                caller={{ component: 'contactCardDetail', id: newContact.id }}
              />
            </div>,
            document.body
          )
        : null
      }
    </>
  );
};

export default NewContactButton;
