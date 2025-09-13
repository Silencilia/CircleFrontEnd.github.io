import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import NoteCard from './Cards/NoteCard';
import ContactCardDetail from './Cards/ContactCardDetail';
import NoteCardDetail from './Cards/NoteCardDetail';
import { Contact, Note } from '../contexts/ContactContext';

interface NoteBookProps {
  notes: Note[];
}

// Notebook section positioned similarly to provided spec; renders a wrapped grid of NoteCards
const NoteBook: React.FC<NoteBookProps> = ({ notes }) => {
  const items = useMemo(() => (notes || []).filter(n => !n.isTrashed), [notes]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  return (
    <>
    <div className="w-full px-[30px] pt-[30px] pb-0 flex flex-row items-center gap-[37px]">
      <div className="w-full flex flex-row flex-wrap justify-center items-start content-center gap-[20px]">
        {items.length > 0 ? (
          items.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note}
              onOpenNoteDetail={(n) => {
                setSelectedNote(n);
                setSelectedContact(null);
              }}
              onOpenContactDetail={(contact) => {
                setSelectedContact(contact);
                setSelectedNote(null);
              }}
            />
          ))
        ) : (
          <div className="text-center text-circle-primary/60 font-inter w-full">No notes to display</div>
        )}
      </div>
    </div>
    {/* Overlays managed at the NoteBook level */}
    {isMounted && selectedNote
      ? createPortal(
          (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <NoteCardDetail 
                note={selectedNote}
                onMinimize={() => setSelectedNote(null)}
                onOpenContactDetail={(contact) => {
                  setSelectedContact(contact);
                  setSelectedNote(null);
                }}
              />
            </div>
          ),
          document.body
        )
      : null}
    {isMounted && selectedContact
      ? createPortal(
          (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <ContactCardDetail 
                contact={selectedContact}
                onMinimize={() => setSelectedContact(null)}
                onOpenContactDetail={(next) => setSelectedContact(next)}
                onOpenNote={(n) => {
                  setSelectedNote(n);
                  setSelectedContact(null);
                }}
              />
            </div>
          ),
          document.body
        )
      : null}
    </>
  );
};

export default NoteBook;


