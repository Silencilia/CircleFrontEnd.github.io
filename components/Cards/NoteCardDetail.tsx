import React, { useState, useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import ScrollContainer from 'react-indiana-drag-scroll';
import { createPortal } from 'react-dom';
import { Note, useContacts, Contact, parseTimeToTimeValue, TimeValue } from '../../contexts/ContactContext';
import { CalendarIcon } from '../icons';
import { RecycleButton, MinimizeButton, BackButton, NewTagButton, ConfirmButton, CancelButton } from '../Button';
import { SentimentTag } from '../Tag';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import NewSentiment from '../Dialogs/NewSentiment';
import MaximumSentimentDialog from '../Dialogs/MaximumSentimentDialog';
import { contactReference } from '../../data/referenceParsing';
import DatePicker, { DynamicPrecisionDateValue } from '../Dialogs/DatePicker';
import TimePicker from '../Dialogs/TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import useCardNavigation from '../../hooks/useCardNavigation';
import { destroyUnusedSentiments } from '../../utils/entityCleanup';
import { EDITING_MODE_PADDING } from '../../data/variables';
import { createInlineEditingState, createInlineEditingHandlers, useInlineEditingSync } from '../../utils/inlineEditingUtils';
import { formatTextWithContactReferences, convertHtmlToUuidFormat, CONTACT_REFERENCE_STYLES } from '../../utils/contactReference';
import { useContactAutocomplete } from '../../hooks/useContactAutocomplete';
import ContactAutocomplete from '../ContactAutocomplete';
import { extractContactIdsFromText } from '../../utils/api/extractContactIds';
import { useHashBack } from '../../hooks/useHashBack';

// Force Tailwind to include contact reference highlight classes
const _tailwindContactClasses = 'font-circlebodymedium-highlight font-circlebodysmall-highlight';

const Type: CardType = 'noteCardDetail';

interface NoteCardDetailProps {
  note: Note;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const NoteCardDetail: React.FC<NoteCardDetailProps> = ({ note, onMinimize, caller, onOpenContactDetail }) => {
  const { state, updateNote, loadData } = useContacts();
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

  // Title editing state
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentNote.title);
  const [originalTitle, setOriginalTitle] = useState(currentNote.title);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const titleContentEditableRef = useRef<HTMLElement>(null);

  // Text editing state using utility
  const textEditingState = createInlineEditingState(currentNote.text);

  // Track when we're in the middle of contact selection to prevent blur handling
  const [isSelectingContact, setIsSelectingContact] = useState(false);

  // Contact autocomplete functionality
  const contactAutocomplete = useContactAutocomplete({
    contacts: state.contacts,
    onContactSelect: async (contact) => {
      setIsSelectingContact(true);

      // The hook handles text replacement with {{contact:id}} format
      if (textEditingState.contentEditableRef.current) {
        const currentHtml = textEditingState.contentEditableRef.current.innerHTML || '';

        // Convert HTML back to UUID format for storage
        const updatedText = convertHtmlToUuidFormat(currentHtml);

        // Convert the UUID format to HTML format for display during editing
        const htmlText = formatTextWithContactReferences(updatedText, state.contacts);

        // Update the editing state with the HTML formatted text
        textEditingState.setEditValue(htmlText);

        // Extract contact IDs from the updated text
        const contact_ids = extractContactIdsFromText(updatedText);

        // Update the note data with the UUID format (for storage)
        await updateNote(currentNote.id, { text: updatedText, contact_ids });

        // Ensure focus remains in the text editor after contact selection
        setTimeout(() => {
          if (textEditingState.contentEditableRef.current) {
            textEditingState.contentEditableRef.current.focus();
          }
          setIsSelectingContact(false);
        }, 0);
      }
    },
    textContentEditableRef: textEditingState.contentEditableRef
  });

  // Custom text editing handlers that handle contact references properly
  const textEditingHandlers = {
    handleEditClick: () => {
      textEditingState.setIsEditing(true);
      // Convert UUID format to HTML format with clickable spans for editing
      const htmlText = formatTextWithContactReferences(currentNote.text, state.contacts);
      textEditingState.setEditValue(htmlText);
      textEditingState.setOriginalValue(currentNote.text);

      // Focus the editable element
      setTimeout(() => {
        if (textEditingState.contentEditableRef.current) {
          textEditingState.contentEditableRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(textEditingState.contentEditableRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    },

    handleSave: async () => {
      const currentHtml = textEditingState.contentEditableRef.current?.innerHTML ?? textEditingState.editValue;
      // Convert HTML back to UUID format for saving
      const uuidText = convertHtmlToUuidFormat(currentHtml);

      if (uuidText !== currentNote.text) {
        try {
          textEditingState.setIsSaving(true);
          // Extract contact IDs from the converted text
          const contact_ids = extractContactIdsFromText(uuidText);

          await updateNote(currentNote.id, { text: uuidText, contact_ids });
        } catch (error) {
          console.error('Save failed:', error);
          textEditingState.setEditValue(textEditingState.originalValue);
          return; // Don't exit editing mode on error
        } finally {
          textEditingState.setIsSaving(false);
        }
      }
      textEditingState.setIsEditing(false);
    },

    handleCancel: () => {
      textEditingState.setEditValue(currentNote.text);
      textEditingState.setIsEditing(false);
    },

    handleKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        textEditingHandlers.handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        textEditingHandlers.handleCancel();
      }
    },

    handleKeyUp: (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    },

    handleBlur: () => {
      setTimeout(() => {
        if (textEditingState.isEditing) {
          textEditingHandlers.handleSave();
        }
      }, 100);
    }
  };

  useInlineEditingSync(textEditingState, currentNote.text, textEditingState.isEditing);
  const [wasTextEditingBeforeContactOpen, setWasTextEditingBeforeContactOpen] = useState(false);


  // Restore text editing mode if it was active before opening a contact detail
  useEffect(() => {
    if (wasTextEditingBeforeContactOpen && !textEditingState.isEditing) {
      // Small delay to ensure the component has fully rendered
      setTimeout(() => {
        textEditingState.setIsEditing(true);
        setWasTextEditingBeforeContactOpen(false);
      }, 100);
    }
  }, [wasTextEditingBeforeContactOpen, textEditingState.isEditing]);

  // Custom blur handler that prevents save when selecting contacts
  const customBlurHandler = () => {
    if (!isSelectingContact) {
      textEditingHandlers.handleBlur();
    }
  };

  // Handle clicks outside autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactAutocomplete.showAutocomplete) {
        const target = event.target as Element;
        if (!target.closest('.autocomplete-dropdown') &&
            !target.closest('[contenteditable="true"]')) {
          contactAutocomplete.setShowAutocomplete(false);
        }
      }
    };

    if (contactAutocomplete.showAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contactAutocomplete.showAutocomplete, contactAutocomplete.setShowAutocomplete]);

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
      const cleanupResult = await destroyUnusedSentiments();
      
      if (cleanupResult.errors.length > 0) {
        console.error('Errors during cleanup:', cleanupResult.errors);
      }
      
      // Reload all data to refresh the sentiment list in the UI
      await loadData();
      
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
        await updateNote(currentNote.id, { title: cleanTitle });
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

  const handleTitleBlur = () => {
    setTimeout(() => {
      if (isTitleEditing) {
        handleTitleSave();
      }
    }, 100);
  };

  // Handle contact click during text editing
  const handleContactClick = (contactId: string) => {
    const contact = state.contacts.find(c => c.id === contactId);
    if (contact && onOpenContactDetail) {
      // Remember that we were in text editing mode
      setWasTextEditingBeforeContactOpen(textEditingState.isEditing);
      const cardIndex = createSourceRecord('noteCardDetail', currentNote.id);
      addToCardIndexArray(cardIndex);
      onOpenContactDetail(contact, cardIndex);
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

  // Intercept OS/browser back to trigger in-app back for this card
  useHashBack(() => handleBack('noteCardDetail', currentNote.id));

  return (<>
    <div className="crd-dtl">
      <div className="w-full h-full flex flex-col justify-centercenter items-start gap-lg p-0 overflow-hidden">
        {/* Info */}
        <div className="w-full h-fit flex flex-col items-start gap-lg p-0">
          {/* Note info */}
          <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
            <div className="w-full h-fit flex flex-row justify-between items-start gap-[111px] p-0 flex-1">
              {/* Title */}
              <div className="w-fit h-fit flex flex-col items-start p-0">
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
                      {currentNote.title}
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
              {/* Action Buttons */}
              <div className="w-full h-fit flex flex-row justify-end items-center gap-lg p-0 mx-auto flex-1">
                <div className="w-fit h-fit flex flex-row items-center gap-xs p-0">
                  <BackButton
                    onClick={() => { handleBack('noteCardDetail', currentNote.id); }}
                    showIcon={true}
                    children=""
                    size="md"
                  />
                  <RecycleButton
                    onClick={() => setShowDeleteDialog(true)}
                    ariaLabel="Delete note"
                  />
                  <MinimizeButton
                    onClick={() => {
                      clearCardIndexArray();
                      if (onMinimize) onMinimize();
                    }}
                    ariaLabel="Minimize note detail"
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
                    <CalendarIcon width={16} height={16} className="text-circle-primary" />
                    <button
                      type="button"
                      onClick={() => {
                        // Parse date fields safely and with correct types
                        let init: DynamicPrecisionDateValue;
                        if (
                          currentNote.date &&
                          typeof currentNote.date.year === 'number'
                        ) {
                          if (
                            typeof currentNote.date.month === 'number' &&
                            typeof currentNote.date.day === 'number'
                          ) {
                            init = {
                              precision: 'day',
                              year: currentNote.date.year,
                              month: currentNote.date.month,
                              day: currentNote.date.day,
                            };
                          } else if (
                            typeof currentNote.date.month === 'number'
                          ) {
                            init = {
                              precision: 'month',
                              year: currentNote.date.year,
                              month: currentNote.date.month,
                              day: null,
                            };
                          } else {
                            init = {
                              precision: 'year',
                              year: currentNote.date.year,
                              month: null,
                              day: null,
                            };
                          }
                        } else {
                          init = {
                            precision: 'none',
                            year: null,
                            month: null,
                            day: null,
                          };
                        }
                        setDateValue(init);
                        setIsDatePickerOpen(true);
                      }}
                      className={`w-fit h-fit font-circlebodymedium text-circle-primary flex items-center ${date === 'no date' ? 'italic opacity-50' : ''}`}
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
                        if (
                          currentNote.time_value &&
                          typeof currentNote.time_value.hour === 'number' &&
                          typeof currentNote.time_value.minute === 'number'
                        ) {
                          setTimeValue({
                            hour: currentNote.time_value.hour,
                            minute: currentNote.time_value.minute,
                          });
                        } else {
                          const now = new Date();
                          setTimeValue({
                            hour: now.getHours(),
                            minute: now.getMinutes(),
                          });
                        }
                        setIsTimePickerOpen(true);
                      }}
                      className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${!hasTime ? 'italic opacity-50' : ''}`}
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
        <div className={`w-full h-fit min-h-0 bg-circle-neutral-variant rounded-sm p-md flex flex-col ${textEditingState.isEditing ? 'gap-xs' : ''}`}>
          {textEditingState.isEditing ? (
            <>
              <div className="w-full h-fit min-h-0 flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-text border border-circle-primary rounded focus-within:ring-2 focus-within:ring-inset focus-within:ring-circle-primary focus-within:ring-opacity-50">
                <div className="w-fit font-circlebodymedium text-circle-primary text-left">
                  <ContentEditable
                    innerRef={textEditingState.contentEditableRef}
                    html={textEditingState.editValue}
                    onChange={(e) => {
                      textEditingState.setEditValue(e.target.value);
                      contactAutocomplete.handleTextChange(e);
                    }}
                    onKeyDownCapture={(e) => {
                      // Handle deletion of contact spans
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          const container = range.commonAncestorContainer;

                          // Check if we're trying to delete a contact span
                          let elementToCheck = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);

                          while (elementToCheck && elementToCheck !== textEditingState.contentEditableRef.current) {
                            if (elementToCheck.getAttribute(CONTACT_REFERENCE_STYLES.attributes.contactRef) === 'true') {
                              e.preventDefault();
                              e.stopPropagation();
                              // Remove the entire contact span
                              elementToCheck.remove();
                              return;
                            }
                            elementToCheck = elementToCheck.parentElement;
                          }
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      textEditingHandlers.handleKeyDown(e);
                      contactAutocomplete.handleKeyDown(e);
                    }}
                    onKeyUp={textEditingHandlers.handleKeyUp}
                    onBlur={customBlurHandler}
                    className={`outline-none ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[100px] font-circlebodymedium text-circle-primary cursor-text`}
                    style={{
                      minHeight: '100px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                    onClick={(e) => {
                      // Handle clicks on contact reference spans
                      const target = e.target as HTMLElement;
                      if (target.getAttribute(CONTACT_REFERENCE_STYLES.attributes.contactRef) === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        const contactId = target.getAttribute(CONTACT_REFERENCE_STYLES.attributes.contactId);
                        if (contactId) {
                          handleContactClick(contactId);
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-[2px] justify-end">
                <CancelButton
                  onClick={textEditingHandlers.handleCancel}
                  ariaLabel="Cancel text edit"
                />
                <ConfirmButton
                  onClick={textEditingHandlers.handleSave}
                  ariaLabel={textEditingState.isSaving ? 'Saving...' : 'Save text'}
                />
              </div>
            </>
          ) : (
            <ScrollContainer
              className={`w-full h-fit min-h-0 flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing`}
              horizontal={false}
              vertical={true}
            >
              <div className="w-fit font-circlebodymedium text-circle-primary text-left">
                <div
                  onClick={e => {
                    e.stopPropagation();
                    textEditingHandlers.handleEditClick();
                  }}
                  className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-circlebodymedium text-circle-primary"
                  title="Click to edit"
                  style={{ pointerEvents: 'auto' }}
                >
                  {contactReference(
                    currentNote.text,
                    state.contacts,
                    contact => {
                      if (!contact) return;
                      const cardIndex = createSourceRecord('noteCardDetail', currentNote.id);
                      addToCardIndexArray(cardIndex);
                      if (onOpenContactDetail) {
                        onOpenContactDetail(contact, cardIndex);
                      }
                    }
                  )}
                </div>
              </div>
            </ScrollContainer>
          )}
        </div>
        {/* Contact Autocomplete Dropdown */}
        <ContactAutocomplete
          showAutocomplete={contactAutocomplete.showAutocomplete}
          contacts={state.contacts}
          autocompleteQuery={contactAutocomplete.autocompleteQuery}
          autocompletePosition={contactAutocomplete.autocompletePosition}
          onContactSelect={contactAutocomplete.handleContactSelect}
          maxSuggestions={5}
        />
        {/* Sentiment Tags */}
        <div className="w-fit h-fit flex flex-row items-center gap-sm p-0">
          {sentimentObjects.map(sentiment => (
            <SentimentTag
              key={`${sentiment.id}-${sentimentUpdateTrigger}`}
              sentiment={sentiment}
              noteId={currentNote.id}
              fillColor="bg-circle-neutral"
              textColor="text-circle-primary"
              deleteButtonColor="rgb(38 43 53)"
              iconStrokeColor="rgb(251 247 243)"
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
                <div>
                  <DatePicker
                    value={dateValue}
                    onChange={setDateValue}
                    label="Note date"
                    subtitle="When did this happen?"
                    onConfirm={async (value) => {
                      try {
                        if (!value || value.precision === 'none' || !value.year) {
                          const updated = {
                            date: { year: null, month: null, day: null }
                          } as Partial<Note>;
                          await updateNote(note.id, updated);
                        } else {
                          const updated = {
                            date: {
                              year: value.year ?? null,
                              month: value.precision === 'year' ? null : (value.month ?? null),
                              day: value.precision === 'day' ? (value.day ?? null) : null,
                            }
                          } as Partial<Note>;
                          await updateNote(note.id, updated);
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

