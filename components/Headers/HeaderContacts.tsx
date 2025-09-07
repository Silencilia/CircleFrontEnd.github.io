import React from 'react';
import TitleContacts from './TitleContacts';
import FilterContacts from './FilterContacts';

interface HeaderContactsProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: number[]) => void;
}

const HeaderContacts: React.FC<HeaderContactsProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
}) => {
  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleContacts />
      
      {/* FilterContacts - Below */}
      <FilterContacts 
        onSearchChange={onSearchChange}
        onRelationshipFilterChange={onRelationshipFilterChange}
      />
    </div>
  );
};

export default HeaderContacts;
