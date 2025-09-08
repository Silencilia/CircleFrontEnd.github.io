import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ContentEditable from 'react-contenteditable';
import { Contact, Note, useContacts } from '../contexts/ContactContext';
import { MaximizeIcon, MinimizeIcon, DeleteIcon } from './icons';
import { EDITING_MODE_PADDING } from '../data/variables';
import { SaveButton, CancelButton } from './Button';
import { contactReference } from '../data/referenceParsing';
import ContactCardDetail, { isContactDetailOpen } from './ContactCardDetail';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const { state, updateNoteAsync } = useContacts();
  if (note.isTrashed) {
    return null;
  }
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [originalText, setOriginalText] = useState(note.text); // Store original for rollback
  const [isSaving, setIsSaving] = useState(false); // Add loading state
  const contentEditableRef = useRef<HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Get the sentiment labels from the sentiment IDs
  const sentimentLabels = (note.sentimentIds || []).map(id => {
    const sentiment = state.sentiments.find(s => s.id === id);
    return sentiment?.label || 'unknown';
  });

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditing(true);
    setIsExpanded(true); // Automatically expand when editing
    setEditText(note.text);
    setOriginalText(note.text); // Store original text for rollback
    // Focus the contenteditable element after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        // Place cursor at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  // Handle save when editing is complete
  const handleSave = async () => {
    if (editText.trim() === originalText.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await updateNoteAsync(note.id, { text: editText.trim() });
      setIsEditing(false);
      setOriginalText(editText.trim()); // Update original text after successful save
    } catch (error) {
      console.error("Failed to save note:", error);
      // Revert to original value on error
      setEditText(originalText);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setEditText(originalText); // Revert to original text
    setIsEditing(false);
  };

  // Handle key events for better UX
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle blur (clicking outside) to save
  const handleBlur = () => {
    // Use setTimeout to allow click events to fire first
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  // Format the date and time from the note's time field
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        // If parsing fails, try to extract from the time field format
        const timeMatch = dateTimeString.match(/(\w+ \d{1,2}, \d{4}) (\d{1,2}:\d{2} [AP]M)/);
        if (timeMatch) {
          return {
            date: timeMatch[1],
            time: timeMatch[2]
          };
        }
        return {
          date: 'Invalid Date',
          time: 'Invalid Time'
        };
      }
      
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Use 24h format
      };
      
      return {
        date: date.toLocaleDateString('en-US', dateOptions),
        time: date.toLocaleTimeString('en-US', timeOptions)
      };
    } catch (error) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
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

  const { date, time } = formatDateTime(note.time);
  const { text: truncatedText, hasOverflow } = checkTextOverflow(note.text);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-[600px] h-fit bg-circle-neutral-variant rounded-[5px] p-[10px] flex flex-col gap-1">
      {/* Note info - timestamp and sentiment */}
      <div className="w-[580px] flex flex-row justify-between items-start gap-[10px]">
        {/* Timestamp */}
        <div className="flex flex-col justify-start items-start w-[115px] h-[40px]">
          <div className="font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] flex items-center w-[115px] h-[20px]">
            {date}
          </div>
          <div className="font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] flex items-center w-[46px] h-[20px]">
            {time}
          </div>
        </div>

        {/* Sentiment tags and action buttons */}
        <div className="flex flex-row justify-end items-center gap-[10px] w-fit h-fit">
          {/* Sentiment tags row */}
          <div className="flex flex-row justify-end items-center gap-[5px] w-[242px] h-[20px]">
            {/* Sentiment tags - show up to 3 sentiments */}
            {sentimentLabels.slice(0, 3).map((label, index) => (
              <div key={index} className="bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center h-[20px]">
                <div className="font-inter font-medium text-[11px] leading-[16px] text-circle-primary tracking-[0.5px] flex items-center justify-center text-center">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons row */}
          <div className="flex flex-row items-center gap-[5px] w-fit h-fit">
            {/* Delete button */}
            <button
              onClick={async () => {
                try {
                  await updateNoteAsync(note.id, { isTrashed: true });
                } catch (e) {
                  console.error('Failed to trash note', e);
                }
              }}
              className="p-1 hover:bg-circle-neutral rounded transition-colors duration-200"
              aria-label="Delete note"
            >
              <DeleteIcon width={16} height={16} className="text-circle-primary" />
            </button>

            {/* Maximize/Minimize icon button - only show when there's overflow */}
            {hasOverflow && (
              <button
                onClick={toggleExpanded}
                className="p-1 hover:bg-circle-neutral rounded transition-colors duration-200"
                aria-label={isExpanded ? "Collapse note content" : "Expand note content"}
              >
                {isExpanded ? (
                  <MinimizeIcon width={16} height={16} className="text-circle-primary" />
                ) : (
                  <MaximizeIcon width={16} height={16} className="text-circle-primary" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note description - now with inline editing */}
      <div 
        className={`w-[580px] font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] text-left ${
          isExpanded ? 'h-fit' : 'h-[40px] overflow-hidden'
        }`}
      >
        {isEditing ? (
          <ContentEditable
            innerRef={contentEditableRef}
            html={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50`}
            style={{
              minHeight: '20px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        ) : (
          <div 
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const isEditableText = target.dataset.editable === 'true' || !!target.closest('[data-editable="true"]');
              if (isEditableText) {
                handleEditClick();
              }
            }}
            className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200"
            title="Click to edit"
          >
            {contactReference(
              isExpanded ? note.text : truncatedText,
              state.contacts,
              (contact) => {
                if (contact) {
                  // Prevent opening if this contact's detail is already open anywhere
                  if (isContactDetailOpen(contact.id)) {
                    return;
                  }
                  setSelectedContact(contact);
                }
              }
            )}
          </div>
        )}
      </div>

      {/* Edit controls - show when editing */}
      {isEditing && (
        <div className="flex justify-end gap-2 mt-2">
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </SaveButton>
          <CancelButton onClick={handleCancel} disabled={isSaving} />
        </div>
      )}
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
    </div>
  );
};

export default NoteCard;
