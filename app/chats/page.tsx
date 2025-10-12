'use client';

import React from 'react';
import TitleChats from '../../components/Headers/TitleChats';
import { useIsMobile } from '../../hooks/useIsMobile';
import { TITLE_HEIGHT_DESKTOP, TITLE_HEIGHT_MOBILE } from '../../utils/designConstants';

export default function ChatsPage() {
  const isMobile = useIsMobile();
  const paddingTop = `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + env(safe-area-inset-top))`;

  return (
    <div className="flex flex-col min-h-screen bg-circle-neutral">
      {/* Title - fixed at top; custom for chats with BackToCircleButton */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TitleChats title="Chats" />
      </div>

      {/* Page body with spacing below header */}
      <div className="relative flex-1" style={{ paddingTop }}>
        {/* TODO: Add chats list content here */}
      </div>
    </div>
  );
}


