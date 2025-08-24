'use client';

import React from 'react';
import HeaderContacts from '../../components/Headers/HeaderContacts';
import ContactBook from '../../components/ContactBook';
import NavigationBar from '../../components/NavigationBar';
import { useContacts } from '../../contexts/ContactContext';

export default function ContactsPage() {
  const { state } = useContacts();

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

  return (
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* HeaderContacts - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderContacts />
      </div>
      
      {/* ContactBook - fills all available space between Header and NavBar */}
      <div className="pt-[198px] pb-[80px] w-full h-full overflow-y-scroll">
        <ContactBook contacts={state.contacts} />
      </div>
      
      {/* NavigationBar - positioned at very bottom (80px height) */}
      <NavigationBar currentPage="contacts" />
    </div>
  );
}
