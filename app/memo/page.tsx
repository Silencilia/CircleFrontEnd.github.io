'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import HeaderMemo from '../../components/Headers/HeaderMemo';
import NavigationBar from '../../components/NavigationBar';
import CommitmentGallery, { COMMITMENT_GALLERY_TARGET_HEIGHT } from '../../components/Gallery/CommitmentGallery';
import { useContacts, Note, Contact } from '../../contexts/ContactContext';
import NoteGallery from '../../components/Gallery/NoteGallery';
import NoteCardDetail from '../../components/Cards/NoteCardDetail';
import NoteCardNew from '../../components/Cards/NoteCardNew';
import ContactCardDetail from '../../components/Cards/ContactCardDetail';

export default function MemoPage() {
  const { state, createNewNote } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [commitmentGalleryHeight, setCommitmentGalleryHeight] = useState<number>(COMMITMENT_GALLERY_TARGET_HEIGHT);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newNote, setNewNote] = useState<Note | null>(null);

  // Avoid conditional hook usage: render loading state inside return instead of early return

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewNote = async () => {
    try {
      const note = await createNewNote();
      setNewNote(note);
    } catch (error) {
      console.error('Failed to create new note:', error);
    }
  };



  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    let filtered = (state.notes || []).filter(n => !n.is_trashed);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.text.toLowerCase().includes(query) ||
        // Search in sentiment labels
        (note.sentiment_ids || []).some((sentimentId: string) => 
          state.sentiments.find(s => s.id === sentimentId)?.label.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [state.notes, state.sentiments, searchQuery]);

  return (
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* HeaderMemo - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderMemo 
          onSearchChange={handleSearchChange}
          onNewNote={handleNewNote}
        />
      </div>

      {/* Content between header (190px) and navbar (80px) minus CommitmentGallery target height */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 190, bottom: 80 + commitmentGalleryHeight, overflowY: 'auto' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <NoteGallery notes={filteredNotes} />
        </div>
      </div>

      {/* CommitmentGallery fixed above navigation bar (80px) - height fits content */}
      <div className="fixed left-0 right-0 z-40" style={{ bottom: 80 }}>
        <CommitmentGallery commitments={state.commitments} onHeightChange={setCommitmentGalleryHeight} />
      </div>
      
      {/* NavigationBar - positioned at very bottom (80px height) */}
      <NavigationBar currentPage="memo" />

      {/* Overlays for new/opened items */}
      {typeof window !== 'undefined' && selectedNote
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
      {typeof window !== 'undefined' && newNote
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <NoteCardNew 
                  note={newNote}
                  onMinimize={() => setNewNote(null)}
                  onOpenContactDetail={(contact) => {
                    setSelectedContact(contact);
                    setNewNote(null);
                  }}
                />
              </div>
            ),
            document.body
          )
        : null}
      {typeof window !== 'undefined' && selectedContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <ContactCardDetail 
                  contact={selectedContact}
                  onMinimize={() => setSelectedContact(null)}
                  onOpenNote={(note) => {
                    setSelectedNote(note);
                    setSelectedContact(null);
                  }}
                  onOpenContactDetail={(next) => setSelectedContact(next)}
                />
              </div>
            ),
            document.body
          )
        : null}
    </div>
  );
}
