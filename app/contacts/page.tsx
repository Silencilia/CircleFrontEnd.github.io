'use client';

import React, { useState } from 'react';
import Title from '../../components/Headers/Title';
import SearchBar from '../../components/Headers/SearchBar';
import { NewContactButton } from '../../components/Button';
import ContactGallery from '../../components/Gallery/ContactGallery';
import NavigationBar from '../../components/NavigationBar';
import { useContacts } from '../../contexts/ContactContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  TITLE_HEIGHT_MOBILE,
  TITLE_HEIGHT_DESKTOP,
  CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE,
  CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP,
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP
} from '../../utils/designConstants';

export default function ContactsPage() {
  const { state } = useContacts();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilterIds, setRelationshipFilterIds] = useState<string[]>([]);

  const titleHeight = isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP;
  const searchBarHeight = isMobile ? CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE : CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP;
  const navBarHeight = isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP;

  // Loading state: only show spinner while actively loading,
  // not when there are simply zero contacts
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-circle-neutral">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRelationshipFilterChange = (selectedIds: string[]) => {
    setRelationshipFilterIds(selectedIds);
  };

  return (
    <div className="relative w-full min-h-screen bg-circle-neutral">
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
            actionButton={<NewContactButton />}
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
    </div>
  );
}
