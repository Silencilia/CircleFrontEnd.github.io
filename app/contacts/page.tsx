'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Title from '../../components/Headers/Title';
import SearchBar from '../../components/Headers/SearchBar';
import { NewContactButton } from '../../components/Button';
import ContactGallery from '../../components/Gallery/ContactGallery';
import NavigationBar from '../../components/NavigationBar';
import ContactCardNew from '../../components/Cards/ContactCardNew';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useContacts, Contact } from '../../contexts/ContactContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { LOADING_STRINGS } from '../../data/strings';
import {
  TITLE_HEIGHT_MOBILE,
  TITLE_HEIGHT_DESKTOP,
  CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE,
  CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP,
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP
} from '../../utils/designConstants';

export default function ContactsPage() {
  const { state, createTemporaryContact } = useContacts();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilterIds, setRelationshipFilterIds] = useState<string[]>([]);
  const [newContact, setNewContact] = useState<Contact | null>(null);

  // Loading state: show overlay instead of replacing entire content
  // This prevents the flash when navigating back to the page
  const isLoading = state.isLoading;

  const titleHeight = isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP;
  const searchBarHeight = isMobile ? CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE : CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP;
  const navBarHeight = isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRelationshipFilterChange = (selectedIds: string[]) => {
    setRelationshipFilterIds(selectedIds);
  };

  const handleNewContact = () => {
    // Create a temporary contact for editing (not saved to database yet)
    const tempContact = createTemporaryContact();
    setNewContact(tempContact);
  };

  return (
    <div className="relative w-full min-h-screen bg-circle-neutral">
      {/* Loading overlay - appears on top instead of replacing content */}
      <LoadingOverlay
        isVisible={isLoading}
        isOverlay={true}
        zIndex={200}
      />
      {/* Title and SearchBar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-circle-neutral flex flex-col items-stretch">
          {/* Title - Above */}
          <Title title="Contacts" />

          {/* Search, Relationship Filter, and New Contact Button - Below */}
          <SearchBar
            onSearchChange={handleSearchChange}
            searchQuery={searchQuery}
            relationships={state.relationships}
            selectedRelationshipIds={relationshipFilterIds}
            onRelationshipFilterChange={handleRelationshipFilterChange}
            actionButton={<NewContactButton onClick={handleNewContact} />}
          />
      </div>
      
      {/* ContactGallery fixed between header and navbar with its own scroll area */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: `calc(${parseInt(titleHeight)}px + ${parseInt(searchBarHeight)}px + env(safe-area-inset-top))`, bottom: parseInt(navBarHeight) + 'px', overflowY: 'auto' }}
      >
        <div className="max-w-7xl mx-auto">
          <ContactGallery 
            contacts={state.contacts} 
            searchQuery={searchQuery}
            relationshipFilterIds={relationshipFilterIds}
          />
        </div>
      </div>
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="contacts" />
      
      {/* Overlay for new contact */}
      {typeof window !== 'undefined' && newContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <ContactCardNew
                  contact={newContact}
                  onMinimize={() => setNewContact(null)}
                  caller={{ component: 'contactCardDetail', id: newContact.id }}
                />
              </div>
            ),
            document.body
          )
        : null}
    </div>
  );
}
