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

  const openNameConfirmationDialog = useCallback((noteText: string, contacts: Contact[], caller: CardIndex | null) => {
    // For now, this is handled directly in the component since the dialog is modal
    // The dialog manages its own state
  }, []);

  const handleBack = useCallback((currentType: CardType, currentId: string) => {
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

    if (last.component === 'nameConfirmationDialog') {
      // For name confirmation dialog, we don't need to open it again
      // since it's managed by the parent component's state
      return;
    }

    options.closeCurrent?.();
  }, [state.notes, state.contacts, openNoteDetail, openContactDetail, options]);

  return { openNoteDetail, openContactDetail, handleBack };
}

export default useCardNavigation;


