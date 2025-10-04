'use client';

import React, { useState } from 'react';
import Title from '../../components/Headers/Title';
import NavigationBar from '../../components/NavigationBar';
import DraftGallery from '../../components/Gallery/DraftGallery';
import DraftCardDetail from '../../components/Cards/DraftCardDetail';
import { useContacts } from '../../contexts/ContactContext';
import { Draft } from '../../contexts/ContactContext';

export default function DraftPage() {
  const { state } = useContacts();
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isDraftDetailOpen, setIsDraftDetailOpen] = useState(false);

  // Handle menu click to open draft detail
  const handleMenuDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setIsDraftDetailOpen(true);
  };

  // Handle minimize to close draft detail
  const handleMinimizeDraftDetail = () => {
    setIsDraftDetailOpen(false);
    setSelectedDraft(null);
  };

  // Handle extract draft
  const handleExtractDraft = (draft: Draft) => {
    // TODO: Implement extract draft functionality
    console.log('Extract draft:', draft);
  };

  // Handle delete draft
  const handleDeleteDraft = (draft: Draft) => {
    // TODO: Implement delete draft functionality
    console.log('Delete draft:', draft);
    // Close detail if the deleted draft was selected
    if (selectedDraft && selectedDraft === draft) {
      setIsDraftDetailOpen(false);
      setSelectedDraft(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* Title - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Title title="Draft" />
      </div>
      
      {/* DraftGallery fixed between header and navigation bar */}
      <div className="draft-gallery">
        <DraftGallery 
          drafts={state.drafts || []}
          onDeleteDraft={handleDeleteDraft}
          onExtractDraft={handleExtractDraft}
          onMenuDraft={handleMenuDraft}
        />
      </div>
      
      {/* NavigationBar - positioned at very bottom */}
      <NavigationBar currentPage="draft" />

      {/* Grey-out overlay and DraftCardDetail */}
      {isDraftDetailOpen && selectedDraft && (
        <>
          {/* Grey-out overlay - covers everything including header and navigation */}
          <div className="fixed inset-0 bg-circle-primary/50 z-[60] flex items-center justify-center">
            {/* DraftCardDetail - positioned above overlay */}
            <div className="relative z-[70] w-full h-full sm:w-auto sm:h-auto">
              <DraftCardDetail
                draft={selectedDraft}
                onExtract={handleExtractDraft}
                onDelete={handleDeleteDraft}
                onMinimize={handleMinimizeDraftDetail}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

