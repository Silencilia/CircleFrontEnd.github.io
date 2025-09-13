import React, { useRef, useState, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import { Contact, Subject, Relationship, Note, useContacts } from '../../contexts/ContactContext';
import { CardIndex, createSourceRecord, CardType, getCardIndexArray, popCardIndexArray, clearCardIndexArray } from '../../data/sourceRecord';
import { SubjectTag, RelationshipTag } from '../Tag';

const Type: CardType = 'contactCardDetail';
import NoteCard from './NoteCard';
import NoteCardDetail from './NoteCardDetail';
import { CalendarIcon, MinimizeIcon, NoteIcon, BackIcon, DeleteIcon } from '../icons';
import { EDITING_MODE_PADDING } from '../../data/variables';
import { SaveButton, CancelButton, BackButton, DeleteButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import DynamicPrecisionDatePicker, { DynamicPrecisionDateValue } from '../Dialogs/BirthDatePicker';
import { formatYyyyMmDdToLong } from '../../data/strings';
import useCardNavigation from '../../hooks/useCardNavigation';

// (Removed global open-contact tracking)

// Helper to format to YYYY-MM-DD (Contact.birthDate format)
function formatToIsoDate(value: DynamicPrecisionDateValue): string | undefined {
  if (!value || value.precision === 'none' || !value.year) return undefined;
  const year = value.year.toString().padStart(4, '0');
  if (value.precision === 'year') {
    return `${year}-01-01`;
  }
  if (!value.month) return undefined;
  const month = String(value.month).padStart(2, '0');
  if (value.precision === 'month') {
    return `${year}-${month}-01`;
  }
  if (!value.day) return undefined;
  const day = String(value.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface ContactCardDetailProps {
  contact: Contact;
  onMinimize?: () => void;
  caller?: CardIndex | null;
  onOpenNote?: (note: Note, caller: CardIndex) => void;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const ContactCardDetail: React.FC<ContactCardDetailProps> = ({ contact, onMinimize, caller, onOpenNote, onOpenContactDetail }) => {
  const { state, updateContactAsync, addOccupationAsync, addOrganizationAsync } = useContacts();
  if (contact.isTrashed) {
    return null;
  }
  // (Removed registration of open contact detail)
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isAnyNoteEditing, setIsAnyNoteEditing] = useState(false);
  
  // Get the latest contact data from context state
  const currentContact = state.contacts.find(c => c.id === contact.id) || contact;
  
  // Name editing state
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editName, setEditName] = useState(currentContact.name);
  const [originalName, setOriginalName] = useState(currentContact.name); // Store original for rollback
  const [isNameSaving, setIsNameSaving] = useState(false); // Add loading state
  const nameContentEditableRef = useRef<HTMLElement>(null);
  const [noteDetail, setNoteDetail] = useState<Note | null>(null);
  const [noteDetailCaller, setNoteDetailCaller] = useState<CardIndex | null>(null);

  // Get related data
  const occupation = currentContact.occupationId ? state.occupations.find(o => o.id === currentContact.occupationId) : null;
  const organization = currentContact.organizationId ? state.organizations.find(org => org.id === currentContact.organizationId) : null;
  const subjects = currentContact.subjectIds ? currentContact.subjectIds.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [];
  const relationships = currentContact.relationshipIds ? currentContact.relationshipIds.map(id => state.relationships.find(r => r.id === id)).filter(Boolean) as Relationship[] : [];
  const notes = currentContact.noteIds ? (currentContact.noteIds
    .map(id => state.notes.find(n => n.id === id))
    .filter((n): n is Note => Boolean(n && !n.isTrashed))) : [];

  // Birth date picker overlay state
  const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
  const [birthDateValue, setBirthDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync initial birth date to picker state when opening (parse YYYY-MM-DD as local)
  const openBirthDatePicker = () => {
    if (currentContact.birthDate) {
      const b = currentContact.birthDate;
      if (b.year && b.month && b.day) setBirthDateValue({ precision: 'day', year: b.year, month: b.month, day: b.day });
      else if (b.year && b.month) setBirthDateValue({ precision: 'month', year: b.year, month: b.month, day: null });
      else if (b.year) setBirthDateValue({ precision: 'year', year: b.year, month: null, day: null });
      else setBirthDateValue({ precision: 'none', year: null, month: null, day: null });
    } else {
      setBirthDateValue({ precision: 'none', year: null, month: null, day: null });
    }
    setIsBirthDatePickerOpen(true);
  };

  const handleBirthDateConfirm = async (value: DynamicPrecisionDateValue) => {
    try {
      const birth = {
        year: value.year ?? null,
        month: value.precision === 'year' ? null : (value.month ?? null),
        day: value.precision === 'day' ? (value.day ?? null) : null,
      };
      await updateContactAsync(currentContact.id, { birthDate: birth });
      setIsBirthDatePickerOpen(false);
    } catch (error) {
      console.error('Failed to update birth date:', error);
      setIsBirthDatePickerOpen(false);
    }
  };

  const handleBirthDateCancel = () => {
    setIsBirthDatePickerOpen(false);
  };

  // Occupation editing state - moved after occupation is declared
  const [isOccupationEditing, setIsOccupationEditing] = useState(false);
  const [editOccupation, setEditOccupation] = useState(occupation?.title || '');
  const occupationContentEditableRef = useRef<HTMLElement>(null);

  // Organization editing state
  const [isOrganizationEditing, setIsOrganizationEditing] = useState(false);
  const [editOrganization, setEditOrganization] = useState(organization?.name || '');
  const organizationContentEditableRef = useRef<HTMLElement>(null);

  // Format birth date without timezone conversion
  const formatBirthDate = (birth?: Contact['birthDate']): string => {
    if (!birth || (!birth.year && !birth.month && !birth.day)) return 'No birth date';
    if (birth.year && !birth.month && !birth.day) return `${birth.year}`;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (birth.year && birth.month && !birth.day) return `${months[birth.month - 1]}, ${birth.year}`;
    if (birth.year && birth.month && birth.day) return `${months[birth.month - 1]} ${birth.day}, ${birth.year}`;
    return 'No birth date';
  };

  // Mouse drag scrolling handlers - simpler approach
  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if the target is or contains a contenteditable element
    const target = e.target as HTMLElement;
    const isOverEditable = target.closest('[contenteditable="true"]');
    // Do not start drag when clicking a contact reference or other interactive controls
    const isOverContactRef = target.closest('[data-contact-ref="true"]');
    const isOverButtonOrLink = target.closest('button, a, [role="button"], [role="link"]');
    
    if (isOverEditable || isOverContactRef || isOverButtonOrLink || !notesContainerRef.current) return;
    
    setIsDragging(true);
    setStartY(e.clientY - notesContainerRef.current.offsetTop);
    setScrollTop(notesContainerRef.current.scrollTop);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Check if the target is or contains a contenteditable element
    const target = e.target as HTMLElement;
    const isOverEditable = target.closest('[contenteditable="true"]');
    
    if (isOverEditable || !isDragging || !notesContainerRef.current) return;
    
    const y = e.clientY - notesContainerRef.current.offsetTop;
    const walk = (y - startY) * 2;
    notesContainerRef.current.scrollTop = scrollTop - walk;
  };

  const handleMouseUp = () => {
    if (!isAnyNoteEditing) {
      setIsDragging(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isAnyNoteEditing) {
      setIsDragging(false);
    }
  };

  // Track editing state for mouse drag functionality
  useEffect(() => {
    // Disable mouse drag when name, occupation, or organization is being edited
    if (isNameEditing || isOccupationEditing || isOrganizationEditing) {
      setIsAnyNoteEditing(true);
    } else {
      setIsAnyNoteEditing(false);
    }
  }, [isNameEditing, isOccupationEditing, isOrganizationEditing]);

  // Update editName when contact name changes
  useEffect(() => {
    setEditName(currentContact.name);
  }, [currentContact.name]);

  // Update editOccupation when occupation changes
  useEffect(() => {
    // Only update if not currently editing to prevent flashing during user input
    if (!isOccupationEditing) {
      setEditOccupation(occupation?.title || '');
    }
  }, [occupation?.title, isOccupationEditing]);

  // Update editOrganization when organization changes
  useEffect(() => {
    // Only update if not currently editing to prevent flashing during user input
    if (!isOrganizationEditing) {
      setEditOrganization(organization?.name || '');
    }
  }, [organization?.name, isOrganizationEditing]);

  // Name editing handlers
  const handleNameEditClick = () => {
    setIsNameEditing(true);
    setEditName(currentContact.name);
    setOriginalName(currentContact.name); // Store original name
    // Focus the contenteditable element after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (nameContentEditableRef.current) {
        nameContentEditableRef.current.focus();
        // Place cursor at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(nameContentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleNameSave = async () => {
    // Read directly from the editable DOM to avoid any event ordering issues
    const currentHtml = nameContentEditableRef.current?.innerHTML ?? editName;
    // Clean the input value to remove any HTML tags and trim whitespace
    const cleanName = currentHtml.replace(/<[^>]*>/g, '').trim();
    console.log('Saving name:', cleanName, 'Current name:', currentContact.name);
    if (cleanName !== currentContact.name) {
      console.log('Updating contact with ID:', currentContact.id);
      try {
        setIsNameSaving(true);
        await updateContactAsync(currentContact.id, { name: cleanName });
        console.log('Name updated successfully');
      } catch (error) {
        console.error('Failed to update name:', error);
        // Revert to original value on error
        setEditName(originalName);
      } finally {
        setIsNameSaving(false);
      }
    } else {
      console.log('No changes to save');
    }
    setIsNameEditing(false);
  };

  const handleNameCancel = () => {
    setEditName(currentContact.name);
    setIsNameEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleNameSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleNameCancel();
    }
  };

  const handleNameKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleNameBlur = () => {
    // Use setTimeout to allow click events to fire first
    setTimeout(() => {
      if (isNameEditing) {
        handleNameSave();
      }
    }, 100);
  };

  // Occupation editing handlers
  const handleOccupationEditClick = () => {
    setIsOccupationEditing(true);
    setEditOccupation(occupation?.title || '');
    // Focus the contenteditable element after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (occupationContentEditableRef.current) {
        occupationContentEditableRef.current.focus();
        // Place cursor at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(occupationContentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleOccupationSave = async () => {
    // Read directly from the editable DOM to avoid any event ordering issues
    const currentHtml = occupationContentEditableRef.current?.innerHTML ?? editOccupation;
    // Clean the input value to remove any HTML tags
    const cleanOccupation = currentHtml.replace(/<[^>]*>/g, '').trim();
    console.log('Saving occupation:', cleanOccupation, 'Current occupation:', occupation?.title);
    
    if (cleanOccupation !== (occupation?.title || '')) {
      console.log('Updating contact occupation with ID:', currentContact.id);
      
      try {
        if (cleanOccupation === '') {
          // Clear the occupation - use undefined instead of null
          await updateContactAsync(currentContact.id, { occupationId: undefined });
        } else {
          // Check if occupation already exists, if not create new one
          let existingOccupation = state.occupations.find(o => o.title === cleanOccupation);
          
          if (!existingOccupation) {
            const newOcc = await addOccupationAsync({ title: cleanOccupation });
            existingOccupation = newOcc;
          }
          
          if (existingOccupation) {
            await updateContactAsync(currentContact.id, { occupationId: existingOccupation.id });
          }
        }
      } catch (error) {
        console.error('Failed to save occupation:', error);
        // Revert to original value
        setEditOccupation(occupation?.title || '');
        return; // Don't exit editing mode on error
      }
    } else {
      console.log('No changes to save');
    }
    setIsOccupationEditing(false);
  };

  const handleOccupationCancel = () => {
    setEditOccupation(occupation?.title || '');
    setIsOccupationEditing(false);
  };

  const handleOccupationKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleOccupationSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleOccupationCancel();
    }
  };

  const handleOccupationKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleOccupationBlur = () => {
    // Use setTimeout to allow click events to fire first
    setTimeout(() => {
      if (isOccupationEditing) {
        handleOccupationSave();
      }
    }, 100);
  };

  // Organization editing handlers
  const handleOrganizationEditClick = () => {
    setIsOrganizationEditing(true);
    setEditOrganization(organization?.name || '');
    // Focus the contenteditable element after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (organizationContentEditableRef.current) {
        organizationContentEditableRef.current.focus();
        // Place cursor at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(organizationContentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleOrganizationSave = async () => {
    // Read directly from the editable DOM to avoid any event ordering issues
    const currentHtml = organizationContentEditableRef.current?.innerHTML ?? editOrganization;
    // Clean the input value to remove any HTML tags
    const cleanOrganization = currentHtml.replace(/<[^>]*>/g, '').trim();
    console.log('Saving organization:', cleanOrganization, 'Current organization:', organization?.name);
    
    if (cleanOrganization !== (organization?.name || '')) {
      console.log('Updating contact organization with ID:', currentContact.id);
      
      try {
        if (cleanOrganization === '') {
          // Clear the organization - use undefined instead of null
          await updateContactAsync(currentContact.id, { organizationId: undefined });
        } else {
          // Check if organization already exists, if not create new one
          let existingOrganization = state.organizations.find(org => org.name === cleanOrganization);
          
          if (!existingOrganization) {
            const newOrg = await addOrganizationAsync({ name: cleanOrganization });
            existingOrganization = newOrg;
          }
          
          if (existingOrganization) {
            await updateContactAsync(currentContact.id, { organizationId: existingOrganization.id });
          }
        }
      } catch (error) {
        console.error('Failed to save organization:', error);
        // Revert to original value
        setEditOrganization(organization?.name || '');
        return; // Don't exit editing mode on error
      }
    } else {
      console.log('No changes to save');
    }
    setIsOrganizationEditing(false);
  };

  const handleOrganizationCancel = () => {
    setEditOrganization(organization?.name || '');
    setIsOrganizationEditing(false);
  };

  const handleOrganizationKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleOrganizationSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleOrganizationCancel();
    }
  };

  const handleOrganizationKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleOrganizationBlur = () => {
    // Use setTimeout to allow click events to fire first
    setTimeout(() => {
      if (isOrganizationEditing) {
        handleOrganizationSave();
      }
    }, 100);
  };

  // Delete contact handler
  const handleDeleteContact = async () => {
    try {
      await updateContactAsync(currentContact.id, { isTrashed: true });
      setShowDeleteDialog(false);
      if (onMinimize) {
        onMinimize();
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const { openNoteDetail: navOpenNoteDetail, handleBack } = useCardNavigation({
    openNote: onOpenNote,
    openContact: onOpenContactDetail,
    closeCurrent: onMinimize,
  });

  return (
    <>
    <div className="w-fit h-fit bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] rounded-xl p-[15px] flex flex-col gap-[40px]">
      {/* Contact Info Section */}
      <div className="w-fit h-fit flex flex-col gap-[10px]">
        <div className="w-[600px] h-fit flex flex-row justify-between items-start gap-[136px]">
          {/* Left side - Contact Info */}
          <div className="w-fit h-fit flex flex-col gap-[10px]">
            {/* Name */}
            <div className="w-fit h-[24px] flex items-center gap-2">
              {isNameEditing ? (
                <ContentEditable
                  innerRef={nameContentEditableRef}
                  html={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onKeyDownCapture={handleNameKeyDown}
                  onKeyUp={handleNameKeyUp}
                  onBlur={handleNameBlur}
                  className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-inter font-medium text-base leading-6 text-circle-primary`}
                  style={{
                    minHeight: '20px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              ) : (
                <div 
                  onClick={handleNameEditClick}
                  className="cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-inter font-medium text-base leading-6 text-circle-primary"
                  title="Click to edit"
                >
                  {currentContact.name}
                </div>
              )}
              
              {/* Name edit controls - show when editing, positioned to the right */}
              {isNameEditing && (
                <div className="flex gap-2">
                  <SaveButton onClick={handleNameSave} disabled={isNameSaving}>
                    {isNameSaving ? 'Saving...' : 'Save'}
                  </SaveButton>
                  <CancelButton onClick={handleNameCancel} disabled={isNameSaving} />
                </div>
              )}
            </div>
            
            {/* Occupation and Organization */}
            <div className="w-fit h-fit flex flex-col gap-0">
              <div className="w-fit h-[20px] flex items-center gap-2">
                {isOccupationEditing ? (
                  <ContentEditable
                    innerRef={occupationContentEditableRef}
                    html={editOccupation}
                    onChange={(e) => setEditOccupation(e.target.value)}
                    onKeyDown={handleOccupationKeyDown}
                    onKeyDownCapture={handleOccupationKeyDown}
                    onKeyUp={handleOccupationKeyUp}
                    onBlur={handleOccupationBlur}
                    className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-inter text-sm leading-5 text-circle-primary`}
                    style={{
                      minHeight: '20px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                ) : (
                  <div 
                    onClick={handleOccupationEditClick}
                    className={`cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-inter text-sm leading-5 ${
                      occupation?.title && occupation.title.trim() !== '' 
                        ? 'text-circle-primary' 
                        : 'text-circle-primary opacity-50 italic'
                    }`}
                    title="Click to edit"
                  >
                    {occupation?.title && occupation.title.trim() !== '' ? occupation.title : 'no occupation'}
                  </div>
                )}
                
                {/* Occupation edit controls - show when editing, positioned to the right */}
                {isOccupationEditing && (
                  <div className="flex gap-2">
                    <SaveButton onClick={handleOccupationSave} />
                    <CancelButton onClick={handleOccupationCancel} />
                  </div>
                )}
              </div>
              
              {/* Add conditional gap when occupation is editing */}
              {isOccupationEditing && <div className="h-[10px]"></div>}
              
              <div className="w-fit h-[20px] flex items-center gap-2">
                {isOrganizationEditing ? (
                  <ContentEditable
                    innerRef={organizationContentEditableRef}
                    html={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    onKeyDown={handleOrganizationKeyDown}
                    onKeyDownCapture={handleOrganizationKeyDown}
                    onKeyUp={handleOrganizationKeyUp}
                    onBlur={handleOrganizationBlur}
                    className={`outline-none border border-circle-primary rounded ${EDITING_MODE_PADDING.X} ${EDITING_MODE_PADDING.Y} min-h-[20px] focus:ring-2 focus:ring-inset focus:ring-circle-primary focus:ring-opacity-50 font-inter text-sm leading-5 text-circle-primary`}
                    style={{
                      minHeight: '20px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                ) : (
                  <div 
                    onClick={handleOrganizationEditClick}
                    className={`cursor-pointer hover:bg-circle-neutral hover:bg-opacity-20 rounded transition-colors duration-200 font-inter text-sm leading-5 ${
                      organization?.name 
                        ? 'text-circle-primary' 
                        : 'text-circle-primary opacity-50 italic'
                    }`}
                    title="Click to edit"
                  >
                    {organization?.name || 'organization'}
                  </div>
                )}
                
                {/* Organization edit controls - show when editing, positioned to the right */}
                {isOrganizationEditing && (
                  <div className="flex gap-2">
                    <SaveButton onClick={handleOrganizationSave} />
                    <CancelButton onClick={handleOrganizationCancel} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Back, Delete, and Minimize buttons */}
          <div className="w-fit h-[16px] flex flex-row justify-end items-center gap-[5px]">
            {/* Back button */}
            <button
              onClick={() => handleBack('contactCardDetail', contact.id)}
              className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
              aria-label="Back"
            >
              <BackIcon width={16} height={16} className="text-circle-primary" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
              aria-label="Delete contact"
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
              aria-label="Minimize contact detail"
            >
              <MinimizeIcon width={16} height={16} className="text-circle-primary" />
            </button>
          </div>
        </div>

        {/* Birth Date */}
        <div className="w-fit h-[20px] flex flex-col gap-0">
          <div className="w-fit h-[20px] flex flex-row items-center gap-[10px]">
            <CalendarIcon width={16} height={16} className="text-circle-primary" />
            <button
              type="button"
              onClick={openBirthDatePicker}
              className="font-inter font-normal text-sm leading-5 text-circle-primary tracking-[0.25px] underline decoration-transparent hover:decoration-circle-primary/30 focus:decoration-circle-primary/50 rounded px-1 -mx-1"
              title="Click to set birth date"
            >
              {formatBirthDate(currentContact.birthDate)}
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="w-fit h-fit max-h-[580px] flex flex-col gap-[20px]">
        {/* Notes Header */}
        <div className="w-fit h-[20px] flex flex-row items-center gap-[10px]">
          <NoteIcon width={16} height={16} className="text-circle-primary" />
          <span className="font-inter font-normal text-sm leading-5 text-circle-primary tracking-[0.25px]">
            {notes.length} notes
          </span>
        </div>

        {/* Note Cards Container - Scrollable with mouse drag (disabled during editing) */}
        <div 
          ref={notesContainerRef}
          className={`w-fit h-fit max-h-[540px] overflow-y-auto flex flex-col gap-[15px] select-none scrollbar-hide ${
            isAnyNoteEditing 
              ? 'cursor-default' 
              : isDragging 
                ? 'cursor-grabbing' 
                : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {notes.length > 0 ? (
            notes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note}
                caller={createSourceRecord('contactCardDetail', contact.id)}
                isNestedInContactDetail={true}
                currentContactId={contact.id}
                onOpenNoteDetail={(n, source) => {
                  const src = source || createSourceRecord('contactCardDetail', contact.id);
                  navOpenNoteDetail(n, src);
                  onMinimize?.();
                }}
                onOpenContactDetail={(nextContact, source) => {
                  // Delegate to parent overlay manager if provided
                  if (onOpenContactDetail) {
                    onOpenContactDetail(nextContact, source || createSourceRecord('contactCardDetail', contact.id));
                  } else {
                    // No parent handler available; log for now
                    console.log('Nested NoteCard requested opening contact detail for:', nextContact.name);
                  }
                }}
              />
            ))
          ) : (
            <div className="text-center text-circle-primary/50 italic py-8 font-inter text-label-medium">
              No notes recorded.
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="w-fit h-fit flex flex-col gap-[5px] overflow-y-auto">
        {/* Relationships */}
        <div className="w-fit h-fit max-h-[20px] flex flex-row flex-wrap items-start content-start gap-[5px]">
          {relationships.length > 0 ? (
            relationships.map((relationship) => (
              <RelationshipTag
                key={relationship.id}
                relationship={relationship}
                contactId={contact.id}
                editable={false}
              />
            ))
          ) : (
            <div className="text-circle-primary/50 italic font-inter text-label-medium">No relationships recorded.</div>
          )}
        </div>

        {/* Subjects */}
        <div className="w-fit h-fit max-h-[70px] flex flex-row flex-wrap items-start content-start gap-[5px]">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <SubjectTag
                key={subject.id}
                subject={subject}
                contactId={contact.id}
                editable={true}
              />
            ))
          ) : (
            <div className="text-circle-primary/50 italic font-inter text-label-medium">No subjects recorded.</div>
          )}
        </div>
      </div>
    </div>
    {/* Birth Date Picker Overlay */}
    {isBirthDatePickerOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-circle-primary/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleBirthDateCancel();
        }}
      >
        <div className="mx-4">
          <DynamicPrecisionDatePicker
            value={birthDateValue}
            onChange={setBirthDateValue}
            label="Birth date picker"
            onConfirm={handleBirthDateConfirm}
            onCancel={handleBirthDateCancel}
          />
        </div>
      </div>
    )}

    {/* Delete Confirmation Dialog */}
    <DeleteConfirmationDialog
      isOpen={showDeleteDialog}
      onCancel={() => setShowDeleteDialog(false)}
      onConfirm={handleDeleteContact}
      itemType="contact"
      itemName={currentContact.name}
    />
    {/* Note Detail Overlay (fallback local manager) */}
    {typeof window !== 'undefined' && noteDetail && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-circle-primary/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) setNoteDetail(null);
        }}
      >
        <div className="mx-4">
          <NoteCardDetail
            note={noteDetail}
            caller={noteDetailCaller}
            onMinimize={() => setNoteDetail(null)}
            onOpenContactDetail={() => {
              // Optional: could integrate to open a nested contact; for now, close note detail
              setNoteDetail(null);
            }}
          />
        </div>
      </div>
    )}
    </>
  );
};

export default ContactCardDetail;
