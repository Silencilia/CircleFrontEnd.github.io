'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { renderComponent } from './registry';
import UserMessageCard from './UserMessageCard';
import SystemMessageCard from './SystemMessageCard';
import ThinkingIndicator from './ThinkingIndicator';

const ChatWindow: React.FC = () => {
  const { entries, isThinking } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  console.log('[ChatWindow] isThinking:', isThinking, 'entries length:', entries.length);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-lg py-md">
      <div className="flex flex-col gap-md w-full">
        {entries.map((e) => {
          const isUser = e.role === 'user';
          const bubble = isUser ? (
            <UserMessageCard text={e.text ?? ''} />
          ) : (
            <SystemMessageCard text={e.text ?? ''} />
          );
          const parts = (e.parts || []).map((p, idx) => {
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
            <div key={e.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex flex-col ${isUser ? 'items-end max-w-[75%]' : 'items-stretch w-full'} gap-md`}>
                {e.text ? bubble : null}
                {parts}
              </div>
            </div>
          );
        })}
        {isThinking && (() => {
          console.log('[ChatWindow] Rendering ThinkingIndicator');
          return (
            <div className="flex justify-start w-full">
              <div className="flex flex-col items-stretch w-full gap-md">
                <ThinkingIndicator />
              </div>
            </div>
          );
        })()}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;



