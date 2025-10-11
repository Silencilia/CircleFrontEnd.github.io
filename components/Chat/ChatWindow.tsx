'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { renderComponent } from './registry';

const ChatWindow: React.FC = () => {
  const { entries } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="flex flex-col gap-3 max-w-[900px] w-[85vw] mx-auto">
        {entries.map((e) => {
          const isUser = e.role === 'user';
          const bubble = (
            <div className={`rounded-lg px-3 py-2 ${isUser ? 'bg-circle-primary text-white' : 'bg-white border'} whitespace-pre-wrap break-words`}>
              {e.text}
            </div>
          );
          const parts = (e.parts || []).map((p, idx) => {
            if (p.type === 'text') {
              return (
                <div key={idx} className="rounded-lg px-3 py-2 bg-white border whitespace-pre-wrap break-words">
                  {p.text}
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
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-stretch'} gap-2 max-w-[75%]`}>
                {e.text ? bubble : null}
                {parts}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;



