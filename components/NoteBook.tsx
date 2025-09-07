import React, { useMemo } from 'react';
import NoteCard from './NoteCard';
import { Note } from '../contexts/ContactContext';

interface NoteBookProps {
  notes: Note[];
}

// Notebook section positioned similarly to provided spec; renders a wrapped grid of NoteCards
const NoteBook: React.FC<NoteBookProps> = ({ notes }) => {
  const items = useMemo(() => (notes || []).filter(n => !n.isTrashed), [notes]);

  return (
    <div className="w-full px-[30px] pt-[30px] pb-0 flex flex-row items-center gap-[37px]">
      <div className="w-full flex flex-row flex-wrap justify-center items-start content-center gap-[20px]">
        {items.length > 0 ? (
          items.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))
        ) : (
          <div className="text-center text-circle-primary/60 font-inter w-full">No notes to display</div>
        )}
      </div>
    </div>
  );
};

export default NoteBook;


