'use client';

import React, { useState, useMemo } from 'react';
import HeaderMemo from '../../components/Headers/HeaderMemo';
import NavigationBar from '../../components/NavigationBar';
import CommitmentBook, { COMMITMENT_BOOK_TARGET_HEIGHT } from '../../components/CommitmentBook';
import { useContacts } from '../../contexts/ContactContext';
import NoteBook from '../../components/NoteBook';

export default function MemoPage() {
  const { state } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilterIds, setRelationshipFilterIds] = useState<number[]>([]);
  const [commitmentBookHeight, setCommitmentBookHeight] = useState<number>(COMMITMENT_BOOK_TARGET_HEIGHT);

  // Avoid conditional hook usage: render loading state inside return instead of early return

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRelationshipFilterChange = (selectedIds: number[]) => {
    setRelationshipFilterIds(selectedIds);
  };

  // Filter notes based on search query and relationship filter
  const filteredNotes = useMemo(() => {
    let filtered = (state.notes || []).filter(n => !n.isTrashed);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.text.toLowerCase().includes(query) ||
        // Search in sentiment labels
        (note.sentimentIds || []).some(sentimentId => 
          state.sentiments.find(s => s.id === sentimentId)?.label.toLowerCase().includes(query)
        )
      );
    }

    // Apply relationship filter - filter notes that mention contacts with selected relationships
    if (relationshipFilterIds.length > 0) {
      filtered = filtered.filter(note => {
        // Get all contacts that match the relationship filter
        const matchingContacts = state.contacts?.filter(contact => 
          contact.relationshipIds.some(relationshipId => 
            relationshipFilterIds.includes(relationshipId)
          )
        ) || [];

        // Check if the note text contains any of the matching contact names
        return matchingContacts.some(contact => 
          note.text.toLowerCase().includes(contact.name.toLowerCase())
        );
      });
    }

    return filtered;
  }, [state.notes, state.contacts, state.sentiments, searchQuery, relationshipFilterIds]);

  return (
    <div className="relative w-full min-h-screen bg-[#FBF7F3]">
      {/* HeaderMemo - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderMemo 
          onSearchChange={handleSearchChange}
          onRelationshipFilterChange={handleRelationshipFilterChange}
        />
      </div>

      {/* Content between header (198px) and navbar (80px) minus CommitmentBook target height */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 198, bottom: 80 + commitmentBookHeight, overflowY: 'auto' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <NoteBook notes={filteredNotes} />
        </div>
      </div>

      {/* CommitmentBook fixed above navigation bar (80px) - height fits content */}
      <div className="fixed left-0 right-0 z-40" style={{ bottom: 80 }}>
        <CommitmentBook commitments={state.commitments} onHeightChange={setCommitmentBookHeight} />
      </div>
      
      {/* NavigationBar - positioned at very bottom (80px height) */}
      <NavigationBar currentPage="memo" />
    </div>
  );
}
