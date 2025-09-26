'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Title from '../../components/Headers/Title';
import SearchBar from '../../components/Headers/SearchBar';
import { NewNoteButton } from '../../components/Button';
import NavigationBar from '../../components/NavigationBar';
import CommitmentGallery from '../../components/Gallery/CommitmentGallery';
import { useContacts, Note, Contact } from '../../contexts/ContactContext';
import NoteGallery from '../../components/Gallery/NoteGallery';
import NoteCardDetail from '../../components/Cards/NoteCardDetail';
import NoteCardNew from '../../components/Cards/NoteCardNew';
import ContactCardDetail from '../../components/Cards/ContactCardDetail';
import {
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP
} from '../../utils/designConstants';

export default function MemoPage() {
  const { state, createNewNote } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newNote, setNewNote] = useState<Note | null>(null);
  const [navBarHeight, setNavBarHeight] = useState<string>(NAV_BAR_HEIGHT_MOBILE);
  const [isMobile, setIsMobile] = useState(false);
  const [isCommitmentGalleryCollapsed, setIsCommitmentGalleryCollapsed] = useState(false);

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

  // Update navigation bar height and mobile detection based on screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setNavBarHeight(mobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);



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

  // Calculate commitment gallery height based on collapsed state and screen size
  const commitmentGalleryHeight = useMemo(() => {
    if (isCommitmentGalleryCollapsed) {
      return parseInt(isMobile ? COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE : COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP);
    } else {
      return parseInt(isMobile ? COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE : COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP);
    }
  }, [isCommitmentGalleryCollapsed, isMobile]);

  return (
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* Title and SearchBar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full justify-center items-center bg-circle-neutral flex flex-col">
          {/* Title - Above */}
          <Title title="Memo" />

          {/* SearchBar and New Note Button - Below */}
          <SearchBar
            onSearchChange={handleSearchChange}
            actionButton={<NewNoteButton onClick={handleNewNote} />}
          />
        </div>
      </div>

      {/* Content between header (190px) and navbar minus CommitmentGallery target height */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 190, bottom: parseInt(navBarHeight) + commitmentGalleryHeight, overflowY: 'auto' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <NoteGallery notes={filteredNotes} />
        </div>
      </div>

      {/* CommitmentGallery fixed above navigation bar - height fits content */}
      <div className="fixed left-0 right-0 z-40" style={{ bottom: navBarHeight }}>
        <CommitmentGallery
          commitments={state.commitments}
          isCollapsed={isCommitmentGalleryCollapsed}
          onToggle={() => setIsCommitmentGalleryCollapsed(prev => !prev)}
        />
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
