'use client';

import React from 'react';
import HeaderDraft from '../../components/Headers/HeaderDraft';
import NavigationBar from '../../components/NavigationBar';
import ContactPreview from '../../components/ContactPreview';
import { useContacts } from '../../contexts/ContactContext';

export default function DraftPage() {
  const { state } = useContacts();
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* HeaderDraft - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderDraft />
      </div>
      
      {/* Main content between header and bottom previews */}
      <div className="flex-1 flex flex-col pt-[138px] pb-[400px]">
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Draft Page</h2>
            <p className="text-gray-500">Raw input buffer zone - coming soon</p>
          </div>
        </div>
      </div>

      {/* ContactPreview fixed above navigation bar */}
      <div className="fixed left-0 right-0 z-40" style={{ bottom: 80 }}>
        <ContactPreview contacts={state.contacts || []} />
      </div>
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="draft" />
    </div>
  );
}

