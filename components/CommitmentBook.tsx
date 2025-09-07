import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommitmentCard from './CommitmentCard';
import { Commitment } from '../contexts/ContactContext';
import DownIcon from './icons/DownIcon';

interface CommitmentBookProps {
  commitments: Commitment[];
  title?: string;
  onHeightChange?: (h: number) => void;
}

// Visual metrics used to size the space reserved for CommitmentBook on pages
// Top padding (20) + title line-height (32) + gap under title (30) + card row height (155) + bottom padding (10)
export let COMMITMENT_BOOK_TARGET_HEIGHT = 20 + 32 + 30 + 155 + 10; // 247px (mutable for live updates)

// Horizontally scrollable row of CommitmentCard items with drag-to-scroll behavior
const CommitmentBook: React.FC<CommitmentBookProps> = ({ commitments, title = 'Upcoming commitments', onHeightChange }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keep last measured expanded heights to compute collapsed target height accurately
  const lastExpandedRootHeightRef = useRef<number>(COMMITMENT_BOOK_TARGET_HEIGHT);
  const lastCardsHeightRef = useRef<number>(155); // default to card row height

  const updateTargetHeight = useCallback(() => {
    if (!isCollapsed) {
      const rootHeight = rootRef.current?.clientHeight ?? lastExpandedRootHeightRef.current;
      const cardsHeight = cardsContainerRef.current?.clientHeight ?? lastCardsHeightRef.current;
      lastExpandedRootHeightRef.current = rootHeight;
      lastCardsHeightRef.current = cardsHeight;
      COMMITMENT_BOOK_TARGET_HEIGHT = rootHeight;
      if (onHeightChange) onHeightChange(COMMITMENT_BOOK_TARGET_HEIGHT);
      return;
    }

    // Collapsed: subtract the last measured cards container height from the last expanded total
    const collapsedHeight = Math.max(0, (lastExpandedRootHeightRef.current ?? 0) - (lastCardsHeightRef.current ?? 0));
    COMMITMENT_BOOK_TARGET_HEIGHT = collapsedHeight;
    if (onHeightChange) onHeightChange(COMMITMENT_BOOK_TARGET_HEIGHT);
  }, [isCollapsed, onHeightChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cardsContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(cardsContainerRef.current.scrollLeft);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !cardsContainerRef.current) return;
    const x = e.clientX;
    const walk = (startX - x) * 1.5;
    cardsContainerRef.current.scrollLeft = scrollLeft + walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!cardsContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(cardsContainerRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !cardsContainerRef.current) return;
    const x = e.touches[0].clientX;
    const walk = (startX - x) * 1.5;
    cardsContainerRef.current.scrollLeft = scrollLeft + walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global listeners for smooth dragging
  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Observe size changes of the root and cards container to update the exported target height
  useEffect(() => {
    updateTargetHeight();

    const observers: ResizeObserver[] = [];
    if (rootRef.current) {
      const ro = new ResizeObserver(() => {
        updateTargetHeight();
      });
      ro.observe(rootRef.current);
      observers.push(ro);
    }
    if (cardsContainerRef.current) {
      const ro2 = new ResizeObserver(() => {
        updateTargetHeight();
      });
      ro2.observe(cardsContainerRef.current);
      observers.push(ro2);
    }
    return () => {
      observers.forEach(o => o.disconnect());
    };
  }, [updateTargetHeight, isCollapsed]);

  const items = useMemo(() => (commitments || []).filter(c => !c.isTrashed), [commitments]);

  return (
    <div ref={rootRef} className="w-full px-[30px] pt-[20px] pb-[10px]">
      <div className="flex flex-col gap-[30px] w-full">
        <div className="flex flex-row items-center gap-[30px]">
          <h2 className="font-serif text-[24px] leading-[32px] text-circle-primary">{title}</h2>
          <button type="button" onClick={() => setIsCollapsed(prev => !prev)} aria-expanded={!isCollapsed}>
            <DownIcon width={20} height={20} className={`[stroke-width:1.5px] transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!isCollapsed && (
          <div
            ref={cardsContainerRef}
            className={`flex flex-row items-start gap-[20px] overflow-x-auto select-none scrollbar-hide ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth', userSelect: isDragging ? 'none' : 'auto' }}
          >
            {items.length > 0 ? (
              items.map((commitment) => (
                <div key={commitment.id} className="flex-shrink-0">
                  <CommitmentCard commitment={commitment} />
                </div>
              ))
            ) : (
              <div className="text-center text-circle-primary/60 font-inter py-8">
                No commitments to display
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitmentBook;


