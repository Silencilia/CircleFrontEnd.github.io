'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { renderComponent } from './registry';
import UserMessageCard from './UserMessageCard';
import SystemMessageCard from './SystemMessageCard';
import ThinkingIndicator from './ThinkingIndicator';
import ContactCardDetail from '../Cards/ContactCardDetail';
import NoteCardDetail from '../Cards/NoteCardDetail';
import CommitmentCardDetail from '../Cards/CommitmentCardDetail';
import { createPortal } from 'react-dom';
import { createSourceRecord } from '../../data/sourceRecord';
import { useContacts, Contact, Note, Commitment } from '../../contexts/ContactContext';
import useCardNavigation from '../../hooks/useCardNavigation';
import { useDragScroll } from '../../hooks/useDragScroll';
import MissingIndicator from './MissingIndicator';

// Memoized message component to prevent unnecessary re-renders
const MessageComponent = React.memo(({ entry, onOpenContactDetail, onOpenNoteDetail, onContactMenuClick, onMaximizeCommitment, state }: { entry: any; onOpenContactDetail: (c: Contact, src: any) => void; onOpenNoteDetail: (n: Note, src: any) => void; onContactMenuClick: (contactId: string) => void; onMaximizeCommitment: (c: Commitment) => void; state: any }) => {
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
  const commitmentParts = componentParts.filter((p: any) => p.kind === 'CommitmentCard');
  const otherParts = componentParts.filter((p: any) => p.kind !== 'ContactCard' && p.kind !== 'NoteCard' && p.kind !== 'CommitmentCard');

  // Separate valid and missing contacts
  const { validContactParts, missingContactCount } = useMemo(() => {
    const valid = contactParts.filter((p: any) => {
      const contact = state.contacts.find((c: Contact) => c.id === p.props?.id);
      return contact && !contact.is_trashed;
    });
    return {
      validContactParts: valid,
      missingContactCount: contactParts.length - valid.length
    };
  }, [contactParts, state.contacts]);

  // Separate valid and missing notes
  const { validNoteParts, missingNoteCount } = useMemo(() => {
    const valid = noteParts.filter((p: any) => {
      // Prioritize ID lookup for live data, fallback to passed note object
      const note = (p.props?.id ? state.notes.find((n: Note) => n.id === p.props.id) : null)
        || p.props?.note
        || null;
      return note && !note.is_trashed;
    });
    return {
      validNoteParts: valid,
      missingNoteCount: noteParts.length - valid.length
    };
  }, [noteParts, state.notes]);

  // Separate valid and missing commitments
  const { validCommitmentParts, missingCommitmentCount } = useMemo(() => {
    const valid = commitmentParts.filter((p: any) => {
      // Prioritize ID lookup for live data, fallback to passed commitment object
      const commitment = (p.props?.id ? state.commitments.find((c: Commitment) => c.id === p.props.id) : null) 
        || p.props?.commitment 
        || null;
      return commitment && !commitment.is_trashed;
    });
    return {
      validCommitmentParts: valid,
      missingCommitmentCount: commitmentParts.length - valid.length
    };
  }, [commitmentParts, state.commitments]);

  const contactScrollRef = useDragScroll<HTMLDivElement>();
  const noteScrollRef = useDragScroll<HTMLDivElement>();
  const commitmentScrollRef = useDragScroll<HTMLDivElement>();

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex flex-col ${isUser ? 'items-end max-w-[75%]' : 'items-stretch w-full'} gap-md`}>
        {entry.text ? bubble : null}
        {textParts.map((p: any, idx: number) => (
          <div key={`t-${idx}`} className="w-full">
            <SystemMessageCard text={p.text} />
          </div>
        ))}
        {!isUser && missingContactCount > 0 && (
          <div className="w-full">
            <SystemMessageCard text={`Ooops. That contact is already gone. Did you delete it after we chatted?`} />
          </div>
        )}
        {!isUser && validContactParts.length > 0 && (
          <div 
            ref={contactScrollRef}
            className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {validContactParts.map((p: any, idx: number) => (
              <div key={`c-${idx}`} className="shrink-0">
                {renderComponent(p.kind, {
                  ...p.props,
                  onMenuClick: () => onContactMenuClick(p.props?.id as string),
                }, entry.id)}
              </div>
            ))}
          </div>
        )}
        {!isUser && missingNoteCount > 0 && (
          <div className="w-full">
            <SystemMessageCard text={`Ooops. That note is already gone. Did you delete it after we chatted?`} />
          </div>
        )}
        {!isUser && validNoteParts.length > 0 && (
          <div 
            ref={noteScrollRef}
            className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {validNoteParts.map((p: any, idx: number) => (
              <div key={`n-${idx}`} className="shrink-0">
                {renderComponent(p.kind, {
                  ...p.props,
                  onOpenNoteDetail: (note: Note, src: any) => onOpenNoteDetail(note, src),
                  onOpenContactDetail: (contact: Contact, src: any) => onOpenContactDetail(contact, src),
                }, entry.id)}
              </div>
            ))}
          </div>
        )}
        {!isUser && missingCommitmentCount > 0 && (
          <div className="w-full">
            <MissingIndicator datatype="commitment" />
          </div>
        )}
        {!isUser && validCommitmentParts.length > 0 && (
          <div 
            ref={commitmentScrollRef}
            className="w-full flex flex-col md:flex-row gap-md md:overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {validCommitmentParts.map((p: any, idx: number) => {
              // Prioritize ID lookup for live data, fallback to passed commitment object
              const commitment = (p.props?.id ? state.commitments.find((c: Commitment) => c.id === p.props.id) : null) 
                || p.props?.commitment 
                || null;
              return (
                <div key={`cmt-${idx}`} className="shrink-0">
                  {renderComponent(p.kind, {
                    ...p.props,
                    onMaximize: commitment ? () => onMaximizeCommitment(commitment) : undefined,
                    onOpenContactDetail: (contact: Contact, src: any) => onOpenContactDetail(contact, src),
                  }, entry.id)}
                </div>
              );
            })}
          </div>
        )}
        {!isUser && otherParts.length > 0 && (
          <div className="w-full flex flex-col gap-md">
            {otherParts.map((p: any, idx: number) => (
              <div key={`o-${idx}`} className="shrink-0">
                {renderComponent(p.kind, {
                  ...p.props,
                  onOpenNoteDetail: (note: Note, src: any) => onOpenNoteDetail(note, src),
                  onOpenContactDetail: (contact: Contact, src: any) => onOpenContactDetail(contact, src),
                }, entry.id)}
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
  const [commitmentForDetail, setCommitmentForDetail] = useState<Commitment | null>(null);
  const [caller, setCaller] = useState<any>(null);
  const { openContactDetail, openNoteDetail, handleBack } = useCardNavigation({
    openContact: (c, src) => {
      setCaller(src);
      setContactForDetail(c);
      setNoteForDetail(null);
      setCommitmentForDetail(null);
    },
    openNote: (n, src) => {
      setCaller(src);
      setNoteForDetail(n);
      setContactForDetail(null);
      setCommitmentForDetail(null);
    },
    closeCurrent: () => {
      setContactForDetail(null);
      setNoteForDetail(null);
      setCommitmentForDetail(null);
    },
  });

  // Memoize message elements to prevent unnecessary re-renders
  const messageElements = useMemo(() => 
    entries.map((entry) => (
      <MessageComponent
        key={entry.id}
        entry={entry}
        state={state}
        onOpenContactDetail={(c) => openContactDetail(c, createSourceRecord('contactCardDetail', c.id))}
        onOpenNoteDetail={(n) => openNoteDetail(n, createSourceRecord('noteCardDetail', n.id))}
        onContactMenuClick={(contactId: string) => {
          const contact = state.contacts.find((c: Contact) => c.id === contactId);
          if (contact) {
            setCaller(createSourceRecord('contactCardDetail', contact.id));
            setContactForDetail(contact);
            setNoteForDetail(null);
            setCommitmentForDetail(null);
          }
        }}
        onMaximizeCommitment={(commitment) => {
          setCaller(createSourceRecord('commitmentCardDetail', commitment.id));
          setCommitmentForDetail(commitment);
          setContactForDetail(null);
          setNoteForDetail(null);
        }}
      />
    )), [entries, openContactDetail, openNoteDetail, state]
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

      {typeof window !== 'undefined' && (contactForDetail || noteForDetail || commitmentForDetail) && createPortal(
        (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
            onClick={(e) => {
              if (e.target !== e.currentTarget) return;
              setContactForDetail(null);
              setNoteForDetail(null);
              setCommitmentForDetail(null);
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
                  setCommitmentForDetail(null);
                }}
                onOpenContactDetail={(c, src) => {
                  setCaller(src);
                  setNoteForDetail(null);
                  setContactForDetail(c);
                  setCommitmentForDetail(null);
                }}
                onMinimize={() => {
                  setContactForDetail(null);
                  setNoteForDetail(null);
                  setCommitmentForDetail(null);
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
                  setCommitmentForDetail(null);
                }}
                onMinimize={() => {
                  setContactForDetail(null);
                  setNoteForDetail(null);
                  setCommitmentForDetail(null);
                }}
              />
            ) : commitmentForDetail ? (
              <CommitmentCardDetail
                commitment={commitmentForDetail}
                caller={caller}
                onOpenContactDetail={(c, src) => {
                  setCaller(src);
                  setCommitmentForDetail(null);
                  setContactForDetail(c);
                  setNoteForDetail(null);
                }}
                onMinimize={() => {
                  setContactForDetail(null);
                  setNoteForDetail(null);
                  setCommitmentForDetail(null);
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



