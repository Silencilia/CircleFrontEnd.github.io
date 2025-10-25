'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { renderComponent } from './registry';
import UserMessageCard from './UserMessageCard';
import SystemMessageCard from './SystemMessageCard';
import ThinkingIndicator from './ThinkingIndicator';
import ContactCardDetail from '../Cards/ContactCardDetail';
import NoteCardDetail from '../Cards/NoteCardDetail';
import { createPortal } from 'react-dom';
import { createSourceRecord } from '../../data/sourceRecord';
import { useContacts, Contact, Note } from '../../contexts/ContactContext';
import useCardNavigation from '../../hooks/useCardNavigation';
import { useDragScroll } from '../../hooks/useDragScroll';

// Memoized message component to prevent unnecessary re-renders
const MessageComponent = React.memo(({ entry, onOpenContactDetail, onOpenNoteDetail, onContactMenuClick }: { entry: any; onOpenContactDetail: (c: Contact, src: any) => void; onOpenNoteDetail: (n: Note, src: any) => void; onContactMenuClick: (contactId: string) => void }) => {
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

  const contactScrollRef = useDragScroll<HTMLDivElement>();
  const noteScrollRef = useDragScroll<HTMLDivElement>();

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
          <div 
            ref={contactScrollRef}
            className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {contactParts.map((p: any, idx: number) => (
              <div key={`c-${idx}`} className="shrink-0">
                {renderComponent(p.kind, {
                  ...p.props,
                  onMenuClick: () => onContactMenuClick(p.props?.id as string),
                })}
              </div>
            ))}
          </div>
        )}
        {!isUser && noteParts.length > 0 && (
          <div 
            ref={noteScrollRef}
            className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {noteParts.map((p: any, idx: number) => (
              <div key={`n-${idx}`} className="shrink-0">
                {renderComponent(p.kind, {
                  ...p.props,
                  onOpenNoteDetail: (note: Note, src: any) => onOpenNoteDetail(note, src),
                  onOpenContactDetail: (contact: Contact, src: any) => onOpenContactDetail(contact, src),
                })}
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
  const { state } = useContacts();
  const [contactForDetail, setContactForDetail] = useState<Contact | null>(null);
  const [noteForDetail, setNoteForDetail] = useState<Note | null>(null);
  const [caller, setCaller] = useState<any>(null);
  const { openContactDetail, openNoteDetail, handleBack } = useCardNavigation({
    openContact: (c, src) => {
      setCaller(src);
      setContactForDetail(c);
      setNoteForDetail(null);
    },
    openNote: (n, src) => {
      setCaller(src);
      setNoteForDetail(n);
      setContactForDetail(null);
    },
    closeCurrent: () => {
      setContactForDetail(null);
      setNoteForDetail(null);
    },
  });

  // Memoize message elements to prevent unnecessary re-renders
  const messageElements = useMemo(() => 
    entries.map((entry) => (
      <MessageComponent
        key={entry.id}
        entry={entry}
        onOpenContactDetail={(c) => openContactDetail(c, createSourceRecord('contactCardDetail', c.id))}
        onOpenNoteDetail={(n) => openNoteDetail(n, createSourceRecord('noteCardDetail', n.id))}
        onContactMenuClick={(contactId: string) => {
          const contact = state.contacts.find((c) => c.id === contactId);
          if (contact) {
            setCaller(createSourceRecord('contactCardDetail', contact.id));
            setContactForDetail(contact);
            setNoteForDetail(null);
          }
        }}
      />
    )), [entries, openContactDetail, openNoteDetail, state.contacts]
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

      {typeof window !== 'undefined' && (contactForDetail || noteForDetail) && createPortal(
        (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
            onClick={(e) => {
              if (e.target !== e.currentTarget) return;
              setContactForDetail(null);
              setNoteForDetail(null);
            }}
          >
            {contactForDetail ? (
              <ContactCardDetail
                contact={contactForDetail}
                caller={caller}
                onOpenNote={(n, src) => {
                  setCaller(src);
                  setContactForDetail(null);
                  setNoteForDetail(n);
                }}
                onOpenContactDetail={(c, src) => {
                  setCaller(src);
                  setNoteForDetail(null);
                  setContactForDetail(c);
                }}
                onMinimize={() => {
                  setContactForDetail(null);
                  setNoteForDetail(null);
                }}
              />
            ) : noteForDetail ? (
              <NoteCardDetail
                note={noteForDetail}
                caller={caller}
                onOpenContactDetail={(c, src) => {
                  setCaller(src);
                  setNoteForDetail(null);
                  setContactForDetail(c);
                }}
                onMinimize={() => {
                  setContactForDetail(null);
                  setNoteForDetail(null);
                }}
              />
            ) : null}
          </div>
        ),
        document.body
      )}
    </div>
  );
};

export default ChatWindow;



