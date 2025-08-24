import React from 'react';
import ContactCard from './ContactCard';
import { Contact } from '../contexts/ContactContext';

interface ContactBookProps {
  contacts: Contact[];
  className?: string;
}

const ContactBook: React.FC<ContactBookProps> = ({ contacts, className = '' }) => {
  return (
    <div className={`h-full overflow-auto px-4 py-6 ${className}`}>
      <div className="flex flex-wrap gap-5 justify-center max-w-7xl mx-auto">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
};

export default ContactBook;
