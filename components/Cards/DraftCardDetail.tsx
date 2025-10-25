import React, { useRef, useState, useCallback, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import ExtractButton from '../Button/ExtractButton';
import RecycleButton from '../Button/RecycleButton';
import MinimizeButton from '../Button/MinimizeButton';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { Draft, useContacts, PrecisionDate } from '../../contexts/ContactContext';
import ContentEditable from 'react-contenteditable';
import { CancelButton, ConfirmButton } from '../Button';
import DatePicker, { DynamicPrecisionDateValue } from '../Dialogs/DatePicker';
import TimePicker from '../Dialogs/TimePicker';
import { CalendarIcon } from '../icons';
import { createPortal } from 'react-dom';
import { EDITING_MODE_PADDING } from '../../data/variables';

interface DraftCardDetailProps {
  draft: Draft;
  onExtract?: (draft: Draft) => void;
  onDelete?: (draft: Draft) => void;
  onMinimize?: () => void;
}

const DraftCardDetail: React.FC<DraftCardDetailProps> = ({
  draft,
  onExtract,
  onDelete,
  onMinimize
}) => {
  const { updateTemporaryNote } = useContacts();
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Title editing
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(draft.title || '');
  const [originalTitle, setOriginalTitle] = useState(draft.title || '');
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const titleContentEditableRef = useRef<HTMLElement>(null);

  // Date/time pickers
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<{ hour: number | null; minute: number | null }>({ hour: draft.time.hour, minute: draft.time.minute });

  // Mount flag to safely use portal on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleExtractClick = useCallback(() => {
    if (onExtract) {
      onExtract(draft);
    }
  }, [draft, onExtract]);

  const handleMinimizeClick = useCallback(() => {
    if (onMinimize) {
      onMinimize();
    }
  }, [onMinimize]);

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
    setIsTitleEditing(true);
    setEditTitle(draft.title || '');
    setOriginalTitle(draft.title || '');
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

  const handleTitleSave = () => {
    setIsTitleSaving(true);
    const currentHtml = titleContentEditableRef.current?.innerHTML ?? editTitle;
    const cleanTitle = currentHtml.replace(/<[^>]*>/g, '').trim();
    updateTemporaryNote?.(draft.id, { title: cleanTitle });
    setIsTitleSaving(false);
    setIsTitleEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(originalTitle);
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
      <div className="crd-dtl">
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
                  {draft.title || 'Untitled'}
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
                  >
                    {draft.date?.year ? formatDate(draft.date) : 'no date'}
                  </button>
                </div>
                {/* Time row */}
                <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
                  <button
                    type="button"
                    onClick={() => {
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
                  >
                    {draft.time.hour !== null ? formatTime(draft.time) : '--:--'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Container */}
          <div className="flex flex-row items-center gap-md w-fit h-fit p-0 flex-none">
            <ExtractButton onClick={handleExtractClick} />
            <RecycleButton onClick={handleDeleteClick} ariaLabel="Delete draft" />
            <MinimizeButton onClick={handleMinimizeClick} ariaLabel="Minimize draft" />
          </div>

          {/* Text container */}
          <ScrollContainer
            className="w-full h-fit min-h-0 max-h-full bg-circle-neutral-variant rounded-sm p-md flex flex-row justify-start items-start overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            horizontal={false}
            vertical={true}
          >
            <div className="w-fit font-circlebodymedium text-circle-primary text-left">
              {draft.text}
            </div>
          </ScrollContainer>
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
                          updateTemporaryNote?.(draft.id, {
                            date: { year: null, month: null, day: null }
                          });
                        } else {
                          updateTemporaryNote?.(draft.id, {
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
                        updateTemporaryNote?.(draft.id, { time: { hour: value.hour, minute: value.minute } });
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

export default DraftCardDetail;
