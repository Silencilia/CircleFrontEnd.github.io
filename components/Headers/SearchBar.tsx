import React from 'react';
import Search from './Search';
import RelationshipFilter from './RelationshipFilter';
import { Relationship } from '../../contexts/ContactContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE, CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP } from '../../utils/designConstants';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  searchQuery?: string;
  relationships?: Relationship[];
  selectedRelationshipIds?: string[];
  onRelationshipFilterChange: (selectedIds: string[]) => void;
  actionButton?: React.ReactNode;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  searchQuery = '',
  relationships = [],
  selectedRelationshipIds = [],
  onRelationshipFilterChange,
  actionButton,
}) => {
  const isMobile = useIsMobile();

  // Mobile Layout
  const MobileLayout = () => (
    <div className="flex flex-col w-full max-w-[900px] mx-auto items-center px-lg gap-md bg-circle-neutral" style={{ height: CONTACTS_PAGE_SEARCH_BAR_HEIGHT_MOBILE }}>
      {/* Search input field */}
      <Search
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search contacts..."
        // Autofocus only on desktop screens
        autoFocus={false}
      />

      <div className="flex flex-row w-full items-center gap-md bg-circle-neutral">
      {/* Relationship filter */}
      <div className="flex flex-1">
        <RelationshipFilter
          relationships={relationships}
          selectedRelationshipIds={selectedRelationshipIds}
          onSelectionChange={onRelationshipFilterChange}
        />
      </div>
     

      {/* Render the optional action button, e.g., "New Contact" */}
      {actionButton && (
        <div className="flex-shrink-0">
          {actionButton}
        </div>
      )}
      </div>
    </div>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="flex flex-row w-full max-w-[900px] mx-auto items-center px-xl gap-lg bg-circle-neutral" style={{ height: CONTACTS_PAGE_SEARCH_BAR_HEIGHT_DESKTOP }}>
      {/* Search input field */}
      <Search
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search contacts..."
        // Autofocus only on desktop screens
        autoFocus={true}
      />

      {/* Relationship filter */}
      <div className="flex">
        <RelationshipFilter
          relationships={relationships}
          selectedRelationshipIds={selectedRelationshipIds}
          onSelectionChange={onRelationshipFilterChange}
        />
      </div>

      {/* Render the optional action button, e.g., "New Contact" */}
      {actionButton && (
        <div className="flex-shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default SearchBar;
