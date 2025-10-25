import React from 'react';
import NameConfirm from '../Dialogs/NameConfirmationDialog';
import { ComponentKind } from '../../types/chat';
import { useContacts } from '../../contexts/ContactContext';
import ContactCard from '../Cards/ContactCard';
import NoteCard from '../Cards/NoteCard';
import DraftCardDetail from '../Cards/DraftCardDetail';

type Renderer = (props: any) => React.ReactNode;

const ContactRef: Renderer = ({ id, onMenuClick }: { id: string; onMenuClick?: () => void }) => {
  const { state } = useContacts();
  const contact = state.contacts.find((c) => c.id === id);
  console.log('[Registry] ContactCard render', { id, found: !!contact });
  if (!contact) return null;
  return <ContactCard contact={contact} onMenuClick={onMenuClick || (() => {})} />;
};

const NoteRef: Renderer = ({ id, onOpenNoteDetail, onOpenContactDetail, isNestedInContactDetail, currentContactId }: { id: string; onOpenNoteDetail?: (note: any, source: any) => void; onOpenContactDetail?: (contact: any, source: any) => void; isNestedInContactDetail?: boolean; currentContactId?: string }) => {
  const { state } = useContacts();
  const note = state.notes.find((n) => n.id === id);
  console.log('[Registry] NoteCard render', { id, found: !!note });
  if (!note) return null;
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

const DraftCardRef: Renderer = ({ id, onMinimize }: { id: string; onMinimize?: () => void }) => {
  const { state } = useContacts();
  const draft = state.drafts.find((d: any) => d.id === id);
  console.log('[Registry] DraftCard render', { id, found: !!draft });
  if (!draft) return null;
  return <DraftCardDetail draft={draft} onMinimize={onMinimize} />;
};

const renderers: Record<ComponentKind, Renderer> = {
  NameConfirm: (props) => <NameConfirm {...props} />,
  NoteCard: NoteRef,
  ContactCard: ContactRef,
  DraftCard: DraftCardRef,
};

export function renderComponent(kind: ComponentKind, props: any) {
  const renderer = renderers[kind];
  if (!renderer) return null;
  return renderer(props);
}



