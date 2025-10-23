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
  const items = useMemo(() => {
    const filtered = (notes || []).filter(n => !n.is_trashed);
    
    // Sort by date and time (year, month, day, hour, minute)
    return filtered.sort((a, b) => {
      // Compare dates first
      const aDate = a.date;
      const bDate = b.date;
      
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1; // Put notes without dates at the end
      if (!bDate) return -1;
      
      // Compare year
      if (aDate.year !== bDate.year) {
        if (aDate.year === null) return 1;
        if (bDate.year === null) return -1;
        return bDate.year - aDate.year; // Most recent first
      }
      
      // Compare month
      if (aDate.month !== bDate.month) {
        if (aDate.month === null) return 1;
        if (bDate.month === null) return -1;
        return bDate.month - aDate.month;
      }
      
      // Compare day
      if (aDate.day !== bDate.day) {
        if (aDate.day === null) return 1;
        if (bDate.day === null) return -1;
        return bDate.day - aDate.day;
      }
      
      // If dates are equal, compare times
      const aTime = a.time_value;
      const bTime = b.time_value;
      
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1; // Put notes without times at the end
      if (!bTime) return -1;
      
      // Compare hour
      if (aTime.hour !== bTime.hour) {
        if (aTime.hour === null) return 1;
        if (bTime.hour === null) return -1;
        return bTime.hour - aTime.hour;
      }
      
      // Compare minute
      if (aTime.minute !== bTime.minute) {
        if (aTime.minute === null) return 1;
        if (bTime.minute === null) return -1;
        return bTime.minute - aTime.minute;
      }
      
      return 0;
    });
  }, [notes]);
  
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


