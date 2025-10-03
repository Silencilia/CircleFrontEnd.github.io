import React, { useState } from 'react';
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

  const { date, time } = formatDateTime(note);
  


  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Body text is truncated to two lines via CSS (line-clamp-2) when collapsed

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="w-[600px] h-fit bg-circle-neutral-variant rounded-sm p-md flex flex-col gap-lg">
      {/* Frame 126 */}
      <div className="w-full h-fit flex flex-col items-start p-0">
        {/* Note info */}
        <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
          {/* Frame 69 */}
          <div className="w-full h-fit flex flex-row justify-between items-start p-0 flex-1">
            {/* Title */}
            <div className="h-fit flex flex-row items-start p-0 flex-1 min-w-0 overflow-hidden">
              <div className="font-circletitlemedium text-circle-primary line-clamp-1 w-full">
                {note.title}
              </div>
            </div>

            {/* Sentiment */}
            <div className="h-fit flex flex-row justify-end items-center gap-lg p-0">
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
        className={`w-full font-circlebodymedium text-circle-primary text-left ${
          isExpanded ? 'h-fit' : 'h-[40px] overflow-hidden'
        }`}
      >
        <div className={isExpanded ? '' : 'line-clamp-2'}>
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
            },
            isMobile
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
            <div className="h-fit w-full flex flex-row items-start pr-sm flex-1 overflow-hidden">
              <div className="font-circletitlesmall text-circle-primary line-clamp-1 w-full">
                {note.title}
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
        className={`w-full font-circlebodysmall text-circle-primary text-left ${
          isExpanded ? 'h-fit' : 'h-[32px] overflow-hidden'
        }`}
      >
        <div className={isExpanded ? '' : 'line-clamp-2'}>
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
            },
            isMobile
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
