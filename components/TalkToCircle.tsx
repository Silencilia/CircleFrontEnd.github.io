'use client';
import React, { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { STRINGS } from '../data/strings';
import { UploadButton, VoiceButton, SendButton } from './Button';
import NameConfirm from './Dialogs/NameConfirm';
import { detectNamesInText } from '../utils/talkToCircleHelpers';
import { useChat } from '../contexts/ChatContext';
import { supabase } from '../lib/supabase';
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
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectedNames, setDetectedNames] = useState<string[] | null>(null);
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
    if (!text || isDetecting) return;
    setIsDetecting(true);
    
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
        if (!userId) {
          setIsDetecting(false);
          return;
        }

        const { data: createdChat, error: chatError } = await supabase
          .from('chats')
          .insert({ user_id: userId, title: null, metadata: {} })
          .select('id')
          .single();
        if (chatError || !createdChat?.id) {
          setIsDetecting(false);
          return;
        }

        const newChatId = createdChat.id as string;
        // Insert the first user message for this chat BEFORE switching views
        await supabase.from('chat_messages').insert({
          chat_id: newChatId,
          role: 'user',
          text,
          parts: null,
          status: 'final',
        });
        // Inform parent so it can mount ChatProvider with this chatId after message exists
        onNewChatCreated?.(newChatId);
      } catch {
        // Silent fail for now; could surface UI error later
      }
    } else {
      // Otherwise, add via chat context
      await chat.addUserMessage(text);
    }
    
    const names = await detectNamesInText(text);
    setDetectedNames(names);
    setIsDetecting(false);
  };

  const handleDialogClose = () => {
    setDetectedNames(null);
  };

  return (
    <>
      {/* Container that switches layout via CSS Grid */}
      <div className="w-full flex justify-center h-fit">
            <div
              className={`bg-circle-white border border-inset border-circle-neutral-variant rounded-lg self-start w-[95vw] max-w-[900px] ${
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
                  <SendButton onClick={handleSend} className={isDetecting ? 'opacity-60 pointer-events-none' : ''} />
                ) : (
                  <VoiceButton />
                )}
              </div>
            </div>
          </div>
      {Array.isArray(detectedNames) && (
        <NameConfirm
          names={detectedNames}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};
export default TalkToCircle;
