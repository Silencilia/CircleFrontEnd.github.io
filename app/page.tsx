'use client';

import React from 'react';
import HeaderNote from '../components/Headers/HeaderNote';
import InputSection from '../components/InputSection';
import ContactPreview from '../components/ContactPreview';
import NavigationBar from '../components/NavigationBar';
import { useContacts } from '../contexts/ContactContext';

export default function NotePage() {
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
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* HeaderNote - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderNote />
      </div>
      
      {/* Main content area - with top padding to account for fixed header */}
      <div className="flex-1 flex flex-col pt-[138px]">
        {/* Input Section - centered in the available space */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <InputSection />
        </div>
        
        {/* ContactPreview - positioned above navigation */}
        <div className="h-[320px]">
          <ContactPreview contacts={state.contacts} />
        </div>
      </div>
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="note" />
    </div>
  );
}
