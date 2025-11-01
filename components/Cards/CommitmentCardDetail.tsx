import React, { useState } from 'react';
import ContentEditable from 'react-contenteditable';
import ScrollContainer from 'react-indiana-drag-scroll';
import { createPortal } from 'react-dom';
import { Commitment, useContacts, parseTimeToTimeValue, TimeValue, Contact } from '../../contexts/ContactContext';
import { RecycleButton, MinimizeButton, BackButton, ConfirmButton, CancelButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import DatePicker, { DynamicPrecisionDateValue } from '../Dialogs/DatePicker';
import TimePicker from '../Dialogs/TimePicker';
import { CardIndex, createSourceRecord, CardType, addToCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import useCardNavigation from '../../hooks/useCardNavigation';
import { EDITING_MODE_PADDING } from '../../data/variables';
import { createInlineEditingState, useInlineEditingSync } from '../../utils/inlineEditingUtils';
import { useHashBack } from '../../hooks/useHashBack';
import { CalendarIcon } from '../icons';
import { contactReference } from '../../data/referenceParsing';
import { useContactAutocomplete } from '../../hooks/useContactAutocomplete';
import ContactAutocomplete from '../ContactAutocomplete';
import { extractContactIdsFromText } from '../../utils/api/extractContactIds';
import { formatTextWithContactReferences, convertHtmlToUuidFormat, CONTACT_REFERENCE_STYLES } from '../../utils/contactReference';

const Type: CardType = 'commitmentCardDetail';

interface CommitmentCardDetailProps {
  commitment: Commitment;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const CommitmentCardDetail: React.FC<CommitmentCardDetailProps> = ({ commitment, onMinimize, caller, onOpenContactDetail }) => {
  const { state, updateCommitment } = useContacts();
  // Always render with the latest commitment from context in case it was updated
  const currentCommitment = state.commitments.find(c => c.id === commitment.id) || commitment;
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<TimeValue>({ hour: null, minute: null });

  // Text editing state using utility
  const textEditingState = createInlineEditingState(currentCommitment.text);

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

        // Update the commitment data with the UUID format (for storage)
        await updateCommitment(currentCommitment.id, { text: updatedText, contact_ids });

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

  // Parse due_date string (e.g., "Dec 20, 2024") to DynamicPrecisionDateValue
  const parseDueDate = (dateStr: string): DynamicPrecisionDateValue => {
    if (!dateStr || dateStr === 'no date') {
      return { precision: 'none', year: null, month: null, day: null };
    }
    
    try {
      // Try parsing formats like "Dec 20, 2024" or "Dec 20,2024"
      const match = dateStr.match(/(\w+)\s+(\d{1,2}),\s*(\d{4})/);
      if (match) {
        const monthName = match[1];
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        const monthMap: { [key: string]: number } = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        
        const month = monthMap[monthName];
        if (month && day && year) {
          return { precision: 'day', year, month, day };
        }
      }
      
      // Try parsing as Date object
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return {
          precision: 'day',
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        };
      }
    } catch (e) {
      // Fall through to return 'none'
    }
    
    return { precision: 'none', year: null, month: null, day: null };
  };

  // Format DynamicPrecisionDateValue to due_date string (e.g., "Dec 20, 2024")
  const formatDueDate = (dateValue: DynamicPrecisionDateValue): string => {
    if (!dateValue || dateValue.precision === 'none' || !dateValue.year) {
      return '';
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (dateValue.precision === 'day' && dateValue.month && dateValue.day) {
      return `${monthNames[dateValue.month - 1]} ${dateValue.day}, ${dateValue.year}`;
    } else if (dateValue.precision === 'month' && dateValue.month) {
      return `${monthNames[dateValue.month - 1]} ${dateValue.year}`;
    } else if (dateValue.precision === 'year') {
      return String(dateValue.year);
    }
    
    return '';
  };

  // Parse due_time string (e.g., "16:00") to TimeValue
  const parseDueTime = (timeStr: string): TimeValue => {
    if (!timeStr || timeStr === '--:--') {
      return { hour: null, minute: null };
    }
    
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      if (!isNaN(hour) && !isNaN(minute)) {
        return { hour, minute };
      }
    }
    
    return parseTimeToTimeValue(timeStr);
  };

  // Format TimeValue to due_time string (e.g., "16:00")
  const formatDueTime = (timeValue: TimeValue): string => {
    if (timeValue.hour === null || timeValue.minute === null) {
      return '';
    }
    return `${String(timeValue.hour).padStart(2, '0')}:${String(timeValue.minute).padStart(2, '0')}`;
  };

  // Text editing handlers
  const handleTextEditClick = () => {
    textEditingState.setIsEditing(true);
    // Convert UUID format to HTML format with clickable spans for editing
    const htmlText = formatTextWithContactReferences(currentCommitment.text, state.contacts);
    textEditingState.setEditValue(htmlText);
    textEditingState.setOriginalValue(currentCommitment.text);

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
  };

  const handleTextSave = async () => {
    const currentHtml = textEditingState.contentEditableRef.current?.innerHTML ?? textEditingState.editValue;
    // Convert HTML back to UUID format for saving
    const uuidText = convertHtmlToUuidFormat(currentHtml);
    
    if (uuidText !== currentCommitment.text) {
      try {
        textEditingState.setIsSaving(true);
        // Extract contact IDs from the converted text
        const contact_ids = extractContactIdsFromText(uuidText);

        await updateCommitment(currentCommitment.id, { text: uuidText, contact_ids });
      } catch (error) {
        console.error('Save failed:', error);
        textEditingState.setEditValue(textEditingState.originalValue);
        return; // Don't exit editing mode on error
      } finally {
        textEditingState.setIsSaving(false);
      }
    }
    textEditingState.setIsEditing(false);
  };

  const handleTextCancel = () => {
    textEditingState.setEditValue(currentCommitment.text);
    textEditingState.setIsEditing(false);
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

  const handleTextBlur = () => {
    setTimeout(() => {
      if (textEditingState.isEditing && !isSelectingContact) {
        handleTextSave();
      }
    }, 100);
  };

  // Handle contact click during text editing
  const handleContactClick = (contactId: string) => {
    const contact = state.contacts.find(c => c.id === contactId);
    if (contact && onOpenContactDetail) {
      const cardIndex = createSourceRecord('commitmentCardDetail', currentCommitment.id);
      addToCardIndexArray(cardIndex);
      onOpenContactDetail(contact, cardIndex);
    }
  };

  useInlineEditingSync(textEditingState, currentCommitment.text, textEditingState.isEditing);

  if (currentCommitment.is_trashed) {
    return null;
  }

  const date = currentCommitment.due_date || '';
  const time = currentCommitment.due_time || '';
  const hasDate = date !== '';
  const hasTime = time !== '';

  const { handleBack } = useCardNavigation({
    closeCurrent: onMinimize,
  });

  // Intercept OS/browser back to trigger in-app back for this card
  useHashBack(() => handleBack('commitmentCardDetail', currentCommitment.id));

  const handleDelete = async () => {
    try {
      await updateCommitment(commitment.id, { is_trashed: true });
      setShowDeleteDialog(false);
      if (onMinimize) {
        onMinimize();
      }
    } catch (error) {
      console.error('Failed to delete commitment:', error);
    }
  };

  return (
    <>
      <div className="crd-dtl">
        <div className="w-full h-full flex flex-col justify-centercenter items-start gap-lg p-0 overflow-hidden">
          {/* Info */}
          <div className="w-full h-fit flex flex-col items-start gap-lg p-0">
            {/* Commitment info */}
            <div className="w-full h-fit flex flex-row items-between gap-lg p-0">
              
               {/* Date and Time */}
            <div className="w-full h-fit flex flex-col items-start gap-sm p-0">
              <div className="w-full h-fit flex flex-row items-start gap-lg p-0">
                <div className="w-full h-fit flex flex-col justify-between items-start p-0 gap-lg flex-1">
                    <span className="w-fit h-fit font-circlebodymedium text-circle-primary flex items-center">Due:</span>
                    
                    <div className="w-full h-fit flex flex-col items-start p-0 flex-1">
                        {/* Date row */}
                        <div className="w-fit h-fit flex flex-row items-center gap-md p-0">
                        <CalendarIcon width={16} height={16} className="text-circle-primary" />
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = parseDueDate(currentCommitment.due_date || '');
                            setDateValue(parsed);
                            setIsDatePickerOpen(true);
                          }}
                          className={`w-fit h-fit font-circlebodymedium text-circle-primary flex items-center cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 ${!hasDate ? 'italic opacity-50' : ''}`}
                          title="Click to edit due date"
                        >
                            {date || 'no date'}
                        </button>
                        </div>
                        {/* Time row */}
                        <div className="w-fit h-fit flex flex-row items-center gap-md p-0">
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = parseDueTime(currentCommitment.due_time || '');
                            setTimeValue(parsed);
                            setIsTimePickerOpen(true);
                          }}
                          className={`w-fit h-fit font-circlebodymedium text-circle-primary flex items-center cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 ${!hasTime ? 'italic opacity-50' : ''}`}
                          title="Click to edit due time"
                        >
                            {time || '--:--'}
                        </button>
                        </div>
                    </div>
                </div>
              </div>
            </div>
                {/* Action Buttons */}
                <div className="w-full h-fit flex flex-row justify-end items-center gap-lg p-0 mx-auto flex-1">
                  <div className="w-fit h-fit flex flex-row items-center gap-xs p-0">
               
                    <RecycleButton
                      onClick={() => setShowDeleteDialog(true)}
                      ariaLabel="Delete commitment"
                    />
                    <MinimizeButton
                      onClick={() => {
                        clearCardIndexArray();
                        if (onMinimize) onMinimize();
                      }}
                      ariaLabel="Minimize commitment detail"
                    />
                  </div>
                </div>
              
            </div>
            
          </div>
          {/* Text */}
          <div className={`w-full h-fit min-h-0 bg-circle-neutral-variant rounded-sm p-md flex flex-col ${textEditingState.isEditing ? 'gap-xs' : ''}`}>
            {textEditingState.isEditing ? (
              <>
                <div 
                  className="w-full h-fit min-h-0 flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-text border border-circle-primary rounded focus-within:ring-2 focus-within:ring-inset focus-within:ring-circle-primary focus-within:ring-opacity-50"
                  onMouseDown={(e) => {
                    const el = textEditingState.contentEditableRef.current;
                    if (el && !el.contains(e.target as Node)) {
                      e.preventDefault();
                      el.focus();
                    }
                  }}
                >
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
                        handleTextKeyDown(e);
                        contactAutocomplete.handleKeyDown(e);
                      }}
                      onKeyUp={handleTextKeyUp}
                      onBlur={handleTextBlur}
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
                    onClick={handleTextCancel}
                    ariaLabel="Cancel text edit"
                  />
                  <ConfirmButton
                    onClick={handleTextSave}
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
                      handleTextEditClick();
                    }}
                    className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-circlebodymedium text-circle-primary"
                    title="Click to edit"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {contactReference(
                      currentCommitment.text,
                      state.contacts,
                      contact => {
                        if (!contact) return;
                        const cardIndex = createSourceRecord('commitmentCardDetail', currentCommitment.id);
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
        </div>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemType="commitment"
        itemName={commitment.text}
      />

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
                    label="Due date"
                    subtitle="When is this commitment due?"
                    onConfirm={async (value) => {
                      try {
                        const formattedDate = formatDueDate(value);
                        await updateCommitment(currentCommitment.id, { due_date: formattedDate });
                      } catch (err) {
                        console.error('Failed to update commitment date', err);
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
                    label="Due time"
                    subtitle="What time is this commitment due?"
                    onConfirm={async (value) => {
                      try {
                        const formattedTime = formatDueTime(value);
                        await updateCommitment(currentCommitment.id, { due_time: formattedTime });
                      } catch (err) {
                        console.error('Failed to update commitment time', err);
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

export default CommitmentCardDetail;

