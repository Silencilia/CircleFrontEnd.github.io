import { useCallback } from 'react';
import { useContacts, Note, Contact } from '../contexts/ContactContext';
import { CardIndex, CardType, createSourceRecord, getCardIndexArray, popCardIndexArray } from '../data/sourceRecord';

interface CardNavigationOptions {
  openNote?: (note: Note, caller: CardIndex) => void;
  openContact?: (contact: Contact, caller: CardIndex) => void;
  closeCurrent?: () => void;
}

export function useCardNavigation(options: CardNavigationOptions = {}) {
  const { state } = useContacts();

  const openNoteDetail = useCallback((note: Note, caller: CardIndex | null) => {
    if (options.openNote) {
      options.openNote(note, caller || createSourceRecord('noteCardDetail', note.id));
    }
  }, [options]);

  const openContactDetail = useCallback((contact: Contact, caller: CardIndex | null) => {
    if (options.openContact) {
      options.openContact(contact, caller || createSourceRecord('contactCardDetail', contact.id));
    }
  }, [options]);

  const handleBack = useCallback((currentType: CardType, currentId: number) => {
    const arr = getCardIndexArray();
    if (arr.length === 0) {
      options.closeCurrent?.();
      return;
    }
    const last = popCardIndexArray();
    if (!last) {
      options.closeCurrent?.();
      return;
    }
    if (last.component === 'noteCardDetail') {
      const note = state.notes.find(n => n.id === last.id);
      if (note) {
        openNoteDetail(note, createSourceRecord(currentType, currentId));
        return;
      }
      options.closeCurrent?.();
      return;
    }
    if (last.component === 'contactCardDetail') {
      const contact = state.contacts.find(c => c.id === last.id);
      if (contact) {
        openContactDetail(contact, createSourceRecord(currentType, currentId));
        return;
      }
      options.closeCurrent?.();
      return;
    }
    options.closeCurrent?.();
  }, [state.notes, state.contacts, openNoteDetail, openContactDetail, options]);

  return { openNoteDetail, openContactDetail, handleBack };
}

export default useCardNavigation;


