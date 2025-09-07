import React from 'react';
import TitleMemo from './TitleMemo';
import FilterMemo from './FilterMemo';

interface HeaderMemoProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: number[]) => void;
}

const HeaderMemo: React.FC<HeaderMemoProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
}) => {
  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleMemo />
      
      {/* FilterMemo - Below */}
      <FilterMemo 
        onSearchChange={onSearchChange}
        onRelationshipFilterChange={onRelationshipFilterChange}
      />
    </div>
  );
};

export default HeaderMemo;
