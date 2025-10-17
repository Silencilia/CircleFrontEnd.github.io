'use client';
import React, { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { STRINGS } from '../data/strings';
import { UploadButton, VoiceButton, SendButton } from './Button';
 
import { useChat } from '../contexts/ChatContext';
import { supabase } from '../lib/supabase';
import { identifyRequest } from '../utils/api/talkToCircleHelpers';
import { useIsMobile } from '../hooks/useIsMobile';

interface TalkToCircleProps {
  // For demos/testing: force a specific layout. If undefined, auto-detect.
  forceWrapped?: boolean;
  // Callback when user sends a message
  onSend?: () => void;
  // Callback when a new chat is created on first message
  onNewChatCreated?: (chatId: string) => void;
}

const TalkToCircle: React.FC<TalkToCircleProps> = ({ forceWrapped, onSend, onNewChatCreated }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chat = (() => {
    try { return useChat(); } catch { return null; }
  })();
  const [value, setValue] = useState('');
  const [isWrapped, setIsWrapped] = useState<boolean>(false);
 
  const isMobile = useIsMobile();

  // Minimal wrap detection: based on explicit newlines or measured height vs single-line
  const updateWrapState = (nextValue: string) => {
    if (forceWrapped !== undefined) return; // respect forced layout
    const el = textareaRef.current;
    if (!el) return;

    let wrappedNow = isWrapped;
    const trimmed = nextValue.trim();
    // Sticky behavior: once wrapped, stay wrapped until input is cleared
    if (trimmed === '') {
      wrappedNow = false;
    } else if (isWrapped) {
      wrappedNow = true;
    } else if (nextValue.includes('\n')) {
      wrappedNow = true;
    } else {
      const computedStyle = window.getComputedStyle(el);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
      const paddingTop = parseFloat(computedStyle.paddingTop) || 5;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 5;
      const singleLineHeight = lineHeight + paddingTop + paddingBottom;
      const contentHeight = el.scrollHeight;
      if (contentHeight > singleLineHeight + 5) {
        wrappedNow = true;
      }
    }

    if (wrappedNow !== isWrapped) {
      setIsWrapped(wrappedNow);
    }
  };

  // On mount or breakpoint change: focus on desktop
  useEffect(() => {
    const el = textareaRef.current;
    if (el && typeof window !== 'undefined' && !isMobile) {
      setTimeout(() => {
        el.focus();
      }, 100);
    }
  }, [isMobile]);

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;

    // Call the onSend callback to mark that user has made initial input
    onSend?.();
    // Clear the textarea immediately after sending
    setValue('');
    // If no chat context is available (initial input before provider),
    // create a new chat and insert the first message directly.
    if (!chat) {
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
            return;
          }

          const newChatId = createdChat.id as string;
          // Insert the first user message for this chat BEFORE switching views
          const { data: inserted, error: insertErr } = await supabase.from('chat_messages').insert({
            chat_id: newChatId,
            role: 'user',
            text,
            parts: null,
            status: 'final',
          }).select('id').single();
          if (insertErr || !inserted?.id) {
            onNewChatCreated?.(newChatId);
            return;
          }
          // Inform parent so it can mount ChatProvider with this chatId after message exists
          onNewChatCreated?.(newChatId);
          // Fire-and-forget intent processing
          identifyRequest(newChatId, inserted.id);
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
          
          // Inform parent to mount ChatProvider with this local chatId
          onNewChatCreated?.(localChatId);
          
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
          
          // Process intent and handle AI response for offline mode
          identifyRequest(localChatId, localMessageId, (content) => {
            // Add system message to localStorage
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const messages = JSON.parse(stored);
                messages.push({
                  id: crypto.randomUUID(),
                  role: 'system',
                  text: content,
                  createdAt: new Date().toISOString(),
                });
                localStorage.setItem(key, JSON.stringify(messages));
              } catch (e) {
                console.error('Failed to store system message', e);
              }
            }
          }, localData);
        }
      } catch {
        // Silent fail for now; could surface UI error later
      }
    } else {
      // Otherwise, add via chat context and trigger identify
      const messageId = await chat.addUserMessage(text);
      if (chat.chatId && messageId) {
        // Check if we're in offline mode
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
          
          identifyRequest(chat.chatId, messageId, (content) => {
            // Add system message via context for offline mode
            chat.addSystemText(content);
          }, localData);
        } else {
          identifyRequest(chat.chatId, messageId);
        }
      }
    }
  };

  return (
    <>
      {/* Container that switches layout via CSS Grid */}
      <div className="w-full flex justify-center h-fit">
            <div
              className={`bg-circle-white border border-inset border-circle-neutral-variant rounded-lg self-start w-full max-w-[900px] ${
               (forceWrapped ?? isWrapped)
                ? "grid grid-rows-btn-layout grid-cols-1 items-center"
                : "grid grid-cols-btn-layout items-center gap-x-md"
              }`}
            >
              {/* Upload button: bottom row when wrapped; left column when single-line */}
              <div style={{ gridRow: (forceWrapped ?? isWrapped) ? '2' : '1', gridColumn: '1' }}>
                <UploadButton />
              </div>

              {/* Textarea region */}
              <div
                className={`${(forceWrapped ?? isWrapped) ? '' : 'textarea-container-unwrapped'}`}
                style={{ gridRow: '1', gridColumn: (forceWrapped ?? isWrapped) ? '1' : '2', height: (forceWrapped ?? isWrapped) ? 'fit-content' : undefined, alignSelf: (forceWrapped ?? isWrapped) ? 'start' : undefined }}
              >
                <TextareaAutosize
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    const next = e.target.value;
                    setValue(next);
                    requestAnimationFrame(() => updateWrapState(next));
                  }}
                  onHeightChange={() => {
                    requestAnimationFrame(() => updateWrapState(value));
                  }}
                  placeholder={STRINGS.PLACEHOLDERS.TALK_TO_CIRCLE}
                  minRows={1}
                  className={`font-circlechatmedium w-full resize-none overflow-y-auto bg-transparent focus:outline-none text-circle-primary placeholder-circle-primary/35 ${
                    chat ? 'max-h-[180px]' : ''
                  } ${
                    (forceWrapped ?? isWrapped) ? 'textarea-wrapped' : 'textarea-unwrapped'
                  }`}
                />
              </div>

              {/* Right button: bottom-right when wrapped; right column when single-line */}
              <div style={{ gridRow: (forceWrapped ?? isWrapped) ? '2' : '1', gridColumn: (forceWrapped ?? isWrapped) ? '1' : '3', justifySelf: (forceWrapped ?? isWrapped) ? 'end' : undefined }}>
                {value.trim() ? (
                  <SendButton onClick={handleSend} />
                ) : (
                  <VoiceButton />
                )}
              </div>
            </div>
          </div>
    </>
  );
};
export default TalkToCircle;
