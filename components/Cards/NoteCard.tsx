import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Contact, Note, useContacts } from '../../contexts/ContactContext';
import { MenuButton, RecycleButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { contactReference } from '../../data/referenceParsing';
import ContactCardDetail from './ContactCardDetail';
import NoteCardDetail from './NoteCardDetail';
import { CardIndex, createSourceRecord, addToCardIndexArray } from '../../data/sourceRecord';

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
  
  // Get the sentiment labels from the sentiment IDs
  const sentimentLabels = (note.sentiment_ids || []).map(id => {
    const sentiment = state.sentiments.find(s => s.id === id);
    return sentiment?.label || 'unknown';
  });


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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-[600px] h-[114px] bg-circle-neutral-variant rounded-[12px] p-[10px] flex flex-col gap-[10px]">
      {/* Frame 126 */}
      <div className="w-[580px] h-[44px] flex flex-col items-start p-0">
        {/* Note info */}
        <div className="w-[580px] h-[24px] flex flex-row items-start gap-[10px] p-0">
          {/* Frame 69 */}
          <div className="w-full h-[24px] flex flex-row justify-between items-start p-0 flex-1">
            {/* Title */}
            <div className="h-[24px] flex flex-row items-start p-0 flex-1 min-w-0">
              <div className="h-[24px] font-inter font-medium text-[16px] leading-[24px] tracking-[0.15px] text-circle-primary flex items-center truncate">
                {note.title}
              </div>
            </div>

            {/* Sentiment */}
            <div className="h-[20px] flex flex-row justify-end items-center gap-[15px] p-0">
              {/* Frame 73 */}
              <div className="w-fit h-[20px] flex flex-row items-center gap-[5px] p-0">
                {/* Sentiment tags - show up to 3 sentiments */}
                {sentimentLabels.slice(0, 3).map((label, index) => (
                  <div key={index} className="w-fit h-[20px] bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center">
                    <div className="w-fit h-[16px] font-inter font-medium text-[11px] leading-[16px] tracking-[0.5px] text-circle-primary flex items-center text-center">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Frame 105 */}
              <div className="w-fit h-fit flex flex-row items-center gap-[2px] p-0">
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
        <div className="w-fit h-[20px] flex flex-row items-center gap-[10px] p-0">
          <div
            className={`w-fit h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-center ${
              date === 'no date' ? 'italic opacity-50' : ''
            }`}
          >
            {date}
          </div>
          <div
            className={`w-fit h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-center ${
              time ? '' : 'italic opacity-50'
            }`}
          >
            {time || '--:--'}
          </div>
        </div>
      </div>

      {/* Note description */}
      <div 
        className={`w-[580px] font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] text-left ${
          isExpanded ? 'h-fit' : 'h-[40px] overflow-hidden'
        }`}
      >
        <div>
          {contactReference(
            isExpanded ? note.text : truncatedText,
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
    </div>
  );
};

export default NoteCard;
