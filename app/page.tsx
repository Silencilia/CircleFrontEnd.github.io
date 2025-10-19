'use client';

import React, { useState } from 'react';
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
import { supabase } from '../lib/supabase';
import { identifyRequest } from '../utils/api/talkToCircleHelpers';
import { useChat } from '../contexts/ChatContext';
import { useEffect } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';
import { LOADING_STRINGS } from '../data/strings';
import { useRef } from 'react';
import {
  TITLE_HEIGHT_MOBILE,
  TITLE_HEIGHT_DESKTOP,
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP,
} from '../utils/designConstants';

// Simplified component to handle initial message API calls
interface InitialMessageHandlerProps {
  pendingMessage: {chatId: string, messageId: string, text: string} | null;
  onMessageHandled: () => void;
}

const InitialMessageHandler: React.FC<InitialMessageHandlerProps> = ({ pendingMessage, onMessageHandled }) => {
  const chat = useChat();
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    if (!pendingMessage || !chat.chatId) return;

    const messageKey = `${pendingMessage.chatId}-${pendingMessage.messageId}`;
    if (processedMessages.current.has(messageKey)) return;

    processedMessages.current.add(messageKey);

    const processMessage = async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const isOffline = !userRes.user?.id;

        if (isOffline) {
          // Gather local storage data for offline mode
          const localData = {
            contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
            notes: JSON.parse(localStorage.getItem('notes') || '[]'),
            subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
            relationships: JSON.parse(localStorage.getItem('relationships') || '[]'),
            organizations: JSON.parse(localStorage.getItem('organizations') || '[]'),
            occupations: JSON.parse(localStorage.getItem('occupations') || '[]'),
            sentiments: JSON.parse(localStorage.getItem('sentiments') || '[]'),
            commitments: JSON.parse(localStorage.getItem('commitments') || '[]'),
            drafts: JSON.parse(localStorage.getItem('drafts') || '[]'),
          };

          await identifyRequest(
            pendingMessage.chatId, 
            pendingMessage.messageId, 
            chat.addSystemText, 
            localData, 
            chat.setIsThinking
          );
        } else {
          await identifyRequest(
            pendingMessage.chatId, 
            pendingMessage.messageId, 
            undefined, 
            undefined, 
            chat.setIsThinking
          );
        }
      } catch (error) {
        console.error('Error processing initial message:', error);
      } finally {
        onMessageHandled();
      }
    };

    processMessage();
  }, [pendingMessage?.chatId, pendingMessage?.messageId, chat, onMessageHandled]);

  return null;
};

export default function NotePage() {
  const { state } = useContacts();
  const isMobile = useIsMobile();
  const { isSpeedMode } = useSpeedMode();
  const recorder = useAudioRecorder();
  const [audioRefreshKey, setAudioRefreshKey] = useState(0);
  // Removed isInitialInput; currentChatId is the source of truth
  
  // Consolidated state management
  const [appState, setAppState] = useState({
    currentChatId: null as string | null,
    pendingMessage: null as {chatId: string, messageId: string, text: string} | null,
    isAuthenticated: true,
  });
  
  // Deterministic initial greeting for SSR; randomize after mount on client only
  const [greeting, setGreeting] = useState<string>(GREETINGS[0]);

  useEffect(() => {
    // Randomize greeting after hydration to avoid SSR/client mismatch
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    
    // Check authentication status
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setAppState(prev => ({ ...prev, isAuthenticated: !!userRes.user?.id }));
    })();
  }, []);

  // Load currentChatId from localStorage on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      // Check if the chat still exists before setting it
      (async () => {
        try {
          const { data: userRes } = await supabase.auth.getUser();
          const userId = userRes.user?.id;

          if (userId) {
            // Check if chat exists in Supabase
            const { data: chatData, error } = await supabase
              .from('chats')
              .select('id')
              .eq('id', savedChatId)
              .eq('user_id', userId)
              .single();

            if (!error && chatData) {
              setAppState(prev => ({ ...prev, currentChatId: savedChatId }));
            } else {
              // Chat doesn't exist, clear localStorage
              localStorage.removeItem('currentChatId');
              setAppState(prev => ({ ...prev, currentChatId: null }));
            }
          } else {
            // Offline mode - check localStorage for chat messages
            const chatKey = `circle_chat_messages_${savedChatId}`;
            const chatMessages = localStorage.getItem(chatKey);
            if (chatMessages) {
              setAppState(prev => ({ ...prev, currentChatId: savedChatId }));
            } else {
              // Chat doesn't exist, clear localStorage
              localStorage.removeItem('currentChatId');
              setAppState(prev => ({ ...prev, currentChatId: null }));
            }
          }
        } catch (error) {
          console.error('Error checking chat existence:', error);
          // On error, clear the potentially invalid chat ID
          localStorage.removeItem('currentChatId');
          setAppState(prev => ({ ...prev, currentChatId: null }));
        }
      })();
    }
  }, []);

  // Save currentChatId to localStorage whenever it changes
  useEffect(() => {
    if (appState.currentChatId) {
      localStorage.setItem('currentChatId', appState.currentChatId);
    } else {
      localStorage.removeItem('currentChatId');
    }
  }, [appState.currentChatId]);

  // Initial input UI is now controlled solely by currentChatId

  // Handle new chat creation from initial input
  const handleNewChatCreated = (chatId: string) => {
    setAppState(prev => ({ ...prev, currentChatId: chatId }));
  };

  // Handle sending first message in new chat
  const handleMessageSend = async (text: string) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;

      if (userId) {
        // User is authenticated - create chat in Supabase
        const { data: createdChat, error: chatError } = await supabase
          .from('chats')
          .insert({ user_id: userId, title: null, metadata: {} })
          .select('id')
          .single();
        if (chatError || !createdChat?.id) {
          console.error('Failed to create chat:', chatError);
          return;
        }

        const newChatId = createdChat.id as string;
        // Insert the first user message for this chat
        const { data: inserted, error: insertErr } = await supabase.from('chat_messages').insert({
          chat_id: newChatId,
          role: 'user',
          text,
          parts: null,
          status: 'final',
        }).select('id').single();
        if (insertErr || !inserted?.id) {
          console.error('Failed to insert message:', insertErr);
          return;
        }

        // Set pending message info for API call after ChatProvider mounts
        setAppState(prev => ({ 
          ...prev, 
          pendingMessage: { chatId: newChatId, messageId: inserted.id, text },
          currentChatId: newChatId 
        }));
      } else {
        // User is not authenticated - create local chat
        const localChatId = crypto.randomUUID();
        const localMessageId = crypto.randomUUID();

        // Store initial message in localStorage
        const key = `circle_chat_messages_${localChatId}`;
        const initialEntry = {
          id: localMessageId,
          role: 'user',
          text,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify([initialEntry]));

        // Set pending message info for API call after ChatProvider mounts
        setAppState(prev => ({ 
          ...prev, 
          pendingMessage: { chatId: localChatId, messageId: localMessageId, text },
          currentChatId: localChatId 
        }));
      }
    } catch (error) {
      console.error('Error in handleMessageSend:', error);
    }
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
      <LoadingOverlay
        isVisible={true}
        isOverlay={false}
      />
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-circle-neutral">
      {/* Title - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TitleCircle
          title="Circle"
          hasActiveChat={!!appState.currentChatId}
          onNewChat={() => setAppState(prev => ({ ...prev, currentChatId: null }))}
        />
          {/* Offline indicator - only shown when not authenticated and no active chat */}
          {!appState.isAuthenticated && (
                    <div className="left-0 right-0 top-0 w-full text-center h-fit bg-circle-neutral">
                      <p className="font-circlemedium text-circle-primary/60 font-circletitlesmall">
                        Offline now. Sign in for stored data.
                      </p>
                    </div>
                  )}  
      </div>

           
      
      {/* Talk mode content area - fixed between header and nav */}
      {!isSpeedMode && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{
            top: `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + env(safe-area-inset-top) + ${!appState.isAuthenticated ? '20px' : '0px'})`,
            bottom: isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP,
          }}
        >
  
          <div className="h-full flex flex-col">
            {/* Render greeting and initial input only when no chat is active */}
            {!appState.currentChatId ? (
              <div className="h-full flex items-center justify-center px-lg">
                <div className="flex flex-col w-full gap-xl items-center">
                  <div className="text-center">
                    {/* Personalized greeting shown before first user input */}
                    <h2 className="font-circleheadlinemedium text-circle-primary">
                      {greeting}
                    </h2>
                  </div>
                  {/* TalkToCircle input for initial message */}
                  <TalkToCircle onMessageSend={handleMessageSend} />
                </div>
              </div>
            ) : (
              // Main chat window when a chat is active
              <ChatProvider chatId={appState.currentChatId}>
                <InitialMessageHandler 
                  pendingMessage={appState.pendingMessage} 
                  onMessageHandled={() => setAppState(prev => ({ ...prev, pendingMessage: null }))} 
                />
                <div className="w-full h-full flex flex-col">
                  <ChatWindow /> {/* Main chat conversation UI */}
                  <div className="h-fit w-full px-lg max-w-[900px] mx-auto">
                    {/* TalkToCircle input for ongoing chat */}
                    <TalkToCircle />
                  </div>
                </div>
              </ChatProvider>
            )}
          </div>
        </div>
      )}

      {isSpeedMode && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{
            top: `calc(${isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP} + env(safe-area-inset-top))`,
            bottom: isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP,
          }}
        >
          <div className="relative h-full">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              <VoiceButtonLg onClick={handleVoiceClick} isActive={recorder.isRecording} />
            </div>
            <div className="absolute left-0 right-0 bottom-0 flex flex-row items-center justify-center">
              <AudioGallery key={audioRefreshKey} />
            </div>
          </div>
        </div>
      )}
      
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="note" />
    </div>
  );
}
