'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { renderComponent } from './registry';
import UserMessageCard from './UserMessageCard';
import SystemMessageCard from './SystemMessageCard';
import ThinkingIndicator from './ThinkingIndicator';

// Memoized message component to prevent unnecessary re-renders
const MessageComponent = React.memo(({ entry }: { entry: any }) => {
  const isUser = entry.role === 'user';
  const bubble = isUser ? (
    <UserMessageCard text={entry.text ?? ''} />
  ) : (
    <SystemMessageCard text={entry.text ?? ''} />
  );
  
  const componentParts = (entry.parts || []).filter((p: any) => p.type === 'component');
  const textParts = (entry.parts || []).filter((p: any) => p.type === 'text');
  const contactParts = componentParts.filter((p: any) => p.kind === 'ContactCard');
  const noteParts = componentParts.filter((p: any) => p.kind === 'NoteCard');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex flex-col ${isUser ? 'items-end max-w-[75%]' : 'items-stretch w-full'} gap-md`}>
        {entry.text ? bubble : null}
        {textParts.map((p: any, idx: number) => (
          <div key={`t-${idx}`} className="w-full">
            <SystemMessageCard text={p.text} />
          </div>
        ))}
        {!isUser && contactParts.length > 0 && (
          <div className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto">
            {contactParts.map((p: any, idx: number) => (
              <div key={`c-${idx}`} className="shrink-0">
                {renderComponent(p.kind, p.props)}
              </div>
            ))}
          </div>
        )}
        {!isUser && noteParts.length > 0 && (
          <div className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto">
            {noteParts.map((p: any, idx: number) => (
              <div key={`n-${idx}`} className="shrink-0">
                {renderComponent(p.kind, p.props)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

MessageComponent.displayName = 'MessageComponent';

const ChatWindow: React.FC = () => {
  const { entries, isThinking } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  // Memoize message elements to prevent unnecessary re-renders
  const messageElements = useMemo(() => 
    entries.map((entry) => (
      <MessageComponent key={entry.id} entry={entry} />
    )), [entries]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      const last = entries[entries.length - 1];
      if (last) {
        const parts = last?.parts || [];
        const compCount = parts.filter((p: any) => p.type === 'component').length;
        const kinds = parts.filter((p: any) => p.type === 'component').map((p: any) => p.kind);
        console.log('[ChatWindow] new message', { role: last.role, hasText: !!last.text, partsCount: parts.length, componentCount: compCount, kinds });
      }
    } catch {}
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-lg py-md">
      <div className="flex flex-col gap-md w-full">
        {messageElements}
        {isThinking && (
          <div className="flex justify-start w-full">
            <div className="flex flex-col items-stretch w-full gap-md">
              <ThinkingIndicator />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;



