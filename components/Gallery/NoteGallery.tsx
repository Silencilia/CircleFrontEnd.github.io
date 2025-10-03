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

  const DesktopLayout = () => (
    <div className="w-full px-xxl pt-xl pb-0 flex flex-row items-center gap-2xl">
      <div className="w-full flex flex-row flex-wrap justify-center items-start content-center gap-[20px]">
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
          <div className="text-center text-circle-primary/60 font-circlebodymedium w-full">No notes to display</div>
        )}
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="w-full px-lg pt-md pb-0 flex flex-row items-center gap-xl">
      <div className="w-full flex flex-row flex-wrap justify-center items-start content-center gap-lg">
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
          <div className="text-center text-circle-primary/60 font-circlebodysmall w-full">No notes to display</div>
        )}
      </div>
    </div>
  );
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default NoteGallery;


