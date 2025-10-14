'use client';

import React from 'react';
import TitleChats from '../../components/Headers/TitleChats';
import { useIsMobile } from '../../hooks/useIsMobile';
import { TITLE_HEIGHT_DESKTOP, TITLE_HEIGHT_MOBILE, MEMO_PAGE_SEARCH_BAR_HEIGHT_DESKTOP, MEMO_PAGE_SEARCH_BAR_HEIGHT_MOBILE } from '../../utils/designConstants';
import ChatsGallery from '../../components/Gallery/ChatsGallery';
import Search from '../../components/Headers/Search';

export default function ChatsPage() {
  const isMobile = useIsMobile();
  const searchBarHeight = isMobile ? MEMO_PAGE_SEARCH_BAR_HEIGHT_MOBILE : MEMO_PAGE_SEARCH_BAR_HEIGHT_DESKTOP;
  const paddingTop = `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + ${searchBarHeight} + env(safe-area-inset-top))`;
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="flex flex-col min-h-screen bg-circle-neutral">
      {/* Title and SearchBar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-circle-neutral flex flex-col">
          {/* Title */}
          <TitleChats title="Chats" />

          {/* Search Bar */}
          <div className="flex flex-row w-full justify-center">
            <div className={`flex flex-row w-full max-w-[900px] items-center bg-circle-neutral ${isMobile ? 'px-lg gap-md' : 'px-xl gap-lg'}`} style={{ height: searchBarHeight }}>
              <Search
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search chats..."
                autoFocus={typeof window !== 'undefined' && !isMobile}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page body with spacing below header */}
      <div className="relative flex-1" style={{ paddingTop }}>
        <div className="relative inset-0 overflow-auto">
          <div className="w-full h-full flex flex-col">
            <div className="flex-1">
              <div className="w-full h-full">
                <ChatsGallery query={searchQuery} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


