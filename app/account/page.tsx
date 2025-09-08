'use client';

import React from 'react';
import HeaderAccount from '../../components/Headers/HeaderAccount';
import NavigationBar from '../../components/NavigationBar';

export default function AccountPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* HeaderAccount - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAccount />
      </div>

      {/* Content area between fixed header (120px) and navbar (80px) */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 120, bottom: 80, overflowY: 'auto' }}
      >
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="text-circle-primary font-inter">
            Account page content goes here
          </div>
        </div>
      </div>

      {/* NavigationBar - positioned at very bottom (80px height) */}
      <NavigationBar currentPage="user" />
    </div>
  );
}


