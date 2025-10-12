import React, { useMemo } from 'react';
import NoteCard from '../Cards/NoteCard';
import { Contact, Note } from '../../contexts/ContactContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface NoteGalleryProps {
  notes: Note[];
  onOpenNoteDetail?: (note: Note) => void;
  onOpenContactDetail?: (contact: Contact) => void;
}

// NoteGallery section positioned similarly to provided spec; renders a wrapped grid of NoteCards
const NoteGallery: React.FC<NoteGalleryProps> = ({ notes, onOpenNoteDetail, onOpenContactDetail }) => {
  const items = useMemo(() => (notes || []).filter(n => !n.is_trashed), [notes]);
  const isMobile = useIsMobile();

  return (
    <div className={`w-full ${isMobile ? 'px-lg pt-md gap-xl' : 'px-xxl pt-xl gap-2xl'} pb-0 flex flex-row items-center`}>
      <div className={`w-full flex flex-col justify-start items-center ${isMobile ? 'gap-lg' : 'gap-xl'}`}>
        {items.length > 0 ? (
          items.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpenNoteDetail={onOpenNoteDetail}
              onOpenContactDetail={onOpenContactDetail}
            />
          ))
        ) : (
          <div className={`text-center text-circle-primary/60 ${isMobile ? 'font-circlebodysmall' : 'font-circlebodymedium'} w-full`}>
            No notes to display
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteGallery;


