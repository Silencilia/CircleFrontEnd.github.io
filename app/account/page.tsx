'use client';

import React from 'react';
import Title from '../../components/Headers/Title';
import NavigationBar from '../../components/NavigationBar';
import AuthenticationCard from '../../components/Cards/AuthenticationCard';

export default function AccountPage() {
  return (
    <div className="relative w-full min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Title title="Account" isAccountPage={true} />
      </div>

      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 120, bottom: 80, overflowY: 'auto' }}
      >
        <div className="w-full h-full flex items-center justify-center p-6">
          <AuthenticationCard />
        </div>
      </div>

      <NavigationBar currentPage="user" />
    </div>
  );
}


