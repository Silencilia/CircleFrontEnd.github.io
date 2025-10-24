import React from 'react';
import NameConfirm from '../Dialogs/NameConfirmationDialog';
import { ComponentKind } from '../../types/chat';
import { useContacts } from '../../contexts/ContactContext';
import ContactCard from '../Cards/ContactCard';
import NoteCard from '../Cards/NoteCard';

type Renderer = (props: any) => React.ReactNode;

const ContactRef: Renderer = ({ id }: { id: string }) => {
  const { state } = useContacts();
  const contact = state.contacts.find((c) => c.id === id);
  console.log('[Registry] ContactCard render', { id, found: !!contact });
  if (!contact) return null;
  return <ContactCard contact={contact} onMenuClick={() => {}} />;
};

const NoteRef: Renderer = ({ id }: { id: string }) => {
  const { state } = useContacts();
  const note = state.notes.find((n) => n.id === id);
  console.log('[Registry] NoteCard render', { id, found: !!note });
  if (!note) return null;
  return <NoteCard note={note} />;
};

const renderers: Record<ComponentKind, Renderer> = {
  NameConfirm: (props) => <NameConfirm {...props} />,
  NoteCard: NoteRef,
  ContactCard: ContactRef,
};

export function renderComponent(kind: ComponentKind, props: any) {
  const renderer = renderers[kind];
  if (!renderer) return null;
  return renderer(props);
}



