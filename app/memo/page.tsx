'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Title from '../../components/Headers/Title';
import Search from '../../components/Headers/Search';
import { NewNoteButton } from '../../components/Button';
import NavigationBar from '../../components/NavigationBar';
import CommitmentGallery from '../../components/Gallery/CommitmentGallery';
import { useContacts, Note, Contact } from '../../contexts/ContactContext';
import NoteGallery from '../../components/Gallery/NoteGallery';
import NoteCardDetail from '../../components/Cards/NoteCardDetail';
import NoteCardNew from '../../components/Cards/NoteCardNew';
import ContactCardDetail from '../../components/Cards/ContactCardDetail';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP,
  TITLE_HEIGHT_MOBILE,
  TITLE_HEIGHT_DESKTOP,
  MEMO_PAGE_SEARCH_BAR_HEIGHT_MOBILE,
  MEMO_PAGE_SEARCH_BAR_HEIGHT_DESKTOP,
} from '../../utils/designConstants';

export default function MemoPage() {
  const { state, createNewNote } = useContacts();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newNote, setNewNote] = useState<Note | null>(null);
  const [isCommitmentGalleryCollapsed, setIsCommitmentGalleryCollapsed] = useState(true);

  const titleHeight = isMobile ? TITLE_HEIGHT_MOBILE : TITLE_HEIGHT_DESKTOP;
  const searchBarHeight = isMobile ? MEMO_PAGE_SEARCH_BAR_HEIGHT_MOBILE : MEMO_PAGE_SEARCH_BAR_HEIGHT_DESKTOP;
  const navBarHeight = isMobile ? NAV_BAR_HEIGHT_MOBILE : NAV_BAR_HEIGHT_DESKTOP;

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

  // Calculate commitment gallery height based on collapsed state and screen size
  const commitmentGalleryHeight = useMemo(() => {
    if (isCommitmentGalleryCollapsed) {
      return parseInt(isMobile ? COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE : COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP);
    } else {
      return parseInt(isMobile ? COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE : COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP);
    }
  }, [isCommitmentGalleryCollapsed, isMobile]);

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="relative w-full min-h-screen bg-circle-neutral">
      {/* Title and SearchBar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-circle-neutral flex flex-col">
          {/* Title - Above */}
          <Title title="Memo" />

          {/* Desktop Search Bar */}
          <div className="flex flex-row w-full justify-center">
            <div className="flex flex-row w-full max-w-[900px] items-center px-xl gap-lg bg-circle-neutral" style={{ height: searchBarHeight }}>
              {/* Search */}
              <Search
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search notes..."
                autoFocus={typeof window !== 'undefined' && window.innerWidth >= 768}
              />

              <div className="flex-shrink-0">
                <NewNoteButton onClick={handleNewNote} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content between header and navbar minus CommitmentGallery target height */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: parseInt(titleHeight) + parseInt(searchBarHeight) + 'px', bottom: parseInt(navBarHeight) + commitmentGalleryHeight + 'px', overflowY: 'auto' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <NoteGallery 
            notes={filteredNotes} 
            onOpenNoteDetail={(n) => {
              setSelectedNote(n);
              setSelectedContact(null);
            }}
            onOpenContactDetail={(contact) => {
              setSelectedContact(contact);
              setSelectedNote(null);
            }}
          />
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

      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="memo" />
    </div>
  );

  // Mobile Layout
  const MobileLayout = () => (
    <div className="relative w-full min-h-screen bg-circle-neutral">
      {/* Title and SearchBar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-circle-neutral flex flex-col">
          {/* Title - Above */}
          <Title title="Memo" />

          {/* Mobile Search Bar */}
          <div className="flex flex-row w-full justify-center">
            <div className="flex flex-row w-full max-w-[900px] items-center px-lg gap-md bg-circle-neutral" style={{ height: MEMO_PAGE_SEARCH_BAR_HEIGHT_MOBILE }}>
              {/* Search */}
              <Search
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search notes..."
                autoFocus={typeof window !== 'undefined' && window.innerWidth >= 768}
              />

              <div className="flex-shrink-0">
                <NewNoteButton onClick={handleNewNote} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content between header and navbar minus CommitmentGallery target height */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: parseInt(titleHeight) + parseInt(searchBarHeight) + 'px', bottom: parseInt(navBarHeight) + commitmentGalleryHeight + 'px', overflowY: 'auto' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <NoteGallery 
            notes={filteredNotes} 
            onOpenNoteDetail={(n) => {
              setSelectedNote(n);
              setSelectedContact(null);
            }}
            onOpenContactDetail={(contact) => {
              setSelectedContact(contact);
              setSelectedNote(null);
            }}
          />
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

      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="memo" />
    </div>
  );

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}

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
    </>
  );
}
