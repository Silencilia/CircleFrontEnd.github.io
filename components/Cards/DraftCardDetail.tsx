import React, { useRef, useState, useCallback, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import ExtractButton from '../Button/ExtractButton';
import RecycleButton from '../Button/RecycleButton';
import MinimizeButton from '../Button/MinimizeButton';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { Draft } from '../../contexts/ContactContext';

interface DraftCardDetailProps {
  draft: Draft;
  onExtract?: (draft: Draft) => void;
  onDelete?: (draft: Draft) => void;
  onMinimize?: () => void;
}

const DraftCardDetail: React.FC<DraftCardDetailProps> = ({
  draft,
  onExtract,
  onDelete,
  onMinimize
}) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mount flag to safely use portal on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (onDelete) {
      onDelete(draft);
    }
    setDeleteDialogOpen(false);
  }, [draft, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleExtractClick = useCallback(() => {
    if (onExtract) {
      onExtract(draft);
    }
  }, [draft, onExtract]);

  const handleMinimizeClick = useCallback(() => {
    if (onMinimize) {
      onMinimize();
    }
  }, [onMinimize]);

  // Mouse wheel scrolling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!textContainerRef.current) return;
    
    if (e.deltaY !== 0) {
      textContainerRef.current.scrollTop += e.deltaY;
      e.preventDefault();
    }
  }, []);

  // Mouse drag scrolling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!textContainerRef.current) return;
    
    if (e.button === 0) {
      setIsDragging(true);
      setStartY(e.clientY);
      setScrollTop(textContainerRef.current.scrollTop);
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !textContainerRef.current) return;
    
    const deltaY = e.clientY - startY;
    textContainerRef.current.scrollTop = scrollTop - deltaY;
    e.preventDefault();
  }, [isDragging, startY, scrollTop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!textContainerRef.current) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setStartY(touch.clientY);
    setScrollTop(textContainerRef.current.scrollTop);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !textContainerRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    textContainerRef.current.scrollTop = scrollTop - deltaY;
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

  // Format date and time
  const formatDate = (date: { year: number | null; month?: number | null; day?: number | null }) => {
    if (!date.year) return 'Unknown date';
    
    const month = date.month || 1;
    const day = date.day || 1;
    const dateObj = new Date(date.year, month - 1, day);
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: { hour: number | null; minute: number | null }) => {
    const hours = (time.hour || 0).toString().padStart(2, '0');
    const minutes = (time.minute || 0).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <div className="crd-dtl">
        {/* Main container */}
        <div className="flex flex-col w-full h-full gap-lg overflow-hidden">

          {/* Note info row */}
          <div className="flex flex-row justify-between items-center p-0 gap-md w-full h-fit flex-none order-0 self-stretch flex-grow-0">

            {/* Timestamp */}
            <div className="flex flex-row items-center p-0 gap-md w-fit h-5 flex-none order-0 flex-grow-0">
              <div className="flex flex-col items-start p-0 w-fit h-5 flex-none order-0 flex-grow-0">
                <div className="flex flex-row items-center pr-md gap-md w-fit h-5 flex-none order-0 flex-grow-0">

                  {/* Date */}
                  <div className="w-fit h-5 font-circlebodymedium-draft text-circle-primary opacity-50 flex-none order-0 flex-grow-0">
                    {formatDate(draft.date)}
                  </div>

                  {/* Time */}
                  <div className="w-fit h-5 font-circlebodymedium-draft text-circle-primary opacity-50 flex-none order-1 flex-grow-0">
                    {formatTime(draft.time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons Container */}
            <div className="flex flex-row items-center gap-md w-fit h-fit p-0 flex-none order-1 flex-grow-0">
              {/* Extract Button */}
              <div className="flex flex-row items-center gap-xs w-fit h-fit flex-none order-1 flex-grow-0">
                <ExtractButton onClick={handleExtractClick} />
              </div>

              {/* Delete and Minimize Buttons */}
              <div className="flex flex-row items-center gap-xs w-fit h-fit flex-none order-2 flex-grow-0">
                {/* Delete Button */}
                <RecycleButton
                  onClick={handleDeleteClick}
                  ariaLabel="Delete draft"
                />

                {/* Minimize Button */}
                <button
                  onClick={handleMinimizeClick}
                  className="btn-sm hover:bg-circle-neutral-variant transition-colors"
                  aria-label="Minimize draft"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-circle-primary"
                  >
                    <path
                      d="M2.66667 9.33333H6.66667M6.66667 9.33333V13.3333M6.66667 9.33333L2 14M13.3333 6.66667H9.33333M9.33333 6.66667V2.66667M9.33333 6.66667L14 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Text container */}
          <ScrollContainer
            className="w-full h-fit min-h-0 max-h-full bg-circle-neutral-variant rounded-sm p-md flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            horizontal={false}
            vertical={true}
          >
            <div className="w-fit font-circlebodymedium-draft text-circle-primary text-left opacity-50">
              {draft.text}
            </div>
          </ScrollContainer>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isMounted && (
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          itemType="draft"
          itemName={`Draft from ${formatDate(draft.date)} ${formatTime(draft.time)}`}
        />
      )}
    </>
  );
};

export default DraftCardDetail;
