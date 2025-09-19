import React from 'react';
import TitleMemo from './TitleMemo';
import { NewNoteButton } from '../Button';
import Search from './Search';

interface HeaderMemoProps {
  onSearchChange: (query: string) => void;
  onNewNote?: () => void;
}

const HeaderMemo: React.FC<HeaderMemoProps> = ({
  onSearchChange,
  onNewNote,
}) => {
  return (
    <div className="w-full justify-center items-center bg-circle-neutral flex flex-col">
      {/* TitleContacts - Above */}
      <TitleMemo />
      
      {/* FilterMemo and New Note Button - Below */}
      <div className="w-full h-[60px] bg-circle-neutral flex items-center">
        <div className="flex justify-center w-full px-[30px]">
          <div className="flex flex-row justify-center items-center gap-[20px]  w-full max-w-[900px]">
            
            <div className="flex-1">
              <Search
                onChange={onSearchChange}
                placeholder="Search notes..."
                autoFocus={true}
              />

            </div>
            <div className="flex-shrink-0">
              <NewNoteButton onClick={onNewNote} />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMemo;
