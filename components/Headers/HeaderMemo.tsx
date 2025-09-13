import React from 'react';
import TitleMemo from './TitleMemo';
import FilterMemo from './FilterMemo';
import { NewNoteButton } from '../Button';

interface HeaderMemoProps {
  onSearchChange: (query: string) => void;
  onRelationshipFilterChange: (selectedIds: number[]) => void;
  onNewNoteClick?: () => void;
}

const HeaderMemo: React.FC<HeaderMemoProps> = ({
  onSearchChange,
  onRelationshipFilterChange,
  onNewNoteClick,
}) => {
  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleMemo />
      
      {/* FilterMemo and New Note Button - Below */}
      <div className="w-full bg-circle-neutral px-4 py-4">
        <div className="flex justify-center">
          <div className="flex flex-row items-center gap-5">
            <FilterMemo 
              onSearchChange={onSearchChange}
              onRelationshipFilterChange={onRelationshipFilterChange}
            />
            
            {/* New Note Button - 20px gap from FilterMemo */}
            <div className="flex items-center">
              <NewNoteButton 
                onClick={onNewNoteClick || (() => {})} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMemo;
