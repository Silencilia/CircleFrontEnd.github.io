import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ContentEditable from 'react-contenteditable';
import ScrollContainer from 'react-indiana-drag-scroll';
import { Note, useContacts, Contact, parseTimeToTimeValue, TimeValue } from '../../contexts/ContactContext';
import { CalendarIcon } from '../icons';
import { ConfirmButton, CancelButton, NewTagButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import NameConfirmationDialog from '../Dialogs/NameConfirmationDialog';
import NewSentiment from '../Dialogs/NewSentiment';
import { contactReference } from '../../data/referenceParsing';
import DatePicker, { DynamicPrecisionDateValue } from '../Dialogs/DatePicker';
import TimePicker from '../Dialogs/TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, getCardIndexArray, popCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import { EDITING_MODE_PADDING } from '../../data/variables';
import useCardNavigation from '../../hooks/useCardNavigation';
import { extractContactIdsFromText } from '../../utils/api/extractContactIds';
import { detectContactNames } from '../../utils/contactNameDetection';
import { destroyUnusedSentiments } from '../../utils/entityCleanup';

const Type: CardType = 'noteCardDetail';

interface NoteCardDetailProps {
  note: Note;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const NoteCardDetail: React.FC<NoteCardDetailProps> = ({ note, onMinimize, caller, onOpenContactDetail }) => {
  const { state, updateNote, addNote } = useContacts();

  // Check if this is a temporary note (not yet saved to database)
  const isTemporaryNote = note.id.startsWith('temp-');
  // Local state for temporary note data (only used for temporary notes)
  const [tempNoteData, setTempNoteData] = useState<Note | null>(isTemporaryNote ? note : null);
  // Always render with the latest note from context in case it was updated, or temp data for temporary notes
  const currentNote = isTemporaryNote ? (tempNoteData || note) : (state.notes.find(n => n.id === note.id) || note);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isNameConfirmationOpen, setIsNameConfirmationOpen] = useState(false);
  const [processedNoteText, setProcessedNoteText] = useState('');
  const [isSentimentDialogOpen, setIsSentimentDialogOpen] = useState(false);
  
  // Date/Time picker states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<TimeValue>({ hour: null, minute: null });


  // Title editing state
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentNote.title);
  const [originalTitle, setOriginalTitle] = useState(currentNote.title);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const titleContentEditableRef = useRef<HTMLElement>(null);

  // Text editing state
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [editText, setEditText] = useState(currentNote.text);
  const [originalText, setOriginalText] = useState(currentNote.text);
  const [isTextSaving, setIsTextSaving] = useState(false);
  const textContentEditableRef = useRef<HTMLElement>(null);

  if (currentNote.is_trashed) {
    return null;
  }

  // Get the sentiment labels from the sentiment IDs
  const sentimentLabels = (currentNote.sentiment_ids || []).map(id => {
    const sentiment = state.sentiments.find(s => s.id === id);
    return sentiment?.label || 'unknown';
  });

  // Format the date (from note.date)
  const formatDate = (noteObj: Note) => {
    try {
      if (noteObj.date) {
        const { year, month, day } = noteObj.date;
        if (year && month && day) {
          const dt = new Date(year, month - 1, day);
          return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (year && month && !day) {
          const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1] || '';
          return `${monthName} ${year}`;
        } else if (year && !month && !day) {
          return String(year);
        }
      }
      return 'no date';
    } catch (error) {
      return 'no date';
    }
  };

  // Format the time (from note.timeValue)
  const formatTime = (noteObj: Note) => {
    try {
      if (noteObj.time_value && noteObj.time_value.hour !== null && noteObj.time_value.minute !== null) {
        const hh = String(noteObj.time_value.hour).padStart(2, '0');
        const mm = String(noteObj.time_value.minute).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      return '--:--';
    } catch (error) {
      return '--:--';
    }
  };

  const handleDelete = async () => {
    try {
      await updateNote(note.id, { is_trashed: true });
      setShowDeleteDialog(false);
      if (onMinimize) {
        onMinimize();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const date = formatDate(currentNote);
  const time = formatTime(currentNote);
  const hasDate = date !== 'no date';
  const hasTime = time !== '--:--';

  const { handleBack } = useCardNavigation({
    openContact: onOpenContactDetail,
    closeCurrent: onMinimize,
  });

  // Handle sentiment selection from dialog
  const handleSentimentSelect = async (selectedSentiment: any) => {
    try {
      // Add the selected sentiment to the note's sentiment_ids
      const updatedSentimentIds = [...(currentNote.sentiment_ids || []), selectedSentiment.id];
      if (isTemporaryNote) {
        // Update local state for temporary notes
        setTempNoteData(prev => prev ? { ...prev, sentiment_ids: updatedSentimentIds } : null);
      } else {
        // Update database for saved notes
        await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });
      }
    } catch (error) {
      console.error('Failed to add sentiment to note:', error);
    }
  };

  // Handle new sentiment button click
  const handleNewSentimentClick = async () => {
    try {
      // Clean up unused sentiments first
      const cleanupResult = await destroyUnusedSentiments();

      if (cleanupResult.errors.length > 0) {
        console.error('Errors during cleanup:', cleanupResult.errors);
      }

      // Open the sentiment dialog
      setIsSentimentDialogOpen(true);
    } catch (error) {
      console.error('Failed to open sentiment dialog:', error);
    }
  };

  // Helper function to save note to database
  const saveNoteToDatabase = async () => {
    try {
      const noteToSave = {
        title: currentNote.title,
        text: currentNote.text,
        time_value: currentNote.time_value,
        date: currentNote.date,
        sentiment_ids: currentNote.sentiment_ids,
        contact_ids: currentNote.contact_ids,
        is_trashed: false
      };
      await addNote(noteToSave);

      // Close the card after successful save
      clearCardIndexArray();
      if (onMinimize) onMinimize();
    } catch (error) {
      console.error('Failed to save note:', error);
      // Don't close if save failed
    }
  };

  // Name confirmation dialog handlers
  const handleNameConfirmationConfirm = async (confirmedText: string) => {
    try {
      // Extract contact IDs from the processed text
      const contact_ids = extractContactIdsFromText(confirmedText);

      // Update the note text with the processed version and extracted contact IDs
      if (isTemporaryNote) {
        setTempNoteData(prev => {
          const updated = prev ? { ...prev, text: confirmedText, contact_ids } : null;
          return updated;
        });
        
        // Save immediately with the processed data
        const noteToSave = {
          title: currentNote.title,
          text: confirmedText,
          time_value: currentNote.time_value,
          date: currentNote.date,
          sentiment_ids: currentNote.sentiment_ids,
          contact_ids,
          is_trashed: false
        };
        await addNote(noteToSave);
        
        // Close the card after successful save
        clearCardIndexArray();
        if (onMinimize) onMinimize();
      }

      // Close the dialog
      setIsNameConfirmationOpen(false);
    } catch (error) {
      console.error('Failed to save note with confirmed names:', error);
    }
  };

  const handleNameConfirmationCancel = () => {
    setIsNameConfirmationOpen(false);
    // Don't save the note - just close the dialog so user can continue editing
  };

  // Update edit values when note changes
  useEffect(() => {
      setEditTitle(currentNote.title);
      setEditText(currentNote.text);
  }, [currentNote.title, currentNote.text]);


  // Title editing handlers
  const handleTitleEditClick = () => {
    setIsTitleEditing(true);
    setEditTitle(currentNote.title);
    setOriginalTitle(currentNote.title);
    setTimeout(() => {
      if (titleContentEditableRef.current) {
        titleContentEditableRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(titleContentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleTitleSave = async () => {
    const currentHtml = titleContentEditableRef.current?.innerHTML ?? editTitle;
    const cleanTitle = currentHtml.replace(/<[^>]*>/g, '').trim();
    if (cleanTitle !== currentNote.title) {
      try {
        setIsTitleSaving(true);
        if (isTemporaryNote) {
          // Update local state for temporary notes
          setTempNoteData(prev => prev ? { ...prev, title: cleanTitle } : null);
        } else {
          // Update database for saved notes
          await updateNote(note.id, { title: cleanTitle });
        }
      } catch (error) {
        console.error('Failed to update title:', error);
        setEditTitle(originalTitle);
      } finally {
        setIsTitleSaving(false);
      }
    }
    setIsTitleEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(currentNote.title);
    setIsTitleEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleTitleCancel();
    }
  };

  const handleTitleKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTitleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[aria-label="Save title"]') ||
      relatedTarget.closest('[aria-label="Cancel title edit"]')
    )) {
      return;
    }
    setTimeout(() => {
      if (isTitleEditing) {
        handleTitleSave();
      }
    }, 100);
  };

  // Text editing handlers
  const handleTextEditClick = () => {
    setIsTextEditing(true);
    setEditText(currentNote.text);
    setOriginalText(currentNote.text);
    setTimeout(() => {
      if (textContentEditableRef.current) {
        textContentEditableRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(textContentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleTextSave = async () => {
    const currentHtml = textContentEditableRef.current?.innerHTML ?? editText;
    const cleanText = currentHtml.replace(/<[^>]*>/g, '').trim();
    if (cleanText !== currentNote.text) {
      try {
        setIsTextSaving(true);
        // Extract contact IDs from the new text
        const contact_ids = extractContactIdsFromText(cleanText);
        if (isTemporaryNote) {
          // Update local state for temporary notes
          setTempNoteData(prev => prev ? { ...prev, text: cleanText, contact_ids } : null);
        } else {
          // Update database for saved notes
          await updateNote(note.id, { text: cleanText, contact_ids });
        }
      } catch (error) {
        console.error('Failed to update text:', error);
        setEditText(originalText);
      } finally {
        setIsTextSaving(false);
      }
    }
    setIsTextEditing(false);
  };

  const handleTextCancel = () => {
    setEditText(currentNote.text);
    setIsTextEditing(false);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleTextSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleTextCancel();
    }
  };

  const handleTextKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTextBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[aria-label="Save text"]') ||
      relatedTarget.closest('[aria-label="Cancel text edit"]')
    )) {
      return;
    }
    setTimeout(() => {
      if (isTextEditing) {
        handleTextSave();
      }
    }, 100);
  };



  return (
    <>
      <div className="crd-dtl">
        <div className="w-full h-full flex flex-col justify-centercenter items-start gap-lg p-0 overflow-hidden">
          {/* Info */}
          <div className="w-full h-fit flex flex-col items-start gap-lg p-0">
            {/* Note info */}
            <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
              <div className="w-full h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                {/* Title */}
                <div className="w-fit h-fit flex flex-col items-start gap-md p-0">
                  <span className="w-fit h-fit font-circletitlemedium text-circle-primary">Create new note</span>
                  <div className="w-fit h-fit flex items-center gap-2">
                    {isTitleEditing ? (
                      <ContentEditable
                        innerRef={titleContentEditableRef}
                        html={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onKeyDownCapture={handleTitleKeyDown}
                        onKeyUp={handleTitleKeyUp}
                        onBlur={handleTitleBlur}
                        className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-circletitlemedium text-circle-primary`}
                        style={{
                          minHeight: '20px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      />
                    ) : (
                      <div
                        onClick={handleTitleEditClick}
                        className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-circletitlemedium text-circle-primary"
                        title="Click to edit"
                      >
                        {currentNote.title || (
                          <span className="italic opacity-50">
                            New Note
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title edit controls - show when editing */}
                    {isTitleEditing && (
                      <div className="flex gap-[2px]">
                        <CancelButton
                          onClick={handleTitleCancel}
                          ariaLabel="Cancel title edit"
                        />
                        <ConfirmButton
                          onClick={handleTitleSave}
                          ariaLabel={isTitleSaving ? 'Saving...' : 'Save title'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-fit h-fit flex flex-row justify-end items-center gap-lg p-0 mx-auto flex-1">
                  <div className="w-fit h-fit flex flex-row items-center gap-xs p-0">
                    <CancelButton
                      onClick={() => {
                        if (isTemporaryNote) {
                          // For temporary notes, just close without deleting
                          clearCardIndexArray();
                          if (onMinimize) onMinimize();
                        } else {
                          // For saved notes, show delete confirmation
                          setShowDeleteDialog(true);
                        }
                      }}
                      ariaLabel="Cancel note creation"
                    />
                    <ConfirmButton
                      onClick={async () => {
                        if (isTemporaryNote) {
                          try {
                            // First, detect contact names in the note text
                            const detectionResult = await detectContactNames(currentNote.text, state.contacts);

                            if (detectionResult.detectedContacts.length > 0) {
                              // Show name confirmation dialog
                              setProcessedNoteText(detectionResult.processedText);
                              setIsNameConfirmationOpen(true);
                              return; // Don't save yet, wait for user confirmation
                            } else {
                              // No names detected, proceed with normal save
                              await saveNoteToDatabase();
                            }
                          } catch (error) {
                            console.error('Failed to detect contact names:', error);
                            // Fallback: save without name detection
                            await saveNoteToDatabase();
                          }
                        } else {
                          // For saved notes, just close
                          clearCardIndexArray();
                          if (onMinimize) onMinimize();
                        }
                      }}
                      ariaLabel="Confirm note creation"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="w-full h-fit flex flex-col items-start gap-sm p-0">
              <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
                <div className="w-full h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                  <div className="w-full h-fit flex flex-col items-start p-0 mx-auto flex-1">
                    {/* Date row */}
                    <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
                      {/* Calendar */}
                      <CalendarIcon width={16} height={16} className="text-circle-primary" />
                      {/* Date (clickable) */}
                      <button
                        type="button"
                        onClick={() => {
                          const yearOnly = /^(\d{4})$/;
                          const yearMonth = /^(\d{4})-(\d{2})$/;
                          const fullDate = /^(\d{4})-(\d{2})-(\d{2})$/;
                          let init: DynamicPrecisionDateValue = { precision: 'none', year: null, month: null, day: null };
                          if (currentNote.date && currentNote.date.year) {
                            if (currentNote.date.year && currentNote.date.month && currentNote.date.day) init = { precision: 'day', year: currentNote.date.year, month: currentNote.date.month, day: currentNote.date.day };
                            else if (currentNote.date.year && currentNote.date.month) init = { precision: 'month', year: currentNote.date.year, month: currentNote.date.month, day: null };
                            else if (currentNote.date.year) init = { precision: 'year', year: currentNote.date.year, month: null, day: null };
                          }
                          setDateValue(init);
                          setIsDatePickerOpen(true);
                        }}
                        className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${
                          date === 'no date' ? 'italic opacity-50' : ''
                        }`}
                        title="Click to edit note date"
                      >
                        {date}
                      </button>
                    </div>
                    {/* Time row */}
                    <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentNote.time_value && currentNote.time_value.hour !== null && currentNote.time_value.minute !== null) {
                            setTimeValue({ hour: currentNote.time_value.hour, minute: currentNote.time_value.minute });
                          } else {
                            const currentTime = parseTimeToTimeValue(new Date());
                            setTimeValue(currentTime);
                          }
                          setIsTimePickerOpen(true);
                        }}
                        className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${
                          !hasTime ? 'italic opacity-50' : ''
                        }`}
                        title="Click to edit note time"
                      >
                        {time || '--:--'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <ScrollContainer
            className="w-full h-fit min-h-0 bg-circle-neutral-variant rounded-sm p-md flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            horizontal={false}
            vertical={true}
          >
            <div className="w-fit font-circlebodymedium text-circle-primary text-left">
              {isTextEditing ? (
                <ContentEditable
                  innerRef={textContentEditableRef}
                  html={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  onKeyDownCapture={handleTextKeyDown}
                  onKeyUp={handleTextKeyUp}
                  onBlur={handleTextBlur}
                  className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-circlebodymedium text-circle-primary flex-1`}
                  style={{
                    minHeight: '20px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              ) : (
                <div
                  onClick={handleTextEditClick}
                  className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-circlebodymedium text-circle-primary flex-1"
                  title="Click to edit"
                >
                  {currentNote.text ? (
                    contactReference(
                      currentNote.text,
                      state.contacts,
                      (contact) => {
                        if (!contact) return;
                        // Add CardIndex to global array - represents the current NoteCardDetail
                        const cardIndex = createSourceRecord('noteCardDetail', currentNote.id);
                        addToCardIndexArray(cardIndex);

                        if (onOpenContactDetail) {
                          onOpenContactDetail(contact, createSourceRecord('noteCardDetail', currentNote.id));
                        }
                      },
                      false // Use desktop layout for contact references
                    )
                  ) : (
                    <span className="italic opacity-50">
                      Enter note description here.
                    </span>
                  )}
                </div>
              )}

              {/* Text edit controls - show when editing */}
              {isTextEditing && (
                <div className="flex gap-[2px] flex-shrink-0">
                  <CancelButton
                    onClick={handleTextCancel}
                    ariaLabel="Cancel text edit"
                  />
                  <ConfirmButton
                    onClick={handleTextSave}
                    ariaLabel={isTextSaving ? 'Saving...' : 'Save text'}
                  />
                </div>
              )}
            </div>
          </ScrollContainer>

          {/* Sentiment Tags */}
          <div className="w-fit h-fit flex flex-row items-center gap-sm p-0">
            {sentimentLabels.map((label, index) => (
              <div key={index} className="w-fit h-[20px] bg-circle-neutral rounded-xs p-[2px_5px] flex flex-row justify-center items-center">
                <div className="w-fit h-[16px] font-circlelabelsmall text-circle-primary flex items-center text-center">
                  {label}
                </div>
              </div>
            ))}

            {/* New Tag Button */}
            <NewTagButton
              onClick={handleNewSentimentClick}
              aria-label="Add new tag"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemType="note"
        itemName={note.title}
      />

      {/* Name Confirmation Dialog */}
      <NameConfirmationDialog
        isOpen={isNameConfirmationOpen}
        onConfirm={handleNameConfirmationConfirm}
        onCancel={handleNameConfirmationCancel}
        noteText={processedNoteText}
        contacts={state.contacts}
      />

      {/* Contact Detail Overlay removed; parent manages single overlay */}

      {/* Date Picker Overlay (portal) */}
      {typeof window !== 'undefined' && isDatePickerOpen
        ? createPortal(
            (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsDatePickerOpen(false);
                }}
              >
                <div className="mx-4">
                  <DatePicker
                    value={dateValue}
                    onChange={setDateValue}
                    label="Note date"
                    subtitle="When did this happen?"
                    onConfirm={async (value) => {
                      try {
                        const dateUpdate = !value || value.precision === 'none' || !value.year
                          ? { year: null, month: null, day: null }
                          : {
                              year: value.year ?? null,
                              month: value.precision === 'year' ? null : (value.month ?? null),
                              day: value.precision === 'day' ? (value.day ?? null) : null,
                            };

                        if (isTemporaryNote) {
                          // Update local state for temporary notes
                          setTempNoteData(prev => prev ? { ...prev, date: dateUpdate } : null);
                        } else {
                          // Update database for saved notes
                          await updateNote(note.id, { date: dateUpdate });
                        }
                      } catch (err) {
                        console.error('Failed to update note date', err);
                      } finally {
                        setIsDatePickerOpen(false);
                      }
                    }}
                    onCancel={() => setIsDatePickerOpen(false)}
                  />
                </div>
              </div>
            ),
            document.body
          )
        : null}

      {/* Time Picker Overlay (portal) */}
      {typeof window !== 'undefined' && isTimePickerOpen
        ? createPortal(
            (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsTimePickerOpen(false);
                }}
              >
                <div className="mx-4">
                  <TimePicker
                    value={timeValue}
                    onChange={setTimeValue}
                    label="Note time"
                    subtitle="What time did this happen?"
                    onConfirm={async (value) => {
                      try {
                        if (isTemporaryNote) {
                          // Update local state for temporary notes
                          setTempNoteData(prev => prev ? { ...prev, time_value: { hour: value.hour, minute: value.minute } } : null);
                        } else {
                          // Update database for saved notes
                          await updateNote(note.id, { time_value: { hour: value.hour, minute: value.minute } });
                        }
                      } catch (err) {
                        console.error('Failed to update note time', err);
                      } finally {
                        setIsTimePickerOpen(false);
                      }
                    }}
                    onCancel={() => setIsTimePickerOpen(false)}
                  />
                </div>
              </div>
            ),
            document.body
          )
        : null}

      {/* New Sentiment Dialog (portal) */}
      {typeof window !== 'undefined' && isSentimentDialogOpen
        ? createPortal(
            (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsSentimentDialogOpen(false);
                }}
              >
                <div className="mx-4">
                  <NewSentiment
                    isOpen={isSentimentDialogOpen}
                    onClose={() => setIsSentimentDialogOpen(false)}
                    onSelect={handleSentimentSelect}
                    noteId={currentNote.id}
                  />
                </div>
              </div>
            ),
            document.body
          )
        : null}
    </>
  );
};

export default NoteCardDetail;

