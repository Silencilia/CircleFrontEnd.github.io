import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Note, useContacts, Contact, parseTimeToTimeValue, TimeValue } from '../../contexts/ContactContext';
import { CalendarIcon, DeleteIcon, MinimizeIcon, BackIcon } from '../icons';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { contactReference } from '../../data/referenceParsing';
import NoteDatePicker, { DynamicPrecisionDateValue } from '../Dialogs/NoteDatePicker';
import TimePicker from '../TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, getCardIndexArray, popCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import useCardNavigation from '../../hooks/useCardNavigation';

const Type: CardType = 'noteCardDetail';

interface NoteCardDetailProps {
  note: Note;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const NoteCardDetail: React.FC<NoteCardDetailProps> = ({ note, onMinimize, caller, onOpenContactDetail }) => {
  const { state, updateNoteAsync } = useContacts();
  // Always render with the latest note from context in case it was updated
  const currentNote = state.notes.find(n => n.id === note.id) || note;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<TimeValue>({ hour: null, minute: null });

  if (currentNote.isTrashed) {
    return null;
  }

  // Get the sentiment labels from the sentiment IDs
  const sentimentLabels = (currentNote.sentimentIds || []).map(id => {
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

  // Format the time (from note.time HH:mm)
  const formatTime = (noteObj: Note) => {
    try {
      const hhmm = /^(\d{1,2}):(\d{2})$/;
      if (noteObj.time && hhmm.test(noteObj.time)) {
        const [, h, m] = noteObj.time.match(hhmm)!;
        const hh = String(parseInt(h, 10)).padStart(2, '0');
        const mm = String(parseInt(m, 10)).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      return '--:--';
    } catch (error) {
      return '--:--';
    }
  };

  const handleDelete = async () => {
    try {
      await updateNoteAsync(note.id, { isTrashed: true });
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

  return (
    <>
      <div className="w-[600px] h-fit bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] rounded-[12px] p-[15px] flex flex-col gap-[20px]">
        {/* Frame 124 */}
        <div className="w-[570px] h-fit flex flex-col items-start gap-[20px] p-0">
          {/* Info */}
          <div className="w-[570px] h-fit flex flex-col items-start gap-[15px] p-0">
            {/* Note info */}
            <div className="w-[570px] h-fit flex flex-row items-start gap-[10px] p-0">
              {/* Frame 69 */}
              <div className="w-[570px] h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                {/* Timestamp */}
                <div className="w-fit h-fit flex flex-col items-start p-0 mx-auto">
                  {/* Title */}
                  <div className="w-fit h-[24px] font-inter font-medium text-[16px] leading-[24px] tracking-[0.15px] text-circle-primary flex items-center">
                    {note.title}
                  </div>
                </div>

                {/* Sentiment */}
                <div className="w-[535px] h-fit flex flex-row justify-end items-center gap-[15px] p-0 mx-auto flex-1">
                  {/* Frame 105 */}
                  <div className="w-fit h-[16px] flex flex-row items-center gap-[5px] p-0">
                    {/* Back button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBack('noteCardDetail', currentNote.id); }}
                      className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
                      aria-label="Back"
                    >
                      <BackIcon width={16} height={16} className="text-circle-primary" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
                      aria-label="Delete note"
                    >
                      <DeleteIcon width={16} height={16} className="text-circle-primary" />
                    </button>
                    
                    {/* Minimize button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCardIndexArray();
                        onMinimize?.();
                      }}
                      className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
                      aria-label="Minimize note detail"
                    >
                      <MinimizeIcon width={16} height={16} className="text-circle-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 119 */}
            <div className="w-[570px] h-fit flex flex-col items-start gap-[4px] p-0">
              {/* Note info */}
              <div className="w-[570px] h-fit flex flex-row items-start gap-[10px] p-0">
                {/* Frame 69 */}
                <div className="w-[570px] h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
                  {/* Timestamp */}
                  <div className="w-[570px] h-fit flex flex-col items-start p-0 mx-auto flex-1">
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
                          } else if (currentNote.time) {
                            if (fullDate.test(currentNote.time)) {
                              const [, y, m, d] = currentNote.time.match(fullDate)!;
                              init = { precision: 'day', year: parseInt(y, 10), month: parseInt(m, 10), day: parseInt(d, 10) };
                            } else if (yearMonth.test(currentNote.time)) {
                              const [, y, m] = currentNote.time.match(yearMonth)!;
                              init = { precision: 'month', year: parseInt(y, 10), month: parseInt(m, 10), day: null };
                            } else if (yearOnly.test(currentNote.time)) {
                              const [, y] = currentNote.time.match(yearOnly)!;
                              init = { precision: 'year', year: parseInt(y, 10), month: null, day: null };
                            } else {
                              const d = new Date(currentNote.time);
                              if (!isNaN(d.getTime())) {
                                init = { precision: 'day', year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
                              }
                            }
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
                          const hhmm = /^(\d{1,2}):(\d{2})$/;
                          if (currentNote.time && hhmm.test(currentNote.time)) {
                            const [, h, m] = currentNote.time.match(hhmm)!;
                            setTimeValue({ hour: parseInt(h, 10), minute: parseInt(m, 10) });
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
          <div className="w-[570px] h-fit bg-circle-neutral-variant rounded-[12px] p-[10px] flex flex-row justify-start items-start">
            <div className="w-[550px] h-fit font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary text-left">
              {contactReference(
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
                        await updateNoteAsync(note.id, updated);
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
                        await updateNoteAsync(note.id, { time: t });
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

