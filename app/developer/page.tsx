'use client';

import React from 'react';
import NavigationBar from '../../components/NavigationBar';

export default function DeveloperPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-merriweather font-normal text-display-large text-circle-primary mb-4">
            Developer Page
          </h1>
          <p className="font-inter font-normal text-body-medium text-circle-primary">
            This page is for testing purposes.
          </p>
        </div>
      </div>
      
      {/* NavigationBar */}
      <NavigationBar currentPage="developer" />
    </div>
  );
}
