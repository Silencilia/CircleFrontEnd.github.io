import React, { useState } from 'react';
import TitleContacts from './TitleContacts';
import { NewContactButton } from '../Button';
import Search from './Search';
import RelationshipFilterDropdown from './RelationshipFilterDropdown';
import { useContacts } from '../../contexts/ContactContext';

interface HeaderContactsProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: string[]) => void;
}

const HeaderContacts: React.FC<HeaderContactsProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
}) => {
  const { state } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationshipIds, setSelectedRelationshipIds] = useState<string[]>([]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleRelationshipChange = (selectedIds: string[]) => {
    setSelectedRelationshipIds(selectedIds);
    onRelationshipFilterChange(selectedIds);
  };

  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleContacts />
      
        {/* Search, Relationship Filter, and New Contact Button - Below */}
        <div className="w-full h-[60px] bg-circle-neutral px-[30px] items-center">
          <div className="flex justify-center w-full h-full">
            <div className="flex flex-row justify-center items-center gap-[20px] w-full max-w-[900px]">
              <div className="flex-1">
                <Search
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus={true}
                />
              </div>
              
              <div className="flex-shrink-0">
                <RelationshipFilterDropdown
                  relationships={state.relationships}
                  selectedRelationshipIds={selectedRelationshipIds}
                  onSelectionChange={handleRelationshipChange}
                />
              </div>
              
              {/* New Contact Button - 20px gap from Relationship Filter */}
              <div className="flex items-center flex-shrink-0">
                <NewContactButton />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HeaderContacts;
