import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Note, useContacts, Contact, parseTimeToTimeValue, TimeValue } from '../../contexts/ContactContext';
import { CalendarIcon } from '../icons';
import { RecycleButton, MinimizeButton, BackButton, NewTagButton } from '../Button';
import { SentimentTag } from '../Tag';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import NewSentiment from '../Dialogs/NewSentiment';
import MaximumSentimentDialog from '../Dialogs/MaximumSentimentDialog';
import { contactReference } from '../../data/referenceParsing';
import NoteDatePicker, { DynamicPrecisionDateValue } from '../Dialogs/NoteDatePicker';
import TimePicker from '../TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, getCardIndexArray, popCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import useCardNavigation from '../../hooks/useCardNavigation';
import { destroyUnusedSentiments } from '../../utils/entityCleanup';

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
  const [sentimentUpdateTrigger, setSentimentUpdateTrigger] = useState(0);
  const [isSentimentDialogOpen, setIsSentimentDialogOpen] = useState(false);
  const [isMaximumSentimentDialogOpen, setIsMaximumSentimentDialogOpen] = useState(false);

  // Debug: Log when sentimentUpdateTrigger changes
  useEffect(() => {
    console.log('NoteCardDetail: sentimentUpdateTrigger changed to', sentimentUpdateTrigger);
  }, [sentimentUpdateTrigger]);

  // Handle sentiment selection from dialog
  const handleSentimentSelect = async (selectedSentiment: any) => {
    try {
      // Add the selected sentiment to the note's sentiment_ids
      const updatedSentimentIds = [...(currentNote.sentiment_ids || []), selectedSentiment.id];
      await updateNote(currentNote.id, { sentiment_ids: updatedSentimentIds });
      
      // Trigger re-render of sentiment tags
      setSentimentUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add sentiment to note:', error);
    }
  };

  // Handle new sentiment button click
  const handleNewSentimentClick = async () => {
    try {
      // Clean up unused sentiments first
      console.log('Cleaning up unused sentiments...');
      const cleanupResult = await destroyUnusedSentiments();
      console.log(`Cleanup completed: ${cleanupResult.deletedCount} unused sentiments deleted`);
      
      if (cleanupResult.errors.length > 0) {
        console.error('Errors during cleanup:', cleanupResult.errors);
      }
      
      // Trigger a re-render to refresh the sentiment list
      setSentimentUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to cleanup unused sentiments:', error);
    }

    // Then proceed with sentiment selection
    const currentSentimentCount = (currentNote.sentiment_ids || []).length;
    if (currentSentimentCount >= 3) {
      setIsMaximumSentimentDialogOpen(true);
    } else {
      setIsSentimentDialogOpen(true);
    }
  };

  if (currentNote.is_trashed) {
    return null;
  }

  // Get the sentiment objects from the sentiment IDs
  const sentimentObjects = (currentNote.sentiment_ids || [])
    .map(id => state.sentiments.find(s => s.id === id))
    .filter((sentiment): sentiment is NonNullable<typeof sentiment> => sentiment !== undefined);

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
                  <div className="w-fit h-[24px] font-circletitlemedium text-circle-primary flex items-center">
                    {note.title}
                  </div>
                </div>

                {/* Sentiment */}
                <div className="w-[535px] h-fit flex flex-row justify-end items-center gap-[15px] p-0 mx-auto flex-1">
                  {/* Frame 105 */}
                  <div className="w-fit h-[16px] flex flex-row items-center gap-[2px] p-0">
                    {/* Back button */}
                    <BackButton
                      onClick={() => { handleBack('noteCardDetail', currentNote.id); }}
                      showIcon={true}
                      children=""
                      size="md"
                    />
                    
                    {/* Delete button */}
                    <RecycleButton
                      onClick={() => setShowDeleteDialog(true)}
                      ariaLabel="Delete note"
                    />
                    
                    {/* Minimize button */}
                    <MinimizeButton
                      onClick={() => {
                        clearCardIndexArray();
                        onMinimize?.();
                      }}
                      ariaLabel="Minimize note detail"
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
                        className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${
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
          <div className="w-[600px] h-fit bg-circle-neutral-variant rounded-[12px] p-[15px] flex flex-row justify-start items-start">
            <div className="w-fit h-fit font-circlebodymedium text-circle-primary text-left">
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
          <div className="w-fit h-[20px] flex flex-row items-center gap-[5px] p-0">
            {sentimentObjects.map((sentiment) => (
              <SentimentTag
                key={`${sentiment.id}-${sentimentUpdateTrigger}`}
                sentiment={sentiment}
                noteId={currentNote.id}
                fillColor="bg-circle-neutral"
                textColor="text-circle-primary"
              />
            ))}
            <NewTagButton
              onClick={handleNewSentimentClick}
              aria-label="Add new sentiment tag"
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

      {/* New Sentiment Dialog */}
      <NewSentiment
        isOpen={isSentimentDialogOpen}
        onClose={() => setIsSentimentDialogOpen(false)}
        onSelect={handleSentimentSelect}
        noteId={currentNote.id}
      />

      {/* Maximum Sentiment Dialog */}
      <MaximumSentimentDialog
        isOpen={isMaximumSentimentDialogOpen}
        onClose={() => setIsMaximumSentimentDialogOpen(false)}
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

