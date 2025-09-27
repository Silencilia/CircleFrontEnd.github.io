import React from 'react';
import Search from './Search';
import RelationshipFilter from './RelationshipFilter';
import { Relationship } from '../../contexts/ContactContext';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  searchQuery?: string;
  showRelationshipFilter?: boolean;
  relationships?: Relationship[];
  selectedRelationshipIds?: string[];
  onRelationshipFilterChange?: (selectedIds: string[]) => void;
  actionButton?: React.ReactNode;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  searchQuery = '',
  showRelationshipFilter = false,
  relationships = [],
  selectedRelationshipIds = [],
  onRelationshipFilterChange,
  actionButton,
}) => {
  return (
    <div className="flex flex-row w-full max-w-[900px] items-center px-xl gap-lg h-[60px] bg-circle-neutral">
      <Search
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={showRelationshipFilter ? "Search contacts..." : "Search notes..."}
        autoFocus={typeof window !== 'undefined' && window.innerWidth >= 768}
      />

      {showRelationshipFilter && relationships && onRelationshipFilterChange && (
        <div className="flex">
        <RelationshipFilter
          relationships={relationships}
          selectedRelationshipIds={selectedRelationshipIds}
          onSelectionChange={onRelationshipFilterChange}
        />
        </div>
      )}

      {actionButton && (
        <div className="flex-shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
