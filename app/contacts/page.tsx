'use client';

import React, { useState } from 'react';
import HeaderContacts from '../../components/Headers/HeaderContacts';
import ContactGallery from '../../components/Gallery/ContactGallery';
import NavigationBar from '../../components/NavigationBar';
import { useContacts } from '../../contexts/ContactContext';

export default function ContactsPage() {
  const { state } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilterIds, setRelationshipFilterIds] = useState<string[]>([]);

  // Loading state
  if (state.isLoading || !state.contacts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBF7F3]">
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
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* HeaderContacts - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderContacts 
          onSearchChange={handleSearchChange}
          onRelationshipFilterChange={handleRelationshipFilterChange}
        />
      </div>
      
      {/* ContactGallery fixed between header (198px) and navbar (80px) with its own scroll area */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 198, bottom: 80, overflowY: 'auto' }}
      >
        <div className="max-w-7xl mx-auto">
          <ContactGallery 
            contacts={state.contacts} 
            searchQuery={searchQuery}
            relationshipFilterIds={relationshipFilterIds}
          />
        </div>
      </div>
      
      {/* NavigationBar - positioned at very bottom (80px height) */}
      <NavigationBar currentPage="contacts" />
    </div>
  );
}
