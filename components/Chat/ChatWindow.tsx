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
  
  const parts = (entry.parts || []).map((p: any, idx: number) => {
    if (p.type === 'text') {
      return (
        <div key={idx} className="w-full">
          <SystemMessageCard text={p.text} />
        </div>
      );
    }
    if (p.type === 'component') {
      return (
        <div key={idx} className="w-full">
          {renderComponent(p.kind, p.props)}
        </div>
      );
    }
    return null;
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex flex-col ${isUser ? 'items-end max-w-[75%]' : 'items-stretch w-full'} gap-md`}>
        {entry.text ? bubble : null}
        {parts}
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



