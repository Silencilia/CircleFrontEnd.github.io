import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DraftCard from '../Cards/DraftCard';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { Draft } from '../../contexts/ContactContext';

interface DraftGalleryProps {
  drafts: Draft[];
  onDeleteDraft?: (draft: Draft) => void;
  onExtractDraft?: (draft: Draft) => void;
  onMenuDraft?: (draft: Draft) => void;
}

const DraftGallery: React.FC<DraftGalleryProps> = ({
  drafts,
  onDeleteDraft,
  onExtractDraft,
  onMenuDraft
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Mount flag to safely use portal on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDeleteClick = useCallback((draft: Draft) => {
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (draftToDelete && onDeleteDraft) {
      onDeleteDraft(draftToDelete);
    }
    setDeleteDialogOpen(false);
    setDraftToDelete(null);
  }, [draftToDelete, onDeleteDraft]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setDraftToDelete(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Only start dragging on left mouse button and not on interactive elements
    if (e.button === 0 && !(e.target as HTMLElement).closest('button, input, textarea, select')) {
      setIsDragging(true);
      setStartY(e.clientY);
      setScrollTop(containerRef.current.scrollTop);
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaY = e.clientY - startY;
    containerRef.current.scrollTop = scrollTop - deltaY;
    e.preventDefault();
  }, [isDragging, startY, scrollTop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!containerRef.current) return;
    
    // Handle mouse wheel scrolling with smooth behavior
    if (e.deltaY !== 0) {
      containerRef.current.scrollTop += e.deltaY;
      e.preventDefault();
    }
  }, []);

  // Touch support for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    // Only start dragging if not on interactive elements
    if (!(e.target as HTMLElement).closest('button, input, textarea, select')) {
      const touch = e.touches[0];
      setIsDragging(true);
      setStartY(touch.clientY);
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    containerRef.current.scrollTop = scrollTop - deltaY;
    e.preventDefault();
  }, [isDragging, startY, scrollTop]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse move and up, and touch events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <>
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          scrollBehavior: isDragging ? 'auto' : 'smooth'
        }}
      >
        <div className="flex flex-wrap gap-5 justify-center px-4 py-6">
          {drafts.length > 0 ? (
            drafts.map((draft, index) => (
              <DraftCard 
                key={index} 
                draft={draft} 
                onDelete={() => handleDeleteClick(draft)}
                onExtract={() => onExtractDraft?.(draft)}
                onMenu={() => onMenuDraft?.(draft)}
              />
            ))
          ) : (
            <div className="w-full text-center py-12">
              <div className="text-gray-500 text-lg">
                No drafts available
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isMounted && (
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          itemType="draft"
          itemName={draftToDelete ? `Draft from ${draftToDelete.date.year ? new Date(draftToDelete.date.year, (draftToDelete.date.month || 1) - 1, draftToDelete.date.day || 1).toLocaleDateString() : 'Unknown date'}` : undefined}
        />
      )}
    </>
  );
};

export default DraftGallery;