'use client';

import React, { useState, useEffect } from 'react';
import TitleCircle from '../components/Headers/TitleCircle';
import TalkToCircle from '../components/TalkToCircle';
import ChatWindow from '../components/Chat/ChatWindow';
import { ChatProvider } from '../contexts/ChatContext';
import { GREETINGS } from '../data/strings';
// ContactPreview moved to Draft page
import NavigationBar from '../components/NavigationBar';
import AudioGallery from '../components/Gallery/AudioGallery';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { VoiceButtonLg } from '../components/Button';
import { useContacts } from '../contexts/ContactContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useSpeedMode } from '../hooks/useSpeedMode';
import {
  TITLE_HEIGHT_MOBILE,
  TITLE_HEIGHT_DESKTOP,
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP,
  AUDIO_GALLERY_HEIGHT_MOBILE,
  AUDIO_GALLERY_HEIGHT_DESKTOP,
} from '../utils/designConstants';

export default function NotePage() {
  const { state } = useContacts();
  const isMobile = useIsMobile();
  const { isSpeedMode } = useSpeedMode();
  const recorder = useAudioRecorder();
  const [audioRefreshKey, setAudioRefreshKey] = useState(0);
  // Removed isInitialInput; currentChatId is the source of truth
  
  // Current chat ID state with localStorage persistence
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Deterministic initial greeting for SSR; randomize after mount on client only
  const [greeting, setGreeting] = useState<string>(GREETINGS[0]);

  useEffect(() => {
    // Randomize greeting after hydration to avoid SSR/client mismatch
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

  // Load currentChatId from localStorage on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      setCurrentChatId(savedChatId);
    }
  }, []);

  // Save currentChatId to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    } else {
      localStorage.removeItem('currentChatId');
    }
  }, [currentChatId]);

  // Initial input UI is now controlled solely by currentChatId

  // Handle new chat creation from initial input
  const handleNewChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleVoiceClick = async () => {
    if (recorder.isRecording) {
      await recorder.stopAndSave();
      setAudioRefreshKey((k) => k + 1);
    } else {
      await recorder.start();
    }
  };

  // Loading state: do not block on empty data; only while actively loading
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-circle-neutral">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-circle-neutral">
      {/* Title - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TitleCircle
          title="Circle"
          hasActiveChat={!!currentChatId}
          onNewChat={() => setCurrentChatId(null)}
        />
      </div>
      
      {/* Talk mode content area - with top padding for header (plus safe area) and bottom padding for navbar */}
      {!isSpeedMode && (
        <div 
          className="position-fixed flex-1 flex flex-col w-full h-full" 
          style={{ 
            paddingTop: `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + env(safe-area-inset-top))`,
            paddingBottom: isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP,
          }}
        >
          {/* Input Section / Chat Area */}
          {/* Render greeting and initial input only when no chat is active */}
          {!currentChatId ? (
            <div
              className="absolute inset-x-0 top-1/2 flex justify-center"
              // Center the greeting area vertically, offset according to device type:
              style={{ transform: isMobile ? 'translateY(-50px)' : 'translateY(-52.5px)' }}
            >
              <div className="flex flex-col gap-xl items-center">
                <div className="text-center">
                  {/* Personalized greeting shown before first user input */}
                  <h2 className="font-circleheadlinemedium text-circle-primary">
                    {greeting}
                  </h2>
                </div>
                {/* TalkToCircle input for initial message */}
                <TalkToCircle onNewChatCreated={handleNewChatCreated} />
              </div>
            </div>
          ) : (
            // Main chat window when a chat is active
            <ChatProvider chatId={currentChatId}>
              <div className="flex flex-col flex-1">
                <ChatWindow /> {/* Main chat conversation UI */}
                <div className="flex justify-center">
                  <div className="w-[85vw] max-w-[900px]">
                    {/* TalkToCircle input for ongoing chat */}
                    <TalkToCircle />
                  </div>
                </div>
              </div>
            </ChatProvider>
          )}
        
        </div>
      )}

      {isSpeedMode && (
        <div 
          className="relative flex-1" 
          style={{ 
            paddingTop: `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + env(safe-area-inset-top))`,
            paddingBottom: isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP,
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            <VoiceButtonLg onClick={handleVoiceClick} isActive={recorder.isRecording} />
          </div>
          <div
            className="absolute left-0 right-0 bottom-0 flex flex-row items-center justify-center"
            style={{
              transform: isMobile 
                ? `translateY(calc(-${AUDIO_GALLERY_HEIGHT_MOBILE} / 2))`
                : `translateY(calc(-${AUDIO_GALLERY_HEIGHT_DESKTOP} / 2))`,
            }}
          >
            <AudioGallery key={audioRefreshKey} />
          </div>
        </div>
      )}
      
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="note" />
    </div>
  );
}
