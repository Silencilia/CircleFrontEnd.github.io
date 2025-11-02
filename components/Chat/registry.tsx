import React from 'react';
import NameConfirm from '../Dialogs/NameConfirmationDialog';
import { ComponentKind } from '../../types/chat';
import { useContacts, Commitment, Note } from '../../contexts/ContactContext';
import ContactCard from '../Cards/ContactCard';
import NoteCard from '../Cards/NoteCard';
import DraftDialog from '../Dialogs/DraftDialog';
import CommitmentCard from '../Cards/CommitmentCard';

type Renderer = (props: any, messageId: string) => React.ReactNode;

const ContactRef: Renderer = ({ id, onMenuClick }: { id: string; onMenuClick?: () => void }, messageId: string) => {
  const { state } = useContacts();
  const contact = state.contacts.find((c) => c.id === id);
  console.log('[Registry] ContactCard render', { id, found: !!contact });
  if (!contact) return null;
  return <ContactCard contact={contact} onMenuClick={onMenuClick || (() => {})} />;
};

const NoteRef: Renderer = ({ id, note: passedNote, onOpenNoteDetail, onOpenContactDetail, isNestedInContactDetail, currentContactId }: { id?: string; note?: Note; onOpenNoteDetail?: (note: any, source: any) => void; onOpenContactDetail?: (contact: any, source: any) => void; isNestedInContactDetail?: boolean; currentContactId?: string }, messageId: string) => {
  const { state } = useContacts();

  // Prioritize ID lookup for live data, fallback to passed note object
  const note = (id ? state.notes.find((n) => n.id === id) : null) || passedNote || null;
  
  console.log('[Registry] NoteCard render', { id, hasPassedNote: !!passedNote, found: !!note });
  if (!note || note.is_trashed) return null;
  return (
    <NoteCard
      note={note}
      onOpenNoteDetail={onOpenNoteDetail}
      onOpenContactDetail={onOpenContactDetail}
      isNestedInContactDetail={!!isNestedInContactDetail}
      currentContactId={currentContactId}
    />
  );
};

const DraftCardRef: Renderer = ({ draft, onMinimize, onOpenContactDetail, locked }: { draft: any; onMinimize?: () => void; onOpenContactDetail?: (contact: any, src: any) => void; locked?: 'confirm' | 'cancel' | 'extract' | null }, messageId: string) => {
  console.log('[Registry] DraftCard render with embedded draft', { id: draft?.id, found: !!draft, locked });
  if (!draft) return null;
  return <DraftDialog draft={draft} onMinimize={onMinimize} onOpenContactDetail={onOpenContactDetail} messageId={messageId} locked={locked} />;
};

const CommitmentCardRef: Renderer = ({ id, commitment: passedCommitment, onMaximize, onOpenContactDetail }: { id?: string; commitment?: Commitment; onMaximize?: () => void; onOpenContactDetail?: (contact: any, src: any) => void }, messageId: string) => {
  const { state } = useContacts();

  // Prioritize ID lookup for live data, fallback to passed commitment object
  const commitment = (id ? state.commitments.find((c) => c.id === id) : null) || passedCommitment || null;

  if (!commitment || commitment.is_trashed) return null;
  return (
    <CommitmentCard
      commitment={commitment}
      onMaximize={onMaximize}
      onOpenContactDetail={onOpenContactDetail}
    />
  );
};

const renderers: Record<ComponentKind, Renderer> = {
  NameConfirm: (props, messageId) => <NameConfirm {...props} messageId={messageId} />,
  NoteCard: NoteRef,
  ContactCard: ContactRef,
  DraftCard: DraftCardRef,
  CommitmentCard: CommitmentCardRef,
};

export function renderComponent(kind: ComponentKind, props: any, messageId: string) {
  const renderer = renderers[kind];
  if (!renderer) return null;
  return renderer(props, messageId);
}



