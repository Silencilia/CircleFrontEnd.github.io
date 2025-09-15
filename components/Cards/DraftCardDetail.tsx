import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      <div className="flex flex-col items-start p-0 gap-5 w-[630px] h-fit bg-white rounded-[12px]">
        {/* Main container */}
        <div className="flex flex-col items-start p-[15px] gap-5 w-[630px] h-fit bg-white rounded-[12px] flex-none order-0 self-stretch flex-grow-0">
          
          {/* Note info row */}
          <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-[600px] h-6 flex-none order-0 self-stretch flex-grow-0">
            
            {/* Timestamp */}
            <div className="flex flex-row items-center p-0 gap-[10px] w-fit h-5 flex-none order-0 flex-grow-0">
              <div className="flex flex-col items-start p-0 w-fit h-5 flex-none order-0 flex-grow-0">
                <div className="flex flex-row items-center pr-[10px] gap-[10px] w-fit h-5 flex-none order-0 flex-grow-0">
                  
                  {/* Date */}
                  <div className="w-fit h-5 font-inter italic font-normal text-[14px] leading-[20px] flex items-center tracking-[0.25px] text-circle-primary opacity-50 flex-none order-0 flex-grow-0">
                    {formatDate(draft.date)}
                  </div>
                  
                  {/* Time */}
                  <div className="w-fit h-5 font-inter italic font-normal text-[14px] leading-[20px] flex items-center tracking-[0.25px] text-circle-primary opacity-50 flex-none order-1 flex-grow-0">
                    {formatTime(draft.time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons Container */}
            <div className="flex flex-row items-center gap-[10px] w-fit h-fit p-0 flex-none order-1 flex-grow-0">
              {/* Extract Button */}
              <div className="flex flex-row items-center gap-[2px] w-fit h-fit flex-none order-1 flex-grow-0">
                <ExtractButton onClick={handleExtractClick} />
              </div>

              {/* Delete and Minimize Buttons */}
              <div className="flex flex-row items-center gap-[2px] w-fit h-fit flex-none order-2 flex-grow-0">
                {/* Delete Button */}
                <RecycleButton
                  onClick={handleDeleteClick}
                  ariaLabel="Delete draft"
                />
                
                {/* Minimize Button */}
                <button
                  onClick={handleMinimizeClick}
                  className="flex flex-row justify-center items-center p-1 gap-[10px] w-6 h-6 hover:bg-circle-neutral-variant rounded transition-colors"
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
          <div 
            ref={textContainerRef}
            className="flex flex-col justify-start items-start p-[10px] w-[600px] h-fit max-h-[720px] bg-circle-neutral-variant rounded-[12px] flex-none order-1 flex-grow-0 overflow-y-auto"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging ? 'none' : 'auto',
            }}
          >
            {/* Hide scrollbar for webkit browsers */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Draft text */}
            <div className="w-[580px] h-fit font-inter italic font-normal text-[14px] leading-[20px] text-left tracking-[0.25px] text-circle-primary opacity-50">
              {draft.text}
            </div>
          </div>
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
