'use client';

import React, { useEffect, useState } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import ContactCard from '../Cards/ContactCard';
import NoteCard from '../Cards/NoteCard';
import { Contact, Note } from '../../contexts/ContactContext';

interface ContactCardWrapperProps {
  contactId: string;
}

interface NoteCardWrapperProps {
  noteId: string;
}

export const ContactCardWrapper: React.FC<ContactCardWrapperProps> = ({ contactId }) => {
  const { state } = useContacts();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const found = state.contacts.find(c => c.id === contactId);
    setContact(found || null);
  }, [contactId, state.contacts]);

  if (!contact) {
    return (
      <div className="crd-ctct bg-circle-neutral-variant p-md text-circle-primary">
        Contact not found
      </div>
    );
  }

  return <ContactCard contact={contact} onMenuClick={() => {}} />;
};

export const NoteCardWrapper: React.FC<NoteCardWrapperProps> = ({ noteId }) => {
  const { state } = useContacts();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const found = state.notes.find(n => n.id === noteId);
    setNote(found || null);
  }, [noteId, state.notes]);

  if (!note) {
    return (
      <div className="crd-nt bg-circle-neutral-variant p-md text-circle-primary">
        Note not found
      </div>
    );
  }

  return <NoteCard note={note} />;
};

