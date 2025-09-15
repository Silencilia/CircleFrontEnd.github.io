import React from 'react';
import TitleContacts from './TitleContacts';
import FilterContacts from './FilterContacts';
import { NewContactButton } from '../Button';

interface HeaderContactsProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: string[]) => void;
}

const HeaderContacts: React.FC<HeaderContactsProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
}) => {
  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleContacts />
      
      {/* FilterContacts and New Contact Button - Below */}
      <div className="w-full bg-circle-neutral px-4 py-4">
        <div className="flex justify-center">
          <div className="flex flex-row items-center gap-5">
            <FilterContacts 
              onSearchChange={onSearchChange}
              onRelationshipFilterChange={onRelationshipFilterChange}
            />
            
            {/* New Contact Button - 20px gap from FilterContacts */}
            <div className="flex items-center">
              <NewContactButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderContacts;
