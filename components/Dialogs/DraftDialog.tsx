import React, { useRef, useState, useCallback, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import ExtractButton from '../Button/ExtractButton';
import RecycleButton from '../Button/RecycleButton';
import MinimizeButton from '../Button/MinimizeButton';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { Draft, useContacts, PrecisionDate, Contact } from '../../contexts/ContactContext';
import ContentEditable from 'react-contenteditable';
import { CancelButton, ConfirmButton } from '../Button';
import DatePicker, { DynamicPrecisionDateValue } from './DatePicker';
import TimePicker from './TimePicker';
import { CalendarIcon } from '../icons';
import { createPortal } from 'react-dom';
import { EDITING_MODE_PADDING } from '../../data/variables';
import { useChat } from '../../contexts/ChatContext';
import { extractContactIdsFromText } from '../../utils/api/extractContactIds';
import { summarizeDraft } from '../../utils/api/summarizeDraft';
import { contactReference } from '../../data/referenceParsing';

interface DraftDialogProps {
  draft: Draft;
  onExtract?: (draft: Draft) => void;
  onDelete?: (draft: Draft) => void;
  onMinimize?: () => void;
  onOpenContactDetail?: (contact: Contact, src: any) => void;
  messageId?: string;
  locked?: 'confirm' | 'cancel' | 'extract' | null;
}

const DraftDialog: React.FC<DraftDialogProps> = ({
  draft,
  onExtract,
  onDelete,
  onMinimize,
  onOpenContactDetail,
  messageId,
  locked: initialLocked = null
}) => {
  const { updateTemporaryNote, addNote, addSentiment, state } = useContacts();
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  // Always render with the latest draft from context in case it was updated
  const currentDraft = state.drafts.find(d => d.id === draft.id) || draft;
  const chat = useChat();
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [locked, setLocked] = useState<null | 'confirm' | 'cancel' | 'extract'>(initialLocked);

  // Title editing
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentDraft.title || '');
  const [originalTitle, setOriginalTitle] = useState(currentDraft.title || '');
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const titleContentEditableRef = useRef<HTMLElement>(null);

  // Date/time pickers
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<{ hour: number | null; minute: number | null }>({ hour: currentDraft.time.hour, minute: currentDraft.time.minute });

  // Mount flag to safely use portal on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync editTitle with draft.title when draft prop changes (when not editing)
  useEffect(() => {
    if (!isTitleEditing) {
      setEditTitle(currentDraft.title || '');
    }
  }, [currentDraft.title, isTitleEditing]);

  // Helper to update locked state persistently
  const setLockedPersistent = useCallback(async (value: 'confirm' | 'cancel' | 'extract') => {
    setLocked(value);
    if (messageId) {
      try {
        await chat.updateComponentProps(messageId, { locked: value });
      } catch (error) {
        console.error('Failed to persist locked state:', error);
      }
    }
  }, [messageId, chat]);

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

  const handleExtractClick = useCallback(async () => {
    if (locked) {
      console.log('[DraftDialog] Extract click ignored because locked', { draftId: draft.id, locked });
      return;
    }
    console.log('[DraftDialog] Extract click start', { draftId: draft.id, hasTitle: !!draft.title, textLength: draft.text?.length || 0 });
    await setLockedPersistent('extract');
    console.log('[DraftDialog] Locked set to extract');
    chat.setIsThinking(true);
    try {
      // Call summarization API with existing sentiments
      console.log('[DraftDialog] Calling summarizeDraft', { existingSentimentsCount: state.sentiments?.length || 0 });
      const selectedIds = extractContactIdsFromText(draft.text);
      const selectedContacts = state.contacts
        .filter(c => selectedIds.includes(c.id))
        .map(c => ({ id: c.id, name: c.name }));
      const summary = await summarizeDraft({
        title: draft.title || '',
        text: draft.text,
        existingSentiments: state.sentiments.map(s => ({ id: s.id, label: s.label, category: s.category })),
        selectedContacts,
      });
      console.log('[DraftDialog] summarizeDraft result', {
        titleLen: (summary.title || '').length,
        textLen: (summary.text || '').length,
        existingSentimentIds: summary.sentiments.existing_ids?.length || 0,
        newSentimentLabels: summary.sentiments.new_labels?.length || 0,
      });

      // Create any new sentiments first (limit to keep total ≤ 3 already enforced server-side)
      const createdIds: string[] = [];
      for (const label of summary.sentiments.new_labels) {
        try {
          console.log('[DraftDialog] Creating new sentiment', { label });
          const created = await addSentiment({ label, category: 'general' });
          console.log('[DraftDialog] Created sentiment', { id: created.id, label: created.label });
          createdIds.push(created.id);
        } catch (e) {
          console.error('Failed to create new sentiment:', label, e);
        }
      }

      // Fallback: ensure tokens for selected contacts if names slipped through
      let ensuredText = summary.text;
      for (const sc of selectedContacts) {
        const token = `{{contact:${sc.id}}}`;
        if (!ensuredText.includes(token) && sc.name) {
          try {
            const esc = sc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            ensuredText = ensuredText.replace(new RegExp(`\\b${esc}\\b`, 'g'), token);
          } catch {}
        }
      }
      summary.text = ensuredText;

      const sentiment_ids = [...summary.sentiments.existing_ids, ...createdIds];
      console.log('[DraftDialog] Final sentiment_ids', { count: sentiment_ids.length, sentiment_ids });
      const contact_ids = extractContactIdsFromText(summary.text);
      console.log('[DraftDialog] Extracted contact_ids from summarized text', { count: contact_ids.length, contact_ids });

      // Reuse confirm pathway to create note and announce
      console.log('[DraftDialog] Creating note from summary with carried date/time');
      await addNote({
        title: summary.title || (draft.title || ''),
        text: summary.text,
        date: draft.date,
        time_value: draft.time,
        sentiment_ids,
        contact_ids,
        is_trashed: false,
      });
      console.log('[DraftDialog] addNote completed');

      // Find created note and announce (poll state since addNote updates async)
      let newNote = stateRef.current.notes.find(n => n.text === summary.text && n.title === (summary.title || (draft.title || '')));
      for (let i = 0; !newNote && i < 20; i++) {
        await new Promise(r => setTimeout(r, 100));
        newNote = stateRef.current.notes.find(n => n.text === summary.text && n.title === (summary.title || (draft.title || '')));
        if (!newNote) console.log('[DraftDialog] Waiting for note to appear in state...', { attempt: i + 1 });
      }
      if (newNote) {
        console.log('[DraftDialog] Found newly created note in state', { id: newNote.id });
        await chat.addSystemText('Great! Here is your note:');
        // Small delay to ensure text message is fully added before component
        await new Promise(r => setTimeout(r, 50));
        await chat.addSystemComponent('NoteCard', { id: newNote.id });
        console.log('[DraftDialog] Mounted NoteCard for new note');
      } else {
        console.warn('[DraftDialog] Could not find newly created note in state after polling');
      }

      if (onMinimize) onMinimize();
      console.log('[DraftDialog] Extract flow finished, dialog minimized');
    } catch (error) {
      console.error('Summarize draft failed:', error);
    } finally {
      chat.setIsThinking(false);
      console.log('[DraftDialog] isThinking set to false');
    }
  }, [draft, onExtract, locked, setLockedPersistent, chat, state.sentiments]);

  const handleCancelClick = useCallback(async () => {
    if (locked) return;
    await setLockedPersistent('cancel');
    try {
      await chat.addSystemText("Cool. We can discard this note and start over. What can I do for you then?");
      if (onMinimize) {
        onMinimize();
      }
    } catch (error) {
      console.error('Failed to add cancel message:', error);
    }
  }, [chat, onMinimize, locked, setLockedPersistent]);

  const handleConfirmClick = useCallback(async () => {
    if (locked) return;
    await setLockedPersistent('confirm');
    try {
      // Extract contact IDs from the draft text
      const contact_ids = extractContactIdsFromText(currentDraft.text);
      
      // Create a new note and add it to the database
      await addNote({
        title: currentDraft.title || '',
        text: currentDraft.text,
        date: currentDraft.date,
        time_value: currentDraft.time,
        sentiment_ids: [],
        contact_ids,
        is_trashed: false
      });

      // Find created note and announce (poll state since addNote updates async)
      let newNote = stateRef.current.notes.find(n => n.text === currentDraft.text && n.title === (currentDraft.title || ''));
      for (let i = 0; !newNote && i < 20; i++) {
        await new Promise(r => setTimeout(r, 100));
        newNote = stateRef.current.notes.find(n => n.text === currentDraft.text && n.title === (currentDraft.title || ''));
        if (!newNote) console.log('[DraftDialog] Waiting for note to appear in state...', { attempt: i + 1 });
      }
      if (newNote) {
        console.log('[DraftDialog] Found newly created note in state', { id: newNote.id });
        await chat.addSystemText("Great! Here is your note:");
        // Small delay to ensure text message is fully added before component
        await new Promise(r => setTimeout(r, 50));
        await chat.addSystemComponent('NoteCard', { id: newNote.id });
        console.log('[DraftDialog] Mounted NoteCard for new note');
      } else {
        console.warn('[DraftDialog] Could not find newly created note in state after polling');
      }

      // Minimize the draft card
      if (onMinimize) {
        onMinimize();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }, [currentDraft, addNote, chat, onMinimize, locked, setLockedPersistent]);

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

  const handleTitleEditClick = () => {
    if (locked) return;
    setIsTitleEditing(true);
    setEditTitle(currentDraft.title || '');
    setOriginalTitle(currentDraft.title || '');
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
    setIsTitleSaving(true);
    const currentHtml = titleContentEditableRef.current?.innerHTML ?? editTitle;
    const cleanTitle = currentHtml.replace(/<[^>]*>/g, '').trim();
    await updateTemporaryNote?.(currentDraft.id, { title: cleanTitle });
    setIsTitleSaving(false);
    setIsTitleEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(currentDraft.title || '');
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

  const handleTitleBlur = () => {
    setTimeout(() => {
      if (isTitleEditing) {
        handleTitleSave();
      }
    }, 100);
  };

  return (
    <>
      <div className={`dlg-chat ${locked ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Main container */}
        <div className="flex flex-col w-full h-full gap-lg overflow-hidden">

          {/* Title row */}
          <div className="w-full h-fit flex flex-row justify-between items-start gap-lg p-0">
            <div className="w-fit h-fit flex items-center gap-xs">
              {isTitleEditing ? (
                <ContentEditable
                  innerRef={titleContentEditableRef}
                  html={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onKeyDownCapture={handleTitleKeyDown}
                  onKeyUp={handleTitleKeyUp}
                  onBlur={handleTitleBlur}
                  className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[24px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-circletitlemedium text-circle-primary`}
                  style={{
                    minHeight: '24px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              ) : (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    handleTitleEditClick();
                  }}
                  className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-circletitlemedium text-circle-primary"
                  title="Click to edit"
                  style={{ pointerEvents: 'auto' }}
                >
                  {currentDraft.title || 'Untitled'}
                </div>
              )}
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

          {/* Date and Time */}
          <div className="w-full h-fit flex flex-col items-start gap-sm p-0">
            <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
              <div className="w-full h-fit flex flex-col items-start p-0 mx-auto flex-1">
                {/* Date row */}
                <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
                  <CalendarIcon width={16} height={16} className="text-circle-primary" />
                  <button
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      let init: DynamicPrecisionDateValue;
                      if (draft.date && typeof draft.date.year === 'number') {
                        if (typeof draft.date.month === 'number' && typeof draft.date.day === 'number') {
                          init = { precision: 'day', year: draft.date.year, month: draft.date.month, day: draft.date.day };
                        } else if (typeof draft.date.month === 'number') {
                          init = { precision: 'month', year: draft.date.year, month: draft.date.month, day: null };
                        } else {
                          init = { precision: 'year', year: draft.date.year, month: null, day: null };
                        }
                      } else {
                        init = { precision: 'none', year: null, month: null, day: null };
                      }
                      setDateValue(init);
                      setIsDatePickerOpen(true);
                    }}
                    className={`w-fit h-fit font-circlebodymedium text-circle-primary flex items-center ${!draft.date?.year ? 'italic opacity-50' : ''}`}
                    title="Click to edit date"
                    disabled={!!locked}
                  >
                    {draft.date?.year ? formatDate(draft.date) : 'no date'}
                  </button>
                </div>
                {/* Time row */}
                <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      if (draft.time && typeof draft.time.hour === 'number' && typeof draft.time.minute === 'number') {
                        setTimeValue({ hour: draft.time.hour, minute: draft.time.minute });
                      } else {
                        const now = new Date();
                        setTimeValue({ hour: now.getHours(), minute: now.getMinutes() });
                      }
                      setIsTimePickerOpen(true);
                    }}
                    className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${draft.time.hour === null ? 'italic opacity-50' : ''}`}
                    title="Click to edit time"
                    disabled={!!locked}
                  >
                    {draft.time.hour !== null ? formatTime(draft.time) : '--:--'}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Text container */}
          <ScrollContainer
            className="w-full h-fit min-h-0 max-h-full bg-circle-neutral-variant rounded-sm p-md flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            horizontal={false}
            vertical={true}
          >
            <div className="w-fit font-circlebodymedium text-circle-primary text-left whitespace-pre-wrap break-words">
              {contactReference(draft.text, state.contacts, (contact) => {
                console.log('[DraftDialog] contact span clicked', { id: contact?.id, name: contact?.name });
                if (!contact || !onOpenContactDetail) return;
                onOpenContactDetail(contact, null);
              })}
            </div>
          </ScrollContainer>

           {/* Buttons Container */}
           <div className="flex flex-row items-center gap-md justify-end w-full h-fit p-0 flex-none">
            <ExtractButton 
              onClick={handleExtractClick} 
              disabled={!!locked}
              className={locked === 'extract' ? '!bg-circle-neutral-variant' : ''}
            >
              Summarize
            </ExtractButton>
              <div className="flex flex-row items-center gap-xs">
              <CancelButton 
                onClick={handleCancelClick} 
                ariaLabel="Cancel draft" 
                disabled={!!locked}
                className={locked === 'cancel' ? '!bg-circle-neutral-variant' : ''}
              />
              <ConfirmButton 
                onClick={handleConfirmClick} 
                ariaLabel="Confirm draft" 
                disabled={!!locked}
                className={locked === 'confirm' ? '!bg-circle-neutral-variant' : ''}
              />
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
                <div>
                  <DatePicker
                    value={dateValue}
                    onChange={setDateValue}
                    label="Draft date"
                    subtitle="When did this happen?"
                    onConfirm={async (value) => {
                      try {
                        if (!value || value.precision === 'none' || !value.year) {
                          await updateTemporaryNote?.(currentDraft.id, {
                            date: { year: null, month: null, day: null }
                          });
                        } else {
                          await updateTemporaryNote?.(currentDraft.id, {
                            date: {
                              year: value.year ?? null,
                              month: value.precision === 'year' ? null : (value.month ?? null),
                              day: value.precision === 'day' ? (value.day ?? null) : null,
                            }
                          });
                        }
                      } catch (err) {
                        console.error('Failed to update draft date', err);
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
                    label="Draft time"
                    subtitle="What time did this happen?"
                    onConfirm={async (value) => {
                      try {
                        await updateTemporaryNote?.(currentDraft.id, { time: { hour: value.hour, minute: value.minute } });
                      } catch (err) {
                        console.error('Failed to update draft time', err);
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

export default DraftDialog;

