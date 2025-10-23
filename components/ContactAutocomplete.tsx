import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../contexts/ContactContext';

interface ContactAutocompleteProps {
  query: string;
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const ContactAutocomplete: React.FC<ContactAutocompleteProps> = ({
  query,
  contacts,
  onSelect,
  onClose,
  position
}) => {
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredContacts([]);
      return;
    }

    // Simple fuzzy matching - client-side only, no API calls
    const filtered = contacts
      .filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 results

    setFilteredContacts(filtered);
    setSelectedIndex(0);
  }, [query, contacts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredContacts.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredContacts.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredContacts[selectedIndex]) {
          onSelect(filteredContacts[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredContacts, selectedIndex, onSelect, onClose]);

  if (filteredContacts.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-circle-neutral-variant rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '200px'
      }}
    >
      {filteredContacts.map((contact, index) => (
        <div
          key={contact.id}
          className={`px-3 py-2 cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 ${
            index === selectedIndex ? 'bg-circle-primary bg-opacity-10' : ''
          }`}
          onClick={() => onSelect(contact)}
        >
          <div className="font-circlebodymedium text-circle-primary">
            {contact.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactAutocomplete;
