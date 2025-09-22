import React from 'react';
import { CircleIcon, DraftIcon, MemoIcon, ContactsIcon, DevIcon } from './icons';
import { NavigationButton } from './Button';

interface NavigationBarProps {
  currentPage?: 'note' | 'draft' | 'memo' | 'contacts' | 'user' | 'developer';
}

/**
 * NavigationBar component with responsive height using pageUtilities
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage = 'note' }) => {

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-circle-neutral z-50 nav-bar">
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <NavigationButton
          href="/"
          icon={<CircleIcon/>}
          label="Circle"
          isActive={currentPage === 'note'}
        />
        
        <NavigationButton
          href="/draft"
          icon={<DraftIcon/>}
          label="Draft"
          isActive={currentPage === 'draft'}
        />
        
        <NavigationButton
          href="/memo"
          icon={<MemoIcon/>}
          label="Memo"
          isActive={currentPage === 'memo'}
        />
        
        <NavigationButton
          href="/contacts"
          icon={<ContactsIcon/>}
          label="Contacts"
          isActive={currentPage === 'contacts'}
        />
        
        <NavigationButton
          href="/developer"
          icon={<DevIcon/>}
          label="Dev"
        />
      </div>
    </div>
  );
};

export default NavigationBar;
