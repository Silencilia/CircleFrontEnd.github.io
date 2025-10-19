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
    console.log('🔙 handleBack called:', { currentType, currentId, cardStack: arr });

    if (arr.length === 0) {
      console.log('🔙 No cards in stack, closing current');
      options.closeCurrent?.();
      return;
    }

    const last = popCardIndexArray();
    console.log('🔙 Popped card from stack:', last);

    if (!last) {
      console.log('🔙 No card popped, closing current');
      options.closeCurrent?.();
      return;
    }

    if (last.component === 'noteCardDetail') {
      const note = state.notes.find(n => n.id === last.id);
      if (note) {
        console.log('🔙 Opening note detail:', note.title);
        openNoteDetail(note, createSourceRecord(currentType, currentId));
        return;
      }
      console.log('🔙 Note not found, closing current');
      options.closeCurrent?.();
      return;
    }

    if (last.component === 'contactCardDetail') {
      const contact = state.contacts.find(c => c.id === last.id);
      if (contact) {
        console.log('🔙 Opening contact detail:', contact.name);
        openContactDetail(contact, createSourceRecord(currentType, currentId));
        return;
      }
      console.log('🔙 Contact not found, closing current');
      options.closeCurrent?.();
      return;
    }

    if (last.component === 'nameConfirmationDialog') {
      // For name confirmation dialog, we don't need to open it again
      // since it's managed by the parent component's state
      console.log('🔙 Returning to name confirmation dialog (no action needed)');
      return;
    }

    console.log('🔙 Unknown card type, closing current');
    options.closeCurrent?.();
  }, [state.notes, state.contacts, openNoteDetail, openContactDetail, options]);

  return { openNoteDetail, openContactDetail, handleBack };
}

export default useCardNavigation;


