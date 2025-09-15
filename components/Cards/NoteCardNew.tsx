import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ContentEditable from 'react-contenteditable';
import { Note, useContacts, Contact, parseTimeToTimeValue, TimeValue } from '../../contexts/ContactContext';
import { CalendarIcon } from '../icons';
import { ConfirmButton, CancelButton, NewTagButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { contactReference } from '../../data/referenceParsing';
import NoteDatePicker, { DynamicPrecisionDateValue } from '../Dialogs/NoteDatePicker';
import TimePicker from '../TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, getCardIndexArray, popCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import { EDITING_MODE_PADDING } from '../../data/variables';
import useCardNavigation from '../../hooks/useCardNavigation';

const Type: CardType = 'noteCardDetail';

interface NoteCardDetailProps {
  note: Note;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const NoteCardDetail: React.FC<NoteCardDetailProps> = ({ note, onMinimize, caller, onOpenContactDetail }) => {
  const { state, updateNote } = useContacts();
  // Always render with the latest note from context in case it was updated
  const currentNote = state.notes.find(n => n.id === note.id) || note;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
        await updateNote(note.id, { title: cleanTitle });
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
        await updateNote(note.id, { text: cleanText });
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
      <div className="w-fit h-fit bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] rounded-[12px] p-[15px] flex flex-col gap-[20px]">
        {/* Frame 124 */}
        <div className="w-fit h-fit flex flex-col items-start gap-[20px] p-0">
          {/* Info */}
          <div className="w-fit h-fit flex flex-col items-start gap-[15px] p-0">
            {/* Note info */}
            <div className="w-[600px] h-fit flex flex-row items-start gap-[10px] p-0">
              {/* Frame 69 */}
              <div className="w-[600px] h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                {/* Timestamp */}
                <div className="w-fit h-fit flex flex-col items-start p-0 mx-auto">
                  {/* Title */}
                  <div className="w-fit h-[24px] flex items-center gap-2">
                    {isTitleEditing ? (
                      <ContentEditable
                        innerRef={titleContentEditableRef}
                        html={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onKeyDownCapture={handleTitleKeyDown}
                        onKeyUp={handleTitleKeyUp}
                        onBlur={handleTitleBlur}
                        className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-inter font-medium text-[16px] leading-[24px] tracking-[0.15px] text-circle-primary`}
                        style={{
                          minHeight: '20px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      />
                    ) : (
                      <div
                        onClick={handleTitleEditClick}
                        className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-inter font-medium text-[16px] leading-[24px] tracking-[0.15px] text-circle-primary"
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
                        <ConfirmButton 
                          onClick={handleTitleSave} 
                          ariaLabel={isTitleSaving ? 'Saving...' : 'Save title'}
                        />
                        <CancelButton 
                          onClick={handleTitleCancel} 
                          ariaLabel="Cancel title edit"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sentiment */}
                <div className="w-[535px] h-fit flex flex-row justify-end items-center gap-[15px] p-0 mx-auto flex-1">
                  {/* Frame 105 */}
                  <div className="w-fit h-[16px] flex flex-row items-center gap-[2px] p-0">
                    {/* Confirm button */}
                    <ConfirmButton
                      onClick={() => { handleBack('noteCardDetail', currentNote.id); }}
                      ariaLabel="Confirm note"
                    />
                    
                    {/* Cancel button */}
                    <CancelButton
                      onClick={() => setShowDeleteDialog(true)}
                      ariaLabel="Cancel note"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 119 */}
            <div className="w-[600px] h-fit flex flex-col items-start gap-[4px] p-0">
              {/* Note info */}
              <div className="w-[600px] h-fit flex flex-row items-start gap-[10px] p-0">
                {/* Frame 69 */}
                <div className="w-[600px] h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                  {/* Timestamp */}
                  <div className="w-[600px] h-fit flex flex-col items-start p-0 mx-auto flex-1">
                    {/* Date row */}
                    <div className="w-fit h-[20px] flex flex-row items-center gap-[10px] p-0">
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
                        className={`w-fit h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-center ${
                          date === 'no date' ? 'italic opacity-50' : ''
                        }`}
                        title="Click to edit note date"
                      >
                        {date}
                      </button>
                    </div>
                    {/* Time row */}
                    <div className="w-fit h-[20px] flex flex-row items-center gap-[10px] p-0">
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
                        className={`w-fit h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-center ${
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
          <div className="w-[600px] h-fit bg-circle-neutral-variant rounded-[12px] p-[15px] flex flex-col gap-2">
            <div className="w-fit h-fit flex items-start gap-2">
              {isTextEditing ? (
                <ContentEditable
                  innerRef={textContentEditableRef}
                  html={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  onKeyDownCapture={handleTextKeyDown}
                  onKeyUp={handleTextKeyUp}
                  onBlur={handleTextBlur}
                  className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex-1`}
                  style={{
                    minHeight: '20px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              ) : (
                <div
                  onClick={handleTextEditClick}
                  className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex-1"
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
                      }
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
                  <ConfirmButton 
                    onClick={handleTextSave} 
                    ariaLabel={isTextSaving ? 'Saving...' : 'Save text'}
                  />
                  <CancelButton 
                    onClick={handleTextCancel} 
                    ariaLabel="Cancel text edit"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Tags */}
          <div className="w-[242px] h-[20px] flex flex-row items-center gap-[5px] p-0">
            {sentimentLabels.map((label, index) => (
              <div key={index} className="w-fit h-[20px] bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center">
                <div className="w-fit h-[16px] font-inter font-medium text-[11px] leading-[16px] tracking-[0.5px] text-circle-primary flex items-center text-center">
                  {label}
                </div>
              </div>
            ))}
            
            {/* New Tag Button */}
            <NewTagButton
              onClick={() => console.log('Add new tag')}
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
                  <NoteDatePicker
                    value={dateValue}
                    onChange={setDateValue}
                    label="Note date"
                    subtitle="When did this happen?"
                    onConfirm={async (value) => {
                      try {
                        if (!value || !value.year) { setIsDatePickerOpen(false); return; }
                        const updated = {
                          date: {
                            year: value.year ?? null,
                            month: value.precision === 'year' ? null : (value.month ?? null),
                            day: value.precision === 'day' ? (value.day ?? null) : null,
                          }
                        } as Partial<Note>;
                        await updateNote(note.id, updated);
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
                        const hh = value.hour == null ? null : String(value.hour).padStart(2, '0');
                        const mm = value.minute == null ? null : String(value.minute).padStart(2, '0');
                        const t = hh != null && mm != null ? `${hh}:${mm}` : undefined;
                        await updateNote(note.id, { time_value: { hour: value.hour, minute: value.minute } });
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
    </>
  );
};

export default NoteCardDetail;

