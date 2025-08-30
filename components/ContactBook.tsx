import React, { useState } from 'react';
import ContactCard from './ContactCard';
import ContactCardDetail from './ContactCardDetail';
import { Contact } from '../contexts/ContactContext';

interface ContactBookProps {
  contacts: Contact[];
  className?: string;
}

const ContactBook: React.FC<ContactBookProps> = ({ contacts, className = '' }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleOpenDetail = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
  };

  return (
    <div className={`h-full overflow-auto px-4 py-6 ${className}`}>
      <div className="flex flex-wrap gap-5 justify-center max-w-7xl mx-auto">
        {contacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            onMenuClick={() => handleOpenDetail(contact)}
          />
        ))}
      </div>

      {/* Overlay for ContactCardDetail */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <ContactCardDetail 
            contact={selectedContact} 
            onMinimize={handleCloseDetail}
          />
        </div>
      )}
    </div>
  );
};

export default ContactBook;
