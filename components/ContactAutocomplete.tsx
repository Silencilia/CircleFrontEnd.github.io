import React from 'react';
import { Contact } from '../contexts/ContactContext';

interface ContactAutocompleteProps {
  showAutocomplete: boolean;
  contacts: Contact[];
  autocompleteQuery: string;
  autocompletePosition: { top: number; left: number };
  onContactSelect: (contact: Contact) => void;
  maxSuggestions?: number;
}

const ContactAutocomplete: React.FC<ContactAutocompleteProps> = ({
  showAutocomplete,
  contacts,
  autocompleteQuery,
  autocompletePosition,
  onContactSelect,
  maxSuggestions = 5
}) => {
  if (!showAutocomplete) {
    return null;
  }

  const matchingContacts = contacts.filter(contact =>
    contact.name &&
    contact.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
  );

  // Only render dropdown if there are actual matches
  if (matchingContacts.length === 0) {
    return null;
  }

  return (
    <div
      className="autocomplete-dropdown absolute z-50 bg-white border border-circle-primary rounded-md shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: autocompletePosition.top,
        left: autocompletePosition.left,
        minWidth: '200px'
      }}
    >
      {matchingContacts
        .slice(0, maxSuggestions) // Limit to maxSuggestions (default 5)
        .map(contact => (
          <div
            key={contact.id}
            className="px-md py-sm hover:bg-circle-neutral-variant cursor-pointer border-b border-circle-neutral border-opacity-20 last:border-b-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onContactSelect(contact);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
