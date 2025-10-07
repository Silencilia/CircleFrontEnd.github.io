'use client';

import React, { useEffect, useRef, useState } from 'react';
import Title from '../components/Headers/Title';
import TalkToCircle from '../components/TalkToCircle';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatboxY, setChatboxY] = useState(0);
  const [audioRefreshKey, setAudioRefreshKey] = useState(0);

  const handleVoiceClick = async () => {
    if (recorder.isRecording) {
      await recorder.stopAndSave();
      setAudioRefreshKey((k) => k + 1);
    } else {
      await recorder.start();
    }
  };

  // Calculate vertical offset so the chatbox appears vertically centered initially
  const calculateChatboxOffset = () => {
    const container = containerRef.current;
    const chat = chatRef.current;
    if (!container || !chat) return;

    // 1) Available screen height inside the container
    const AvailableScreenHeight = container.getBoundingClientRect().height;

    // 2) Initial TalkToCircle height (minus greeting + gap)
    const initialTalkHeight = chat.getBoundingClientRect().height;
    const ChatboxYAdjustment = initialTalkHeight 

    // 3) Centering offset
    const ChatboxY = AvailableScreenHeight / 2 - 0.5 * ChatboxYAdjustment - 62; // 32 (greeting) + 30 (gap);

    // 4) Apply (clamp to >= 0)
    setChatboxY(Math.max(0, Math.floor(ChatboxY)));
  };

  useEffect(() => {
    // Multiple attempts to ensure TalkToCircle is fully rendered and positioned
    const calculateWithRetries = () => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryCalculate = () => {
        attempts++;
        calculateChatboxOffset();
        
        // Keep trying until we get a valid position or max attempts reached
        if (attempts < maxAttempts && chatboxY === 0) {
          setTimeout(tryCalculate, 100);
        }
      };
      
      // Start immediately
      tryCalculate();
    };
    
    // Initial calculation with retries
    calculateWithRetries();
    
    // Also recalculate after a longer delay to catch any late renders
    const fallbackTimeout = setTimeout(calculateChatboxOffset, 500);
    
    window.addEventListener('resize', calculateChatboxOffset);
    return () => {
      clearTimeout(fallbackTimeout);
      window.removeEventListener('resize', calculateChatboxOffset);
    };
  }, []);

  // Loading state
  if (state.isLoading || state.contacts.length === 0) {
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
        <Title title="Circle" isCirclePage={true} />
      </div>
      
      {/* Talk mode content area - with top padding for header and bottom padding for navbar */}
      {!isSpeedMode && (
        <div 
          className="flex-1 flex flex-col" 
          style={{ 
            paddingTop: isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP,
            paddingBottom: isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP,
          }}
        >
          {/* Input Section - horizontally centered; vertical offset applied to chat */}
          <div ref={containerRef} className="flex-1 flex items-start justify-center p-0">
            <div ref={chatRef} style={{ transform: `translateY(${chatboxY}px)` }}>
              <TalkToCircle />
            </div>
          </div>
        
        </div>
      )}

{isSpeedMode && (
        <div 
          className="relative flex-1" 
          style={{ 
            paddingTop: isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP,
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
