import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '../icons/PlusIcon';
import ContactCardDetail from '../Cards/ContactCardDetail';
import { useContacts } from '../../contexts/ContactContext';

interface NewContactButtonProps {
  className?: string;
}

const NewContactButton: React.FC<NewContactButtonProps> = ({ className = '' }) => {
  const { createNewContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Mount flag to safely use portal on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = async () => {
    try {
      // Create a new contact with default values
      const newContact = await createNewContact();
      setSelectedContact(newContact);
    } catch (error) {
      console.error('Failed to create new contact:', error);
    }
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
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
          <span className="h-[16px] font-inter font-medium text-[11px] leading-[16px] flex items-center tracking-[0.5px] text-circle-primary group-hover:text-circle-neutral transition-colors duration-200 flex-none order-0 flex-grow-0 pr-[5px]">
            new contact
          </span>
        </div>
      </button>

      {/* Overlay for ContactCardDetail via portal to escape parent stacking contexts */}
      {isMounted && selectedContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <ContactCardDetail 
                  contact={selectedContact} 
                  onMinimize={handleCloseDetail}
                />
              </div>
            ),
            document.body
          )
        : null}
    </>
  );
};

export default NewContactButton;
