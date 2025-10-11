'use client';

import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import ChatWindow from '../../components/Chat/ChatWindow';
import TalkToCircle from '../../components/TalkToCircle';
import { ChatProvider } from '../../contexts/ChatContext';
import { NAV_BAR_HEIGHT_DESKTOP, NAV_BAR_HEIGHT_MOBILE, TITLE_HEIGHT_DESKTOP, TITLE_HEIGHT_MOBILE } from '../../utils/designConstants';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function DeveloperPage() {
  const isMobile = useIsMobile();
  const paddingTop = isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP;
  const paddingBottom = isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP;
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      <div className="relative flex-1 flex flex-col w-full h-full" style={{ paddingTop, paddingBottom }}>
        <ChatProvider chatId="dev-local-chat">
          <div className="flex flex-col flex-1">
            <ChatWindow />
            <div className="flex justify-center">
              <div className="w-[85vw] max-w-[900px]">
                <TalkToCircle isInitialInput={false} />
              </div>
            </div>
          </div>
        </ChatProvider>
      </div>
      <NavigationBar currentPage="developer" />
    </div>
  );
}
