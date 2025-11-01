import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import { createPortal } from 'react-dom';
import CommitmentCard from '../Cards/CommitmentCard';
import CommitmentCardDetail from '../Cards/CommitmentCardDetail';
import ContactCardDetail from '../Cards/ContactCardDetail';
import { Commitment, Contact } from '../../contexts/ContactContext';
import DownIcon from '../icons/DownIcon';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CardIndex, createSourceRecord } from '../../data/sourceRecord';

interface CommitmentGalleryProps {
  commitments: Commitment[];
  title?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onHeightChange?: (h: number) => void;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

// Visual metrics used to size the space reserved for CommitmentGallery on pages
// Top padding (20) + title line-height (32) + gap under title (30) + card row height (155) + bottom padding (10)
export let COMMITMENT_GALLERY_TARGET_HEIGHT = 20 + 32 + 30 + 155 + 10; // 247px (mutable for live updates)

// Horizontally scrollable row of CommitmentCard items
const CommitmentGallery: React.FC<CommitmentGalleryProps> = ({ commitments, title = 'Upcoming commitments', isCollapsed = false, onToggle, onHeightChange, onOpenContactDetail }) => {
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [caller, setCaller] = useState<CardIndex | null>(null);


  // Keep last measured expanded heights to compute collapsed target height accurately
  const lastExpandedRootHeightRef = useRef<number>(COMMITMENT_GALLERY_TARGET_HEIGHT);
  const lastCardsHeightRef = useRef<number>(155); // default to card row height

  const updateTargetHeight = useCallback(() => {
    if (!isCollapsed) {
      const rootHeight = rootRef.current?.clientHeight ?? lastExpandedRootHeightRef.current;
      const cardsHeight = cardsContainerRef.current?.clientHeight ?? lastCardsHeightRef.current;
      lastExpandedRootHeightRef.current = rootHeight;
      lastCardsHeightRef.current = cardsHeight;
      COMMITMENT_GALLERY_TARGET_HEIGHT = rootHeight;
      if (onHeightChange) onHeightChange(COMMITMENT_GALLERY_TARGET_HEIGHT);
      return;
    }

    // Collapsed: subtract the last measured cards container height from the last expanded total
    const collapsedHeight = Math.max(0, (lastExpandedRootHeightRef.current ?? 0) - (lastCardsHeightRef.current ?? 0));
    COMMITMENT_GALLERY_TARGET_HEIGHT = collapsedHeight;
    if (onHeightChange) onHeightChange(COMMITMENT_GALLERY_TARGET_HEIGHT);
  }, [isCollapsed, onHeightChange]);

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

  const items = useMemo(() => (commitments || []).filter(c => !c.is_trashed), [commitments]);

  // Mobile Layout
  const MobileLayout = () => (
    <div ref={rootRef} className={`w-full px-lg pt-sm ${isCollapsed ? 'commitment-gallery-collapsed' : 'commitment-gallery-expanded'}`}>
      <div className="flex flex-col gap-md w-full">
        <div className="flex flex-row items-center gap-xl">
          <h2 className="font-circletitlesmall text-circle-primary">{title}</h2>
          <button type="button" onClick={() => onToggle?.()} aria-expanded={!isCollapsed} className="btn-sm">
            <DownIcon className={`[stroke-width:1.5px] transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!isCollapsed && (
          <ScrollContainer
            innerRef={cardsContainerRef}
            className="flex flex-row items-start gap-lg overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            vertical={false}
          >
            {items.length > 0 ? (
              items.map((commitment) => (
                <div key={commitment.id} className="flex-shrink-0">
                  <CommitmentCard 
                    commitment={commitment}
                    onMaximize={() => setSelectedCommitment(commitment)}
                    onOpenContactDetail={(contact, source) => {
                      setCaller(source);
                      setSelectedContact(contact);
                      setSelectedCommitment(null);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-circle-primary/60 font-circlebodymedium py-8">
                No commitments to display
              </div>
            )}
          </ScrollContainer>
        )}
      </div>
    </div>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <div ref={rootRef} className={`w-full px-xl pt-md ${isCollapsed ? 'commitment-gallery-collapsed' : 'commitment-gallery-expanded'}`}>
      <div className="flex flex-col gap-lg w-full">
        <div className="flex flex-row items-center gap-2xl">
          <h2 className="font-circleheadlinexsmall text-circle-primary">{title}</h2>
          <button type="button" onClick={() => onToggle?.()} aria-expanded={!isCollapsed} className="btn-sm">
            <DownIcon className={`[stroke-width:1.5px] transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!isCollapsed && (
          <ScrollContainer
            innerRef={cardsContainerRef}
            className="flex flex-row items-start gap-2xl overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            vertical={false}
          >
            {items.length > 0 ? (
              items.map((commitment) => (
                <div key={commitment.id} className="flex-shrink-0">
                  <CommitmentCard 
                    commitment={commitment}
                    onMaximize={() => setSelectedCommitment(commitment)}
                    onOpenContactDetail={(contact, source) => {
                      setCaller(source);
                      setSelectedContact(contact);
                      setSelectedCommitment(null);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-circle-primary/60 font-circlebodymedium py-8">
                No commitments to display
              </div>
            )}
          </ScrollContainer>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      
      {/* Commitment Detail Overlay */}
      {typeof window !== 'undefined' && (selectedCommitment || selectedContact)
        ? (() => {
            return createPortal(
              (
                <div
                  className={`fixed inset-0 z-[9999] bg-circle-primary/50 ${isMobile ? '' : 'flex items-center justify-center'}`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedCommitment(null);
                      setSelectedContact(null);
                    }
                  }}
                >
                  {isMobile ? (
                    selectedContact ? (
                      (() => {
                        return (
                          <ContactCardDetail
                            contact={selectedContact}
                            caller={caller}
                            onMinimize={() => {
                              setSelectedContact(null);
                              setCaller(null);
                            }}
                            onOpenContactDetail={(contact, source) => {
                              setCaller(source);
                              setSelectedContact(contact);
                            }}
                            onOpenCommitment={(commitment, source) => {
                              setCaller(source);
                              setSelectedCommitment(commitment);
                              setSelectedContact(null);
                            }}
                          />
                        );
                      })()
                    ) : selectedCommitment ? (
                      (() => {
                        return (
                          <CommitmentCardDetail
                            commitment={selectedCommitment}
                            onMinimize={() => {
                              setSelectedCommitment(null);
                              setSelectedContact(null);
                            }}
                            onOpenContactDetail={(contact, source) => {
                              setCaller(source);
                              setSelectedContact(contact);
                              setSelectedCommitment(null);
                            }}
                          />
                        );
                      })()
                    ) : null
                  ) : (
                    <div className="mx-4">
                      {selectedContact ? (
                        (() => {
                          return (
                            <ContactCardDetail
                              contact={selectedContact}
                              caller={caller}
                              onMinimize={() => {
                                setSelectedContact(null);
                                setCaller(null);
                              }}
                              onOpenContactDetail={(contact, source) => {
                                setCaller(source);
                                setSelectedContact(contact);
                              }}
                              onOpenCommitment={(commitment, source) => {
                                setCaller(source);
                                setSelectedCommitment(commitment);
                                setSelectedContact(null);
                              }}
                            />
                          );
                        })()
                      ) : selectedCommitment ? (
                        (() => {
                          return (
                            <CommitmentCardDetail
                              commitment={selectedCommitment}
                              onMinimize={() => {
                                setSelectedCommitment(null);
                                setSelectedContact(null);
                              }}
                              onOpenContactDetail={(contact, source) => {
                                setCaller(source);
                                setSelectedContact(contact);
                                setSelectedCommitment(null);
                              }}
                            />
                          );
                        })()
                      ) : null}
                    </div>
                  )}
                </div>
              ),
              document.body
            );
          })()
        : null}
    </>
  );
};

export default CommitmentGallery;


