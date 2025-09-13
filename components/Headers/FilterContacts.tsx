import React, { useState } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import RelationshipFilterDropdown from './RelationshipFilterDropdown';

interface FilterContactsProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: number[]) => void;
}

const FilterContacts: React.FC<FilterContactsProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
}) => {
  const { state } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationshipIds, setSelectedRelationshipIds] = useState<number[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleRelationshipChange = (selectedIds: number[]) => {
    setSelectedRelationshipIds(selectedIds);
    onRelationshipFilterChange(selectedIds);
  };

  return (
    <>
      {/* Search Field */}
      <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-[560px] h-[30px] px-1.5">
        <div className="flex flex-row items-center gap-4 flex-1">
          {/* Search Icon */}
          <div className="w-5 h-5 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-5 font-inter font-medium text-sm leading-5 text-left text-circle-primary/35 placeholder-circle-primary/35 focus:outline-none pl-1.5 pr-2.5 flex-1"
          />
        </div>
      </div>

      {/* Relationship Filter Dropdown */}
      <RelationshipFilterDropdown
        relationships={state.relationships}
        selectedRelationshipIds={selectedRelationshipIds}
        onSelectionChange={handleRelationshipChange}
      />
    </>
  );
};

export default FilterContacts;
