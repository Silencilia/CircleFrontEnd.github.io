import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Contact, Note, useContacts } from '../../contexts/ContactContext';
import { MenuButton, RecycleButton } from '../Button';
import { SentimentTag } from '../Tag';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { contactReference } from '../../data/referenceParsing';
import ContactCardDetail from './ContactCardDetail';
import NoteCardDetail from './NoteCardDetail';
import { CardIndex, createSourceRecord, addToCardIndexArray } from '../../data/sourceRecord';
import { useIsMobile } from '../../hooks/useIsMobile';

interface NoteCardProps {
  note: Note;
  caller?: CardIndex | null;
  onOpenNoteDetail?: (note: Note, source: CardIndex | null) => void;
  onOpenContactDetail?: (contact: Contact, source: CardIndex | null) => void;
  // Context flags for nested usage inside ContactCardDetail
  isNestedInContactDetail?: boolean;
  currentContactId?: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, caller: propCaller = null, onOpenNoteDetail, onOpenContactDetail, isNestedInContactDetail = false, currentContactId }) => {
  const isMobile = useIsMobile();
  const { state, updateNote } = useContacts();
  if (note.is_trashed) {
    return null;
  }
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isContactDetailOpenLocal, setIsContactDetailOpenLocal] = useState(false);
  const [selectedContactForDetail, setSelectedContactForDetail] = useState<Contact | null>(null);
  const [caller, setCaller] = useState<CardIndex | null>(null);
  const [activeNoteForDetail, setActiveNoteForDetail] = useState<Note>(note);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Get the sentiment objects from the sentiment IDs
  const sentimentObjects = (note.sentiment_ids || [])
    .map(id => state.sentiments.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);


  // Format the date (from note.date) and time (from note.timeValue)
  const formatDateTime = (noteObj: Note) => {
    try {
      let dateStr = '';
      let hasDate = false;
      if (noteObj.date) {
        const { year, month, day } = noteObj.date;
        if (year && month && day) {
          const dt = new Date(year, month - 1, day);
          dateStr = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          hasDate = true;
        } else if (year && month && !day) {
          const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1] || '';
          dateStr = `${monthName} ${year}`;
          hasDate = true;
        } else if (year && !month && !day) {
          dateStr = String(year);
          hasDate = true;
        }
      }
      if (!hasDate) {
        dateStr = 'no date';
      }
      let timeStr = '';
      if (noteObj.time_value && noteObj.time_value.hour !== null && noteObj.time_value.minute !== null) {
        const hh = String(noteObj.time_value.hour).padStart(2, '0');
        const mm = String(noteObj.time_value.minute).padStart(2, '0');
        timeStr = `${hh}:${mm}`;
      }
      return { date: dateStr, time: timeStr };
    } catch (error) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Check if text overflows and truncate if necessary
  const checkTextOverflow = (text: string, maxHeight: number = 40) => {
    const lineHeight = 20; // 20px line height as per design
    const maxLines = Math.floor(maxHeight / lineHeight); // Should be 2 lines
    
    // Calculate approximate characters that can fit in 2 lines
    // Assuming average word length of 5 characters + 1 space = 6 chars per word
    // And approximately 15-20 words per line depending on text content
    const charsPerLine = 80; // Conservative estimate for the card width
    const maxChars = maxLines * charsPerLine;
    
    const hasOverflow = text.length > maxChars;
    
    if (!hasOverflow) {
      return { text: text, hasOverflow: false };
    }
    
    // Find the last complete word that fits within the limit
    const truncated = text.substring(0, maxChars);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      // Cut at the last complete word
      return { text: truncated.substring(0, lastSpaceIndex) + '...', hasOverflow: true };
    } else {
      // If no space found, just cut at the character limit
      return { text: truncated + '...', hasOverflow: true };
    }
  };

  const { date, time } = formatDateTime(note);
  const { text: truncatedText, hasOverflow } = checkTextOverflow(note.text);

  // Dynamic title overflow detection (desktop and mobile)
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLDivElement | null>(null);
  const [titleOverflow, setTitleOverflow] = useState<boolean>(false);
  const [displayTitle, setDisplayTitle] = useState<string>(note.title);

  useEffect(() => {
    const measureAndTruncate = () => {
      const container = titleContainerRef.current;
      const textEl = titleTextRef.current || titleContainerRef.current;
      if (!container || !textEl) {
        setTitleOverflow(false);
        setDisplayTitle(note.title);
        return;
      }

      const availableWidth = container.clientWidth;
      if (!availableWidth || availableWidth <= 0) {
        setTitleOverflow(false);
        setDisplayTitle(note.title);
        return;
      }

      const style = window.getComputedStyle(textEl);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setTitleOverflow(false);
        setDisplayTitle(note.title);
        return;
      }
      ctx.font = font;

      const fullWidth = ctx.measureText(note.title).width;
      if (fullWidth <= availableWidth) {
        setTitleOverflow(false);
        setDisplayTitle(note.title);
        return;
      }

      const ellipsis = '...';
      const ellipsisWidth = ctx.measureText(ellipsis).width;
      const maxTextWidth = Math.max(0, availableWidth - ellipsisWidth);

      // Binary search to find max substring fitting in maxTextWidth
      let low = 0;
      let high = note.title.length;
      let best = '';
      while (low <= high) {
        const mid = (low + high) >> 1;
        const candidate = note.title.slice(0, mid);
        const w = ctx.measureText(candidate).width;
        if (w <= maxTextWidth) {
          best = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // Prefer cutting on word boundary when possible
      const lastSpace = best.lastIndexOf(' ');
      const finalText = lastSpace > 0 ? best.slice(0, lastSpace) : best;

      setTitleOverflow(true);
      setDisplayTitle(finalText);
    };

    // Slight delay to ensure layout is finalized
    const t = setTimeout(measureAndTruncate, 0);

    const ro = titleContainerRef.current ? new ResizeObserver(() => {
      measureAndTruncate();
    }) : null;
    if (ro && titleContainerRef.current) ro.observe(titleContainerRef.current);

    const onResize = () => measureAndTruncate();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [note.title, isMobile]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Dynamic multiline overflow detection for description (collapsed, two lines)
  const bodyContainerRef = useRef<HTMLDivElement | null>(null);
  const bodyTextRef = useRef<HTMLDivElement | null>(null);
  const [bodyOverflow, setBodyOverflow] = useState<boolean>(false);
  const [displayBody, setDisplayBody] = useState<string>(note.text);

  useEffect(() => {
    if (isExpanded) {
      setBodyOverflow(false);
      setDisplayBody(note.text);
      return;
    }

    const measureAndTruncateMultiline = () => {
      const container = bodyContainerRef.current;
      const textEl = bodyTextRef.current || bodyContainerRef.current;
      if (!container || !textEl) {
        setBodyOverflow(false);
        setDisplayBody(note.text);
        return;
      }

      const availableWidth = container.clientWidth;
      if (!availableWidth || availableWidth <= 0) {
        setBodyOverflow(false);
        setDisplayBody(note.text);
        return;
      }

      const style = window.getComputedStyle(textEl);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setBodyOverflow(false);
        setDisplayBody(note.text);
        return;
      }
      ctx.font = font;

      const words = (note.text || '').split(/\s+/);
      const maxLines = 2; // collapsed shows 2 lines
      const ellipsis = '...';
      const ellipsisWidth = ctx.measureText(ellipsis).width;

      const lines: string[] = [];
      let current = '';

      const pushOrWrap = (word: string) => {
        const candidate = current ? current + ' ' + word : word;
        const w = ctx.measureText(candidate).width;
        if (w <= availableWidth) {
          current = candidate;
        } else {
          // wrap to next line
          lines.push(current);
          current = word;
        }
      };

      for (let i = 0; i < words.length; i += 1) {
        pushOrWrap(words[i]);
        if (lines.length === maxLines) {
          break;
        }
      }

      if (lines.length < maxLines && current) {
        lines.push(current);
      }

      // Determine if more content remains beyond the first 2 lines
      const reconstructed = lines.join(' ').trim();
      const hasMoreContent = reconstructed.length < (note.text || '').trim().length;

      if (lines.length <= maxLines && !hasMoreContent) {
        setBodyOverflow(false);
        setDisplayBody(note.text);
        return;
      }

      // Ensure last line + ellipsis fits width
      const safeLines = lines.slice(0, maxLines);
      let last = safeLines[maxLines - 1] || '';
      const maxLastWidth = Math.max(0, availableWidth - ellipsisWidth);

      let low = 0;
      let high = last.length;
      let best = '';
      while (low <= high) {
        const mid = (low + high) >> 1;
        const candidate = last.slice(0, mid);
        const w = ctx.measureText(candidate).width;
        if (w <= maxLastWidth) {
          best = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      // Prefer word boundary near end
      const lastSpace = best.lastIndexOf(' ');
      if (lastSpace > 0 && lastSpace > best.length * 0.6) {
        best = best.slice(0, lastSpace);
      }
      safeLines[maxLines - 1] = best;

      setBodyOverflow(true);
      setDisplayBody(safeLines.join(' ').trim());
    };

    const t = setTimeout(measureAndTruncateMultiline, 0);
    const ro = bodyContainerRef.current ? new ResizeObserver(() => {
      measureAndTruncateMultiline();
    }) : null;
    if (ro && bodyContainerRef.current) ro.observe(bodyContainerRef.current);
    const onResize = () => measureAndTruncateMultiline();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [note.text, isExpanded, isMobile]);

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="w-[600px] h-[114px] bg-circle-neutral-variant rounded-sm p-sm flex flex-col gap-lg">
      {/* Frame 126 */}
      <div className="w-[580px] h-[44px] flex flex-col items-start p-0">
        {/* Note info */}
        <div className="w-[580px] h-[24px] flex flex-row items-start gap-lg p-0">
          {/* Frame 69 */}
          <div className="w-full h-[24px] flex flex-row justify-between items-start p-0 flex-1">
            {/* Title */}
            <div ref={titleContainerRef} className="h-[24px] flex flex-row items-start p-0 flex-1 min-w-0 overflow-hidden">
              <div ref={titleTextRef} className="h-[24px] font-circletitlemedium text-circle-primary flex items-center whitespace-nowrap">
                {displayTitle}{titleOverflow && '...'}
              </div>
            </div>

            {/* Sentiment */}
            <div className="h-[20px] flex flex-row justify-end items-center gap-lg p-0">
              {/* Frame 73 */}
              <div className="w-fit h-[20px] flex flex-row items-center gap-sm p-0">
                {/* Sentiment tags - show up to 3 sentiments */}
                {sentimentObjects.slice(0, 3).map((sentiment) => (
                  <SentimentTag
                    key={sentiment.id}
                    sentiment={sentiment}
                    noteId={note.id}
                    fillColor="bg-circle-neutral"
                    textColor="text-circle-primary"
                  />
                ))}
              </div>

              {/* Frame 105 */}
              <div className="w-fit h-fit flex flex-row items-center gap-xs p-0">
                {/* Recycle button */}
                <RecycleButton
                  onClick={() => setShowDeleteDialog(true)}
                  ariaLabel="Delete note"
                  hoverVariant="neutral"
                />

                {/* Menu icon button */}
                <MenuButton
                  onClick={() => {
                    // If nested inside a ContactCardDetail, push that contact onto the back stack
                    if (isNestedInContactDetail && typeof currentContactId === 'string') {
                      addToCardIndexArray(createSourceRecord('contactCardDetail', currentContactId));
                    }
                    if (onOpenNoteDetail) {
                      onOpenNoteDetail(note, propCaller);
                    } else {
                      setCaller(null);
                      setActiveNoteForDetail(note);
                      setIsDetailOpen(true);
                    }
                  }}
                  ariaLabel="Open note detail"
                  className="hover:!bg-circle-neutral"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Frame 125 - Date and Time (non-clickable) */}
        <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
          <div
            className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${
              date === 'no date' ? 'italic opacity-50' : ''
            }`}
          >
            {date}
          </div>
          <div
            className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${
              time ? '' : 'italic opacity-50'
            }`}
          >
            {time || '--:--'}
          </div>
        </div>
      </div>

      {/* Note description */}
      <div
        ref={bodyContainerRef}
        className={`w-[580px] font-circlebodymedium text-circle-primary text-left ${
          isExpanded ? 'h-fit' : 'h-[40px] overflow-hidden'
        }`}
      >
        <div ref={bodyTextRef} className={isExpanded ? '' : 'line-clamp-2'}>
          {contactReference(
            note.text,
            state.contacts,
            (contact) => {
              if (!contact) return;
              // Nested inside ContactCardDetail
              if (isNestedInContactDetail && typeof currentContactId === 'string') {
                // If clicking the same contact as the current detail, do nothing
                if (contact.id === currentContactId) {
                  return;
                }
                // Push previous contact into global stack and switch contact
                addToCardIndexArray(createSourceRecord('contactCardDetail', currentContactId));
                if (onOpenContactDetail) {
                  onOpenContactDetail(contact, createSourceRecord('noteCardDetail', note.id));
                } else {
                  setCaller(createSourceRecord('noteCardDetail', note.id));
                  setSelectedContactForDetail(contact);
                  setIsDetailOpen(false);
                  setIsContactDetailOpenLocal(true);
                }
                return;
              }
              // Default (e.g., in NoteBook): just open contact detail
              if (onOpenContactDetail) {
                onOpenContactDetail(contact, createSourceRecord('noteCardDetail', note.id));
              } else {
                setCaller(createSourceRecord('noteCardDetail', note.id));
                setSelectedContactForDetail(contact);
                setIsDetailOpen(false);
                setIsContactDetailOpenLocal(true);
              }
            }
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Layout
  const MobileLayout = () => (
    <div className="w-full h-fit bg-circle-neutral-variant rounded-sm p-sm flex flex-col gap-lg">
      {/* Frame 126 */}
      <div className="w-full h-fit flex flex-col items-start p-0">
        {/* Note info */}
        <div className="w-full h-fit flex flex-row items-start gap-lg">
          {/* Frame 69 */}
          <div className="w-full h-fit flex flex-row justify-between items-center flex-1">
            {/* Title */}
            <div ref={titleContainerRef} className="h-fit w-full flex flex-row items-start pr-sm flex-1 overflow-hidden">
              <div ref={titleTextRef} className="h-fit font-circletitlesmall text-circle-primary flex items-center whitespace-nowrap">
                {displayTitle}{titleOverflow && '...'}
              </div>
            </div>

            {/* Sentiment */}
            <div className="h-fit flex flex-row justify-end items-center gap-md p-0">
              {/* Frame 73 */}
              <div className="w-fit h-fit flex flex-row items-center gap-sm p-0">
                {/* Sentiment tags - show up to 3 sentiments */}
                {sentimentObjects.slice(0, 3).map((sentiment) => (
                  <SentimentTag
                    key={sentiment.id}
                    sentiment={sentiment}
                    noteId={note.id}
                    fillColor="bg-circle-neutral"
                    textColor="text-circle-primary"
                  />
                ))}
              </div>

              {/* buttons */}
              <div className="w-fit h-fit flex flex-row items-center">
                {/* Recycle button */}
                <RecycleButton
                  onClick={() => setShowDeleteDialog(true)}
                  ariaLabel="Delete note"
                  hoverVariant="neutral"
                />

                {/* Menu icon button */}
                <MenuButton
                  onClick={() => {
                    // If nested inside a ContactCardDetail, push that contact onto the back stack
                    if (isNestedInContactDetail && typeof currentContactId === 'string') {
                      addToCardIndexArray(createSourceRecord('contactCardDetail', currentContactId));
                    }
                    if (onOpenNoteDetail) {
                      onOpenNoteDetail(note, propCaller);
                    } else {
                      setCaller(null);
                      setActiveNoteForDetail(note);
                      setIsDetailOpen(true);
                    }
                  }}
                  ariaLabel="Open note detail"
                  className="hover:!bg-circle-neutral"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Frame 125 - Date and Time (non-clickable) */}
        <div className="w-fit h-fit flex flex-row items-center gap-lg p-0">
          <div
            className={`w-fit h-fit font-circlebodysmall text-circle-primary flex items-center ${
              date === 'no date' ? 'italic opacity-50' : ''
            }`}
          >
            {date}
          </div>
          <div
            className={`w-fit h-fit font-circlebodysmall text-circle-primary flex items-center ${
              time ? '' : 'italic opacity-50'
            }`}
          >
            {time || '--:--'}
          </div>
        </div>
      </div>

      {/* Note description */}
      <div
        ref={bodyContainerRef}
        className={`w-full font-circlebodysmall text-circle-primary text-left ${
          isExpanded ? 'h-fit' : 'h-[32px] overflow-hidden'
        }`}
      >
        <div ref={bodyTextRef} className={isExpanded ? '' : 'line-clamp-2'}>
          {contactReference(
            note.text,
            state.contacts,
            (contact) => {
              if (!contact) return;
              // Nested inside ContactCardDetail
              if (isNestedInContactDetail && typeof currentContactId === 'string') {
                // If clicking the same contact as the current detail, do nothing
                if (contact.id === currentContactId) {
                  return;
                }
                // Push previous contact into global stack and switch contact
                addToCardIndexArray(createSourceRecord('contactCardDetail', currentContactId));
                if (onOpenContactDetail) {
                  onOpenContactDetail(contact, createSourceRecord('noteCardDetail', note.id));
                } else {
                  setCaller(createSourceRecord('noteCardDetail', note.id));
                  setSelectedContactForDetail(contact);
                  setIsDetailOpen(false);
                  setIsContactDetailOpenLocal(true);
                }
                return;
              }
              // Default (e.g., in NoteBook): just open contact detail
              if (onOpenContactDetail) {
                onOpenContactDetail(contact, createSourceRecord('noteCardDetail', note.id));
              } else {
                setCaller(createSourceRecord('noteCardDetail', note.id));
                setSelectedContactForDetail(contact);
                setIsDetailOpen(false);
                setIsContactDetailOpenLocal(true);
              }
            }
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      {/* Overlay for ContactCardDetail via portal to escape parent stacking contexts */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          try {
            await updateNote(note.id, { is_trashed: true });
          } catch (e) {
            console.error('Failed to trash note', e);
          } finally {
            setShowDeleteDialog(false);
          }
        }}
        itemType="note"
        itemName={note.title}
      />

      {/* Overlay for ContactCardDetail via portal to escape parent stacking contexts */}
      {typeof window !== 'undefined' && selectedContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) setSelectedContact(null); }}>
                <ContactCardDetail 
                  contact={selectedContact} 
                  onMinimize={() => setSelectedContact(null)}
                />
              </div>
            ),
            document.body
          )
        : null}

      

      {/* Single Overlay Manager (Note or Contact detail) */}
      {typeof window !== 'undefined' && (isDetailOpen || isContactDetailOpenLocal)
        ? createPortal(
            (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
                onClick={(e) => {
                  if (e.target !== e.currentTarget) return;
                  setIsDetailOpen(false);
                  setIsContactDetailOpenLocal(false);
                }}
              >
                <div className="mx-4">
                  {isContactDetailOpenLocal && selectedContactForDetail ? (
                    <ContactCardDetail
                      contact={selectedContactForDetail}
                      caller={createSourceRecord('noteCardDetail', activeNoteForDetail.id)}
                      onOpenNote={(n, source) => {
                        setCaller(source);
                        setActiveNoteForDetail(n);
                        setIsContactDetailOpenLocal(false);
                        setIsDetailOpen(true);
                      }}
                      onMinimize={() => {
                        setIsDetailOpen(false);
                        setIsContactDetailOpenLocal(false);
                      }}
                    />
                  ) : (
                    <NoteCardDetail
                      note={activeNoteForDetail}
                      caller={caller}
                      onMinimize={() => {
                        setIsDetailOpen(false);
                        setIsContactDetailOpenLocal(false);
                      }}
                      onOpenContactDetail={(contact, source) => {
                        setCaller(source);
                        setSelectedContactForDetail(contact);
                        setIsDetailOpen(false);
                        setIsContactDetailOpenLocal(true);
                      }}
                    />
                  )}
                </div>
              </div>
            ),
            document.body
          )
        : null}
    </>
  );
};

export default NoteCard;
