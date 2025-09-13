import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ContactCard from './Cards/ContactCard';
import ContactCardDetail from './Cards/ContactCardDetail';
import NoteCardDetail from './Cards/NoteCardDetail';
import { Contact, Note, useContacts } from '../contexts/ContactContext';

interface ContactBookProps {
  contacts: Contact[];
  searchQuery?: string;
  relationshipFilterIds?: number[];
  className?: string;
}

const ContactBook: React.FC<ContactBookProps> = ({ 
  contacts, 
  searchQuery = '', 
  relationshipFilterIds = [], 
  className = '' 
}) => {
  const { state } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Filter contacts based on search query and relationship filter
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(c => !c.isTrashed);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        // Search in occupation
        (contact.occupationId && 
         state.occupations.find(o => o.id === contact.occupationId)?.title.toLowerCase().includes(query)) ||
        // Search in organization
        (contact.organizationId && 
         state.organizations.find(org => org.id === contact.organizationId)?.name.toLowerCase().includes(query)) ||
        // Search in subjects
        contact.subjectIds.some(subjectId => 
          state.subjects.find(s => s.id === subjectId)?.label.toLowerCase().includes(query)
        )
      );
    }

    // Apply relationship filter
    if (relationshipFilterIds.length > 0) {
      filtered = filtered.filter(contact => 
        contact.relationshipIds.some(relationshipId => 
          relationshipFilterIds.includes(relationshipId)
        )
      );
    }

    return filtered;
  }, [contacts, searchQuery, relationshipFilterIds, state.occupations, state.organizations, state.subjects]);

  const handleOpenDetail = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
  };

  const handleCloseNoteDetail = () => {
    setSelectedNote(null);
  };

  // Mount flag to safely use portal on client only
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`h-full px-4 py-6 ${className}`}>
      <div className="flex flex-wrap gap-5 justify-center">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              onMenuClick={() => handleOpenDetail(contact)}
              relationshipFilterIds={relationshipFilterIds}
            />
          ))
        ) : (
          <div className="w-full text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchQuery || relationshipFilterIds.length > 0 
                ? 'No contacts match your filters' 
                : 'No contacts available'
              }
            </div>
            {(searchQuery || relationshipFilterIds.length > 0) && (
              <div className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filter criteria
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay for ContactCardDetail via portal to escape parent stacking contexts */}
      {isMounted && selectedContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <ContactCardDetail 
                  contact={selectedContact} 
                  onMinimize={handleCloseDetail}
                  onOpenNote={(note) => {
                    // Open note overlay and close contact overlay
                    setSelectedNote(note);
                    setSelectedContact(null);
                  }}
                  onOpenContactDetail={(nextContact) => setSelectedContact(nextContact)}
                />
              </div>
            ),
            document.body
          )
        : null}

      {/* Overlay for NoteCardDetail via portal */}
      {isMounted && selectedNote
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <NoteCardDetail 
                  note={selectedNote}
                  onMinimize={handleCloseNoteDetail}
                  onOpenContactDetail={(contact) => {
                    // Switch to contact and close note overlay
                    setSelectedContact(contact);
                    setSelectedNote(null);
                  }}
                />
              </div>
            ),
            document.body
          )
        : null}
    </div>
  );
};

export default ContactBook;
